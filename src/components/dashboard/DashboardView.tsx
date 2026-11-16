import React, { useState } from 'react';
import { usePoultry } from '../../context/PoultryContext';
import {
  formatPKR,
  formatNumber,
  formatWeight,
} from '../../utils/calculations';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Video,
  Wheat,
  Scale,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  DollarSign,
  Fuel,
  Flame,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  ComposedChart,
  AreaChart,
  Area,
} from 'recharts';

interface DashboardViewProps {
  onNavigateToTab: (tab: 'daily' | 'weekly' | 'sales' | 'expenses' | 'report') => void;
  onOpenDailyModal: () => void;
  onOpenNewFlock: () => void;
  onOpenCloseFlock: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToTab,
  onOpenDailyModal,
  onOpenNewFlock,
  onOpenCloseFlock,
}) => {
  const {
    activeFlock,
    dailyRecords,
    weeklyWeights,
    expenses,
    sales,
    vaccinations,
    dashboardKPIs,
  } = usePoultry();

  const [activeChartTab, setActiveChartTab] = useState<'weights' | 'mortality' | 'financials'>('weights');

  // Flock daily records for mortality trend
  const flockDaily = dailyRecords
    .filter((r) => r.flockId === activeFlock?.id)
    .sort((a, b) => a.dayNumber - b.dayNumber);

  // Flock weekly weight records
  const flockWeekly = weeklyWeights
    .filter((w) => w.flockId === activeFlock?.id)
    .sort((a, b) => a.weekNumber - b.weekNumber);

  const weightChartData = flockWeekly.map((w) => ({
    week: `Week ${w.weekNumber}`,
    actualWeight: w.averageWeightGrams,
    targetWeight: w.targetWeightGrams,
    difference: w.targetDifferenceGrams,
    fcr: w.weeklyFcr,
    gain: w.weightGainPerBirdGrams,
  }));

  const mortalityChartData = flockDaily.slice(-14).map((r) => ({
    day: `D${r.dayNumber}`,
    mortality: r.mortality,
    culling: r.culling,
  }));

  const livabilityPercent = dashboardKPIs.totalBirds > 0
    ? Number((100 - dashboardKPIs.mortalityPercent).toFixed(1))
    : 96.8;

  // Key required expenses for quick glance
  const specificExpenses = [
    {
      name: 'Feed (Starter/Grower/Finisher)',
      amount: expenses
        .filter((e) => (e.flockId === activeFlock?.id || !e.flockId) && e.category === 'Feed')
        .reduce((sum, e) => sum + e.totalAmountPkr, 0),
    },
    {
      name: 'Chicks (DOC Placement)',
      amount: expenses
        .filter((e) => (e.flockId === activeFlock?.id || !e.flockId) && e.category === 'Chicks')
        .reduce((sum, e) => sum + e.totalAmountPkr, 0),
    },
    {
      name: 'Wood Brooders (Heating fuel)',
      amount: expenses
        .filter((e) => (e.flockId === activeFlock?.id || !e.flockId) && e.category === 'Wood brooders')
        .reduce((sum, e) => sum + e.totalAmountPkr, 0),
    },
    {
      name: 'Diesel (Standby Generator)',
      amount: expenses
        .filter((e) => (e.flockId === activeFlock?.id || !e.flockId) && e.category === 'Diesel')
        .reduce((sum, e) => sum + e.totalAmountPkr, 0),
    },
    {
      name: 'Litter (Rice husk / sawdust)',
      amount: expenses
        .filter((e) => (e.flockId === activeFlock?.id || !e.flockId) && e.category === 'Litter')
        .reduce((sum, e) => sum + e.totalAmountPkr, 0),
    },
  ];

  const flockVaccines = vaccinations.filter((v) => v.flockId === activeFlock?.id);

  return (
    <div className="space-y-6">
      {/* 1. Top row of operational KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: Flock Livability & Remaining Birds */}
        <div className="bg-white border border-[#E4DEC9] rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[12px] font-semibold text-[#445048] block leading-tight">
              Flock Livability Index
            </span>
            <div className="mt-2 text-2xl sm:text-[28px] font-black text-[#1E2621] tracking-tight tabular-nums">
              {livabilityPercent}%
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pt-1">
            {/* Illustrated Egg & Baby Chick from image */}
            <div className="flex items-center gap-1.5">
              <svg className="w-5 h-6" viewBox="0 0 20 26" fill="none">
                <path
                  d="M10 2C5.5 2 2 8 2 15C2 21 5.5 24 10 24C14.5 24 18 21 18 15C18 8 14.5 2 10 2Z"
                  fill="#EDD8C4"
                  stroke="#D1B9A1"
                  strokeWidth="1.2"
                />
              </svg>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="14" r="6" fill="#F8DE7E" stroke="#E6BE44" strokeWidth="1" />
                <circle cx="15" cy="8" r="4.5" fill="#F8DE7E" stroke="#E6BE44" strokeWidth="1" />
                <circle cx="16.5" cy="7.5" r="1" fill="#2E241E" />
                <path d="M19 8L22 9L19 10Z" fill="#ECA239" />
                <path d="M10 20V23M14 20V23" stroke="#D99B35" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>

            {/* Live Count & Trend Arrow */}
            <div className="flex items-center gap-1.5">
              <div className="text-right">
                <span className="text-[11px] font-bold text-[#1E2621] tabular-nums block">
                  {formatNumber(dashboardKPIs.remainingBirds)}
                </span>
                <span className="text-[9px] text-[#717E75] block">Live Birds</span>
              </div>
              <svg className="w-7 h-4" viewBox="0 0 40 20" fill="none">
                <path
                  d="M2 17L14 12L24 15L36 3M36 3H27M36 3V12"
                  stroke="#5A9673"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 2: Daily Flock Consumption (Calculated in per 50kg bag) */}
        <div className="bg-white border border-[#E4DEC9] rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[12px] font-semibold text-[#445048] block leading-tight">
              Daily Flock Feed (50kg / Bag)
            </span>
            <div className="mt-2 text-2xl sm:text-[28px] font-black text-[#1E2621] tracking-tight tabular-nums">
              {dashboardKPIs.todayFeedBags} <span className="text-lg font-bold text-[#4D6F61]">Bags</span>
            </div>
            <span className="text-[11px] font-semibold text-[#326B4E] block mt-0.5">
              = {dashboardKPIs.todayFeedKg ? `${formatNumber(dashboardKPIs.todayFeedKg)} kg` : '1,040 kg'}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            {/* Feeder Hopper Illustration from image */}
            <div className="flex items-center gap-2">
              <svg className="w-7 h-8" viewBox="0 0 32 36" fill="none">
                <path d="M7 6L25 6L21 16L11 16Z" fill="#C5905C" stroke="#A8723E" strokeWidth="1.2" />
                <path d="M11 16L21 16L18 24L14 24Z" fill="#DEAB77" stroke="#A8723E" strokeWidth="1.2" />
                <rect x="4" y="24" width="24" height="6" rx="3" fill="#A8723E" />
                <circle cx="10" cy="27" r="1.5" fill="#FCE79C" />
                <circle cx="16" cy="27" r="1.5" fill="#FCE79C" />
                <circle cx="22" cy="27" r="1.5" fill="#FCE79C" />
              </svg>
              <div>
                <span className="text-[11px] font-bold text-[#2A3730] tabular-nums block">
                  50 kg Per Bag
                </span>
                <span className="text-[9px] text-[#717E75] block">Standard Poultry Feed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Batch FCR & Feed Conversion */}
        <div className="bg-white border border-[#E4DEC9] rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[12px] font-semibold text-[#445048] block leading-tight">
              Feed Conversion (FCR)
            </span>
            <div className="mt-2 text-2xl sm:text-[28px] font-black text-[#2B4E3E] tracking-tight tabular-nums">
              {dashboardKPIs.overallFcr}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            {/* Water / Feed Gauges from image */}
            <div className="flex items-center -space-x-1">
              <svg className="w-5 h-6" viewBox="0 0 20 24" fill="none">
                <path
                  d="M10 2C10 2 4 10 4 15C4 18.5 6.7 21 10 21C13.3 21 16 18.5 16 15C16 10 10 2 10 2Z"
                  fill="#78B9DE"
                  stroke="#4792C0"
                  strokeWidth="1.2"
                />
              </svg>
              <svg className="w-4 h-5" viewBox="0 0 20 24" fill="none">
                <path
                  d="M10 2C10 2 4 10 4 15C4 18.5 6.7 21 10 21C13.3 21 16 18.5 16 15C16 10 10 2 10 2Z"
                  fill="#A2D2EE"
                  stroke="#4792C0"
                  strokeWidth="1"
                />
              </svg>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-[#2A3730] tabular-nums block">
                {(dashboardKPIs.totalFeedConsumedKg / 50).toLocaleString()} Bags
              </span>
              <span className="text-[9px] text-[#717E75] block">
                {(dashboardKPIs.totalFeedConsumedKg / 1000).toFixed(1)} Tons (50kg/bag)
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Mortality % & Gauge Bar */}
        <div className="bg-white border border-[#E4DEC9] rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[12px] font-semibold text-[#445048] block leading-tight">
              Cumulative Mortality
            </span>
            <div className="mt-2 text-2xl sm:text-[28px] font-black text-[#D3452B] tracking-tight tabular-nums">
              {dashboardKPIs.mortalityPercent}%
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#FAECE8] flex items-center justify-center text-[#D84C32] shrink-0">
                <AlertTriangle className="w-3.5 h-3.5 text-[#D84C32]" />
              </div>

              {/* Multi-segmented Gauge Bar from reference image */}
              <div className="flex-1">
                <div className="relative w-full h-3 rounded-full overflow-hidden flex bg-slate-100 border border-slate-200">
                  <div className="w-1/3 bg-[#5FA379]" title="Normal (0-3.5%)"></div>
                  <div className="w-1/3 bg-[#E7A947]" title="Caution (3.5-5%)"></div>
                  <div className="w-1/3 bg-[#D9534F]" title="High (5%+)"></div>
                  {/* Gauge marker indicator */}
                  <div
                    className="absolute top-0 bottom-0 w-1.5 bg-[#2E2822] rounded-full shadow-xs"
                    style={{
                      left: `${Math.min(95, Math.max(5, (dashboardKPIs.mortalityPercent / 8) * 100))}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-[9px] text-[#869289] mt-0.5 px-0.5">
                  <span>0% Safe</span>
                  <span>{formatNumber(dashboardKPIs.totalMortality)} Dead</span>
                  <span>5%+</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: Target Lifting Weight & Harvest Goal */}
        <div className="bg-white border border-[#E4DEC9] rounded-2xl p-4 shadow-2xs flex flex-col justify-between col-span-2 sm:col-span-1">
          <div>
            <span className="text-[12px] font-semibold text-[#445048] block leading-tight">
              Target Lifting Weight
            </span>
            <div className="mt-2 text-2xl sm:text-[28px] font-black text-[#1E2621] tracking-tight tabular-nums">
              {activeFlock?.targetWeightKg ? `${activeFlock.targetWeightKg} kg` : '2.25 kg'}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            {/* Illustrated Vintage Scale from reference image */}
            <svg className="w-8 h-9" viewBox="0 0 32 36" fill="none">
              <path d="M6 8C6 8 10 5 16 5C22 5 26 8 26 8L23 11H9L6 8Z" fill="#C5905C" />
              <rect x="9" y="11" width="14" height="20" rx="3" fill="#8B9B90" stroke="#68796E" strokeWidth="1" />
              <circle cx="16" cy="20" r="5" fill="#FFFFFF" />
              <path d="M16 20L18.5 18" stroke="#D34735" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="16" cy="20" r="1" fill="#2E241E" />
              <rect x="7" y="30" width="18" height="3" rx="1.5" fill="#5F7065" />
            </svg>

            <div className="text-right">
              <span className="text-[10px] text-[#818E85] block">Current Avg</span>
              <span className="text-xs font-bold text-[#2A3730] tabular-nums">
                {formatWeight(dashboardKPIs.latestAvgWeightGrams)}
              </span>
              <span className="text-[9px] text-[#5A9673] font-semibold block">
                Target Age: {activeFlock?.targetAgeDays || 38}d
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE SECTION: CHART (LEFT) & LIVE SHED CAMERA MONITOR (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Main Performance Charts */}
        <div className="lg:col-span-7 bg-white border border-[#E4DEC9] rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#1E2621]">
                  Weekly Growth & Weight vs Target Goal
                </h2>
                {dashboardKPIs.latestWeekTargetStatus?.isAchieved && (
                  <span className="px-2 py-0.5 rounded-full bg-[#E5F2EB] text-[#2C573F] text-[10px] font-bold">
                    Target Achieved (+{dashboardKPIs.latestWeekTargetStatus.differenceGrams}g)
                  </span>
                )}
              </div>
              <span className="text-[11px] text-[#717E75]">
                {activeFlock?.flockNumber} ({activeFlock?.breed}) sample weights against breed benchmarks
              </span>
            </div>

            {/* Chart Toggle */}
            <div className="flex items-center gap-1 bg-[#F4EFE5] p-0.5 rounded-lg text-[11px]">
              <button
                type="button"
                onClick={() => setActiveChartTab('weights')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeChartTab === 'weights'
                    ? 'bg-white text-[#253A30] font-bold shadow-2xs'
                    : 'text-[#647269] hover:text-[#253A30]'
                }`}
              >
                Weight vs Target
              </button>
              <button
                type="button"
                onClick={() => setActiveChartTab('mortality')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeChartTab === 'mortality'
                    ? 'bg-white text-[#253A30] font-bold shadow-2xs'
                    : 'text-[#647269] hover:text-[#253A30]'
                }`}
              >
                Mortality Trend
              </button>
            </div>
          </div>

          {/* Chart Viewport */}
          <div className="h-64 sm:h-72 w-full">
            {activeChartTab === 'weights' ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={weightChartData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  barSize={34}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1EDE3" vertical={false} />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 11, fill: '#627067' }}
                    axisLine={{ stroke: '#E5DFD1' }}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#627067' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      `${value} g`,
                      name === 'actualWeight' ? 'Actual Avg Weight' : 'Target Goal',
                    ]}
                    contentStyle={{
                      backgroundColor: '#27342D',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#FFFFFF',
                      fontSize: '11px',
                    }}
                  />
                  {/* Colors matching the reference image */}
                  <Bar
                    dataKey="actualWeight"
                    name="actualWeight"
                    fill="#6B9080"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    type="monotone"
                    dataKey="targetWeight"
                    name="targetWeight"
                    stroke="#E8B86D"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#E8B86D' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={mortalityChartData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="mortalityColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DE7A58" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#DE7A58" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1EDE3" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#627067' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#627067' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(val: any) => [`${val} birds`, 'Mortality']}
                    contentStyle={{
                      backgroundColor: '#27342D',
                      borderRadius: '10px',
                      border: 'none',
                      color: '#FFF',
                      fontSize: '11px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="mortality"
                    stroke="#DE7A58"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#mortalityColor)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Color Legend matching palette */}
          <div className="mt-3 flex items-center justify-center gap-6 text-[11px] text-[#4F5C53]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-[#6B9080]"></span>
              <span>Actual Sample Average Weight (Grams)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-[#E8B86D]"></span>
              <span>Weekly Breed Target Benchmark</span>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Live House / Shed Surveillance Card */}
        <div className="lg:col-span-5 bg-white border border-[#E4DEC9] rounded-2xl overflow-hidden shadow-2xs flex flex-col justify-between">
          {/* Top Video Camera Area with Authentic Broiler Shed View */}
          <div className="relative w-full h-52 sm:h-56 bg-slate-900 overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-b from-stone-900/60 via-stone-800/40 to-stone-950/80 z-10"></div>

            {/* Stylized camera feed illustration with perspective rows of chickens and yellow pan feeders */}
            <svg
              className="absolute inset-0 w-full h-full object-cover"
              viewBox="0 0 400 240"
              preserveAspectRatio="xMidYMid slice"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="shedFloor2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9C8B76" />
                  <stop offset="100%" stopColor="#635442" />
                </linearGradient>
                <linearGradient id="roofSteel2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2E3339" />
                  <stop offset="100%" stopColor="#1B1E22" />
                </linearGradient>
              </defs>

              {/* Ceiling & Lighting Beams */}
              <rect width="400" height="70" fill="url(#roofSteel2)" />
              <line x1="200" y1="0" x2="160" y2="240" stroke="#3D454E" strokeWidth="2" />
              <line x1="200" y1="0" x2="240" y2="240" stroke="#3D454E" strokeWidth="2" />
              <circle cx="200" cy="30" r="4" fill="#FFFDE4" />
              <circle cx="120" cy="35" r="3" fill="#FFFDE4" />
              <circle cx="280" cy="35" r="3" fill="#FFFDE4" />

              {/* Litter Floor */}
              <polygon points="0,70 400,70 400,240 0,240" fill="url(#shedFloor2)" />

              {/* Yellow Automated Feeding Lines & Pans */}
              <line x1="50" y1="120" x2="350" y2="120" stroke="#DCA236" strokeWidth="3" />
              <circle cx="80" cy="120" r="9" fill="#F4C430" stroke="#C5931C" strokeWidth="1.5" />
              <circle cx="150" cy="120" r="11" fill="#F4C430" stroke="#C5931C" strokeWidth="1.5" />
              <circle cx="230" cy="120" r="11" fill="#F4C430" stroke="#C5931C" strokeWidth="1.5" />
              <circle cx="310" cy="120" r="9" fill="#F4C430" stroke="#C5931C" strokeWidth="1.5" />

              {/* Realistic White Broiler Chickens flocking near feeders */}
              <ellipse cx="200" cy="165" rx="22" ry="16" fill="#F9F9F8" />
              <ellipse cx="218" cy="152" rx="10" ry="9" fill="#FFFFFF" />
              <path d="M228 152L235 154L228 156Z" fill="#ECA239" />
              <path d="M217 142C216 142 215 144 218 145C220 144 222 143 221 142Z" fill="#D34735" />

              <ellipse cx="140" cy="175" rx="24" ry="17" fill="#F4F4F3" />
              <ellipse cx="122" cy="163" rx="11" ry="10" fill="#FFFFFF" />
              <path d="M112 163L105 165L112 167Z" fill="#ECA239" />

              <ellipse cx="270" cy="170" rx="21" ry="15" fill="#F7F7F6" />
              <ellipse cx="286" cy="158" rx="9" ry="8" fill="#FFFFFF" />
              <path d="M295 158L301 160L295 162Z" fill="#ECA239" />

              <ellipse cx="70" cy="140" rx="14" ry="10" fill="#ECEBE9" />
              <ellipse cx="105" cy="135" rx="12" ry="9" fill="#EBEAE8" />
              <ellipse cx="180" cy="130" rx="13" ry="9" fill="#ECEBE9" />
              <ellipse cx="250" cy="132" rx="13" ry="9" fill="#EAE9E6" />
              <ellipse cx="330" cy="138" rx="14" ry="10" fill="#E8E7E4" />
            </svg>

            {/* Top Left "House 3 / Shed 1" Badge */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
              <span className="bg-black/60 backdrop-blur-xs text-white px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide">
                House 3 (Shed 1)
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>

            {/* Top Right Video Camera Icon */}
            <div className="absolute top-3 right-3 z-20 text-white/90 bg-black/40 backdrop-blur-xs p-1.5 rounded-md">
              <Video className="w-4 h-4" />
            </div>

            {/* Real Active Batch Badge */}
            <div className="absolute bottom-2 left-3 z-20 text-[10px] font-mono text-white/90 bg-black/50 px-2 py-0.5 rounded">
              {activeFlock?.flockNumber} · DOC: {activeFlock?.docWeightPerChickGrams}g
            </div>
          </div>

          {/* Bottom Telemetry Strip matching reference image (21°C Normal · 65% Optimal) */}
          <div className="p-4 grid grid-cols-2 divide-x divide-[#ECE6D8] text-xs">
            {/* Thermometer Normal */}
            <div className="flex items-center gap-3 pr-3">
              <div className="w-8 h-8 rounded-full bg-[#FCEFEA] flex items-center justify-center shrink-0">
                <svg className="w-4 h-5" viewBox="0 0 16 24" fill="none">
                  <rect x="6" y="2" width="4" height="13" rx="2" fill="#DE684B" />
                  <circle cx="8" cy="17" r="5" fill="#DE684B" />
                  <circle cx="8" cy="17" r="2.5" fill="#FFFFFF" />
                  <rect x="5" y="1" width="6" height="15" rx="3" stroke="#B8492E" strokeWidth="1" />
                </svg>
              </div>

              <div>
                <span className="text-base font-bold text-[#1E2621] block leading-tight tabular-nums">
                  21°C
                </span>
                <span className="text-[11px] font-semibold text-[#4F8B67]">
                  Normal
                </span>
              </div>
            </div>

            {/* Humidity Optimal */}
            <div className="flex items-center gap-3 pl-4">
              <div className="w-8 h-8 rounded-full bg-[#EBF4FA] flex items-center justify-center shrink-0">
                <svg className="w-4 h-5" viewBox="0 0 16 20" fill="none">
                  <path
                    d="M8 1C8 1 2 8 2 12.5C2 15.5 4.7 18 8 18C11.3 18 14 15.5 14 12.5C14 8 8 1 8 1Z"
                    fill="#4590B8"
                    stroke="#2D7296"
                    strokeWidth="1"
                  />
                </svg>
              </div>

              <div>
                <span className="text-base font-bold text-[#1E2621] block leading-tight tabular-nums">
                  65%
                </span>
                <span className="text-[11px] font-semibold text-[#3D7A9C]">
                  Optimal
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM "QUICK ACTIONS" CARD - STYLED EXACTLY LIKE REFERENCE IMAGE */}
      <div className="bg-[#EDE7DC] border border-[#E0D9C8] rounded-2xl p-5 shadow-2xs">
        <h3 className="text-sm font-bold text-[#2A3730] text-center mb-4">
          Quick Actions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
          {/* Button 1: + Daily Flock Operations */}
          <button
            type="button"
            onClick={onOpenDailyModal}
            className="w-full py-2.5 px-4 bg-[#52796F] hover:bg-[#43645C] text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
          >
            <span>+ Log Daily Record</span>
          </button>

          {/* Button 2: + New Broiler Placement */}
          <button
            type="button"
            onClick={onOpenNewFlock}
            className="w-full py-2.5 px-4 bg-[#52796F] hover:bg-[#43645C] text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
          >
            <span>+ New Broiler Placement</span>
          </button>

          {/* Button 3: + Weekly Weights & Sample Weigher */}
          <button
            type="button"
            onClick={() => onNavigateToTab('weekly')}
            className="w-full py-2.5 px-4 bg-[#52796F] hover:bg-[#43645C] text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
          >
            <span>+ Record Weekly Weights</span>
          </button>

          {/* Button 4: View Commercial Sales & Mandi Rates (Terracotta color from image) */}
          <button
            type="button"
            onClick={() => onNavigateToTab('sales')}
            className="w-full py-2.5 px-4 bg-[#BC6345] hover:bg-[#A65337] text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
          >
            <span>View Mandi Sales & Rates</span>
          </button>
        </div>
      </div>

      {/* 4. Commercial sales, farm expenses, and vaccination snapshots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Module 1: Commercial Sales & Mandi Udhaar */}
        <div className="bg-white border border-[#E4DEC9] rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#1E2621] flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#4A7261]" />
                <span>Commercial Sales & Mandi Rates</span>
              </h3>
              <button
                onClick={() => onNavigateToTab('sales')}
                className="text-xs text-[#4A7261] hover:text-[#385B4D] font-bold"
              >
                View All
              </button>
            </div>
            <p className="text-xs text-[#717E75] mb-4">
              Real-time bird lifting, actual mandi rate vs agreed final rate, and customer credit (udhaar).
            </p>

            <div className="space-y-2.5">
              {sales.slice(0, 2).map((sale) => (
                <div key={sale.id} className="p-3 bg-[#FAF8F3] rounded-xl border border-[#EDE7D8] text-xs">
                  <div className="flex items-center justify-between font-bold text-[#1E2621]">
                    <span>{sale.customerName}</span>
                    <span className="text-[#326B4E] tabular-nums">{formatPKR(sale.totalAmount)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[#68766E]">
                    <span>{formatNumber(sale.birdsSold)} birds ({formatNumber(sale.totalWeightSoldKg)} kg)</span>
                    <span className="tabular-nums font-semibold">Final: Rs. {sale.finalRatePerKg}/kg</span>
                  </div>
                  <div className="mt-1.5 pt-1.5 border-t border-[#EAE3D4] flex items-center justify-between text-[11px]">
                    <span className="text-[#7A877E]">Market Rate: Rs. {sale.marketRatePerKg}/kg</span>
                    <span className="font-bold text-[#326B4E]">
                      Margin: +Rs. {sale.rateDifferencePerKg}/kg (+{formatPKR(sale.totalRateDifference)})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F0EBE0] flex items-center justify-between text-xs">
            <span className="text-[#717E75]">Total Lifted Birds:</span>
            <span className="font-bold text-[#1E2621] tabular-nums">
              {formatNumber(dashboardKPIs.totalSoldBirds)} Birds
            </span>
          </div>
        </div>

        {/* Module 2: Key Operational Costs (Litter, Diesel, Wood Brooders) */}
        <div className="bg-white border border-[#E4DEC9] rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#1E2621] flex items-center gap-2">
                <Wheat className="w-4 h-4 text-[#A8723E]" />
                <span>Operating Costs & Fuel</span>
              </h3>
              <button
                onClick={() => onNavigateToTab('expenses')}
                className="text-xs text-[#4A7261] hover:text-[#385B4D] font-bold"
              >
                View All
              </button>
            </div>
            <p className="text-xs text-[#717E75] mb-4">
              Standard farm inputs plus newly required Litter, Diesel, and Wood Brooder fuels.
            </p>

            <div className="space-y-2">
              {specificExpenses.map((exp, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                  <span className="text-[#55635B] truncate max-w-[190px]">{exp.name}</span>
                  <span className="font-bold text-[#2A3730] tabular-nums">{formatPKR(exp.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F0EBE0] flex items-center justify-between text-xs">
            <span className="text-[#717E75]">Total Production Costs:</span>
            <span className="font-bold text-[#C54A34] tabular-nums">
              {formatPKR(dashboardKPIs.totalExpensesPkr)}
            </span>
          </div>
        </div>

        {/* Module 3: Vaccination & Health Schedule */}
        <div className="bg-white border border-[#E4DEC9] rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#1E2621] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#4A7261]" />
                <span>Scheduled Day Vaccinations</span>
              </h3>
              <span className="text-[11px] text-[#717E75]">Scheduled Days</span>
            </div>
            <p className="text-xs text-[#717E75] mb-4">
              Pakistani day-age schedule for ND, IB, and IBD Gumboro protection.
            </p>

            <div className="space-y-2.5">
              {flockVaccines.slice(0, 4).map((vac) => (
                <div
                  key={vac.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-[#EDE7D8] bg-[#FAF8F3] text-xs"
                >
                  <div className="flex items-center gap-2">
                    {vac.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-[#43825D] shrink-0" />
                    ) : (
                      <Calendar className="w-4 h-4 text-[#D88D37] shrink-0" />
                    )}
                    <div>
                      <div className="font-bold text-[#1E2621] leading-tight">
                        {vac.vaccineName}
                      </div>
                      <div className="text-[10px] text-[#717E75]">
                        Day {vac.dayAge} · {vac.route}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-bold ${
                      vac.status === 'completed' ? 'text-[#367751]' : 'text-[#BF7324]'
                    }`}
                  >
                    {vac.status === 'completed' ? 'Given' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F0EBE0] flex items-center justify-between text-xs text-[#717E75]">
            <span>Net Batch Profit:</span>
            <span className="font-bold text-[#2A7548] text-sm tabular-nums">
              {formatPKR(dashboardKPIs.estimatedProfitPkr)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
