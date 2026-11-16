import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Farm,
  Shed,
  Flock,
  DailyRecord,
  WeeklyWeightRecord,
  SaleRecord,
  ExpenseRecord,
  Customer,
  VaccinationSchedule,
} from '../types/poultry';
import {
  calculateClosingBirds,
  calculateMortalityPercent,
  calculateFCR,
  calculateAverageSampleWeight,
  calculateWeightGainPerBird,
  calculateTotalWeightGainedKg,
  calculateWeeklyFCR,
  evaluateWeeklyTarget,
  calculateSaleMetrics,
} from '../utils/calculations';
import { getSupabaseClient } from '../lib/supabase';
import { toDb, fromDb } from '../lib/mappers';

interface PoultryContextType {
  farms: Farm[];
  sheds: Shed[];
  flocks: Flock[];
  activeFlockId: string;
  activeFlock: Flock | undefined;
  setActiveFlockId: (id: string) => void;

  dailyRecords: DailyRecord[];
  weeklyWeights: WeeklyWeightRecord[];
  sales: SaleRecord[];
  expenses: ExpenseRecord[];
  customers: Customer[];
  vaccinations: VaccinationSchedule[];

  // CRUD actions
  addDailyRecord: (record: Omit<DailyRecord, 'id' | 'closingBirds' | 'feedBags'>) => void;
  deleteDailyRecord: (id: string) => void;
  addWeeklyWeightRecord: (params: {
    weekNumber: number;
    date: string;
    sampleWeights: number[];
    targetWeightGrams: number;
    notes?: string;
  }) => void;
  addSaleRecord: (params: {
    date: string;
    customerName: string;
    marketRatePerKg: number;
    totalWeightSoldKg: number;
    birdsSold: number;
    finalRatePerKg: number;
    amountPaid: number;
    vehicleNumber?: string;
    remarks?: string;
  }) => void;
  deleteSaleRecord: (id: string) => void;
  addExpenseRecord: (expense: Omit<ExpenseRecord, 'id'>) => void;
  deleteExpenseRecord: (id: string) => void;
  updateVaccineStatus: (id: string, status: 'completed' | 'pending' | 'skipped') => void;
  addFlock: (flock: Omit<Flock, 'id' | 'currentBirds'>) => void;
  closeFlock: (flockId: string, closureDate: string, notes?: string, reconcileRemainingAs?: 'sold' | 'culled', clearanceRatePerKg?: number) => void;
  reopenFlock: (flockId: string) => void;
  addFarm: (farm: Omit<Farm, 'id'>) => Farm;
  deleteFarm: (farmId: string) => void;
  addShed: (shed: Omit<Shed, 'id'>) => Shed;
  deleteShed: (shedId: string) => void;
  /** Re-fetches everything from Supabase (the header's refresh button). */
  refreshData: () => void;

  // Active Flock Computed Dashboard KPIs
  dashboardKPIs: {
    totalBirds: number;
    remainingBirds: number;
    totalMortality: number;
    totalCulling: number;
    totalSoldBirds: number;
    mortalityPercent: number;
    todayFeedKg: number;
    todayFeedBags: number;
    totalFeedConsumedKg: number;
    latestAvgWeightGrams: number;
    overallFcr: number;
    totalExpensesPkr: number;
    totalRevenuePkr: number;
    estimatedProfitPkr: number;
    latestWeekTargetStatus: {
      weekNumber: number;
      actualGrams: number;
      targetGrams: number;
      differenceGrams: number;
      isAchieved: boolean;
      weeklyFcr: number;
    } | null;
  };
}


const PoultryContext = createContext<PoultryContextType | undefined>(undefined);

const newId = () => crypto.randomUUID();

// Throws if a Supabase call returned an error, otherwise returns its data.
function must<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

function rows(res: { data: any[] | null; error: { message: string } | null }): Record<string, any>[] {
  if (res.error) throw new Error(res.error.message);
  return res.data ?? [];
}

