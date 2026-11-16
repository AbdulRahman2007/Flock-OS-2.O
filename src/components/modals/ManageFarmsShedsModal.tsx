import React, { useEffect, useState } from 'react';
import { usePoultry } from '../../context/PoultryContext';
import {
  X,
  Building,
  Home,
  Plus,
  CheckCircle2,
  MapPin,
  Phone,
  Layers,
  Trash2,
} from 'lucide-react';
import { formatNumber } from '../../utils/calculations';

interface ManageFarmsShedsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatedFarmId?: (farmId: string) => void;
  onCreatedShedId?: (shedId: string) => void;
}

export const ManageFarmsShedsModal: React.FC<ManageFarmsShedsModalProps> = ({
  isOpen,
  onClose,
  onCreatedFarmId,
  onCreatedShedId,
}) => {
  const { farms, sheds, flocks, expenses, addFarm, deleteFarm, addShed, deleteShed } = usePoultry();

  const [activeTab, setActiveTab] = useState<'view' | 'addFarm' | 'addShed'>('view');

  // New Farm form state
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [farmContact, setFarmContact] = useState('');

  // New Shed form state
  const [selectedFarmId, setSelectedFarmId] = useState(farms[0]?.id || '');
  const [shedName, setShedName] = useState('');
  const [shedCapacity, setShedCapacity] = useState<number | ''>('');

  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!farms.some((farm) => farm.id === selectedFarmId)) {
      setSelectedFarmId(farms[0]?.id ?? '');
    }
  }, [farms, selectedFarmId]);

  if (!isOpen) return null;

  const handleCreateFarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmName.trim()) return;

    const created = addFarm({
      name: farmName.trim(),
      location: farmLocation.trim(),
      contactNumber: farmContact.trim(),
      status: 'active',
    });

    setFarmName('');
    setFarmLocation('');
    setFarmContact('');
    setSuccessMsg(`Farm "${created.name}" created successfully!`);
    if (onCreatedFarmId) onCreatedFarmId(created.id);
    setTimeout(() => {
      setSuccessMsg('');
      setActiveTab('view');
    }, 1200);
  };

  const handleCreateShed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shedName.trim() || !selectedFarmId || !shedCapacity) return;

    const created = addShed({
      farmId: selectedFarmId,
      name: shedName.trim(),
      capacity: Number(shedCapacity),
    });

    setShedName('');
    setShedCapacity('');
    setSuccessMsg(`Shed "${created.name}" added successfully!`);
    if (onCreatedShedId) onCreatedShedId(created.id);
    setTimeout(() => {
      setSuccessMsg('');
      setActiveTab('view');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-[#E4DEC9] overflow-hidden my-6">
        {/* Header */}
        <div className="bg-[#3A564A] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Farms & Sheds Management</h3>
              <span className="text-xs text-emerald-200">
                Manage farm locations and shed facilities
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Switcher */}
        <div className="flex border-b border-[#E4DEC9] bg-[#F6F3EB] px-5 pt-3 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('view')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'view'
                ? 'border-[#3A564A] text-[#22352C] font-bold'
                : 'border-transparent text-[#67776F] hover:text-[#22352C]'
            }`}
          >
            All Farms & Sheds ({farms.length} Farms · {sheds.length} Sheds)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('addFarm')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1 ${
              activeTab === 'addFarm'
                ? 'border-[#3A564A] text-[#22352C] font-bold'
                : 'border-transparent text-[#67776F] hover:text-[#22352C]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Farm</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('addShed')}
            disabled={farms.length === 0}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1 ${
              activeTab === 'addShed'
                ? 'border-[#3A564A] text-[#22352C] font-bold'
                : 'border-transparent text-[#67776F] hover:text-[#22352C]'
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Shed</span>
          </button>
        </div>

        <div className="p-6 text-xs">
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* VIEW TAB: Directory of all Farms & Sheds */}
          {activeTab === 'view' && (
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {farms.length === 0 && (
                <p className="rounded-xl border border-dashed border-[#D5CDBC] p-6 text-center text-sm text-[#6B7970]">
                  No farms have been registered for this account yet.
                </p>
              )}
              {farms.map((farm) => {
                const farmSheds = sheds.filter((s) => s.farmId === farm.id);
                const farmFlocks = flocks.filter((flock) => flock.farmId === farm.id);
                const hasFarmExpenses = expenses.some((expense) => expense.farmId === farm.id);
                const canDeleteFarm = farmSheds.length === 0 && farmFlocks.length === 0 && !hasFarmExpenses;
                return (
                  <div
                    key={farm.id}
                    className="p-4 bg-[#FAF8F3] border border-[#E4DEC9] rounded-xl space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-[#3A564A]" />
                          <h4 className="font-bold text-sm text-[#1E2621]">{farm.name}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-[#E4EEE8] text-[#2D4D3E] text-[10px] font-bold">
                            Active
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[#647269] text-[11px] mt-1 pl-6">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#8A9890]" />
                            {farm.location}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#8A9890]" />
                            {farm.contactNumber}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFarmId(farm.id);
                            setActiveTab('addShed');
                          }}
                          className="text-[11px] font-bold text-[#3A564A] hover:text-[#253A30] bg-white border border-[#D5CDBC] px-2.5 py-1 rounded-lg shadow-2xs transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Shed</span>
                        </button>
                        <button
                          type="button"
                          aria-label={`Remove farm ${farm.name}`}
                          title={canDeleteFarm ? 'Remove farm' : farmFlocks.length ? 'Farms with flock history cannot be removed' : hasFarmExpenses ? 'Farms with expense history cannot be removed' : 'Remove this farm’s sheds first'}
                          disabled={!canDeleteFarm}
                          onClick={() => {
                            if (window.confirm(`Remove farm "${farm.name}"? This action cannot be undone.`)) {
                              deleteFarm(farm.id);
                              setSuccessMsg(`Farm "${farm.name}" removal requested.`);
                            }
                          }}
                          className="rounded-lg border border-red-200 p-1.5 text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Sheds inside this farm */}
                    <div className="pl-6 pt-2 border-t border-[#EDE7D8] space-y-1.5">
                      <span className="text-[10px] font-bold text-[#869289] uppercase tracking-wider block">
                        Assigned Sheds ({farmSheds.length}):
                      </span>

                      {farmSheds.length === 0 ? (
                        <span className="text-slate-400 italic text-[11px] block">
                          No sheds created for this farm yet. Click "Add Shed Here".
                        </span>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {farmSheds.map((shed) => (
                            <div
                              key={shed.id}
                              className="p-2.5 bg-white border border-[#E0D8C6] rounded-lg flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <Home className="w-3.5 h-3.5 text-[#5A7E6E]" />
                                <span className="font-bold text-[#222E27]">{shed.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] bg-[#F1EFEA] text-[#4A5750] px-2 py-0.5 rounded font-semibold tabular-nums">
                                  Cap: {formatNumber(shed.capacity)}
                                </span>
                                <button
                                  type="button"
                                  aria-label={`Remove shed ${shed.name}`}
                                  title={flocks.some((flock) => flock.shedId === shed.id) ? 'Sheds with flock history cannot be removed' : 'Remove shed'}
                                  disabled={flocks.some((flock) => flock.shedId === shed.id)}
                                  onClick={() => {
                                    if (window.confirm(`Remove shed "${shed.name}"? This action cannot be undone.`)) {
                                      deleteShed(shed.id);
                                      setSuccessMsg(`Shed "${shed.name}" removal requested.`);
                                    }
                                  }}
                                  className="rounded-md p-1 text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ADD FARM TAB */}
          {activeTab === 'addFarm' && (
            <form onSubmit={handleCreateFarm} className="space-y-4">
              <div>
                <label className="block font-bold text-[#202924] mb-1">
                  New Farm Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Madina Poultry Farm (Site 2), Green Valley Agro"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D5CDBC] rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A564A]/20"
                />
                <span className="text-[10px] text-[#717E75] mt-1 block">
                  Official name of the poultry farm facility or landholding.
                </span>
              </div>

              <div>
                <label className="block font-bold text-[#202924] mb-1">
                  Location / City / District *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Okara Cantt, Kamalia, Faisalabad Road"
                  value={farmLocation}
                  onChange={(e) => setFarmLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D5CDBC] rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-[#202924] mb-1">
                  Contact Phone / Supervisor Mobile
                </label>
                <input
                  type="text"
                  placeholder="Enter contact number"
                  value={farmContact}
                  onChange={(e) => setFarmContact(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D5CDBC] rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0EBE0]">
                <button
                  type="button"
                  onClick={() => setActiveTab('view')}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3A564A] hover:bg-[#2C443A] text-white rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save New Farm</span>
                </button>
              </div>
            </form>
          )}

          {/* ADD SHED TAB */}
          {activeTab === 'addShed' && (
            <form onSubmit={handleCreateShed} className="space-y-4">
              <div>
                <label className="block font-bold text-[#202924] mb-1">
                  Assign to Farm Location *
                </label>
                <select
                  required
                  value={selectedFarmId}
                  onChange={(e) => setSelectedFarmId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D5CDBC] bg-white rounded-xl text-xs font-semibold text-slate-900"
                >
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#202924] mb-1">
                  New Shed Name / Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shed 3 (Controlled Environment), Shed 4 East, Brooder House A"
                  value={shedName}
                  onChange={(e) => setShedName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D5CDBC] rounded-xl text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-[#202924] mb-1">
                  Bird Capacity (Birds) *
                </label>
                <input
                  type="number"
                  required
                  min="500"
                  step="500"
                  placeholder="e.g. 10000"
                  value={shedCapacity}
                  onChange={(e) => setShedCapacity(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#D5CDBC] rounded-xl text-xs font-bold text-slate-900 tabular-nums"
                />
                <span className="text-[10px] text-[#717E75] mt-1 block">
                  Maximum bird housing capacity for this shed.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0EBE0]">
                <button
                  type="button"
                  onClick={() => setActiveTab('view')}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3A564A] hover:bg-[#2C443A] text-white rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save New Shed</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
