import React, { useState } from 'react';
import { FarmerBuyerMatch } from '../types';
import {
  CheckCircle,
  XCircle,
  MapPin,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Info,
  DollarSign,
  Truck,
  Building,
  Sprout,
  SlidersHorizontal,
} from 'lucide-react';

interface MatchCardProps {
  match: FarmerBuyerMatch;
  onAccept: (match: FarmerBuyerMatch, customQuantityKg?: number, customPrice?: number) => void;
  onReject: (match: FarmerBuyerMatch, reason: string) => void;
  onViewOnMap: (match: FarmerBuyerMatch) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  onAccept,
  onReject,
  onViewOnMap,
}) => {
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [counterQty, setCounterQty] = useState(match.recommendedMatchedKg);
  const [counterPrice, setCounterPrice] = useState(match.agreedPricePerKg);
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('Insufficient logistics window today');

  const { listing, buyer, breakdown, spoilageAssessment } = match;

  const totalLotValue = counterQty * counterPrice;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 75) return 'text-[#2D6A4F] bg-[#E8F0EA] border-[#C3DCB9]';
    if (score >= 60) return 'text-amber-800 bg-amber-50 border-amber-200';
    return 'text-stone-700 bg-stone-100 border-stone-200';
  };

  const getUrgencyIndicator = () => {
    switch (spoilageAssessment.urgencyLevel) {
      case 'critical':
        return { text: 'text-red-700 bg-red-50 border-red-200', label: 'Critical Spoilage Urgency' };
      case 'high':
        return { text: 'text-amber-700 bg-amber-50 border-amber-200', label: 'High Spoilage Urgency' };
      case 'moderate':
        return { text: 'text-emerald-700 bg-emerald-50 border-emerald-200', label: 'Moderate Window' };
      default:
        return { text: 'text-stone-700 bg-stone-50 border-stone-200', label: 'Stable Quality' };
    }
  };

  const urgencyBadge = getUrgencyIndicator();

  if (match.status === 'rejected') {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 opacity-60">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="font-semibold line-through">
            Match: {listing.cropName} ({listing.farmName} ➔ {buyer.name})
          </span>
          <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-[11px]">
            Rejected ({match.rejectionReason || 'Declined'})
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E6E0D4] rounded-xl overflow-hidden hover:border-[#2D6A4F]/60 shadow-xs transition-all duration-200">
      {/* Top Banner with Score and Urgency */}
      <div className="p-4 bg-[#FAF8F5] border-b border-[#EDE7DC] flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          {/* Overall Match Badge */}
          <div className={`px-2.5 py-1 rounded-md border text-xs font-bold flex items-center gap-1.5 ${getScoreColor(match.overallScore)}`}>
            <span>{match.overallScore}% Overall Match</span>
          </div>

          {/* Spoilage Urgency Badge */}
          <div className={`px-2.5 py-1 rounded-md border text-[11px] font-semibold flex items-center gap-1.5 ${urgencyBadge.text}`}>
            <Clock className="w-3 h-3" />
            <span>{urgencyBadge.label} (~{spoilageAssessment.estimatedDaysRemaining}d left)</span>
          </div>
        </div>

        {/* Quick Map locator */}
        <button
          onClick={() => onViewOnMap(match)}
          className="text-xs text-[#2D6A4F] hover:text-[#1B4332] font-medium flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Truck className="w-3.5 h-3.5" />
          <span>{breakdown.distanceKm} km transit route</span>
        </button>
      </div>

      {/* Main Content: Farmer -> Buyer Flow */}
      <div className="p-5 space-y-4">
        {/* Visual Route Grid */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EDE7DC]">
          {/* Farmer Column */}
          <div className="md:col-span-5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-[#2D6A4F] font-semibold uppercase tracking-wider">
              <Sprout className="w-3.5 h-3.5" />
              <span>Surplus Producer</span>
            </div>
            <div className="text-sm font-bold text-[#1B4332]">{listing.farmName}</div>
            <div className="text-xs text-[#6B7280]">{listing.farmerName} · {listing.phone}</div>
            <div className="text-xs text-[#4A453A] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#2D6A4F]" />
              <span>{listing.location.name} ({listing.location.region})</span>
            </div>
          </div>

          {/* Arrow / Connection */}
          <div className="md:col-span-1 flex flex-col items-center justify-center py-1">
            <div className="w-8 h-8 rounded-full bg-[#E8F0EA] border border-[#C5DAC9] text-[#2D6A4F] flex items-center justify-center font-bold text-xs shadow-xs">
              <ArrowRight className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-[#7A7365] font-semibold mt-1">
              {breakdown.distanceKm} km
            </span>
          </div>

          {/* Buyer Column */}
          <div className="md:col-span-5 space-y-1 md:text-right">
            <div className="flex items-center md:justify-end gap-1.5 text-xs text-[#1B4332] font-semibold uppercase tracking-wider">
              <Building className="w-3.5 h-3.5" />
              <span>Target Buyer</span>
            </div>
            <div className="text-sm font-bold text-[#1B4332]">{buyer.name}</div>
            <div className="text-xs text-[#6B7280]">{buyer.organizationType} · {buyer.contactPerson}</div>
            <div className="text-xs text-[#4A453A] flex items-center md:justify-end gap-1">
              <MapPin className="w-3 h-3 text-[#2D6A4F]" />
              <span>{buyer.location.name}</span>
            </div>
          </div>
        </div>

        {/* Agreed Terms & Quantity Absorption */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Matched Quantity */}
          <div className="p-3 bg-white border border-[#E6E0D4] rounded-lg">
            <div className="text-[11px] text-[#706A5E] font-medium">Recommended Match Quantity</div>
            <div className="text-lg font-bold text-[#1B4332] mt-0.5">
              {match.recommendedMatchedKg.toLocaleString()} <span className="text-xs font-normal text-gray-500">kg</span>
            </div>
            <div className="text-[11px] text-[#2D6A4F] mt-0.5 font-medium">
              Absorbs {Math.round((match.recommendedMatchedKg / listing.remainingKg) * 100)}% of remaining lot
            </div>
          </div>

          {/* Agreed Price */}
          <div className="p-3 bg-white border border-[#E6E0D4] rounded-lg">
            <div className="text-[11px] text-[#706A5E] font-medium">Estimated Pricing</div>
            <div className="text-lg font-bold text-[#1B4332] mt-0.5">
              ${match.agreedPricePerKg.toFixed(2)} <span className="text-xs font-normal text-gray-500">/ kg</span>
            </div>
            <div className="text-[11px] text-[#787265] mt-0.5">
              Ask: ${listing.expectedPricePerKg.toFixed(2)} · Buyer Cap: ${buyer.maxPricePerKg.toFixed(2)}
            </div>
          </div>

          {/* Total Contract Value */}
          <div className="p-3 bg-white border border-[#E6E0D4] rounded-lg">
            <div className="text-[11px] text-[#706A5E] font-medium">Estimated Lot Contract</div>
            <div className="text-lg font-bold text-[#2D6A4F] mt-0.5">
              ${(match.recommendedMatchedKg * match.agreedPricePerKg).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <div className="text-[11px] text-[#787265] mt-0.5">
              Salvaged farm revenue
            </div>
          </div>
        </div>

        {/* Multi-Factor Algorithmic Score Breakdown */}
        <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#EDE7DC] space-y-2">
          <div className="text-xs font-semibold text-[#1B4332] flex items-center justify-between">
            <span>Algorithmic Matching Factors</span>
            <span className="text-[11px] text-[#787265] font-normal">Weighted compatibility</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {/* Factor 1: Crop */}
            <div className="bg-white p-2 rounded border border-[#EDE7DC]">
              <div className="text-[10px] text-[#6B7280]">Crop Fit</div>
              <div className="font-bold text-[#1B4332]">{breakdown.cropCompatibility}%</div>
              <div className="w-full bg-gray-100 h-1 rounded mt-1 overflow-hidden">
                <div className="bg-[#2D6A4F] h-full" style={{ width: `${breakdown.cropCompatibility}%` }} />
              </div>
            </div>

            {/* Factor 2: Proximity */}
            <div className="bg-white p-2 rounded border border-[#EDE7DC]">
              <div className="text-[10px] text-[#6B7280]">Distance Fit ({breakdown.distanceKm} km)</div>
              <div className="font-bold text-[#1B4332]">{breakdown.distanceScore}%</div>
              <div className="w-full bg-gray-100 h-1 rounded mt-1 overflow-hidden">
                <div className="bg-[#2D6A4F] h-full" style={{ width: `${breakdown.distanceScore}%` }} />
              </div>
            </div>

            {/* Factor 3: Quantity Fit */}
            <div className="bg-white p-2 rounded border border-[#EDE7DC]">
              <div className="text-[10px] text-[#6B7280]">Volume Match</div>
              <div className="font-bold text-[#1B4332]">{breakdown.quantityScore}%</div>
              <div className="w-full bg-gray-100 h-1 rounded mt-1 overflow-hidden">
                <div className="bg-[#2D6A4F] h-full" style={{ width: `${breakdown.quantityScore}%` }} />
              </div>
            </div>

            {/* Factor 4: Price Alignment */}
            <div className="bg-white p-2 rounded border border-[#EDE7DC]">
              <div className="text-[10px] text-[#6B7280]">Price Alignment</div>
              <div className="font-bold text-[#1B4332]">{breakdown.priceScore}%</div>
              <div className="w-full bg-gray-100 h-1 rounded mt-1 overflow-hidden">
                <div className="bg-[#2D6A4F] h-full" style={{ width: `${breakdown.priceScore}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Explainability / Rationale List */}
        <div className="space-y-1.5 pt-1">
          <div className="text-xs font-semibold text-[#1B4332]">Matching Engine Explanation:</div>
          <ul className="space-y-1 text-xs text-[#4A453A]">
            {match.rationale.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] mt-1.5 shrink-0" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Mandatory Spoilage Disclaimer */}
        <div className="flex items-start gap-1.5 text-[10px] text-[#7A7365] bg-[#FAF8F5] p-2 rounded border border-[#EDE7DC]">
          <Info className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0 mt-0.5" />
          <span>
            {spoilageAssessment.disclaimer} Spoilage priority rank uses harvest date ({assessmentDate(listing.harvestDate)}), storage, and produce perishability index.
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3 bg-[#FAF8F5] border-t border-[#EDE7DC] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {rejecting ? (
            <div className="flex items-center gap-1.5">
              <select
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                className="text-xs px-2 py-1 bg-white border border-gray-300 rounded"
              >
                <option value="Insufficient logistics window today">No fleet available today</option>
                <option value="Price margin too tight">Price counter needed</option>
                <option value="Quality specs mismatch">Quality specs mismatch</option>
                <option value="Cold storage capacity full">Cold storage full</option>
              </select>
              <button
                onClick={() => onReject(match, rejectionReason)}
                className="px-2.5 py-1 text-xs bg-red-600 text-white font-medium rounded hover:bg-red-700 cursor-pointer"
              >
                Confirm Reject
              </button>
              <button
                onClick={() => setRejecting(false)}
                className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setRejecting(true)}
              className="text-xs text-gray-500 hover:text-red-600 font-medium flex items-center gap-1 py-1.5 px-2 rounded hover:bg-red-50 transition-colors cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject Match</span>
            </button>
          )}

          <button
            onClick={() => setShowCounterModal(!showCounterModal)}
            className="text-xs text-[#524B3E] hover:text-[#1B4332] font-medium flex items-center gap-1 py-1.5 px-2 rounded hover:bg-[#EFECE4] transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Adjust Terms</span>
          </button>
        </div>

        {/* Primary Accept Button */}
        <button
          onClick={() => onAccept(match, counterQty, counterPrice)}
          className="px-4 py-2 bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Accept Match & Dispatch</span>
        </button>
      </div>

      {/* Adjust Terms Mini Drawer if active */}
      {showCounterModal && (
        <div className="p-3 bg-[#F4F1EA] border-t border-[#DDD5C5] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-[#374151] mb-1">
              Adjust Contract Quantity (Max {listing.remainingKg} kg)
            </label>
            <input
              type="number"
              min="50"
              max={listing.remainingKg}
              step="50"
              value={counterQty}
              onChange={e => setCounterQty(Math.min(listing.remainingKg, Math.max(50, Number(e.target.value))))}
              className="w-full px-2.5 py-1.5 bg-white border border-[#DDD5C5] rounded text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#374151] mb-1">
              Adjust Price per kg ($)
            </label>
            <input
              type="number"
              min="0.1"
              max={buyer.maxPricePerKg * 1.5}
              step="0.05"
              value={counterPrice}
              onChange={e => setCounterPrice(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 bg-white border border-[#DDD5C5] rounded text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
};

function assessmentDate(isoStr: string) {
  try {
    return new Date(isoStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return isoStr;
  }
}
