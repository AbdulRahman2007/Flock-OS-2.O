import React, { useEffect, useState } from 'react';
import { usePoultry } from '../../context/PoultryContext';
import { X, Plus, Layers, Calendar, CheckCircle2, Scale, Building, Info } from 'lucide-react';

interface NewFlockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewFlockModal: React.FC<NewFlockModalProps> = ({ isOpen, onClose }) => {
  const { farms, sheds, addFlock, addFarm, addShed } = usePoultry();

  const [flockNumber, setFlockNumber] = useState('');
  const [farmId, setFarmId] = useState('');
  const [shedId, setShedId] = useState('');
  const [breed, setBreed] = useState<'Cobb 500' | 'Ross 308' | 'Hubbard Classic' | 'Arbor Acres'>('Cobb 500');
  const [supplier, setSupplier] = useState('');
  const [initialBirds, setInitialBirds] = useState<number | ''>('');
  const [placementDate, setPlacementDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetAgeDays, setTargetAgeDays] = useState<number | ''>(38);
  const [targetWeightKg, setTargetWeightKg] = useState<number | ''>(2.25);
  // [NEW] DOC chick metrics
  const [docWeightPerChickGrams, setDocWeightPerChickGrams] = useState<number | ''>('');
  const [avgChickWeightPlacementGrams, setAvgChickWeightPlacementGrams] = useState<number | ''>('');

  // Quick Farm & Shed inline creation states
  const [showAddFarm, setShowAddFarm] = useState(false);
  const [newFarmName, setNewFarmName] = useState('');
  const [newFarmLocation, setNewFarmLocation] = useState('');

