import React, { useState } from 'react';
import { PoultryProvider, usePoultry } from './context/PoultryContext';
import { AuthGate } from './components/auth/AuthGate';
import { Header } from './components/common/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { DailyOperationsView } from './components/daily/DailyOperationsView';
import { WeeklyWeightView } from './components/weekly/WeeklyWeightView';
import { SalesView } from './components/sales/SalesView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { FlockPerformanceReport } from './components/reports/FlockPerformanceReport';
import { QuickDailyModal } from './components/modals/QuickDailyModal';
import { NewFlockModal } from './components/modals/NewFlockModal';
import { CloseFlockModal } from './components/modals/CloseFlockModal';
import { ManageFarmsShedsModal } from './components/modals/ManageFarmsShedsModal';
import { Bird, Building2, CircleCheck, Layers3 } from 'lucide-react';

function MainAppContent() {
  const [currentTab, setCurrentTab] = useState<
    'dashboard' | 'daily' | 'weekly' | 'sales' | 'expenses' | 'report'
  >('dashboard');
  const [isQuickDailyOpen, setIsQuickDailyOpen] = useState(false);
  const [isNewFlockOpen, setIsNewFlockOpen] = useState(false);
  const [isCloseFlockOpen, setIsCloseFlockOpen] = useState(false);
  const [isManageFarmsOpen, setIsManageFarmsOpen] = useState(false);
  const { activeFlock, farms, sheds, flocks } = usePoultry();

  if (flocks.length === 0) {
    return (
      <div className="min-h-screen bg-[#F6F3EB] text-[#242A26] flex flex-col font-sans">
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 flex items-center">
          <section className="w-full bg-white border border-[#E4DEC9] rounded-3xl shadow-sm overflow-hidden">
            <div className="bg-[#2A3B32] text-white px-6 py-8 sm:px-10">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Bird className="w-7 h-7 text-[#D8B88C]" />
                </span>
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight">FLOCK OS</h1>
                  <p className="text-sm text-white/70">Poultry operations, under control.</p>
                </div>
              </div>
              <h2 className="mt-8 text-2xl sm:text-3xl font-bold">Set up your operation</h2>
              <p className="mt-2 text-sm text-white/75 max-w-xl">
                Your workspace is ready. Register your farm and sheds, then create your first flock to begin tracking real operations.
              </p>
            </div>

            <div className="grid gap-4 p-6 sm:p-10 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#E4DEC9] bg-[#FAF8F3] p-5">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-[#3A564A]" />
                  <h3 className="font-bold">1. Register your farm & sheds</h3>
                </div>
                <p className="mt-2 text-sm text-[#6B7970]">
                  Add your real farm locations, sheds, and housing capacity.
                </p>
                <button
                  type="button"
                  onClick={() => setIsManageFarmsOpen(true)}
                  className="mt-5 w-full rounded-xl bg-[#3A564A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2C443A]"
                >
                  Manage farms & sheds
                </button>
                <p className="mt-2 text-xs text-[#6B7970]">
                  {farms.length} farms · {sheds.length} sheds configured
                </p>
              </div>

              <div className="rounded-2xl border border-[#E4DEC9] bg-[#FAF8F3] p-5">
                <div className="flex items-center gap-3">
                  <Layers3 className="w-5 h-5 text-[#3A564A]" />
                  <h3 className="font-bold">2. Create your first flock</h3>
                </div>
                <p className="mt-2 text-sm text-[#6B7970]">
                  Enter your placement details to start an auditable flock record.
                </p>
                <button
                  type="button"
                  disabled={farms.length === 0 || sheds.length === 0}
                  onClick={() => setIsNewFlockOpen(true)}
                  className="mt-5 w-full rounded-xl bg-[#3A564A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2C443A] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Create first flock
                </button>
                {(farms.length === 0 || sheds.length === 0) && (
                  <p className="mt-2 text-xs text-[#6B7970]">
                    Add at least one farm and one shed to continue.
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-[#E4DEC9] px-6 py-4 sm:px-10 flex items-center gap-2 text-xs text-[#6B7970]">
              <CircleCheck className="w-4 h-4 text-[#3A564A]" />
              <span>Your workspace data is isolated to your signed-in account.</span>
            </div>
          </section>
        </main>
        <footer className="border-t border-[#E4DEC9] px-4 py-5 text-center text-xs text-[#6B7970]">
          Developed by <span className="font-semibold text-[#2A3B32]">Codision Labs</span>
        </footer>
        <NewFlockModal
          isOpen={isNewFlockOpen}
          onClose={() => setIsNewFlockOpen(false)}
        />
        <ManageFarmsShedsModal
          isOpen={isManageFarmsOpen}
          onClose={() => setIsManageFarmsOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F3EB] text-[#242A26] flex flex-col font-sans">
      {/* Top Bar following Top Bar Contract */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenQuickDaily={() => setIsQuickDailyOpen(true)}
        onOpenNewFlock={() => setIsNewFlockOpen(true)}
        onOpenCloseFlock={() => setIsCloseFlockOpen(true)}
        onOpenManageFarms={() => setIsManageFarmsOpen(true)}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            onNavigateToTab={(tab) => setCurrentTab(tab)}
            onOpenDailyModal={() => setIsQuickDailyOpen(true)}
            onOpenNewFlock={() => setIsNewFlockOpen(true)}
            onOpenCloseFlock={() => setIsCloseFlockOpen(true)}
          />
        )}

        {currentTab === 'daily' && <DailyOperationsView />}

        {currentTab === 'weekly' && <WeeklyWeightView />}

        {currentTab === 'sales' && <SalesView />}

        {currentTab === 'expenses' && <ExpensesView />}

        {currentTab === 'report' && <FlockPerformanceReport />}
      </main>

      {/* Quick Entry Modal */}
      <QuickDailyModal
        isOpen={isQuickDailyOpen}
        onClose={() => setIsQuickDailyOpen(false)}
      />

      {/* Add New Flock Modal */}
      <NewFlockModal
        isOpen={isNewFlockOpen}
        onClose={() => setIsNewFlockOpen(false)}
      />

      {/* Close / Finalize Flock Modal */}
      <CloseFlockModal
        isOpen={isCloseFlockOpen}
        onClose={() => setIsCloseFlockOpen(false)}
      />

      {/* Manage Farms & Sheds Modal */}
      <ManageFarmsShedsModal
        isOpen={isManageFarmsOpen}
        onClose={() => setIsManageFarmsOpen(false)}
      />

      <footer className="bg-[#F6F3EB] border-t border-[#E4DEC9] mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7970]">
          <div>
            <span className="font-bold text-[#2A3B32]">FLOCK OS</span> — Poultry Operations Management
          </div>
          <div className="flex items-center gap-4">
            <span>Currency: PKR (Rs.)</span>
            <span>·</span>
            <span>Active Flock: {activeFlock?.flockNumber || '—'}</span>
            <span>·</span>
            <span>Developed by <strong className="text-[#2A3B32]">Codision Labs</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthGate>
      <PoultryProvider>
        <MainAppContent />
      </PoultryProvider>
    </AuthGate>
  );
}