async function fetchAll() {
  // Supabase RLS scopes each query to the authenticated user's owner_id.
  const [farms, sheds, flocks, daily, weekly, sales, expenses, customers, vaccines] = await Promise.all([
    getSupabaseClient().from('farms').select('*').order('created_at', { ascending: true }),
    getSupabaseClient().from('sheds').select('*').order('created_at', { ascending: true }),
    getSupabaseClient().from('flocks').select('*').order('created_at', { ascending: true }),
    getSupabaseClient().from('daily_records').select('*').order('date', { ascending: false }).order('created_at', { ascending: false }),
    getSupabaseClient().from('weekly_weights').select('*').order('week_number', { ascending: true }),
    getSupabaseClient().from('sales').select('*').order('date', { ascending: false }).order('created_at', { ascending: false }),
    getSupabaseClient().from('expenses').select('*').order('date', { ascending: false }).order('created_at', { ascending: false }),
    getSupabaseClient().from('customers').select('*').order('created_at', { ascending: true }),
    getSupabaseClient().from('vaccinations').select('*').order('scheduled_date', { ascending: true }),
  ]);
  return {
    farms: rows(farms).map((r) => fromDb<Farm>(r)),
    sheds: rows(sheds).map((r) => fromDb<Shed>(r)),
    flocks: rows(flocks).map((r) => fromDb<Flock>(r)),
    daily: rows(daily).map((r) => fromDb<DailyRecord>(r)),
    weekly: rows(weekly).map((r) => fromDb<WeeklyWeightRecord>(r)),
    sales: rows(sales).map((r) => fromDb<SaleRecord>(r)),
    expenses: rows(expenses).map((r) => fromDb<ExpenseRecord>(r)),
    customers: rows(customers).map((r) => fromDb<Customer>(r)),
    vaccines: rows(vaccines).map((r) => fromDb<VaccinationSchedule>(r)),
  };
}

