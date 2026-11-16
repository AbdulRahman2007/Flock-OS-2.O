import React, { useState } from 'react';
import { usePoultry } from '../../context/PoultryContext';
import {
  calculateSaleMetrics,
  formatPKR,
  formatNumber,
} from '../../utils/calculations';
import { SaleRecord } from '../../types/poultry';
import {
  DollarSign,
  Plus,
  Trash2,
  CheckCircle2,
  TrendingUp,
  FileText,
  User,
  Truck,
  Printer,
  X,
  CreditCard,
} from 'lucide-react';

export const SalesView: React.FC = () => {
  const {
    activeFlock,
    sales,
    customers,
    addSaleRecord,
    deleteSaleRecord,
    dashboardKPIs,
  } = usePoultry();

  const flockSales = sales
    .filter((s) => s.flockId === activeFlock?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Form states strictly ordered per Section 4 & 7:
  // 1) Date, 2) Name of person / customer, 3) Rate per kg on that day (market rate),
  // 4) Total weight sold (kg), 5) Total number of birds sold, 6) Final rate per kg
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState<string>('Haji Aslam Broiler Merchant');
  const [customCustomer, setCustomCustomer] = useState<string>('');
  const [marketRatePerKg, setMarketRatePerKg] = useState<number | ''>(425);
  const [totalWeightSoldKg, setTotalWeightSoldKg] = useState<number | ''>(3600);
  const [birdsSold, setBirdsSold] = useState<number | ''>(2000);
  const [finalRatePerKg, setFinalRatePerKg] = useState<number | ''>(432);
  const [amountPaid, setAmountPaid] = useState<number | ''>(1200000);
  const [vehicleNumber, setVehicleNumber] = useState<string>('LES-4412');
  const [remarks, setRemarks] = useState<string>('Direct Mandi dispatch, clean feathers.');

  const [selectedInvoice, setSelectedInvoice] = useState<SaleRecord | null>(null);
  const [successNotice, setSuccessNotice] = useState<boolean>(false);

  // Live calculation of metrics
  const weightNum = typeof totalWeightSoldKg === 'number' ? totalWeightSoldKg : 0;
  const birdsNum = typeof birdsSold === 'number' ? birdsSold : 0;
  const marketNum = typeof marketRatePerKg === 'number' ? marketRatePerKg : 0;
  const finalNum = typeof finalRatePerKg === 'number' ? finalRatePerKg : 0;
  const paidNum = typeof amountPaid === 'number' ? amountPaid : 0;

  const liveMetrics = calculateSaleMetrics(weightNum, birdsNum, marketNum, finalNum);
  const liveOutstanding = Math.max(0, liveMetrics.totalAmount - paidNum);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFlock) return;

    const actualCustomer = customerName === 'NEW' ? customCustomer.trim() : customerName;
    if (!actualCustomer) return;

    addSaleRecord({
      date,
      customerName: actualCustomer,
      marketRatePerKg: marketNum,
      totalWeightSoldKg: weightNum,
      birdsSold: birdsNum,
      finalRatePerKg: finalNum,
      amountPaid: paidNum,
      vehicleNumber: vehicleNumber.trim() || undefined,
      remarks: remarks.trim() || undefined,
    });

    setSuccessNotice(true);
    setTimeout(() => setSuccessNotice(false), 3000);
  };

  const totalSalesRevenue = flockSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalWeightSold = flockSales.reduce((acc, s) => acc + s.totalWeightSoldKg, 0);
  const totalBirdsSold = flockSales.reduce((acc, s) => acc + s.birdsSold, 0);
  const totalOutstanding = flockSales.reduce((acc, s) => acc + s.outstandingBalance, 0);

  return (
    <div className="space-y-6">
      {/* Title & Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Commercial & Sales Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Capture sales with market rate vs final sold rate, calculate rate difference, and track customer credit (udhaar).
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 font-semibold">
            Revenue: {formatPKR(totalSalesRevenue)}
          </div>
          <div className="px-3 py-1.5 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 font-semibold">
            Outstanding (Udhaar): {formatPKR(totalOutstanding)}
          </div>
        </div>
      </div>

      {/* Main Grid: Sequential Sales Entry Form (6 fields) & Commercial Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entry Form (2 Cols on lg) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-700" />
                <span>[NEW] Standard Commercial Sale Entry</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Required order: 1) Date, 2) Customer, 3) Market Rate, 4) Total Weight, 5) Birds Sold, 6) Final Rate
              </p>
            </div>
            {successNotice && (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Sale & Invoice Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field 1 & 2: Date & Customer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  1. Date of Sale *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  2. Name of Person / Customer *
                </label>
                <select
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/20 mb-1.5"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.city} - {c.shopOrBusiness})
                    </option>
                  ))}
                  <option value="NEW">+ Enter New Customer / Buyer Name</option>
                </select>

                {customerName === 'NEW' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter customer full name..."
                    value={customCustomer}
                    onChange={(e) => setCustomCustomer(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg mt-1"
                  />
                )}
              </div>
            </div>

            {/* Field 3 & 6: Market Rate & Final Rate (Rate Comparison) */}
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  Mandi Rate vs Final Agreed Rate
                </span>
                <span className="text-[11px] text-emerald-800 font-medium">
                  Rate difference captured automatically
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    3. Market Rate per kg (PKR) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.5"
                      value={marketRatePerKg}
                      onChange={(e) => setMarketRatePerKg(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg tabular-nums"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-400">Rs/kg</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Official Mandi / Association rate for the day
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-900 mb-1">
                    6. Final Rate per kg Sold At (PKR) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.5"
                      value={finalRatePerKg}
                      onChange={(e) => setFinalRatePerKg(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 bg-white border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-700/20 font-bold text-emerald-900 tabular-nums"
                    />
                    <span className="absolute right-3 top-2 text-xs text-emerald-700 font-semibold">Rs/kg</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 mt-0.5 block">
                    Agreed transaction rate with buyer
                  </span>
                </div>
              </div>
            </div>

            {/* Field 4 & 5: Total Weight Sold & Birds Sold */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  4. Total Weight Sold (kg) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.1"
                    value={totalWeightSoldKg}
                    onChange={(e) => setTotalWeightSoldKg(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg tabular-nums"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400">kg</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Gross weight less crate tare on weighbridge
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  5. Total Number of Birds Sold *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={birdsSold}
                  onChange={(e) => setBirdsSold(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg tabular-nums"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Avg weight: {liveMetrics.avgBirdWeightKg} kg / bird
                </span>
              </div>
            </div>

            {/* Additional Pakistani Mandi Commercial details: Vehicle & Payment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Received Upfront (PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg tabular-nums"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Remaining Udhaar: {formatPKR(liveOutstanding)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transport Vehicle No. & Driver
                </label>
                <input
                  type="text"
                  placeholder="e.g. LES-8910 (Hino Truck)"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Transaction Remarks / Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Weighbridge slip #4402 attached, crates checked"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg"
              />
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Record Sale & Generate Invoice</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Commercial Invoice Summary */}
        <div className="space-y-4">
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Invoice Calculation Engine
              </span>
              <span className="text-[11px] text-slate-400">Live Preview</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Gross Weight:</span>
                <span className="font-bold text-white tabular-nums">{formatNumber(weightNum)} kg</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Birds Count:</span>
                <span className="font-bold text-white tabular-nums">{formatNumber(birdsNum)} Birds</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Avg Weight / Bird:</span>
                <span className="font-bold text-white tabular-nums">{liveMetrics.avgBirdWeightKg} kg</span>
              </div>

              <div className="border-t border-slate-800 pt-2 flex items-center justify-between">
                <span className="text-slate-400">Market Rate:</span>
                <span className="font-medium text-slate-300 tabular-nums">Rs. {marketNum} / kg</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Final Sold Rate:</span>
                <span className="font-bold text-emerald-400 tabular-nums">Rs. {finalNum} / kg</span>
              </div>

              {/* Rate Difference Highlight */}
              <div className="bg-slate-800/90 rounded-lg p-3 border border-slate-700 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-300">[NEW] Rate Difference:</span>
                  <span className={`font-bold tabular-nums ${liveMetrics.rateDifferencePerKg >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {liveMetrics.rateDifferencePerKg >= 0 ? '+' : ''}Rs. {liveMetrics.rateDifferencePerKg}/kg
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Total Rate Impact:</span>
                  <span className={`font-bold tabular-nums ${liveMetrics.totalRateDifference >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {liveMetrics.totalRateDifference >= 0 ? '+' : ''}{formatPKR(liveMetrics.totalRateDifference)}
                  </span>
                </div>
              </div>

              {/* Total Amount */}
              <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-sm">
                <span className="font-bold text-white">Total Amount:</span>
                <span className="text-lg font-bold text-emerald-400 tabular-nums">
                  {formatPKR(liveMetrics.totalAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Amount Paid:</span>
                <span className="text-white tabular-nums">{formatPKR(paidNum)}</span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Outstanding (Udhaar):</span>
                <span className="text-amber-400 font-semibold tabular-nums">
                  {formatPKR(liveOutstanding)}
                </span>
              </div>
            </div>
          </div>

          {/* Pakistani Mandi Trading Notes */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Customer Ledger & Mandi Practice
            </h4>
            <p>
              In Lahore and Rawalpindi mandis, commission agents (arhti) frequently transact with a differential against the published daily rate.
            </p>
            <p>
              Credit balances (udhaar) are maintained across lifting batches and settled upon clearance.
            </p>
          </div>
        </div>
      </div>

      {/* Sales History Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Commercial Sales & Lifting Register ({flockSales.length} Sales)
            </h3>
            <p className="text-xs text-slate-500">
              Records stored for {activeFlock?.flockNumber}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="px-4 py-3">Date / Invoice</th>
                <th className="px-4 py-3">Customer / Buyer</th>
                <th className="px-3 py-3 text-right">Market Rate</th>
                <th className="px-3 py-3 text-right font-bold text-emerald-800">Final Sold Rate</th>
                <th className="px-3 py-3 text-right">[NEW] Rate Diff</th>
                <th className="px-3 py-3 text-right">Weight (kg)</th>
                <th className="px-3 py-3 text-right">Birds</th>
                <th className="px-3 py-3 text-right font-bold text-slate-900">Total Amount</th>
                <th className="px-3 py-3 text-right text-amber-700">Outstanding</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {flockSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{sale.date}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{sale.invoiceNo}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{sale.customerName}</div>
                    {sale.vehicleNumber && (
                      <div className="text-[11px] text-slate-500">{sale.vehicleNumber}</div>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-600">
                    Rs. {sale.marketRatePerKg}/kg
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums font-bold text-emerald-800">
                    Rs. {sale.finalRatePerKg}/kg
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums font-semibold">
                    <span className={sale.rateDifferencePerKg >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                      {sale.rateDifferencePerKg >= 0 ? '+' : ''}Rs. {sale.rateDifferencePerKg}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums font-medium text-slate-900">
                    {formatNumber(sale.totalWeightSoldKg)} kg
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-700">
                    {formatNumber(sale.birdsSold)}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums font-bold text-slate-900">
                    {formatPKR(sale.totalAmount)}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums font-medium text-amber-700">
                    {sale.outstandingBalance > 0 ? formatPKR(sale.outstandingBalance) : 'Settled'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedInvoice(sale)}
                        title="Print / View Invoice Voucher"
                        className="p-1 text-slate-500 hover:text-emerald-700 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteSaleRecord(sale.id)}
                        title="Delete Sale Record"
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Voucher Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-emerald-800 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Commercial Poultry Sale Voucher</h3>
                <span className="text-xs text-emerald-200">{selectedInvoice.invoiceNo} · FLOCK OS</span>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">Customer / Buyer:</span>
                  <strong className="text-sm text-slate-900">{selectedInvoice.customerName}</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px]">Date of Transaction:</span>
                  <strong className="text-slate-800">{selectedInvoice.date}</strong>
                </div>
              </div>

              <div className="space-y-2 py-2">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Total Live Birds Lifted:</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {formatNumber(selectedInvoice.birdsSold)} Birds
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Total Net Weight:</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {formatNumber(selectedInvoice.totalWeightSoldKg)} kg
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Average Bird Weight:</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {selectedInvoice.avgWeightPerBirdKg} kg
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Published Mandi Market Rate:</span>
                  <span className="text-slate-700 tabular-nums">
                    Rs. {selectedInvoice.marketRatePerKg} / kg
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 font-bold">
                  <span className="text-emerald-800">Agreed Final Rate:</span>
                  <span className="text-emerald-800 tabular-nums">
                    Rs. {selectedInvoice.finalRatePerKg} / kg
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Rate Difference:</span>
                  <span className="font-semibold text-emerald-700 tabular-nums">
                    +Rs. {selectedInvoice.rateDifferencePerKg}/kg (+{formatPKR(selectedInvoice.totalRateDifference)})
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b-2 border-slate-900 text-sm font-bold">
                  <span className="text-slate-900">Total Invoice Amount:</span>
                  <span className="text-emerald-800 tabular-nums">
                    {formatPKR(selectedInvoice.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Cash / Bank Received:</span>
                  <span className="font-medium text-slate-900 tabular-nums">
                    {formatPKR(selectedInvoice.amountPaid)}
                  </span>
                </div>
                <div className="flex justify-between py-1 text-amber-800 font-bold">
                  <span>Balance Outstanding (Udhaar):</span>
                  <span className="tabular-nums">
                    {formatPKR(selectedInvoice.outstandingBalance)}
                  </span>
                </div>
              </div>

              {selectedInvoice.vehicleNumber && (
                <div className="bg-slate-50 p-2.5 rounded-lg text-[11px] text-slate-600">
                  Transport Vehicle: <strong className="text-slate-900">{selectedInvoice.vehicleNumber}</strong>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
