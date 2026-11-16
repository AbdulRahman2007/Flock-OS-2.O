import React, { useState } from 'react';
import { usePoultry } from '../../context/PoultryContext';
import {
  calculateClosingBirds,
  formatNumber,
} from '../../utils/calculations';
import {
  Calendar,
  Plus,
  Trash2,
  Wheat,
  Pill,
  ShieldCheck,
  CheckCircle2,
  Info,
  Clock,
  Search,
} from 'lucide-react';

export const DailyOperationsView: React.FC = () => {
  const {
    activeFlock,
    dailyRecords,
    addDailyRecord,
    deleteDailyRecord,
    vaccinations,
    updateVaccineStatus,
  } = usePoultry();

  const flockDaily = dailyRecords
    .filter((r) => r.flockId === activeFlock?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Derive latest opening birds
  const latestRecord = flockDaily[0];
  const defaultOpening = latestRecord ? latestRecord.closingBirds : activeFlock?.initialBirds || 10000;
  const currentDayAge = latestRecord ? latestRecord.dayNumber + 1 : 1;

  // Form states
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dayNumber, setDayNumber] = useState<number>(currentDayAge);
  const [openingBirds, setOpeningBirds] = useState<number>(defaultOpening);
  const [mortality, setMortality] = useState<number | ''>(0);
  const [culling, setCulling] = useState<number | ''>(0);
  const [salesCount, setSalesCount] = useState<number | ''>(0);
  const [feedBagsInput, setFeedBagsInput] = useState<number | ''>(20.8);
  const [feedUsedKg, setFeedUsedKg] = useState<number | ''>(1040);
  const [feedType, setFeedType] = useState<'Pre-Starter' | 'Starter' | 'Grower' | 'Finisher'>('Finisher');
  const [avgWeightGrams, setAvgWeightGrams] = useState<number | ''>('');
  const [medicationGiven, setMedicationGiven] = useState<string>('');
  const [medicationDose, setMedicationDose] = useState<string>('');
  const [medicationPurpose, setMedicationPurpose] = useState<string>('');
  const [selectedVaccineId, setSelectedVaccineId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSuccessMessage, setIsSuccessMessage] = useState<boolean>(false);

  // Live calculation of Closing Birds:
  // Closing Birds = Opening Birds - Mortality - Culling - Sales
  const mortNum = typeof mortality === 'number' ? mortality : 0;
  const cullNum = typeof culling === 'number' ? culling : 0;
  const saleNum = typeof salesCount === 'number' ? salesCount : 0;
  const liveClosingBirds = calculateClosingBirds(openingBirds, mortNum, cullNum, saleNum);

  // Synchronized Feed calculations (Each bag = 50 kg)
  const handleBagsChange = (bagsVal: number | '') => {
    setFeedBagsInput(bagsVal);
    if (typeof bagsVal === 'number') {
      setFeedUsedKg(Number((bagsVal * 50).toFixed(1)));
    } else {
      setFeedUsedKg('');
    }
  };

  const handleKgChange = (kgVal: number | '') => {
    setFeedUsedKg(kgVal);
    if (typeof kgVal === 'number') {
      setFeedBagsInput(Number((kgVal / 50).toFixed(2)));
    } else {
      setFeedBagsInput('');
    }
  };

  const feedKgNum = typeof feedUsedKg === 'number' ? feedUsedKg : (typeof feedBagsInput === 'number' ? feedBagsInput * 50 : 0);
  const liveFeedBags = typeof feedBagsInput === 'number' ? feedBagsInput : Number((feedKgNum / 50).toFixed(2));

  // Vaccines pending for this flock
  const pendingVaccines = vaccinations.filter(
    (v) => v.flockId === activeFlock?.id && v.status === 'pending'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFlock) return;

    addDailyRecord({
      flockId: activeFlock.id,
      date,
      dayNumber: Number(dayNumber),
      openingBirds: Number(openingBirds),
      mortality: mortNum,
      culling: cullNum,
      salesCount: saleNum,
      feedUsedKg: feedKgNum,
      feedType,
      avgWeightGrams: avgWeightGrams ? Number(avgWeightGrams) : undefined,
      medicationGiven: medicationGiven.trim() || undefined,
      medicationDose: medicationDose.trim() || undefined,
      medicationPurpose: medicationPurpose.trim() || undefined,
      vaccineGiven: selectedVaccineId ? pendingVaccines.find(v => v.id === selectedVaccineId)?.vaccineName : undefined,
      vaccineStatus: selectedVaccineId ? 'given' : 'none',
      notes: notes.trim() || undefined,
    });

    if (selectedVaccineId) {
      updateVaccineStatus(selectedVaccineId, 'completed');
    }

    // Update opening for next potential entry
    setOpeningBirds(liveClosingBirds);
    setDayNumber((prev) => prev + 1);
    setMortality(0);
    setCulling(0);
    setSalesCount(0);
    setMedicationGiven('');
    setMedicationDose('');
    setMedicationPurpose('');
    setSelectedVaccineId('');
    setNotes('');

    setIsSuccessMessage(true);
    setTimeout(() => setIsSuccessMessage(false), 3000);
  };

  const filteredRecords = flockDaily.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.date.includes(term) ||
      `day ${r.dayNumber}`.includes(term) ||
      r.feedType.toLowerCase().includes(term) ||
      (r.medicationGiven && r.medicationGiven.toLowerCase().includes(term)) ||
      (r.notes && r.notes.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Daily Flock Operations Entry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log daily mortality, culling, sales, feed, and medication for {activeFlock?.flockNumber}. (Temperature & humidity removed per revised specifications).
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200/60 font-semibold">
            Current Live Birds: {formatNumber(defaultOpening)}
          </div>
          <div className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
            Flock Age: Day {currentDayAge}
          </div>
        </div>
      </div>

      {/* Main Grid: Entry Form on Left, Live Calculator / Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Container (2 Cols on lg) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>Log Daily Flock Record</span>
            </h2>
            {isSuccessMessage && (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Record saved & metrics recalculated!
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Date & Day Age */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Record Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Flock Age (Days) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="120"
                  value={dayNumber}
                  onChange={(e) => setDayNumber(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 tabular-nums"
                />
              </div>
            </div>

            {/* Row 2: Population Movements (Opening, Mortality, Culling, Sales) */}
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Bird Population Movement
                </span>
                <span className="text-[11px] text-slate-500">
                  Formula: Closing = Opening - Mortality - Culling - Sales
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Opening Birds
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={openingBirds}
                    onChange={(e) => setOpeningBirds(Number(e.target.value))}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-rose-700 mb-1">
                    Birds Died (Mortality) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={mortality}
                    onChange={(e) => setMortality(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500/20 text-rose-800 font-semibold tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-orange-700 mb-1">
                    Birds Culled *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={culling}
                    onChange={(e) => setCulling(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 text-orange-800 font-semibold tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Birds Sold / Lifted
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={salesCount}
                    onChange={(e) => setSalesCount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg tabular-nums"
                  />
                </div>
              </div>

              {/* Automatic Live Closing Calculation Pill */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs font-semibold">
                <span className="text-slate-700">Calculated Closing Birds:</span>
                <span className="text-sm font-bold text-emerald-800 tabular-nums">
                  {formatNumber(liveClosingBirds)} Birds
                </span>
              </div>
            </div>

            {/* Row 3: Daily Feed & Weight (Calculated in per 50kg bag) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-amber-50/40 rounded-xl border border-amber-200/60">
              <div>
                <label className="block text-xs font-bold text-amber-950 mb-1">
                  Feed Used in Bags (50 kg / bag) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    placeholder="e.g. 21"
                    value={feedBagsInput}
                    onChange={(e) => handleBagsChange(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 bg-white border border-amber-300 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 tabular-nums"
                  />
                  <span className="absolute right-3 top-2 text-xs font-semibold text-amber-800">Bags</span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-800 mt-1 block">
                  = {feedKgNum} kg ({liveFeedBags} bags × 50kg)
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Or Feed in KG (50kg / bag)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={feedUsedKg}
                    onChange={(e) => handleKgChange(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg tabular-nums"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400">kg</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  = {(feedKgNum / 50).toFixed(2)} bags
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Feed Type
                </label>
                <select
                  value={feedType}
                  onChange={(e) => setFeedType(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                >
                  <option value="Pre-Starter">Pre-Starter (50kg Mesh)</option>
                  <option value="Starter">Starter (50kg Crumble)</option>
                  <option value="Grower">Grower (50kg Crumble)</option>
                  <option value="Finisher">Finisher (50kg Pellet)</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">Standard 50kg commercial bag</span>
              </div>
            </div>

            {/* Row 4: Daily Medication & Scheduled Vaccination */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Pill className="w-4 h-4 text-emerald-700" />
                <span>Daily Medication & Vaccination Record</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Medicine Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vitamin AD3E, Hepavet"
                    value={medicationGiven}
                    onChange={(e) => setMedicationGiven(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Dosage & Route
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1 ml / 2L water"
                    value={medicationDose}
                    onChange={(e) => setMedicationDose(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Medical Purpose
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Liver protection, Stress relief"
                    value={medicationPurpose}
                    onChange={(e) => setMedicationPurpose(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              {pendingVaccines.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Mark Scheduled Vaccination Given Today:
                  </label>
                  <select
                    value={selectedVaccineId}
                    onChange={(e) => setSelectedVaccineId(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="">-- No vaccination scheduled today --</option>
                    {pendingVaccines.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.vaccineName} (Scheduled for Day {v.dayAge}, {v.route})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Farm Worker Observations & Daily Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Birds active, litter condition dry, drinker water flushed at 4 PM"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Save Daily Record</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Info Card: Daily Quick Rules & Today's Summary */}
        <div className="space-y-4">
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-2 text-emerald-400">
              <Info className="w-4 h-4" />
              <span>Automated Calculation Engine</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Whenever a daily entry is saved, the system automatically recalculates:
            </p>
            <ul className="mt-3 space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">1.</span>
                <span>
                  <strong>Closing Count:</strong> Opening ({formatNumber(openingBirds)}) - Died ({mortNum}) - Culled ({cullNum}) - Sold ({saleNum}) = <strong className="text-white">{formatNumber(liveClosingBirds)}</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">2.</span>
                <span>
                  <strong>Feed Conversion:</strong> {feedKgNum} kg ({liveFeedBags} bags) tracked against flock growth.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">3.</span>
                <span>
                  <strong>Dashboard Sync:</strong> Live birds, mortality %, and daily consumption update in real time.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">
              Pakistani Farming Protocol
            </h4>
            <div className="text-xs text-slate-600 space-y-1.5">
              <p>• Standard 50kg feed bags used across Punjab & KPK.</p>
              <p>• Temperature and humidity records removed as per revised planning document.</p>
              <p>• Regular midday electrolytes prevent heat stress spikes.</p>
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Daily Flock Logs History ({filteredRecords.length} Days)
            </h3>
            <p className="text-xs text-slate-500">
              Auditable records for {activeFlock?.flockNumber}
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search date, day, medicine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 w-56"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="px-4 py-3">Date / Day</th>
                <th className="px-3 py-3 text-right">Opening</th>
                <th className="px-3 py-3 text-right text-rose-700">Mortality</th>
                <th className="px-3 py-3 text-right text-orange-700">Culled</th>
                <th className="px-3 py-3 text-right">Sold</th>
                <th className="px-3 py-3 text-right font-bold text-slate-900">Closing</th>
                <th className="px-3 py-3 text-right text-emerald-950 font-bold">Feed Bags (50kg) & KG</th>
                <th className="px-3 py-3">Feed Type</th>
                <th className="px-4 py-3">Medication & Notes</th>
                <th className="px-3 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{r.date}</div>
                    <div className="text-[11px] text-slate-500">Day {r.dayNumber}</div>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-700">
                    {formatNumber(r.openingBirds)}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums font-semibold text-rose-600">
                    {r.mortality > 0 ? `-${r.mortality}` : '0'}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-orange-600">
                    {r.culling > 0 ? `-${r.culling}` : '0'}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-indigo-600 font-medium">
                    {r.salesCount > 0 ? `-${formatNumber(r.salesCount)}` : '-'}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums font-bold text-slate-900">
                    {formatNumber(r.closingBirds)}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    <span className="font-bold text-slate-900">{r.feedBags} Bags</span>
                    <span className="text-[11px] text-slate-500 block">({formatNumber(r.feedUsedKg)} kg)</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-slate-700">{r.feedType}</span>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    {r.medicationGiven && (
                      <div className="text-slate-800 font-medium truncate">
                        {r.medicationGiven} ({r.medicationDose})
                      </div>
                    )}
                    {r.notes && <div className="text-[11px] text-slate-500 truncate">{r.notes}</div>}
                    {!r.medicationGiven && !r.notes && <span className="text-slate-400">-</span>}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      onClick={() => deleteDailyRecord(r.id)}
                      title="Delete record"
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