export const PoultryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [farms, setFarms] = useState<Farm[]>([]);
  const [sheds, setSheds] = useState<Shed[]>([]);
  const [rawFlocks, setFlocks] = useState<Flock[]>([]);
  const [activeFlockId, setActiveFlockId] = useState<string>('');
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([]);
  const [weeklyWeights, setWeeklyWeights] = useState<WeeklyWeightRecord[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vaccinations, setVaccinations] = useState<VaccinationSchedule[]>([]);

  // ---------- Loading ----------
  const reload = useCallback(async () => {
    try {
      const d = await fetchAll();
      setFarms(d.farms);
      setSheds(d.sheds);
      setFlocks(d.flocks);
      setDailyRecords(d.daily);
      setWeeklyWeights(d.weekly);
      setSales(d.sales);
      setExpenses(d.expenses);
      setCustomers(d.customers);
      setVaccinations(d.vaccines);
      setLoadError(null);
      // keep the selected flock if it still exists, otherwise pick an active one
      setActiveFlockId((current) => {
        if (d.flocks.some((f) => f.id === current)) return current;
        return (d.flocks.find((f) => f.status === 'active') || d.flocks[0])?.id || '';
      });
    } catch (e: any) {
      console.error('Load failed', e);
      setLoadError(e.message || 'Could not load data');
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // ---------- Write queue ----------
  // Writes run one after another so foreign keys always exist
  // (e.g. a farm is saved before the shed that points to it).
  const queue = useRef<Promise<void>>(Promise.resolve());
  const enqueue = (label: string, task: () => Promise<void>) => {
    queue.current = queue.current.then(async () => {
      try {
        await task();
      } catch (e: any) {
        console.error(label, e);
        setSyncError(`${label} failed: ${e.message || e}`);
        await reload(); // roll the screen back to what the database really has
      }
    });
  };

  // ---------- Derived data ----------
  // currentBirds is never stored: initial - mortality - culling - sold (0 once a flock is closed)
  const flocks = useMemo<Flock[]>(() => {
    return rawFlocks.map((f) => {
      if (f.status !== 'active') return { ...f, currentBirds: 0 };
      let removed = 0;
      dailyRecords.forEach((r) => {
        if (r.flockId === f.id) removed += (r.mortality || 0) + (r.culling || 0);
      });
      sales.forEach((s) => {
        if (s.flockId === f.id) removed += s.birdsSold || 0;
      });
      return { ...f, currentBirds: Math.max(0, f.initialBirds - removed) };
    });
  }, [rawFlocks, dailyRecords, sales]);

  const activeFlock = useMemo(() => {
    return flocks.find((f) => f.id === activeFlockId) || flocks[0];
  }, [flocks, activeFlockId]);

  const activeFlockDaily = useMemo(
    () => dailyRecords.filter((r) => r.flockId === activeFlockId),
    [dailyRecords, activeFlockId]
  );
  const activeFlockWeekly = useMemo(
    () => weeklyWeights.filter((w) => w.flockId === activeFlockId),
    [weeklyWeights, activeFlockId]
  );
  const activeFlockSales = useMemo(
    () => sales.filter((s) => s.flockId === activeFlockId),
    [sales, activeFlockId]
  );
  const activeFlockExpenses = useMemo(() => {
    return expenses.filter(
      (e) => e.flockId === activeFlockId || (!e.flockId && e.farmId === activeFlock?.farmId)
    );
  }, [expenses, activeFlockId, activeFlock]);

  const dashboardKPIs = useMemo(() => {
    const totalBirds = activeFlock?.initialBirds ?? 0;

    let totalMortality = 0;
    let totalCulling = 0;
    let totalFeedConsumedKg = 0;

    activeFlockDaily.forEach((r) => {
      totalMortality += r.mortality || 0;
      totalCulling += r.culling || 0;
      totalFeedConsumedKg += r.feedUsedKg || 0;
    });

    const totalSoldBirds = activeFlockSales.reduce((acc, s) => acc + (s.birdsSold || 0), 0);
    const remainingBirds = Math.max(0, totalBirds - totalMortality - totalCulling - totalSoldBirds);

    const mortalityPercent = calculateMortalityPercent(totalMortality, totalBirds);

    const sortedDaily = [...activeFlockDaily].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const todayRecord = sortedDaily[0];
    const todayFeedKg = todayRecord ? todayRecord.feedUsedKg : 0;
    const todayFeedBags = Number((todayFeedKg / 50).toFixed(1));

    let latestAvgWeightGrams = activeFlock?.docWeightPerChickGrams || 0;
    if (activeFlockWeekly.length > 0) {
      const sortedWeekly = [...activeFlockWeekly].sort((a, b) => b.weekNumber - a.weekNumber);
      latestAvgWeightGrams = sortedWeekly[0].averageWeightGrams;
    } else if (todayRecord?.avgWeightGrams) {
      latestAvgWeightGrams = todayRecord.avgWeightGrams;
    }

    const docWeightKg = (activeFlock?.docWeightPerChickGrams || 0) / 1000;
    const currentLiveWeightKg = remainingBirds * (latestAvgWeightGrams / 1000);
    const soldWeightKg = activeFlockSales.reduce((acc, s) => acc + s.totalWeightSoldKg, 0);
    const initialChickBiomassKg = totalBirds * docWeightKg;
    const netLiveWeightGainKg = Math.max(1, currentLiveWeightKg + soldWeightKg - initialChickBiomassKg);
    const overallFcr = calculateFCR(totalFeedConsumedKg, netLiveWeightGainKg);

    const totalRevenuePkr = activeFlockSales.reduce((acc, s) => acc + s.totalAmount, 0);
    const totalExpensesPkr = activeFlockExpenses.reduce((acc, e) => acc + e.totalAmountPkr, 0);
    const estimatedProfitPkr = totalRevenuePkr - totalExpensesPkr;

    let latestWeekTargetStatus = null;
    if (activeFlockWeekly.length > 0) {
      const sortedWeekly = [...activeFlockWeekly].sort((a, b) => b.weekNumber - a.weekNumber);
      const latestW = sortedWeekly[0];
      latestWeekTargetStatus = {
        weekNumber: latestW.weekNumber,
        actualGrams: latestW.averageWeightGrams,
        targetGrams: latestW.targetWeightGrams,
        differenceGrams: latestW.targetDifferenceGrams,
        isAchieved: latestW.isGoalAchieved,
        weeklyFcr: latestW.weeklyFcr,
      };
    }

    return {
      totalBirds,
      remainingBirds,
      totalMortality,
      totalCulling,
      totalSoldBirds,
      mortalityPercent,
      todayFeedKg,
      todayFeedBags,
      totalFeedConsumedKg,
      latestAvgWeightGrams,
      overallFcr,
      totalExpensesPkr,
      totalRevenuePkr,
      estimatedProfitPkr,
      latestWeekTargetStatus,
    };
  }, [activeFlock, activeFlockDaily, activeFlockWeekly, activeFlockSales, activeFlockExpenses]);

  // ---------- Daily records ----------
  const addDailyRecord = (record: Omit<DailyRecord, 'id' | 'closingBirds' | 'feedBags'>) => {
    const closing = calculateClosingBirds(record.openingBirds, record.mortality, record.culling, record.salesCount);
    const feedBags = Number(((record.feedUsedKg || 0) / 50).toFixed(1));
    const newRecord: DailyRecord = { ...record, id: newId(), closingBirds: closing, feedBags };

    setDailyRecords((prev) => [newRecord, ...prev]);
    enqueue('Saving daily record', async () => {
      must(await getSupabaseClient().from('daily_records').insert(toDb(newRecord)));
    });
  };

  const deleteDailyRecord = (id: string) => {
    setDailyRecords((prev) => prev.filter((r) => r.id !== id));
    enqueue('Deleting daily record', async () => {
      must(await getSupabaseClient().from('daily_records').delete().eq('id', id));
    });
  };

  // ---------- Weekly weights ----------
  const addWeeklyWeightRecord = (params: {
    weekNumber: number;
    date: string;
    sampleWeights: number[];
    targetWeightGrams: number;
    notes?: string;
  }) => {
    if (!activeFlock) return;
    const { weekNumber, date, sampleWeights, targetWeightGrams, notes } = params;
    const avgWeightGrams = calculateAverageSampleWeight(sampleWeights);
    const avgWeightKg = Number((avgWeightGrams / 1000).toFixed(3));

    let previousAvgGrams = activeFlock.docWeightPerChickGrams || 42;
    if (weekNumber > 1) {
      const prevWeek = activeFlockWeekly.find((w) => w.weekNumber === weekNumber - 1);
      if (prevWeek) previousAvgGrams = prevWeek.averageWeightGrams;
    }

    const weightGainPerBirdGrams = calculateWeightGainPerBird(avgWeightGrams, previousAvgGrams);
    const liveBirdsAtWeighing = dashboardKPIs.remainingBirds;
    const totalFlockWeightGainKg = calculateTotalWeightGainedKg(weightGainPerBirdGrams, liveBirdsAtWeighing);

    // Feed used this week = sum of the daily records for days (week-1)*7+1 .. week*7.
    const fromDay = (weekNumber - 1) * 7 + 1;
    const toDay = weekNumber * 7;
    const weekRecords = activeFlockDaily.filter((r) => r.dayNumber >= fromDay && r.dayNumber <= toDay);
    const feedConsumedThisWeekKg = Math.round(
      weekRecords.reduce((acc, r) => acc + (r.feedUsedKg || 0), 0)
    );

    const weeklyFcr = calculateWeeklyFCR(feedConsumedThisWeekKg, totalFlockWeightGainKg);
    const { isAchieved, differenceGrams } = evaluateWeeklyTarget(avgWeightGrams, targetWeightGrams);

    const newWeightRecord: WeeklyWeightRecord = {
      id: newId(),
      flockId: activeFlock.id,
      weekNumber,
      date,
      birdsSampledCount: sampleWeights.length,
      sampleWeightsGrams: sampleWeights,
      averageWeightGrams: avgWeightGrams,
      averageWeightKg: avgWeightKg,
      targetWeightGrams,
      targetDifferenceGrams: differenceGrams,
      isGoalAchieved: isAchieved,
      weightGainPerBirdGrams,
      liveBirdsAtWeighing,
      totalFlockWeightGainKg,
      feedConsumedThisWeekKg,
      weeklyFcr,
      notes: notes || '',
    };

    setWeeklyWeights((prev) => {
      const filtered = prev.filter((w) => !(w.flockId === newWeightRecord.flockId && w.weekNumber === weekNumber));
      return [...filtered, newWeightRecord].sort((a, b) => a.weekNumber - b.weekNumber);
    });
    enqueue('Saving weekly weight', async () => {
      // replace the same week if it already exists
      must(await getSupabaseClient().from('weekly_weights').delete().eq('flock_id', newWeightRecord.flockId).eq('week_number', weekNumber));
      must(await getSupabaseClient().from('weekly_weights').insert(toDb(newWeightRecord)));
    });
  };

  // ---------- Sales ----------
  const addSaleRecord = (params: {
    date: string;
    customerName: string;
    marketRatePerKg: number;
    totalWeightSoldKg: number;
    birdsSold: number;
    finalRatePerKg: number;
    amountPaid: number;
    vehicleNumber?: string;
    remarks?: string;
  }) => {
    if (!activeFlock) return;
    const metrics = calculateSaleMetrics(
      params.totalWeightSoldKg,
      params.birdsSold,
      params.marketRatePerKg,
      params.finalRatePerKg
    );

    const outstandingBalance = Math.max(0, metrics.totalAmount - (params.amountPaid || 0));
    let paymentStatus: 'paid' | 'partial' | 'unpaid' = 'unpaid';
    if (outstandingBalance === 0) paymentStatus = 'paid';
    else if (params.amountPaid > 0) paymentStatus = 'partial';

    const newSale: SaleRecord = {
      id: newId(),
      flockId: activeFlock.id,
      invoiceNo: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      date: params.date,
      customerName: params.customerName,
      marketRatePerKg: params.marketRatePerKg,
      totalWeightSoldKg: params.totalWeightSoldKg,
      birdsSold: params.birdsSold,
      finalRatePerKg: params.finalRatePerKg,
      totalAmount: metrics.totalAmount,
      rateDifferencePerKg: metrics.rateDifferencePerKg,
      totalRateDifference: metrics.totalRateDifference,
      avgWeightPerBirdKg: metrics.avgBirdWeightKg,
      amountPaid: params.amountPaid || 0,
      outstandingBalance,
      paymentStatus,
      vehicleNumber: params.vehicleNumber,
      remarks: params.remarks,
    };

    setSales((prev) => [newSale, ...prev]);
    enqueue('Saving sale', async () => {
      must(await getSupabaseClient().from('sales').insert(toDb(newSale)));
    });

    // Add the unpaid amount (udhaar) to the customer's balance if they exist
    const customer = customers.find((c) => c.name.toLowerCase() === params.customerName.toLowerCase());
    if (customer) {
      const newBalance = customer.currentBalancePkr + outstandingBalance;
      setCustomers((prev) => prev.map((c) => (c.id === customer.id ? { ...c, currentBalancePkr: newBalance } : c)));
      enqueue('Updating customer balance', async () => {
        must(await getSupabaseClient().from('customers').update({ current_balance_pkr: newBalance }).eq('id', customer.id));
      });
    }
  };

  const deleteSaleRecord = (id: string) => {
    setSales((prev) => prev.filter((s) => s.id !== id));
    enqueue('Deleting sale', async () => {
      must(await getSupabaseClient().from('sales').delete().eq('id', id));
    });
  };

  // ---------- Expenses ----------
  const addExpenseRecord = (expense: Omit<ExpenseRecord, 'id'>) => {
    const newExpense: ExpenseRecord = { ...expense, id: newId() };
    setExpenses((prev) => [newExpense, ...prev]);
    enqueue('Saving expense', async () => {
      must(await getSupabaseClient().from('expenses').insert(toDb(newExpense)));
    });
  };

  const deleteExpenseRecord = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    enqueue('Deleting expense', async () => {
      must(await getSupabaseClient().from('expenses').delete().eq('id', id));
    });
  };

  // ---------- Vaccinations ----------
  const updateVaccineStatus = (id: string, status: 'completed' | 'pending' | 'skipped') => {
    const administeredDate = status === 'completed' ? new Date().toISOString().split('T')[0] : undefined;
    setVaccinations((prev) => prev.map((v) => (v.id === id ? { ...v, status, administeredDate } : v)));
    enqueue('Updating vaccination', async () => {
      must(
        await getSupabaseClient()
          .from('vaccinations')
          .update({ status, administered_date: administeredDate ?? null })
          .eq('id', id)
      );
    });
  };

  // ---------- Flocks ----------
  const addFlock = (flockData: Omit<Flock, 'id' | 'currentBirds'>) => {
    const newFlockId = newId();
    const newFlock: Flock = { ...flockData, id: newFlockId, currentBirds: flockData.initialBirds, status: 'active' };

    const day1Feed = Math.round(flockData.initialBirds * 0.02); // ~20g per chick on Day 1
    const day1Record: DailyRecord = {
      id: newId(),
      flockId: newFlockId,
      date: flockData.placementDate,
      dayNumber: 1,
      openingBirds: flockData.initialBirds,
      mortality: 0,
      culling: 0,
      salesCount: 0,
      closingBirds: flockData.initialBirds,
      feedUsedKg: day1Feed,
      feedType: 'Pre-Starter',
      feedBags: Number((day1Feed / 50).toFixed(1)),
      avgWeightGrams: flockData.docWeightPerChickGrams,
      notes: `Batch placed into shed. DOC weight ${flockData.docWeightPerChickGrams}g verified. Brooding heaters operational.`,
    };

    const placementTime = new Date(flockData.placementDate).getTime();
    const addDays = (days: number) => new Date(placementTime + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newSchedules: VaccinationSchedule[] = [
      {
        id: newId(), flockId: newFlockId, dayAge: 1,
        vaccineName: 'ND + IB (Newcastle + Infectious Bronchitis)', route: 'Eye Drop',
        diseaseTarget: 'Ranikhet & IB Primary', scheduledDate: flockData.placementDate,
        status: 'completed', administeredDate: flockData.placementDate,
        administeredBy: 'Hatchery Staff / Farm Manager',
      },
      {
        id: newId(), flockId: newFlockId, dayAge: 8,
        vaccineName: 'IBD (Gumboro Intermediate)', route: 'Drinking Water',
        diseaseTarget: 'Infectious Bursal Disease', scheduledDate: addDays(7), status: 'pending',
      },
      {
        id: newId(), flockId: newFlockId, dayAge: 18,
        vaccineName: 'ND Lasota (Booster)', route: 'Drinking Water',
        diseaseTarget: 'Newcastle Disease Booster', scheduledDate: addDays(17), status: 'pending',
      },
      {
        id: newId(), flockId: newFlockId, dayAge: 24,
        vaccineName: 'IBD 2nd Booster', route: 'Drinking Water',
        diseaseTarget: 'Gumboro Booster', scheduledDate: addDays(23), status: 'pending',
      },
    ];

    setFlocks((prev) => [...prev, newFlock]);
    setActiveFlockId(newFlockId);
    setDailyRecords((prev) => [day1Record, ...prev]);
    setVaccinations((prev) => [...prev, ...newSchedules]);

    enqueue('Saving new flock', async () => {
      must(await getSupabaseClient().from('flocks').insert(toDb(newFlock, ['currentBirds'])));
      must(await getSupabaseClient().from('daily_records').insert(toDb(day1Record)));
      must(await getSupabaseClient().from('vaccinations').insert(newSchedules.map((v) => toDb(v))));
    });
  };

  const closeFlock = (
    flockId: string,
    closureDate: string,
    notes?: string,
    reconcileRemainingAs?: 'sold' | 'culled',
    clearanceRatePerKg?: number
  ) => {
    const targetFlock = flocks.find((f) => f.id === flockId);
    if (!targetFlock) return;

    if (reconcileRemainingAs && targetFlock.currentBirds > 0) {
      const remaining = targetFlock.currentBirds;
      if (reconcileRemainingAs === 'sold') {
        const avgWeight = dashboardKPIs.latestAvgWeightGrams / 1000 || 2.2;
        const totalWeight = Math.round(remaining * avgWeight);
        // rate: the one passed in, else this flock's latest sale rate, else Rs. 430
        const lastSaleRate = activeFlockSales[0]?.finalRatePerKg;
        const rate = clearanceRatePerKg ?? lastSaleRate ?? 430;
        addSaleRecord({
          date: closureDate,
          customerName: 'Final Batch Clearance Merchant',
          marketRatePerKg: rate,
          totalWeightSoldKg: totalWeight,
          birdsSold: remaining,
          finalRatePerKg: rate,
          amountPaid: Math.round(totalWeight * rate),
          remarks: 'Final batch clearance sale to empty shed for sanitization.',
        });
      } else {
        addDailyRecord({
          flockId,
          date: closureDate,
          dayNumber: (dailyRecords.find((r) => r.flockId === flockId)?.dayNumber || 38) + 1,
          openingBirds: remaining,
          mortality: 0,
          culling: remaining,
          salesCount: 0,
          feedUsedKg: 0,
          feedType: 'Finisher',
          notes: 'Batch closure: Remaining runts/culled birds cleared for shed washout.',
        });
      }
    }

    const closureNotes = notes || 'Batch completed and shed prepared for turnaround.';
    setFlocks((prev) =>
      prev.map((f) => (f.id === flockId ? { ...f, status: 'completed', closureDate, closureNotes } : f))
    );
    enqueue('Closing flock', async () => {
      must(
        await getSupabaseClient()
          .from('flocks')
          .update({ status: 'completed', closure_date: closureDate, closure_notes: closureNotes })
          .eq('id', flockId)
      );
    });
  };

  const reopenFlock = (flockId: string) => {
    setFlocks((prev) => prev.map((f) => (f.id === flockId ? { ...f, status: 'active' } : f)));
    enqueue('Reopening flock', async () => {
      must(await getSupabaseClient().from('flocks').update({ status: 'active' }).eq('id', flockId));
    });
  };

  // ---------- Farms & sheds ----------
  const addFarm = (farmData: Omit<Farm, 'id'>): Farm => {
    const newFarm: Farm = { ...farmData, id: newId() };
    setFarms((prev) => [...prev, newFarm]);
    enqueue('Saving farm', async () => {
      must(await getSupabaseClient().from('farms').insert(toDb(newFarm)));
    });
    return newFarm;
  };

  const deleteFarm = (farmId: string) => {
    if (sheds.some((shed) => shed.farmId === farmId)) {
      setSyncError('Remove this farm’s sheds before removing the farm.');
      return;
    }
    if (flocks.some((flock) => flock.farmId === farmId)) {
      setSyncError('This farm has flock history and cannot be removed.');
      return;
    }
    if (expenses.some((expense) => expense.farmId === farmId)) {
      setSyncError('This farm has expense history and cannot be removed.');
      return;
    }

    setFarms((prev) => prev.filter((farm) => farm.id !== farmId));
    enqueue('Removing farm', async () => {
      must(await getSupabaseClient().from('farms').delete().eq('id', farmId));
    });
  };

  const addShed = (shedData: Omit<Shed, 'id'>): Shed => {
    const newShed: Shed = { ...shedData, id: newId() };
    setSheds((prev) => [...prev, newShed]);
    enqueue('Saving shed', async () => {
      must(await getSupabaseClient().from('sheds').insert(toDb(newShed)));
    });
    return newShed;
  };

  const deleteShed = (shedId: string) => {
    if (flocks.some((flock) => flock.shedId === shedId)) {
      setSyncError('This shed has flock history and cannot be removed.');
      return;
    }

    setSheds((prev) => prev.filter((shed) => shed.id !== shedId));
    enqueue('Removing shed', async () => {
      must(await getSupabaseClient().from('sheds').delete().eq('id', shedId));
    });
  };

  // ---------- Refresh ----------
  const refreshData = () => {
    reload();
  };

  // ---------- Render ----------
  if (!loaded) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F6F3EB] text-[#58645C]">Loading your farm data…</div>;
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#F6F3EB] text-[#242A26] p-6 text-center">
        <p className="font-bold">Could not load data from Supabase</p>
        <p className="text-sm text-[#58645C] max-w-md">{loadError}</p>
        <p className="text-xs text-[#6B7970] max-w-md">
          Usual causes: the SQL migration has not been run yet, or the .env keys are wrong.
        </p>
        <button onClick={reload} className="px-4 py-2 rounded-lg bg-[#3A564A] text-white text-sm font-semibold">
          Try again
        </button>
      </div>
    );
  }

  return (
    <PoultryContext.Provider
      value={{
        farms,
        sheds,
        flocks,
        activeFlockId,
        activeFlock,
        setActiveFlockId,
        dailyRecords,
        weeklyWeights,
        sales,
        expenses,
        customers,
        vaccinations,
        addDailyRecord,
        deleteDailyRecord,
        addWeeklyWeightRecord,
        addSaleRecord,
        deleteSaleRecord,
        addExpenseRecord,
        deleteExpenseRecord,
        updateVaccineStatus,
        addFlock,
        closeFlock,
        reopenFlock,
        addFarm,
        deleteFarm,
        addShed,
        deleteShed,
        refreshData,
        dashboardKPIs,
      }}
    >
      {children}
      {syncError && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-lg bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg px-4 py-2 shadow flex items-start gap-3">
          <span>{syncError}</span>
          <button onClick={() => setSyncError(null)} className="font-bold">×</button>
        </div>
      )}
    </PoultryContext.Provider>
  );
};

export const usePoultry = () => {
  const context = useContext(PoultryContext);
  if (!context) {
    throw new Error('usePoultry must be used within a PoultryProvider');
  }
  return context;
};
