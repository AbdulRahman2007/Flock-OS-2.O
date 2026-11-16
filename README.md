# FLOCK OS — Poultry Operations Platform

A commercial poultry operations platform for farm owners, flock supervisors, and agribusiness teams. Each signed-in account is isolated with Supabase row-level security.

## 🚀 Key Features

1. **Flock Lifecycle & DOC Placement Tracking**:
   - Track batches from Day-Old Chick (DOC) placement (chick count, supplier, chick placement weight in grams).
   - Target depletion/lifting harvest goals (target age in days, target bird weight in kg).

2. **Daily Operations Ledger**:
   - **Population Balance**: Closing Birds = Opening Birds - Mortality - Culling - Sales.
   - **50kg Bag-Based Feed Calculation**: Feed calculated per 50kg standard bag (e.g. 21 bags = 1,050 kg) with two-way auto conversion.
   - Medication and day-age vaccination scheduling.

3. **Weekly Growth Sampling & Breed Benchmark Comparison**:
   - Multi-bird sample weight recorder with automatic sample averaging.
   - Target Achieved / Not Achieved status with exact gram variance (+/- grams) against breed benchmark curves (Cobb 500, Ross 308, Hubbard Classic, Arbor Acres).
   - Weekly FCR and weight gain per bird.

4. **Commercial Mandi Sales & Udhaar (Credit) Ledger**:
   - Records Date, Customer Name, Market Mandi Rate (Rs./kg), Total Weight Sold (kg), Number of Birds Lifted, and Agreed Final Rate (Rs./kg).
   - Automatic calculation of Total Revenue, Price Realization Margin (+/- Rs./kg), Total Rate Difference, and Customer Outstanding Balance (*Udhaar*).

5. **Operational Expenses & Fuel Ledger**:
   - Categorized cost tracking including **Litter** (rice husk/sawdust), **Diesel** (standby generator fuel), **Wood Brooders** (heating fuel), Feed bags, Chick placement, Vaccines, Labour, and Electricity.

6. **Farm & Shed Facility Management**:
   - Add and manage multiple Farm Locations (names, city/districts, supervisor contacts).
   - Add Sheds under each farm with custom bird housing capacity.

7. **Audit & Closure Reports**:
   - Full batch closure reconciliation, overall FCR, European Production Efficiency Factor (EPEF), mortality percentage, and net batch profit in Pakistani Rupees (PKR).

---

## 🛠️ Getting Started Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or bun or yarn

### Installation
```bash
# 1. Install dependencies
npm install

# 2. Configure Supabase
#    Follow SUPABASE_SETUP.md and copy .env.example to .env with your project credentials.

# 3. Start the development server
npm run dev
```

Visit `http://localhost:3000` or `http://localhost:5173` in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 📁 Project Architecture
- `src/context/PoultryContext.tsx`: Central state management backed by account-scoped Supabase data.
- `src/types/poultry.ts`: TypeScript interfaces for Flocks, Daily records, Weekly weights, Sales, Expenses, Vaccinations, Farms, and Sheds.
- `src/utils/calculations.ts`: Mathematical formulas for FCR, EPEF, Closing Birds, and PKR currency formatting.
- `src/components/dashboard/`: FLOCK OS dashboard and operational summaries.
- `src/components/daily/`: Daily operations logging with 50kg bag calculations.
- `src/components/weekly/`: Weekly weight sampling and breed benchmark evaluation.
- `src/components/sales/`: Commercial sales and Mandi Udhaar tracking.
- `src/components/expenses/`: Operating expenses including Litter, Diesel, and Wood Brooders.
- `src/components/reports/`: Full printable Flock Performance and Closure Audit report.
- `src/components/modals/`: Quick entry modals and Farm & Shed management.
