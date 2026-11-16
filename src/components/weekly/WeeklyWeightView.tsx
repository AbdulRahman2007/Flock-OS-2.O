import React, { useState } from 'react';
import { usePoultry } from '../../context/PoultryContext';
import {
  calculateAverageSampleWeight,
  calculateWeightGainPerBird,
  calculateTotalWeightGainedKg,
  calculateWeeklyFCR,
  evaluateWeeklyTarget,
  formatNumber,
  formatWeight,
} from '../../utils/calculations';
import {
  Scale,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Sparkles,
  Info,
  Calendar,
  Layers,
} from 'lucide-react';

export const WeeklyWeightView: React.FC = () => {
  const {
    activeFlock,
    weeklyWeights,
    addWeeklyWeightRecord,
    dashboardKPIs,
  } = usePoultry();

  const flockWeights = weeklyWeights
    .filter((w) => w.flockId === activeFlock?.id)
    .sort((a, b) => a.weekNumber - b.weekNumber);

  // Standard targets based on breed (Cobb 500 / Ross 308 standards in Pakistan)
  const defaultWeeklyTargets: Record<number, number> = {
    1: 180,
    2: 450,
    3: 950,
    4: 1550,
    5: 2100,
    6: 2500,
  };

  // Next week to record
  const nextWeekNumber = flockWeights.length > 0 ? flockWeights[flockWeights.length - 1].weekNumber + 1 : 1;

  const [selectedWeek, setSelectedWeek] = useState<number>(nextWeekNumber <= 6 ? nextWeekNumber : 5);
  const [recordDate, setRecordDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sampleInput, setSampleInput] = useState<string>('');
  const [sampleList, setSampleList] = useState<number[]>([1580, 1560, 1600, 1570, 1590, 1555, 1585, 1610]);
  const [targetWeightGrams, setTargetWeightGrams] = useState<number>(
    defaultWeeklyTargets[nextWeekNumber <= 6 ? nextWeekNumber : 5] || 1550
  );
  const [notes, setNotes] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Handle week selection change
  const handleWeekChange = (wk: number) => {
    setSelectedWeek(wk);
    setTargetWeightGrams(defaultWeeklyTargets[wk] || 1500);
    // Pre-seed realistic samples for that week
    const baseTarget = defaultWeeklyTargets[wk] || 1500;
    const newSamples = Array.from({ length: 10 }, () =>
      Math.round(baseTarget + (Math.random() * 60 - 25))
    );
    setSampleList(newSamples);
  };

  // Add individual sample weight
  const handleAddSample = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(sampleInput);
    if (val && val > 0) {
      setSampleList((prev) => [...prev, val]);
      setSampleInput('');
    }
  };

  // Remove a sample
  const handleRemoveSample = (index: number) => {
    setSampleList((prev) => prev.filter((_, i) => i !== index));
  };

  // Quick simulate 12 birds crate weighing
  const handleSimulateCrate = () => {
    const base = targetWeightGrams;
    const simulated = Array.from({ length: 12 }, () =>
      Math.round(base + (Math.random() * 80 - 30))
    );
    setSampleList(simulated);
  };

  // Real-time calculations for current working sample
  const calculatedAvgGrams = calculateAverageSampleWeight(sampleList);

  // Previous week weight (or DOC weight for Week 1)
  let prevWeightGrams = activeFlock?.docWeightPerChickGrams || 42;
  if (selectedWeek > 1) {
    const prevW = flockWeights.find((w) => w.weekNumber === selectedWeek - 1);
    if (prevW) {
      prevWeightGrams = prevW.averageWeightGrams;
    }
  }

  const calculatedGainPerBird = calculateWeightGainPerBird(calculatedAvgGrams, prevWeightGrams);
  const liveBirds = dashboardKPIs.remainingBirds;
  const calculatedTotalFlockGainKg = calculateTotalWeightGainedKg(calculatedGainPerBird, liveBirds);

  // Estimated week feed for FCR calculation
  const estimatedWeekFeedKg = Math.round(
    selectedWeek === 1
      ? 1550
      : selectedWeek === 2
      ? 3400
      : selectedWeek === 3
      ? 7000
      : selectedWeek === 4
      ? 9600
      : 11000
  );
  const calculatedWeeklyFcr = calculateWeeklyFCR(estimatedWeekFeedKg, calculatedTotalFlockGainKg);

  const targetEvaluation = evaluateWeeklyTarget(calculatedAvgGrams, targetWeightGrams);

  // Submit weekly record
  const handleSaveWeeklyRecord = () => {
    if (sampleList.length === 0) return;

    addWeeklyWeightRecord({
      weekNumber: selectedWeek,
      date: recordDate,
      sampleWeights: sampleList,
      targetWeightGrams,
      notes: notes || undefined,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Title & DOC Placement Weight Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Weekly Weight & Target Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Record per-bird sample weights, calculate weekly gain, weekly FCR, and verify target goals.
          </p>
        </div>

        {/* DOC Chick Placement Weight Badge */}
        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-600/10 flex items-center justify-center text-amber-800 font-bold text-xs">
            DOC
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-900">
              DOC Placement Chick Weight
            </div>
            <div className="text-xs text-amber-950 font-bold tabular-nums">
              {activeFlock?.docWeightPerChickGrams} g / chick · Sample Avg: {activeFlock?.avgChickWeightPlacementGrams} g
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Sample Weights Entry & Automated Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sample Weighing Station (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-700" />
              <span>Per-Bird Sample Weighing Station</span>
            </h2>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Select Week:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                {[1, 2, 3, 4, 5, 6].map((wk) => (
                  <button
                    key={wk}
                    type="button"
                    onClick={() => handleWeekChange(wk)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      selectedWeek === wk
                        ? 'bg-emerald-700 text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    W{wk}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Meta: Date & Target Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Weighing Date *
              </label>
              <input
                type="date"
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Weekly Target Goal (Grams) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={targetWeightGrams}
                  onChange={(e) => setTargetWeightGrams(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg tabular-nums"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400">g</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Standard benchmark for {activeFlock?.breed} at Week {selectedWeek}
              </span>
            </div>
          </div>

          {/* Per-Bird Sample Weight Entry Bar */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-900">
                  Individual Bird Weight Entry
                </span>
                <p className="text-[11px] text-slate-500">
                  Weigh birds across crates to store each bird's weight individually ({sampleList.length} birds sampled)
                </p>
              </div>

              <button
                type="button"
                onClick={handleSimulateCrate}
                className="self-start sm:self-center px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Simulate Crate (12 Birds)</span>
              </button>
            </div>

            <form onSubmit={handleAddSample} className="flex gap-2">
              <input
                type="number"
                placeholder="Enter bird weight (e.g. 1580 grams)..."
                value={sampleInput}
                onChange={(e) => setSampleInput(e.target.value)}
                className="flex-1 text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/20 tabular-nums"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Sample</span>
              </button>
            </form>

            {/* Chips / Grid of sampled birds */}
            <div className="mt-3">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Stored Bird Sample Weights:
              </div>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 bg-white border border-slate-200 rounded-lg">
                {sampleList.map((weight, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200/70 rounded-md text-xs text-slate-800 tabular-nums font-medium"
                  >
                    <span>#{idx + 1}: {weight}g</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSample(idx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors ml-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {sampleList.length === 0 && (
                  <span className="text-xs text-slate-400 italic py-2">
                    No samples added yet. Enter weight above or click Simulate Crate.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Flock Uniformity & Growth Observations
            </label>
            <input
              type="text"
              placeholder="e.g. Uniformity 92%, feathers smooth, crop fullness good"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg"
            />
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            {saveSuccess ? (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Week {selectedWeek} Weight & FCR Saved!
              </span>
            ) : (
              <span className="text-xs text-slate-500">
                Live recalculation of Week {selectedWeek} target status
              </span>
            )}

            <button
              type="button"
              onClick={handleSaveWeeklyRecord}
              disabled={sampleList.length === 0}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Week {selectedWeek} Record</span>
            </button>
          </div>
        </div>

        {/* Real-time Calculation Panel & Target Status */}
        <div className="space-y-4">
          {/* Target Result Box */}
          <div
            className={`border rounded-xl p-5 shadow-xs transition-colors ${
              targetEvaluation.isAchieved
                ? 'bg-emerald-900 text-white border-emerald-800'
                : 'bg-rose-950 text-white border-rose-900'
            }`}
          >
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              [NEW] Target Evaluation Result
            </div>

            <div className="mt-2 flex items-center gap-2.5">
              {targetEvaluation.isAchieved ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <span className="text-xl font-bold">Goal Achieved!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                  <span className="text-xl font-bold">Not Achieved</span>
                </>
              )}
            </div>

            <div className="mt-2 text-xs leading-relaxed text-slate-200">
              Actual Average:{' '}
              <strong className="text-white tabular-nums">{calculatedAvgGrams} g</strong> vs Goal:{' '}
              <strong className="text-white tabular-nums">{targetWeightGrams} g</strong>
            </div>

            <div className="mt-1 text-xs">
              Difference:{' '}
              <span
                className={`font-bold tabular-nums ${
                  targetEvaluation.differenceGrams >= 0 ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {targetEvaluation.differenceGrams >= 0 ? '+' : ''}
                {targetEvaluation.differenceGrams} g
              </span>{' '}
              from weekly target goal.
            </div>
          </div>

          {/* Metrics Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Automatic Derived Calculations
            </h3>

            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
              <span className="text-slate-600">Sample Birds Count:</span>
              <span className="font-bold text-slate-900 tabular-nums">{sampleList.length} Birds</span>
            </div>

            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
              <span className="text-slate-600">Average Bird Weight:</span>
              <span className="font-bold text-emerald-800 tabular-nums">
                {formatWeight(calculatedAvgGrams)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
              <span className="text-slate-600">Weight Gain per Bird:</span>
              <span className="font-bold text-slate-900 tabular-nums">
                +{calculatedGainPerBird} g
                <span className="text-[11px] text-slate-400 font-normal ml-1">
                  (prev: {prevWeightGrams}g)
                </span>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
              <span className="text-slate-600">Total Flock Weight Gained:</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {formatNumber(calculatedTotalFlockGainKg)} kg
              </span>
            </div>

            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-slate-600 font-medium">[NEW] Weekly FCR:</span>
              <span className="font-bold text-indigo-700 text-sm tabular-nums">
                {calculatedWeeklyFcr}
              </span>
            </div>
          </div>

          {/* Business Logic Explainer */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>Section 6 Planning Formula</span>
            </div>
            <p>• Week 1 weight gain is measured against DOC Chick Weight ({activeFlock?.docWeightPerChickGrams}g).</p>
            <p>• Total flock gain = Gain per bird × Live birds ({formatNumber(liveBirds)}).</p>
            <p>• Weekly FCR = Weekly feed consumed ÷ Weekly total weight gained.</p>
          </div>
        </div>
      </div>

      {/* Historical Weekly Records Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Weekly Weight & FCR Performance Ledger ({flockWeights.length} Recorded Weeks)
            </h3>
            <p className="text-xs text-slate-500">
              Historical sample weights and target goal achievement history
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-800">
            Flock: {activeFlock?.flockNumber}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="px-4 py-3">Week / Date</th>
                <th className="px-3 py-3 text-right">Sampled</th>
                <th className="px-3 py-3 text-right font-bold text-slate-900">Actual Avg Weight</th>
                <th className="px-3 py-3 text-right text-slate-700">Target Goal</th>
                <th className="px-3 py-3 text-right">Difference</th>
                <th className="px-3 py-3 text-center">[NEW] Goal Status</th>
                <th className="px-3 py-3 text-right">Gain / Bird</th>
                <th className="px-3 py-3 text-right">Total Gain (kg)</th>
                <th className="px-3 py-3 text-right font-bold text-indigo-700">[NEW] Weekly FCR</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {flockWeights.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">Week {w.weekNumber}</div>
                    <div className="text-[11px] text-slate-500">{w.date}</div>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-600">
                    {w.birdsSampledCount} birds
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums font-bold text-slate-900">
                    {formatWeight(w.averageWeightGrams)}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-600">
                    {w.targetWeightGrams} g
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums font-semibold">
                    <span className={w.targetDifferenceGrams >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                      {w.targetDifferenceGrams >= 0 ? '+' : ''}
                      {w.targetDifferenceGrams} g
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        w.isGoalAchieved ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {w.isGoalAchieved ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Achieved
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" /> Not Achieved
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-700">
                    +{w.weightGainPerBirdGrams} g
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-700">
                    {formatNumber(w.totalFlockWeightGainKg)} kg
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums font-bold text-indigo-700">
                    {w.weeklyFcr}
                  </td>
                  <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                    {w.notes || '-'}
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