  const [showAddShed, setShowAddShed] = useState(false);
  const [newShedName, setNewShedName] = useState('');
  const [newShedCapacity, setNewShedCapacity] = useState<number | ''>('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!farms.some((farm) => farm.id === farmId)) {
      setFarmId(farms[0]?.id ?? '');
    }
  }, [farms, farmId]);

  useEffect(() => {
    if (!sheds.some((shed) => shed.id === shedId && shed.farmId === farmId)) {
      setShedId(sheds.find((shed) => shed.farmId === farmId)?.id ?? '');
    }
  }, [farmId, shedId, sheds]);

  if (!isOpen) return null;

  const relevantSheds = sheds.filter((s) => s.farmId === farmId);
  const selectedShed = sheds.find((s) => s.id === shedId);

  const handleSaveQuickFarm = () => {
    if (!newFarmName.trim() || !newFarmLocation.trim()) {
      setFormError('Enter the farm name and location before saving.');
      return;
    }
    const created = addFarm({
      name: newFarmName.trim(),
      location: newFarmLocation.trim(),
      contactNumber: '',
      status: 'active',
    });
    setFarmId(created.id);
    setNewFarmName('');
    setNewFarmLocation('');
    setShowAddFarm(false);
    setShedId('');
  };

  const handleSaveQuickShed = () => {
    if (!newShedName.trim() || !farmId || !newShedCapacity || Number(newShedCapacity) < 500) {
      setFormError('Enter a shed name and a capacity of at least 500 birds.');
      return;
    }
    const created = addShed({
      farmId,
      name: newShedName.trim(),
      capacity: Number(newShedCapacity),
    });
    setShedId(created.id);
    setNewShedName('');
    setNewShedCapacity('');
    setFormError('');
    setShowAddShed(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !flockNumber.trim() ||
      !initialBirds ||
      !farmId ||
      !selectedShed ||
      !docWeightPerChickGrams ||
      !avgChickWeightPlacementGrams
    ) {
      setFormError('Enter the flock details and select a farm and shed.');
      return;
    }
    if (Number(initialBirds) > selectedShed.capacity) {
      setFormError('Initial bird count cannot exceed the selected shed capacity.');
      return;
    }

    setFormError('');
    addFlock({
      flockNumber: flockNumber.trim(),
      farmId,
      shedId,
      breed,
      supplier: supplier.trim(),
      initialBirds: Number(initialBirds),
      placementDate,
      targetAgeDays: Number(targetAgeDays) || 38,
      targetWeightKg: Number(targetWeightKg) || 2.2,
      status: 'active',
      docWeightPerChickGrams: Number(docWeightPerChickGrams),
      avgChickWeightPlacementGrams: Number(avgChickWeightPlacementGrams),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-6">
        <div className="bg-emerald-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Add New Flock Batch (Placement)</h3>
              <span className="text-xs text-emerald-200">
                Register a new broiler flock and initialize automated tracking
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Row 1: Flock Batch Title & Supplier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Flock Batch ID / Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. FL-2026-001"
                value={flockNumber}
                onChange={(e) => setFlockNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Hatchery / DOC Supplier *
              </label>
              <input
                type="text"
                required
                placeholder="Enter your DOC supplier"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Row 2: Farm & Shed Assignment */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Farm Location *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddFarm(!showAddFarm)}
                    className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{showAddFarm ? 'Close' : '+ New Farm'}</span>
                  </button>
                </div>
                <select
                  required
                  value={farmId}
                  onChange={(e) => {
                    setFarmId(e.target.value);
                    const firstShed = sheds.find((s) => s.farmId === e.target.value);
                    setShedId(firstShed?.id ?? '');
                  }}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs"
                >
                  <option value="">Select a farm</option>
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Shed Assignment *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddShed(!showAddShed)}
                    className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{showAddShed ? 'Close' : '+ New Shed'}</span>
                  </button>
                </div>
                <select
                  required
                  value={shedId}
                  onChange={(e) => setShedId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-900"
                >
                  <option value="">Select a shed</option>
                  {relevantSheds.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Cap: {s.capacity.toLocaleString()} birds)
                    </option>
                  ))}
                </select>
                {selectedShed && (
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Capacity: {selectedShed.capacity.toLocaleString()} birds
                  </span>
                )}
              </div>
            </div>

            {/* Inline Quick Add Farm Form */}
            {showAddFarm && (
              <div className="p-3 bg-white rounded-lg border border-emerald-300 space-y-2">
                <span className="font-bold text-emerald-900 text-[11px] block">
                  Add New Farm Facility Name
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Farm Name (e.g. Al-Madina Site 2)"
                    value={newFarmName}
                    onChange={(e) => setNewFarmName(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="Farm location"
                    value={newFarmLocation}
                    onChange={(e) => setNewFarmLocation(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddFarm(false)}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded text-[11px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveQuickFarm}
                    className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded text-[11px]"
                  >
                    Save & Select Farm
                  </button>
                </div>
              </div>
            )}

            {/* Inline Quick Add Shed Form */}
            {showAddShed && (
              <div className="p-3 bg-white rounded-lg border border-emerald-300 space-y-2">
                <span className="font-bold text-emerald-900 text-[11px] block">
                  Add New Shed Name under Selected Farm
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Shed Name (e.g. Shed 3 Tunnel, House 4)"
                    value={newShedName}
                    onChange={(e) => setNewShedName(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-semibold"
                  />
                  <input
                    type="number"
                    min="500"
                    step="500"
                    placeholder="Bird capacity"
                    value={newShedCapacity}
                    onChange={(e) => setNewShedCapacity(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs tabular-nums"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddShed(false)}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded text-[11px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveQuickShed}
                    className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded text-[11px]"
                  >
                    Save & Select Shed
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Row 3: Breed, Placement Date & Initial Birds */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Broiler Breed *
              </label>
              <select
                value={breed}
                onChange={(e) => setBreed(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium"
              >
                <option value="Cobb 500">Cobb 500</option>
                <option value="Ross 308">Ross 308</option>
                <option value="Hubbard Classic">Hubbard Classic</option>
                <option value="Arbor Acres">Arbor Acres</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Placement Date *
              </label>
              <input
                type="date"
                required
                value={placementDate}
                onChange={(e) => setPlacementDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Initial DOC Chicks Received *
              </label>
              <input
                type="number"
                required
                min="100"
                step="50"
                value={initialBirds}
                onChange={(e) => setInitialBirds(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 tabular-nums"
              />
            </div>
          </div>

          {/* Row 4: [NEW] DOC Chick Placement Metrics (Section 3, 6, 7) */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-950 uppercase tracking-wider text-[11px]">
              <Scale className="w-3.5 h-3.5 text-amber-700" />
              <span>[NEW] DOC (Day-Old Chick) Weight Tracking</span>
            </div>
            <p className="text-[11px] text-amber-900">
              Required for accurate Week 1 weight gain and cumulative FCR calculations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  DOC Weight Per Chick (Grams) *
                </label>
                <input
                  type="number"
                  required
                  step="0.1"
                  min="25"
                  max="60"
                  value={docWeightPerChickGrams}
                  onChange={(e) => setDocWeightPerChickGrams(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-900 tabular-nums"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Standard: 38g – 44g</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Placement Sample Avg Weight (Grams) *
                </label>
                <input
                  type="number"
                  required
                  step="0.1"
                  min="25"
                  max="60"
                  value={avgChickWeightPlacementGrams}
                  onChange={(e) => setAvgChickWeightPlacementGrams(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-900 tabular-nums"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Box sample verification weight</span>
              </div>
            </div>
          </div>

          {/* Row 5: Target Age & Target Harvest Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target Market Age (Days) *
              </label>
              <input
                type="number"
                required
                min="25"
                max="60"
                value={targetAgeDays}
                onChange={(e) => setTargetAgeDays(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs tabular-nums"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Typical broiler cycle: 35–42 days</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target Harvest Weight (kg) *
              </label>
              <input
                type="number"
                required
                step="0.05"
                min="1.0"
                max="4.0"
                value={targetWeightKg}
                onChange={(e) => setTargetWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs tabular-nums"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Target lifting average weight</span>
            </div>
          </div>

          {formError && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {formError}
            </p>
          )}

          {/* Automated System Integration Note */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-start gap-2 text-[11px] text-slate-600">
            <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800">Automated Setup:</strong> Creating this flock will automatically generate Day 1 opening count ({initialBirds ? Number(initialBirds).toLocaleString() : 0} birds), Day 1 Pre-Starter feed record, and standard scheduled vaccination timeline.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Flock & Start Batch</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
