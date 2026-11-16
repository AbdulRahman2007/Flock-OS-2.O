import React from 'react';
import { usePoultry } from '../../context/PoultryContext';
import {
  formatPKR,
  formatNumber,
  formatWeight,
} from '../../utils/calculations';
import {
  FileText,
  Printer,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Download,
  Building,
} from 'lucide-react';

export const FlockPerformanceReport: React.FC = () => {
  const {
    activeFlock,
    weeklyWeights,
    dailyRecords,
    sales,
    expenses,
    dashboardKPIs,
  } = usePoultry();

  const flockWeights = weeklyWeights
    .filter((w) => w.flockId === activeFlock?.id)
    .sort((a, b) => a.weekNumber - b.weekNumber);

  const flockSales = sales.filter((s) => s.flockId === activeFlock?.id);
  const flockExpenses = expenses.filter((e) => e.flockId === activeFlock?.id || !e.flockId);

  // Financial aggregates
  const totalRevenue = dashboardKPIs.totalRevenuePkr;
  const totalExpenses = dashboardKPIs.totalExpensesPkr;
  const netProfit = dashboardKPIs.estimatedProfitPkr;

  const totalBirdsSold = dashboardKPIs.totalSoldBirds;
  const totalWeightSoldKg = flockSales.reduce((acc, s) => acc + s.totalWeightSoldKg, 0);

  const profitPerBird = totalBirdsSold > 0 ? Math.round(netProfit / totalBirdsSold) : 0;
  const profitPerKg = totalWeightSoldKg > 0 ? (netProfit / totalWeightSoldKg).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Comprehensive Batch Performance Report
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full audit of biological growth, weekly weight targets, commercial sales, and financial returns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-xs space-y-6">
        {/* Farm & Flock Header Block */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              FLOCK OS · Developed by Codision Labs
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              Flock Batch Audit: {activeFlock?.flockNumber}
            </h2>
            <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
              <span>Breed: {activeFlock?.breed}</span>
              <span>·</span>
              <span>Hatchery: {activeFlock?.supplier}</span>
              <span>·</span>
              <span>Placement Date: {activeFlock?.placementDate}</span>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="text-slate-400 block">Report Generation:</span>
            <span className="font-semibold text-slate-900">{new Date().toLocaleDateString('en-PK')}</span>
            <span className="text-slate-500 block text-[11px] mt-0.5">System Status: Active Broiler Cycle</span>
          </div>
        </div>

        {/* DOC Placement Baseline Info (Section 3, 6, 7) */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">Initial DOC Placed:</span>
            <strong className="text-slate-900 text-sm tabular-nums">
              {formatNumber(dashboardKPIs.totalBirds)} Birds
            </strong>
          </div>

          <div>
            <span className="text-slate-500 block text-[11px]">[NEW] DOC Chick Weight:</span>
            <strong className="text-slate-900 text-sm tabular-nums">
              {activeFlock?.docWeightPerChickGrams} g
            </strong>
          </div>

          <div>
            <span className="text-slate-500 block text-[11px]">[NEW] Placement Sample Avg:</span>
            <strong className="text-slate-900 text-sm tabular-nums">
              {activeFlock?.avgChickWeightPlacementGrams} g
            </strong>
          </div>

          <div>
            <span className="text-slate-500 block text-[11px]">Cumulative Mortality:</span>
            <strong className="text-rose-700 text-sm tabular-nums">
              {dashboardKPIs.mortalityPercent}% ({formatNumber(dashboardKPIs.totalMortality)} birds)
            </strong>
          </div>
        </div>

        {/* Biological Metrics & FCR */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">
            1. Biological Performance & Feed Efficiency
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block">Remaining Live Birds</span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                {formatNumber(dashboardKPIs.remainingBirds)}
              </span>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block">Total Feed (50kg / Bag)</span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                {(dashboardKPIs.totalFeedConsumedKg / 50).toFixed(0)} Bags <span className="text-xs font-normal text-slate-500">({formatNumber(dashboardKPIs.totalFeedConsumedKg)} kg)</span>
              </span>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block">Latest Avg Weight</span>
              <span className="text-lg font-bold text-emerald-800 tabular-nums">
                {formatWeight(dashboardKPIs.latestAvgWeightGrams)}
              </span>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block">Overall Batch FCR</span>
              <span className="text-lg font-bold text-indigo-700 tabular-nums">
                {dashboardKPIs.overallFcr}
              </span>
            </div>
          </div>
        </div>

        {/* Weekly Weight & FCR Target Tracker */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">
            2. [NEW] Weekly Weight Goal Achievement & FCR Tracking
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Week</th>
                  <th className="px-3 py-2.5">Date</th>
                  <th className="px-3 py-2.5 text-right">Sample Birds</th>
                  <th className="px-3 py-2.5 text-right font-bold text-slate-900">Actual Avg Weight</th>
                  <th className="px-3 py-2.5 text-right">Target Goal</th>
                  <th className="px-3 py-2.5 text-right">Difference</th>
                  <th className="px-3 py-2.5 text-center">[NEW] Goal Result</th>
                  <th className="px-3 py-2.5 text-right">Gain / Bird</th>
                  <th className="px-3 py-2.5 text-right font-bold text-indigo-700">[NEW] Weekly FCR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {flockWeights.map((w) => (
                  <tr key={w.id}>
                    <td className="px-4 py-2 font-bold text-slate-900">Week {w.weekNumber}</td>
                    <td className="px-3 py-2 text-slate-600">{w.date}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{w.birdsSampledCount}</td>
                    <td className="px-3 py-2 text-right tabular-nums font-bold text-slate-900">
                      {w.averageWeightGrams} g
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{w.targetWeightGrams} g</td>
                    <td className="px-3 py-2 text-right tabular-nums font-semibold">
                      <span className={w.targetDifferenceGrams >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                        {w.targetDifferenceGrams >= 0 ? '+' : ''}{w.targetDifferenceGrams} g
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center font-semibold">
                      {w.isGoalAchieved ? (
                        <span className="text-emerald-700">Achieved</span>
                      ) : (
                        <span className="text-rose-600">Not Achieved</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">+{w.weightGainPerBirdGrams} g</td>
                    <td className="px-3 py-2 text-right tabular-nums font-bold text-indigo-700">{w.weeklyFcr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Commercial Sales with Rate Diff */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">
            3. [NEW] Commercial Sales & Customer Lifting Records
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Customer Name</th>
                  <th className="px-3 py-2.5 text-right">Market Rate</th>
                  <th className="px-3 py-2.5 text-right font-bold text-emerald-800">Final Sold Rate</th>
                  <th className="px-3 py-2.5 text-right">[NEW] Rate Diff</th>
                  <th className="px-3 py-2.5 text-right">Total Weight</th>
                  <th className="px-3 py-2.5 text-right">Birds</th>
                  <th className="px-3 py-2.5 text-right font-bold text-slate-900">Total Amount (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {flockSales.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-2 text-slate-700">{s.date}</td>
                    <td className="px-4 py-2 font-semibold text-slate-900">{s.customerName}</td>
                    <td className="px-3 py-2 text-right tabular-nums">Rs. {s.marketRatePerKg}/kg</td>
                    <td className="px-3 py-2 text-right tabular-nums font-bold text-emerald-800">
                      Rs. {s.finalRatePerKg}/kg
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums font-semibold text-emerald-700">
                      +Rs. {s.rateDifferencePerKg}/kg
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatNumber(s.totalWeightSoldKg)} kg</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatNumber(s.birdsSold)}</td>
                    <td className="px-3 py-2 text-right tabular-nums font-bold text-slate-900">
                      {formatPKR(s.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Profitability Summary */}
        <div className="bg-slate-900 text-white rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            4. Net Profitability & Batch Financial Balance
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <span className="text-xs text-slate-400 block">Total Sales Revenue:</span>
              <span className="text-xl font-bold text-emerald-400 tabular-nums">
                {formatPKR(totalRevenue)}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block">Total Production Expenses:</span>
              <span className="text-xl font-bold text-rose-400 tabular-nums">
                {formatPKR(totalExpenses)}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block">Net Profit (PKR):</span>
              <span className={`text-xl font-bold tabular-nums ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatPKR(netProfit)}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3 flex flex-wrap items-center justify-between text-xs text-slate-300">
            <span>Estimated Profit per Sold Bird: <strong>Rs. {profitPerBird}</strong></span>
            <span>Estimated Profit per KG Meat: <strong>Rs. {profitPerKg}</strong></span>
            <span>Local Currency: Pakistani Rupee (PKR / Rs.)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
