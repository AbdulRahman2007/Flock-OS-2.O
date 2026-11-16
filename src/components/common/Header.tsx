import React, { useState } from 'react';
import { usePoultry } from '../../context/PoultryContext';
import {
  Layers,
  Calendar,
  Scale,
  DollarSign,
  Receipt,
  FileText,
  RotateCcw,
  ChevronDown,
  Building,
  Plus,
  FileCheck,
  Bird,
  LogOut,
} from 'lucide-react';
import { getSupabaseClient } from '../../lib/supabase';

interface HeaderProps {
  currentTab: 'dashboard' | 'daily' | 'weekly' | 'sales' | 'expenses' | 'report';
  setCurrentTab: (tab: 'dashboard' | 'daily' | 'weekly' | 'sales' | 'expenses' | 'report') => void;
  onOpenQuickDaily: () => void;
  onOpenNewFlock: () => void;
  onOpenCloseFlock: () => void;
  onOpenManageFarms: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenQuickDaily,
  onOpenNewFlock,
  onOpenCloseFlock,
  onOpenManageFarms,
}) => {
  const { farms, flocks, activeFlockId, setActiveFlockId, activeFlock, refreshData } = usePoultry();
  const [showFlockDropdown, setShowFlockDropdown] = useState(false);
  const [signOutError, setSignOutError] = useState('');

  const handleSignOut = async () => {
    const { error } = await getSupabaseClient().auth.signOut();
    if (error) {
      console.error('Sign out failed', error);
      setSignOutError(error.message);
    }
  };

  return (
    <header className="bg-[#F6F3EB] border-b border-[#E4DEC9] sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center gap-3 text-left focus:outline-none group"
            >
              <div className="flex items-center gap-2.5 tracking-tight font-extrabold text-xl text-[#3A564A]">
                <span className="w-9 h-9 rounded-xl bg-[#3A564A] text-white flex items-center justify-center">
                  <Bird className="w-5 h-5" />
                </span>
                <span>FLOCK OS</span>
              </div>

              <div className="hidden sm:block border-l border-[#DCD6C2] pl-3">
                <span className="text-xs font-medium text-[#5E6861] block tracking-normal">
                  Poultry Operations Platform
                </span>
              </div>
            </button>

            {/* Flock Switcher Dropdown (in natural warm styling) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFlockDropdown(!showFlockDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#3A453E] bg-[#EFE9DC] hover:bg-[#E7E0D1] rounded-lg transition-colors border border-[#DDD6C5]"
              >
                <Building className="w-3.5 h-3.5 text-[#4D6F61]" />
                <span className="font-bold text-[#2A3630]">{activeFlock?.flockNumber}</span>
                <span className="text-[#647169] hidden md:inline">({activeFlock?.breed})</span>
                {activeFlock?.status === 'completed' && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold bg-[#DDD7C8] text-[#55625A] rounded">
                    Completed
                  </span>
                )}
                <ChevronDown className="w-3 h-3 text-[#6A7870]" />
              </button>

              {showFlockDropdown && (
                <div className="absolute left-0 mt-1.5 w-72 bg-white rounded-xl shadow-lg border border-[#E0D9C8] py-1.5 z-50">
                  <div className="px-3.5 py-2 text-[11px] font-bold text-[#86928A] uppercase tracking-wider flex items-center justify-between border-b border-[#F0EBE0]">
                    <span>Select Flock Batch</span>
                    <span>{flocks.length} Flocks</span>
                  </div>

                  <div className="max-h-60 overflow-y-auto divide-y divide-[#F4EFE6]">
                    {flocks.map((flock) => (
                      <button
                        key={flock.id}
                        onClick={() => {
                          setActiveFlockId(flock.id);
                          setShowFlockDropdown(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 text-xs flex flex-col gap-0.5 transition-colors ${
                          flock.id === activeFlockId
                            ? 'bg-[#EBF2EE] text-[#294236] font-semibold'
                            : 'text-[#48534C] hover:bg-[#FAF7F0]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#223028]">{flock.flockNumber}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              flock.status === 'completed'
                                ? 'bg-stone-200 text-stone-700'
                                : 'bg-[#D2E4DA] text-[#28503D]'
                            }`}
                          >
                            {flock.status === 'completed' ? 'Completed' : 'Active'}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#69776E] flex items-center justify-between">
                          <span>{flock.breed} · Placed: {flock.placementDate}</span>
                          <span className="tabular-nums font-bold text-[#35433C]">
                            {flock.currentBirds.toLocaleString()} birds
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Actions inside dropdown */}
                  <div className="pt-2 mt-1 border-t border-[#EDE7DB] px-2 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowFlockDropdown(false);
                        onOpenManageFarms();
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-[#2D4D3E] hover:bg-[#EBF2EE] rounded-md font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Building className="w-3.5 h-3.5 text-[#3A564A]" />
                      <span>Manage Farms & Sheds ({farms.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowFlockDropdown(false);
                        onOpenNewFlock();
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-[#3C6453] hover:bg-[#EBF2EE] rounded-md font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Another Flock (Placement)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowFlockDropdown(false);
                        onOpenCloseFlock();
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-[#B55A3D] hover:bg-[#F8EFE9] rounded-md font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>{activeFlock?.status === 'completed' ? 'View Batch Closure Info' : 'Close Current Flock Batch'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links styled in matching warm tones */}
          <nav className="hidden xl:flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                currentTab === 'dashboard'
                  ? 'text-[#2D4D3E] bg-[#E4EEE8] font-bold shadow-xs'
                  : 'text-[#58645C] hover:text-[#25322A] hover:bg-[#ECE5D7]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setCurrentTab('daily')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                currentTab === 'daily'
                  ? 'text-[#2D4D3E] bg-[#E4EEE8] font-bold shadow-xs'
                  : 'text-[#58645C] hover:text-[#25322A] hover:bg-[#ECE5D7]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Daily Ops</span>
            </button>

            <button
              onClick={() => setCurrentTab('weekly')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                currentTab === 'weekly'
                  ? 'text-[#2D4D3E] bg-[#E4EEE8] font-bold shadow-xs'
                  : 'text-[#58645C] hover:text-[#25322A] hover:bg-[#ECE5D7]'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>Weekly Weights</span>
            </button>

            <button
              onClick={() => setCurrentTab('sales')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                currentTab === 'sales'
                  ? 'text-[#2D4D3E] bg-[#E4EEE8] font-bold shadow-xs'
                  : 'text-[#58645C] hover:text-[#25322A] hover:bg-[#ECE5D7]'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Sales</span>
            </button>

            <button
              onClick={() => setCurrentTab('expenses')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                currentTab === 'expenses'
                  ? 'text-[#2D4D3E] bg-[#E4EEE8] font-bold shadow-xs'
                  : 'text-[#58645C] hover:text-[#25322A] hover:bg-[#ECE5D7]'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Expenses</span>
            </button>

            <button
              onClick={() => setCurrentTab('report')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                currentTab === 'report'
                  ? 'text-[#2D4D3E] bg-[#E4EEE8] font-bold shadow-xs'
                  : 'text-[#58645C] hover:text-[#25322A] hover:bg-[#ECE5D7]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Report</span>
            </button>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={refreshData}
              aria-label="Refresh data"
              title="Refresh data"
              className="w-9 h-9 rounded-full bg-white border border-[#DDD6C5] flex items-center justify-center text-[#55635B] hover:text-[#283830] hover:bg-[#F3EFE6] transition-colors shadow-2xs"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-lg border border-[#DDD6C5] bg-white px-3 py-2 text-xs font-semibold text-[#55635B] hover:bg-[#F3EFE6]"
              title="Sign out of FLOCK OS"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
            {signOutError && (
              <span role="alert" className="max-w-40 text-[11px] text-red-700">{signOutError}</span>
            )}

          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="xl:hidden flex items-center gap-1.5 overflow-x-auto py-2 border-t border-[#E8E2D2] text-xs">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              currentTab === 'dashboard' ? 'bg-[#4A7261] text-white font-bold' : 'text-[#58645C] hover:bg-[#EBE5D8]'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentTab('daily')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              currentTab === 'daily' ? 'bg-[#4A7261] text-white font-bold' : 'text-[#58645C] hover:bg-[#EBE5D8]'
            }`}
          >
            Daily Ops
          </button>
          <button
            onClick={() => setCurrentTab('weekly')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              currentTab === 'weekly' ? 'bg-[#4A7261] text-white font-bold' : 'text-[#58645C] hover:bg-[#EBE5D8]'
            }`}
          >
            Weekly Weights
          </button>
          <button
            onClick={() => setCurrentTab('sales')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              currentTab === 'sales' ? 'bg-[#4A7261] text-white font-bold' : 'text-[#58645C] hover:bg-[#EBE5D8]'
            }`}
          >
            Sales
          </button>
          <button
            onClick={() => setCurrentTab('expenses')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              currentTab === 'expenses' ? 'bg-[#4A7261] text-white font-bold' : 'text-[#58645C] hover:bg-[#EBE5D8]'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setCurrentTab('report')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium ${
              currentTab === 'report' ? 'bg-[#4A7261] text-white font-bold' : 'text-[#58645C] hover:bg-[#EBE5D8]'
            }`}
          >
            Report
          </button>
        </div>
      </div>
    </header>
  );
};
