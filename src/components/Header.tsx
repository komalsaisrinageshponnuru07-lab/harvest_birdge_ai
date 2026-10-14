import React from 'react';
import { Sprout, Calendar, RefreshCw, Plus, Building2, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

interface HeaderProps {
  currentSimulatedDate: Date;
  onAdvanceDay: () => void;
  onResetSimulation: (scenario: 'A' | 'B') => void;
  onOpenNewListing: () => void;
  onOpenNewBuyer: () => void;
  activeTab: 'matches' | 'listings' | 'buyers' | 'map' | 'dispatches';
  setActiveTab: (tab: 'matches' | 'listings' | 'buyers' | 'map' | 'dispatches') => void;
  pendingMatchesCount: number;
  criticalLotsCount: number;
  activeDispatchesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentSimulatedDate,
  onAdvanceDay,
  onResetSimulation,
  onOpenNewListing,
  onOpenNewBuyer,
  activeTab,
  setActiveTab,
  pendingMatchesCount,
  criticalLotsCount,
  activeDispatchesCount,
}) => {
  const formattedDate = currentSimulatedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="border-b border-[#E6E0D4] bg-[#FAF8F5]/90 backdrop-blur-md sticky top-0 z-30">
      {/* Simulation banner */}
      <div className="bg-[#1B4332] text-[#F3EFE6] px-4 py-1.5 text-xs font-medium flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active Simulation Mode</span>
          <span className="text-[#A3B899] hidden sm:inline">·</span>
          <span className="text-[#D2DCBE] hidden sm:inline">
            Algorithmic coordination demo for regional food surplus recovery
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#E2EBD8]">
          <span className="hidden md:inline">Synthetic farm & buyer dataset</span>
          <button
            onClick={() => onResetSimulation('A')}
            className="hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
            title="Reset to scenario A with high-perishability berry & tomato surplus"
          >
            Scenario A (Perishables)
          </button>
          <span>·</span>
          <button
            onClick={() => onResetSimulation('B')}
            className="hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
            title="Reset to scenario B with regional vegetable & root surplus"
          >
            Scenario B (Balanced)
          </button>
        </div>
      </div>

      {/* Main bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2D6A4F] text-white flex items-center justify-center shadow-sm">
            <Sprout className="w-6 h-6 text-[#95D5B2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-[#1B4332]">
                HarvestBridge<span className="text-[#C06C4C] font-normal"> AI</span>
              </h1>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[#2D6A4F] bg-[#E8F0EA] px-2 py-0.5 rounded">
                Surplus Dispatch
              </span>
            </div>
            <p className="text-xs text-[#6B7280]">
              Connecting farm harvest surpluses with nearby commercial & relief buyers
            </p>
          </div>
        </div>

        {/* Action Controls & Simulator */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Day progress indicator */}
          <div className="flex items-center gap-2 bg-[#F2EDE2] border border-[#DDD5C5] px-3 py-1.5 rounded-lg text-xs text-[#4A453A]">
            <Calendar className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span className="font-medium text-[#292520]">{formattedDate}</span>
            <button
              onClick={onAdvanceDay}
              className="ml-1 px-2 py-0.5 bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-[11px] font-medium rounded transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
              title="Advance 1 day forward to observe post-harvest aging and spoilage urgency escalation"
            >
              <span>+1 Day</span>
            </button>
          </div>

          {/* New surplus listing button */}
          <button
            onClick={onOpenNewListing}
            className="px-3 py-2 bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>List Crop Surplus</span>
          </button>

          {/* Add buyer button */}
          <button
            onClick={onOpenNewBuyer}
            className="px-3 py-2 bg-white hover:bg-[#F7F4EE] border border-[#DDD5C5] text-[#2D6A4F] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Register Buyer</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#EFECE4]">
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'matches'
                ? 'bg-[#1B4332] text-white font-semibold'
                : 'text-[#5A6356] hover:text-[#1B4332] hover:bg-[#EFECE4]'
            }`}
          >
            <span>Smart Matchmaker</span>
            {pendingMatchesCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'matches' ? 'bg-white text-[#1B4332]' : 'bg-[#2D6A4F] text-white'
              }`}>
                {pendingMatchesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('listings')}
            className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'listings'
                ? 'bg-[#1B4332] text-white font-semibold'
                : 'text-[#5A6356] hover:text-[#1B4332] hover:bg-[#EFECE4]'
            }`}
          >
            <span>Surplus Lots</span>
            {criticalLotsCount > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-semibold">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                {criticalLotsCount} urgent
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('buyers')}
            className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'buyers'
                ? 'bg-[#1B4332] text-white font-semibold'
                : 'text-[#5A6356] hover:text-[#1B4332] hover:bg-[#EFECE4]'
            }`}
          >
            <span>Buyer Directory</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'map'
                ? 'bg-[#1B4332] text-white font-semibold'
                : 'text-[#5A6356] hover:text-[#1B4332] hover:bg-[#EFECE4]'
            }`}
          >
            <span>Regional Logistics Map</span>
          </button>

          <button
            onClick={() => setActiveTab('dispatches')}
            className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'dispatches'
                ? 'bg-[#1B4332] text-white font-semibold'
                : 'text-[#5A6356] hover:text-[#1B4332] hover:bg-[#EFECE4]'
            }`}
          >
            <span>Dispatched Manifests</span>
            {activeDispatchesCount > 0 && (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                {activeDispatchesCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
