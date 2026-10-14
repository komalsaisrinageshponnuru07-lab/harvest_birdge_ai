import React from 'react';
import { DashboardMetrics } from '../types';
import { Scale, TrendingUp, AlertCircle, Leaf, DollarSign, PackageCheck, Info } from 'lucide-react';

interface ImpactDashboardProps {
  metrics: DashboardMetrics;
  onViewMatches: () => void;
  onViewCriticalListings: () => void;
}

export const ImpactDashboard: React.FC<ImpactDashboardProps> = ({
  metrics,
  onViewMatches,
  onViewCriticalListings,
}) => {
  return (
    <div className="bg-white border border-[#E6E0D4] rounded-xl p-5 shadow-xs mb-6">
      {/* Title bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F0EDE6] gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#1B4332]">Regional Surplus & Impact Monitor</h2>
            <span className="text-[11px] bg-[#F3EFE6] text-[#6A6456] px-2 py-0.5 rounded font-medium">
              Simulated Field Metrics
            </span>
          </div>
          <p className="text-xs text-[#787265] mt-0.5">
            Real-time tracking of perishable farm harvests, buyer matching throughput, and loss mitigation
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#6A6456]">
          <Info className="w-3.5 h-3.5 text-[#2D6A4F]" />
          <span className="italic text-[11px]">Estimates derived from active listings & salvage log</span>
        </div>
      </div>

      {/* Primary 4 Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
        {/* Metric 1: Total Listed */}
        <div className="p-3.5 rounded-lg bg-[#FAF8F5] border border-[#EAE4D8]">
          <div className="flex items-center justify-between text-[#6B7280] mb-1">
            <span className="text-xs font-medium">Total Listed Produce</span>
            <Scale className="w-4 h-4 text-[#2D6A4F]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#1B4332]">
            {metrics.totalListedSurplusKg.toLocaleString()} <span className="text-xs font-normal text-[#6B7280]">kg</span>
          </div>
          <div className="text-[11px] text-[#787265] mt-1">
            Across {metrics.activeListingsCount} active farm lot{metrics.activeListingsCount === 1 ? '' : 's'}
          </div>
        </div>

        {/* Metric 2: Matched Quantity */}
        <div className="p-3.5 rounded-lg bg-[#F0F7F4] border border-[#D5EADB]">
          <div className="flex items-center justify-between text-[#2D6A4F] mb-1">
            <span className="text-xs font-medium">Matched & Contracted</span>
            <PackageCheck className="w-4 h-4 text-[#2D6A4F]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#1B4332]">
            {metrics.matchedQuantityKg.toLocaleString()} <span className="text-xs font-normal text-[#2D6A4F]">kg</span>
          </div>
          <div className="text-[11px] text-[#406A52] mt-1 font-medium flex items-center justify-between">
            <span>{metrics.wasteAvoidedPercentage}% of surplus absorbed</span>
            <button
              onClick={onViewMatches}
              className="text-[#2D6A4F] underline hover:text-[#1B4332] cursor-pointer"
            >
              View
            </button>
          </div>
        </div>

        {/* Metric 3: Unmatched Surplus at Risk */}
        <div className="p-3.5 rounded-lg bg-[#FEF6F0] border border-[#FADCC7]">
          <div className="flex items-center justify-between text-[#C06C4C] mb-1">
            <span className="text-xs font-medium">Unmatched at Risk</span>
            <AlertCircle className="w-4 h-4 text-[#C06C4C]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#8A3B14]">
            {metrics.unmatchedSurplusKg.toLocaleString()} <span className="text-xs font-normal text-[#C06C4C]">kg</span>
          </div>
          <div className="text-[11px] text-[#A64A20] mt-1 flex items-center justify-between">
            <span>{metrics.criticalLotsCount} lot{metrics.criticalLotsCount === 1 ? '' : 's'} critical spoilage</span>
            {metrics.criticalLotsCount > 0 && (
              <button
                onClick={onViewCriticalListings}
                className="underline font-medium hover:text-[#7A2B04] cursor-pointer"
              >
                Triage
              </button>
            )}
          </div>
        </div>

        {/* Metric 4: Potential Waste Avoided / Value */}
        <div className="p-3.5 rounded-lg bg-[#FAF8F5] border border-[#EAE4D8]">
          <div className="flex items-center justify-between text-[#6B7280] mb-1">
            <span className="text-xs font-medium">Estimated Value Salvaged</span>
            <DollarSign className="w-4 h-4 text-[#2D6A4F]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#1B4332]">
            ${metrics.estimatedEconomicValueSaved.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-[#787265] mt-1 flex items-center gap-1">
            <Leaf className="w-3 h-3 text-[#2D6A4F]" />
            <span>~{metrics.estimatedCo2eAvoidedKg.toLocaleString()} kg CO₂e avoided</span>
          </div>
        </div>
      </div>

      {/* Progress bar visualizer */}
      <div className="pt-2">
        <div className="flex items-center justify-between text-xs text-[#5A6356] mb-1.5">
          <span className="font-medium">Surplus Resolution Progress</span>
          <span>
            <strong className="text-[#1B4332]">{metrics.matchedQuantityKg.toLocaleString()} kg</strong> matched of{' '}
            {metrics.totalListedSurplusKg.toLocaleString()} kg total
          </span>
        </div>
        <div className="w-full bg-[#EAE5DA] rounded-full h-2.5 overflow-hidden flex">
          <div
            className="bg-[#2D6A4F] h-full transition-all duration-500 rounded-l-full"
            style={{ width: `${Math.min(100, metrics.wasteAvoidedPercentage)}%` }}
            title={`Matched: ${metrics.matchedQuantityKg} kg`}
          />
          <div
            className="bg-[#C06C4C]/40 h-full transition-all duration-500"
            style={{ width: `${Math.max(0, 100 - metrics.wasteAvoidedPercentage)}%` }}
            title={`Unmatched: ${metrics.unmatchedSurplusKg} kg`}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-[#7A7365] mt-1.5">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2D6A4F]" />
            Contracted / Dispatched ({metrics.wasteAvoidedPercentage}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C06C4C]/60" />
            Unmatched Surplus ({Math.max(0, 100 - metrics.wasteAvoidedPercentage)}%)
          </span>
        </div>
      </div>
    </div>
  );
};
