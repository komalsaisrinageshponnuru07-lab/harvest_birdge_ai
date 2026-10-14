import React from 'react';
import { FarmerListing, SpoilageAssessment } from '../types';
import { calculateSpoilageUrgency } from '../utils/spoilageEngine';
import { AlertCircle, Clock, MapPin, Thermometer, DollarSign, ArrowRight, CheckCircle2 } from 'lucide-react';

interface SurplusLotCardProps {
  listing: FarmerListing;
  currentSimulatedDate: Date;
  onMatchThisLot: (listing: FarmerListing) => void;
  onSelectForMap: (listing: FarmerListing) => void;
}

export const SurplusLotCard: React.FC<SurplusLotCardProps> = ({
  listing,
  currentSimulatedDate,
  onMatchThisLot,
  onSelectForMap,
}) => {
  const assessment: SpoilageAssessment = calculateSpoilageUrgency(
    listing.cropName,
    listing.category,
    listing.harvestDate,
    listing.freshness,
    listing.storageCondition,
    currentSimulatedDate
  );

  const getUrgencyBadge = () => {
    switch (assessment.urgencyLevel) {
      case 'critical':
        return {
          bg: 'bg-red-50 text-red-800 border-red-200',
          dot: 'bg-red-600',
          label: 'Critical Spoilage Risk',
        };
      case 'high':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-600',
          label: 'High Spoilage Urgency',
        };
      case 'moderate':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-600',
          label: 'Moderate Urgency',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-500',
          label: 'Stable / Fresh',
        };
    }
  };

  const urgencyStyle = getUrgencyBadge();
  const isFullyMatched = listing.remainingKg <= 0 || listing.status === 'fully_matched';

  return (
    <div className={`rounded-xl border transition-all duration-200 bg-white ${
      isFullyMatched
        ? 'border-gray-200 opacity-75'
        : assessment.urgencyLevel === 'critical'
        ? 'border-red-200 hover:border-red-400 shadow-xs'
        : 'border-[#E6E0D4] hover:border-[#2D6A4F]/40 shadow-xs'
    }`}>
      {/* Top Header of Card */}
      <div className="p-4 border-b border-[#F0ECE4] flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-[#1B4332]">{listing.cropName}</h3>
            <span className="text-xs text-[#706A5E] capitalize">
              · {listing.category.replace('_', ' ')}
            </span>
          </div>
          <div className="text-xs text-[#524B3E] font-medium flex items-center gap-1.5 mt-0.5">
            <span>{listing.farmName}</span>
            <span className="text-[#A39D90]">·</span>
            <span className="text-[#787265]">{listing.farmerName}</span>
          </div>
        </div>

        {/* Urgency Badge */}
        <div className={`px-2.5 py-1 rounded-md border text-xs font-semibold flex items-center gap-1.5 ${urgencyStyle.bg}`}>
          <span className={`w-2 h-2 rounded-full ${urgencyStyle.dot}`} />
          <span>{urgencyStyle.label}</span>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 space-y-3">
        {/* Quantity and Pricing Row */}
        <div className="grid grid-cols-2 gap-3 bg-[#FAF8F5] p-3 rounded-lg border border-[#EDE7DC]">
          <div>
            <div className="text-[11px] text-[#706A5E] font-medium">Surplus Quantity</div>
            <div className="text-base font-bold text-[#1B4332]">
              {listing.remainingKg.toLocaleString()} <span className="text-xs font-normal text-[#666]">kg left</span>
            </div>
            {listing.matchedKg > 0 && (
              <div className="text-[10px] text-emerald-700 font-medium">
                ({listing.matchedKg.toLocaleString()} kg matched)
              </div>
            )}
          </div>
          <div>
            <div className="text-[11px] text-[#706A5E] font-medium">Farmer Expected Price</div>
            <div className="text-base font-bold text-[#1B4332]">
              ${listing.expectedPricePerKg.toFixed(2)} <span className="text-xs font-normal text-[#666]">/ kg</span>
            </div>
            <div className="text-[10px] text-[#787265]">
              Est. Lot: ${(listing.remainingKg * listing.expectedPricePerKg).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        {/* Spoilage & Freshness Breakdown */}
        <div className="space-y-1.5 text-xs text-[#4A453A]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[#6B7280]">
              <Clock className="w-3.5 h-3.5 text-[#2D6A4F]" />
              Harvest Age:
            </span>
            <span className="font-medium text-[#292520]">
              {assessment.daysSinceHarvest} days ago ({listing.harvestDate})
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[#6B7280]">
              <Thermometer className="w-3.5 h-3.5 text-[#2D6A4F]" />
              Storage & Condition:
            </span>
            <span className="font-medium capitalize text-[#292520]">
              {listing.storageCondition.replace('_', ' ')} · {listing.freshness.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[#6B7280]">
              <MapPin className="w-3.5 h-3.5 text-[#2D6A4F]" />
              Location:
            </span>
            <button
              onClick={() => onSelectForMap(listing)}
              className="font-medium text-[#2D6A4F] hover:underline truncate max-w-[190px] text-right cursor-pointer"
              title="Click to view farm on regional logistics map"
            >
              {listing.location.name}
            </button>
          </div>
        </div>

        {/* Urgency Progress Meter */}
        <div className="pt-2 border-t border-[#F0ECE4]">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[#6B7280]">Spoilage Urgency Score:</span>
            <span className="font-bold text-[#1B4332]">
              {assessment.urgencyScore} / 100 · ~{assessment.estimatedDaysRemaining}d window
            </span>
          </div>
          <div className="w-full bg-[#EAE5DA] rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                assessment.urgencyLevel === 'critical'
                  ? 'bg-red-500'
                  : assessment.urgencyLevel === 'high'
                  ? 'bg-amber-500'
                  : 'bg-emerald-600'
              }`}
              style={{ width: `${assessment.urgencyScore}%` }}
            />
          </div>
          <p className="text-[10px] text-[#7A7365] mt-1 leading-snug">
            {assessment.primaryRiskFactor}
          </p>
        </div>

        {/* Notes if provided */}
        {listing.notes && (
          <p className="text-xs text-[#6B7280] italic bg-[#FAF8F5] p-2 rounded border border-[#F0ECE4]">
            "{listing.notes}"
          </p>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="p-3 bg-[#FAF8F5] border-t border-[#EDE7DC] rounded-b-xl flex items-center justify-between gap-2">
        <button
          onClick={() => onSelectForMap(listing)}
          className="text-xs text-[#524B3E] hover:text-[#1B4332] font-medium transition-colors cursor-pointer"
        >
          View Map Radius
        </button>

        {isFullyMatched ? (
          <div className="flex items-center gap-1 text-xs text-emerald-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Fully Matched</span>
          </div>
        ) : (
          <button
            onClick={() => onMatchThisLot(listing)}
            className="px-3 py-1.5 bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>Match with Buyers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
