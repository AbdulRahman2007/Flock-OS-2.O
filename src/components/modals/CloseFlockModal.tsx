import React, { useState } from 'react';
import { usePoultry } from '../../context/PoultryContext';
import { formatPKR, formatNumber } from '../../utils/calculations';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

interface CloseFlockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloseFlockModal: React.FC<CloseFlockModalProps> = ({ isOpen, onClose }) => {
  const { activeFlock, dashboardKPIs, closeFlock, reopenFlock } = usePoultry();

  const [closureDate, setClosureDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [reconcileAction, setReconcileAction] = useState<'sold' | 'culled' | 'none'>(
    dashboardKPIs.remainingBirds > 0 ? 'sold' : 'none'
  );
  const [closureNotes, setClosureNotes] = useState<string>(
    'Batch successfully completed and cleared. Shed prepared for litter removal, disinfection, and next chick placement.'
  );
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen || !activeFlock) return null;

  const isAlreadyCompleted = activeFlock.status === 'completed';

  const handleCloseBatch = (e: React.FormEvent) => {
    e.preventDefault();
    closeFlock(
      activeFlock.id,
      closureDate,
      closureNotes,
      reconcileAction === 'none' ? undefined : reconcileAction
    );
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  const handleReopen = () => {
    reopenFlock(activeFlock.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-6">
        <div className={`p-5 text-white flex items-center justify-between ${
          isAlreadyCompleted ? 'bg-slate-800' : 'bg-rose-900'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {isAlreadyCompleted ? 'Flock Batch Closure Details' : 'Close / Finalize Flock Batch'}
              </h3>
              <span className="text-xs text-white/80">
                {activeFlock.flockNumber} ({activeFlock.breed})
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {isAlreadyCompleted ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>This Flock Batch is Completed</span>
                </div>
                <p className="text-xs">
                  Closure Date: <strong>{activeFlock.closureDate || 'Recorded'}</strong>
                </p>
                <p className="text-xs text-emerald-800">
                  Notes: {activeFlock.closureNotes || 'Batch cleared and archived.'}
                </p>
              </div>

              {/* Final Batch Metrics Summary */}
              <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2 text-xs">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Final Batch Performance Recap
                </span>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                  <div>Initial Birds: {formatNumber(dashboardKPIs.totalBirds)}</div>
                  <div>Final Mortality: {dashboardKPIs.mortalityPercent}%</div>
                  <div>Total Birds Sold: {formatNumber(dashboardKPIs.totalSoldBirds)}</div>
                  <div>Overall FCR: {dashboardKPIs.overallFcr}</div>
                  <div>Total Revenue: {formatPKR(dashboardKPIs.totalRevenuePkr)}</div>
                  <div>Net Profit: {formatPKR(dashboardKPIs.estimatedProfitPkr)}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleReopen}
                  className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 font-semibold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Re-open Active Batch</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCloseBatch} className="space-y-4">
              {/* Batch Status & Reconciliation Notice */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                  Flock Status & Shed Reconciliation
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-600">
                  <div>
                    <span className="block text-[10px] text-slate-400">Placed Count:</span>
                    <strong className="text-slate-900 text-xs">{formatNumber(dashboardKPIs.totalBirds)}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400">Already Sold:</span>
                    <strong className="text-emerald-700 text-xs">{formatNumber(dashboardKPIs.totalSoldBirds)}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400">Remaining in Shed:</span>
                    <strong className={`text-xs ${dashboardKPIs.remainingBirds > 0 ? 'text-amber-700 font-bold' : 'text-slate-900'}`}>
                      {formatNumber(dashboardKPIs.remainingBirds)} Birds
                    </strong>
                  </div>
                </div>

                {dashboardKPIs.remainingBirds > 0 && (
                  <div className="pt-2 border-t border-slate-200 mt-2">
                    <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                      Reconcile Remaining {formatNumber(dashboardKPIs.remainingBirds)} Birds Before Closing:
                    </label>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-800">
                        <input
                          type="radio"
                          name="reconcileAction"
                          checked={reconcileAction === 'sold'}
                          onChange={() => setReconcileAction('sold')}
                          className="text-emerald-700"
                        />
                        <span>
                          <strong>Record Final Clearance Sale</strong> (Automatically logs a final sale for {formatNumber(dashboardKPIs.remainingBirds)} birds)
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-slate-800">
                        <input
                          type="radio"
                          name="reconcileAction"
                          checked={reconcileAction === 'culled'}
                          onChange={() => setReconcileAction('culled')}
                          className="text-emerald-700"
                        />
                        <span>
                          <strong>Record Final Depopulation / Cull</strong> (Clears runts & unlifted birds to zero)
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Financial & Performance Recap */}
              <div className="p-3 bg-slate-900 text-white rounded-xl space-y-1.5 text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                  Final Batch Lifecycle Metrics
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>Mortality: <strong className="text-white">{dashboardKPIs.mortalityPercent}%</strong></div>
                  <div>Total Feed: <strong className="text-white">{(dashboardKPIs.totalFeedConsumedKg / 1000).toFixed(1)} tons</strong></div>
                  <div>Final FCR: <strong className="text-emerald-400">{dashboardKPIs.overallFcr}</strong></div>
                  <div>Net Profit: <strong className="text-emerald-400">{formatPKR(dashboardKPIs.estimatedProfitPkr)}</strong></div>
                </div>
              </div>

              {/* Closure Date & Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Batch Completion / Clearance Date *
                </label>
                <input
                  type="date"
                  required
                  value={closureDate}
                  onChange={(e) => setClosureDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Final Closure Notes & Shed Turnaround Remarks
                </label>
                <textarea
                  rows={2}
                  value={closureNotes}
                  onChange={(e) => setClosureNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  placeholder="e.g. All birds lifted by Haji Aslam. Old litter bagged and sold for fertilizer. Washing and disinfection starts tomorrow."
                />
              </div>

              {isSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Flock successfully closed and archived!</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Confirm & Close Flock Batch</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
