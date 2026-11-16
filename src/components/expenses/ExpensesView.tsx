import React, { useState } from 'react';
import { usePoultry } from '../../context/PoultryContext';
import { ExpenseCategory, ExpenseRecord } from '../../types/poultry';
import { formatPKR, formatNumber } from '../../utils/calculations';
import {
  Receipt,
  Plus,
  Trash2,
  Wheat,
  Fuel,
  Flame,
  Layers,
  Zap,
  Users,
  Search,
  CheckCircle2,
  Filter,
} from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const {
    activeFlock,
    expenses,
    addExpenseRecord,
    deleteExpenseRecord,
    dashboardKPIs,
  } = usePoultry();

  const flockExpenses = expenses
    .filter((e) => e.flockId === activeFlock?.id || !e.flockId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Form states
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory>('Litter');
  const [description, setDescription] = useState<string>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [unit, setUnit] = useState<string>('bags');
  const [unitPricePkr, setUnitPricePkr] = useState<number | ''>('');
  const [totalAmountPkr, setTotalAmountPkr] = useState<number | ''>('');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Bank Transfer' | 'Cheque' | 'Credit'>('Cash');
  const [vendorName, setVendorName] = useState<string>('');

  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [successSaved, setSuccessSaved] = useState<boolean>(false);

  // Auto calculate total if quantity and unit price are entered
  const handleQuantityChange = (val: number | '') => {
    setQuantity(val);
    if (typeof val === 'number' && typeof unitPricePkr === 'number') {
      setTotalAmountPkr(val * unitPricePkr);
    }
  };

  const handleUnitPriceChange = (val: number | '') => {
    setUnitPricePkr(val);
    if (typeof quantity === 'number' && typeof val === 'number') {
      setTotalAmountPkr(quantity * val);
    }
  };

  // Adjust default units based on category
  const handleCategoryChange = (cat: ExpenseCategory) => {
    setCategory(cat);
    if (cat === 'Litter') {
      setUnit('bags');
      setDescription('Clean dried rice husk bedding for shed floor');
    } else if (cat === 'Diesel') {
      setUnit('liters');
      setDescription('Diesel for standby generator during load shedding');
    } else if (cat === 'Wood brooders') {
      setUnit('maunds (40kg)');
      setDescription('Firewood & fuel for brooding heating stoves');
    } else if (cat === 'Feed') {
      setUnit('bags (50kg)');
      setDescription('Broiler feed purchase');
    } else if (cat === 'Chicks') {
      setUnit('birds');
      setDescription('Day-Old Chicks (DOC) batch');
    } else if (cat === 'Labour') {
      setUnit('workers');
      setDescription('Farm workers monthly salary & allowances');
    } else if (cat === 'Electricity') {
      setUnit('month');
      setDescription('Power utility bill (fans, pumps, cooling pads)');
    } else {
      setUnit('units');
      setDescription('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFlock) return;
    const finalAmount = typeof totalAmountPkr === 'number' ? totalAmountPkr : 0;
    if (finalAmount <= 0) return;

    addExpenseRecord({
      farmId: activeFlock.farmId,
      flockId: activeFlock.id,
      date,
      category,
      description: description.trim(),
      quantity: typeof quantity === 'number' ? quantity : undefined,
      unit: unit.trim() || undefined,
      unitPricePkr: typeof unitPricePkr === 'number' ? unitPricePkr : undefined,
      totalAmountPkr: finalAmount,
      paymentMode,
      vendorName: vendorName.trim() || undefined,
    });

    setDescription('');
    setQuantity('');
    setUnitPricePkr('');
    setTotalAmountPkr('');
    setVendorName('');
    setSuccessSaved(true);
    setTimeout(() => setSuccessSaved(false), 3000);
  };

  // Filter expenses
  const filteredExpenses = flockExpenses.filter((e) => {
    const matchesFilter = selectedFilter === 'All' || e.category === selectedFilter;
    const matchesSearch =
      !searchTerm ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.vendorName && e.vendorName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const totalExpenseSum = flockExpenses.reduce((sum, e) => sum + e.totalAmountPkr, 0);

  // Category aggregations
  const getCatSum = (cat: ExpenseCategory) =>
    flockExpenses.filter((e) => e.category === cat).reduce((sum, e) => sum + e.totalAmountPkr, 0);

  const litterSum = getCatSum('Litter');
  const dieselSum = getCatSum('Diesel');
  const woodBrooderSum = getCatSum('Wood brooders');
  const feedSum = getCatSum('Feed');
  const chicksSum = getCatSum('Chicks');

  const costPerLiveBird = dashboardKPIs.remainingBirds > 0
    ? totalExpenseSum / dashboardKPIs.remainingBirds
    : 0;

  return (
    <div className="space-y-6">
      {/* Title & Cost Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Flock Expenses & Farm Cost Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track operational costs including standard feed & chicks plus required Litter, Diesel, and Wood Brooder fuels.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 bg-rose-50 text-rose-800 rounded-lg border border-rose-200 font-bold">
            Total Costs: {formatPKR(totalExpenseSum)}
          </div>
          <div className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
            Cost / Bird: Rs. {Math.round(costPerLiveBird)}
          </div>
        </div>
      </div>

      {/* NEW Required Categories Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Litter Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-emerald-800">[NEW] Litter Purchased</span>
            <Layers className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">
            {formatPKR(litterSum)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Bedding, rice husk & sawdust for moisture control
          </p>
        </div>

        {/* Diesel Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-amber-800">[NEW] Diesel Cost</span>
            <Fuel className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">
            {formatPKR(dieselSum)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Standby generator fuel for uninterrupted ventilation
          </p>
        </div>

        {/* Wood Brooders Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-orange-800">[NEW] Wood Brooders</span>
            <Flame className="w-4 h-4 text-orange-700" />
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">
            {formatPKR(woodBrooderSum)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Firewood & solid fuel for brooding heat stoves
          </p>
        </div>
      </div>

      {/* Entry Form + Category Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Container */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-700" />
              <span>Record Farm Expense</span>
            </h2>
            {successSaved && (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Expense logged successfully!
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expense Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value as ExpenseCategory)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/20 font-medium"
                >
                  <optgroup label="[NEW] Required Items">
                    <option value="Litter">Litter (Bedding / Sawdust / Husk)</option>
                    <option value="Diesel">Diesel (Generator Fuel)</option>
                    <option value="Wood brooders">Wood brooders (Heating Fuel)</option>
                  </optgroup>
                  <optgroup label="Standard Farm Expenses">
                    <option value="Feed">Feed (Starter, Grower, Finisher)</option>
                    <option value="Chicks">Chicks (DOC Placement)</option>
                    <option value="Medicine">Medicine & Vaccines</option>
                    <option value="Labour">Labour & Farm Staff</option>
                    <option value="Electricity">Electricity Tariff (WAPDA / LESCO)</option>
                    <option value="Transport">Transport & Logistics</option>
                    <option value="Maintenance">Maintenance & Repairs</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expense Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description / Particulars *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 160 bags of rice husk for Shed 1 floor"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg"
              />
            </div>

            {/* Quantity, Unit, Unit Price, Total */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="e.g. 160"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg tabular-nums"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Unit
                </label>
                <input
                  type="text"
                  placeholder="bags, maunds, liters"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Rate / Unit (PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Rs. per unit"
                  value={unitPricePkr}
                  onChange={(e) => handleUnitPriceChange(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg tabular-nums"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                  Total (PKR) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={totalAmountPkr}
                  onChange={(e) => setTotalAmountPkr(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-emerald-300 font-bold text-emerald-950 rounded-lg tabular-nums"
                />
              </div>
            </div>

            {/* Payment & Vendor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Mode
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg"
                >
                  <option value="Cash">Cash on Delivery</option>
                  <option value="Bank Transfer">Bank Transfer / Online</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Credit">Credit (Udhaar / Supplier Ledger)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vendor / Supplier Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ittefaq Rice Mills, PSO Station"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Save Expense Record</span>
              </button>
            </div>
          </form>
        </div>

        {/* Cost Structure Snapshot */}
        <div className="space-y-4">
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Batch Cost Breakdown
            </h3>
            <p className="text-xs text-slate-300">
              Relative distribution of production expenses for {activeFlock?.flockNumber}.
            </p>

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Feed Total:</span>
                <span className="font-bold text-white tabular-nums">{formatPKR(feedSum)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Chicks (DOC):</span>
                <span className="font-bold text-white tabular-nums">{formatPKR(chicksSum)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-emerald-400 font-medium">Litter (Bedding):</span>
                <span className="font-bold text-emerald-400 tabular-nums">{formatPKR(litterSum)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-amber-400 font-medium">Diesel Fuel:</span>
                <span className="font-bold text-amber-400 tabular-nums">{formatPKR(dieselSum)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-orange-400 font-medium">Wood Brooders:</span>
                <span className="font-bold text-orange-400 tabular-nums">{formatPKR(woodBrooderSum)}</span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-bold text-white">
                <span>Grand Total:</span>
                <span className="text-rose-400 tabular-nums">{formatPKR(totalExpenseSum)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Pakistani Brooding Insights
            </h4>
            <p>
              Wood brooders and sawdust litter are critical cost items in autumn/winter batches in Punjab, ensuring chicks maintain optimal gut digestion without chilling.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto text-xs py-1">
            <span className="text-slate-500 font-medium shrink-0">Filter:</span>
            {['All', 'Litter', 'Diesel', 'Wood brooders', 'Feed', 'Chicks', 'Labour', 'Electricity'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedFilter(cat)}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
                  selectedFilter === cat
                    ? 'bg-emerald-700 text-white font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg w-48"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-3 py-3 text-right">Quantity / Unit</th>
                <th className="px-3 py-3 text-right">Unit Rate</th>
                <th className="px-3 py-3 text-right font-bold text-slate-900">Total (PKR)</th>
                <th className="px-3 py-3">Payment</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-3 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{exp.date}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`font-semibold ${
                        exp.category === 'Litter'
                          ? 'text-emerald-700'
                          : exp.category === 'Diesel'
                          ? 'text-amber-700'
                          : exp.category === 'Wood brooders'
                          ? 'text-orange-700'
                          : 'text-slate-800'
                      }`}
                    >
                      {exp.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 max-w-xs">{exp.description}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-600">
                    {exp.quantity ? `${exp.quantity} ${exp.unit || ''}` : '-'}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-600">
                    {exp.unitPricePkr ? `Rs. ${exp.unitPricePkr}` : '-'}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums font-bold text-slate-900">
                    {formatPKR(exp.totalAmountPkr)}
                  </td>
                  <td className="px-3 py-3 text-slate-600">{exp.paymentMode}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{exp.vendorName || '-'}</td>
                  <td className="px-3 py-3 text-center">
                    <button
                      onClick={() => deleteExpenseRecord(exp.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
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
