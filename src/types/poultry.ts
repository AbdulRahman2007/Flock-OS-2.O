/**
 * FLOCK OS Poultry Operations Platform - TypeScript Definitions
 * Revised Project Planning Document Specification
 */

export interface Farm {
  id: string;
  name: string;
  location: string;
  contactNumber: string;
  status: 'active' | 'inactive';
}

export interface Shed {
  id: string;
  farmId: string;
  name: string;
  capacity: number;
}

export interface Flock {
  id: string;
  flockNumber: string;
  farmId: string;
  shedId: string;
  breed: 'Cobb 500' | 'Ross 308' | 'Hubbard Classic' | 'Arbor Acres';
  supplier: string;
  initialBirds: number;
  currentBirds: number;
  placementDate: string; // YYYY-MM-DD
  targetAgeDays: number; // e.g., 35-42 days
  targetWeightKg: number; // e.g., 2.2 kg
  status: 'active' | 'completed' | 'culled';
  closureDate?: string; // YYYY-MM-DD
  closureNotes?: string;
  // DOC chick metrics (Section 3, 6, 7)
  docWeightPerChickGrams: number; // e.g., 42 grams
  avgChickWeightPlacementGrams: number; // sample avg at placement
}

export interface DailyRecord {
  id: string;
  flockId: string;
  date: string; // YYYY-MM-DD
  dayNumber: number; // Age in days
  openingBirds: number;
  mortality: number; // Died today
  culling: number; // Culled today
  salesCount: number; // Birds sold today (if any)
  closingBirds: number; // Opening - Mortality - Culling - Sales
  feedUsedKg: number;
  feedType: 'Pre-Starter' | 'Starter' | 'Grower' | 'Finisher';
  feedBags: number; // Calculated (50kg bags)
  avgWeightGrams?: number; // Optional if weighed today
  // Daily medication and vaccination
  medicationGiven?: string;
  medicationDose?: string;
  medicationPurpose?: string;
  vaccineGiven?: string;
  vaccineStatus?: 'given' | 'pending' | 'none';
  notes?: string;
}

export interface BirdWeightSample {
  sampleNumber: number;
  weightGrams: number;
}

export interface WeeklyWeightRecord {
  id: string;
  flockId: string;
  weekNumber: number; // 1 to 6
  date: string;
  birdsSampledCount: number;
  sampleWeightsGrams: number[]; // Each bird's weight stored
  averageWeightGrams: number; // Calculated
  averageWeightKg: number; // Calculated
  targetWeightGrams: number; // Weekly goal
  targetDifferenceGrams: number; // Actual - Goal
  isGoalAchieved: boolean; // Actual >= Goal
  weightGainPerBirdGrams: number; // This week avg - Previous week avg (or DOC)
  liveBirdsAtWeighing: number;
  totalFlockWeightGainKg: number; // (Gain per bird * Live birds) / 1000
  feedConsumedThisWeekKg: number;
  weeklyFcr: number; // Feed consumed / Total weight gain
  notes?: string;
}

export interface SaleRecord {
  id: string;
  flockId: string;
  invoiceNo: string;
  // Sale entry stores in this order (Section 4, 6, 7):
  date: string; // 1) Date
  customerName: string; // 2) Name of person / customer
  marketRatePerKg: number; // 3) Rate per kg on that day (market rate / actual rate in PKR)
  totalWeightSoldKg: number; // 4) Total weight sold (kg)
  birdsSold: number; // 5) Total number of birds sold
  finalRatePerKg: number; // 6) Final rate per kg birds were sold at
  // Calculated & commercial fields
  totalAmount: number; // Total weight * final rate
  rateDifferencePerKg: number; // Final rate - Market rate
  totalRateDifference: number; // Rate difference * total weight
  avgWeightPerBirdKg: number; // Total weight / birds sold
  amountPaid: number;
  outstandingBalance: number; // Udhaar / remaining balance
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  vehicleNumber?: string;
  remarks?: string;
}

export type ExpenseCategory =
  | 'Feed'
  | 'Chicks'
  | 'Medicine'
  | 'Labour'
  | 'Electricity'
  | 'Transport'
  | 'Maintenance'
  | 'Litter' // [NEW] Bedding/sawdust/rice husk
  | 'Diesel' // [NEW] Generator/heating fuel
  | 'Wood brooders' // [NEW] Wood/fuel for brooding
  | 'Miscellaneous';

export interface ExpenseRecord {
  id: string;
  flockId?: string; // Can be flock-level or farm-level
  farmId: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  quantity?: number;
  unit?: string; // e.g. bags, maunds, liters, days
  unitPricePkr?: number;
  totalAmountPkr: number;
  paymentMode: 'Cash' | 'Bank Transfer' | 'Cheque' | 'Credit';
  vendorName?: string;
}

export interface Customer {
  id: string;
  name: string;
  shopOrBusiness: string;
  city: string;
  phone: string;
  currentBalancePkr: number; // Udhaar
}

export interface VaccinationSchedule {
  id: string;
  flockId: string;
  dayAge: number;
  vaccineName: string;
  route: 'Drinking Water' | 'Eye Drop' | 'Injection' | 'Spray';
  diseaseTarget: string;
  scheduledDate: string;
  status: 'pending' | 'completed' | 'skipped';
  administeredDate?: string;
  administeredBy?: string;
}
