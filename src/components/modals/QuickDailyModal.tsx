import React, { useState } from 'react';
import { usePoultry } from '../../context/PoultryContext';
import { calculateClosingBirds, formatNumber } from '../../utils/calculations';
import { X, Plus, Calendar, CheckCircle2 } from 'lucide-react';

interface QuickDailyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickDailyModal: React.FC<QuickDailyModalProps> = ({ isOpen, onClose }) => {
  const { activeFlock, dailyRecords, addDailyRecord } = usePoultry();

  const flockDaily = dailyRecords
    .filter((r) => r.flockId === activeFlock?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const latestRecord = flockDaily[0];
  const defaultOpening = latestRecord ? latestRecord.closingBirds : activeFlock?.initialBirds || 10000;
  const currentDayAge = latestRecord ? latestRecord.dayNumber + 1 : 1;

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dayNumber, setDayNumber] = useState<number>(currentDayAge);
  const [openingBirds, setOpeningBirds] = useState<number>(defaultOpening);
  const [mortality, setMortality] = useState<number | ''>(6);
  const [culling, setCulling] = useState<number | ''>(1);
  const [salesCount, setSalesCount] = useState<number | ''>(0);
  const [feedBagsInput, setFeedBagsInput] = useState<number | ''>(21);
  const [feedUsedKg, setFeedUsedKg] = useState<number | ''>(1050);
  const [feedType, setFeedType] = useState<'Pre-Starter' | 'Starter' | 'Grower' | 'Finisher'>('Finisher');
  const [medicationGiven, setMedicationGiven] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const mortNum = typeof mortality === 'number' ? mortality : 0;
  const cullNum = typeof culling === 'number' ? culling : 0;
  const saleNum = typeof salesCount === 'number' ? salesCount : 0;
  const liveClosing = calculateClosingBirds(openingBirds, mortNum, cullNum, saleNum);

  const handleBagsChange = (val: number | '') => {
    setFeedBagsInput(val);
    if (typeof val === 'number') {
      setFeedUsedKg(Number((val * 50).toFixed(1)));
    } else {
      setFeedUsedKg('');
    }
  };

  const handleKgChange = (val: number | '') => {
    setFeedUsedKg(val);
    if (typeof val === 'number') {
      setFeedBagsInput(Number((val / 50).toFixed(2)));
    } else {
      setFeedBagsInput('');
    }
  };

  const feedBags = typeof feedBagsInput === 'number' ? feedBagsInput : (typeof feedUsedKg === 'number' ? (feedUsedKg / 50).toFixed(1) : '0');
  const finalFeedKg = typeof feedUsedKg === 'number' ? feedUsedKg : (typeof feedBagsInput === 'number' ? feedBagsInput * 50 : 0);

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
      feedUsedKg: finalFeedKg,
      feedType,
      medicationGiven: medicationGiven.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        <div className="bg-emerald-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 className="font-bold text-sm">Quick Daily Flock Entry</h3>
              <span className="text-[11px] text-emerald-200">{activeFlock?.flockNumber}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Flock Day Age *</label>
              <input
                type="number"
                required
                value={dayNumber}
                onChange={(e) => setDayNumber(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs tabular-nums"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
              Population Movement
            </span>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block">Opening</label>
                <input
                  type="number"
                  value={openingBirds}
                  onChange={(e) => setOpeningBirds(Number(e.target.value))}
                  className="w-full px-2 py-1 border border-slate-200 rounded text-xs tabular-nums"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-rose-700 block">Died</label>
                <input
                  type="number"
                  min="0"
                  value={mortality}
                  onChange={(e) => setMortality(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2 py-1 border border-rose-300 rounded text-xs text-rose-800 font-bold tabular-nums"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-orange-700 block">Culled</label>
                <input
                  type="number"
                  min="0"
                  value={culling}
                  onChange={(e) => setCulling(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2 py-1 border border-orange-300 rounded text-xs text-orange-800 font-bold tabular-nums"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-600 block">Sold</label>
                <input
                  type="number"
                  min="0"
                  value={salesCount}
                  onChange={(e) => setSalesCount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2 py-1 border border-slate-200 rounded text-xs tabular-nums"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-xs font-semibold">
              <span className="text-slate-600">Calculated Closing:</span>
              <span className="font-bold text-emerald-800 tabular-nums">{formatNumber(liveClosing)} Birds</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-2.5 bg-amber-50/50 rounded-lg border border-amber-200/70">
            <div>
              <label className="block font-bold text-amber-950 mb-1 text-[11px]">
                Feed in Bags (50 kg / bag) *
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
                  className="w-full px-2.5 py-1.5 border border-amber-300 rounded-lg text-xs font-bold text-slate-900 tabular-nums bg-white"
                />
                <span className="absolute right-2.5 top-1.5 text-[11px] font-semibold text-amber-800">Bags</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-800 mt-1 block">
                = {finalFeedKg} kg (50 kg/bag)
              </span>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1 text-[11px]">Feed Type</label>
              <select
                value={feedType}
                onChange={(e) => setFeedType(e.target.value as any)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white font-medium"
              >
                <option value="Pre-Starter">Pre-Starter (50kg)</option>
                <option value="Starter">Starter (50kg)</option>
                <option value="Grower">Grower (50kg)</option>
                <option value="Finisher">Finisher (50kg)</option>
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">Standard 50kg bag</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Medication Given (if any)</label>
            <input
              type="text"
              placeholder="e.g. Vitamin AD3E, Hepavet"
              value={medicationGiven}
              onChange={(e) => setMedicationGiven(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notes</label>
            <input
              type="text"
              placeholder="Daily observations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
