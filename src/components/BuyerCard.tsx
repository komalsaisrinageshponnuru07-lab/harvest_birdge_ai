import React from 'react';
import { BuyerProfile } from '../types';
import { Building2, MapPin, DollarSign, Scale, ArrowRight, ShieldCheck, HeartHandshake, Truck } from 'lucide-react';

interface BuyerCardProps {
  buyer: BuyerProfile;
  onFilterMatchesForBuyer: (buyer: BuyerProfile) => void;
  onLocateOnMap: (buyer: BuyerProfile) => void;
}

export const BuyerCard: React.FC<BuyerCardProps> = ({
  buyer,
  onFilterMatchesForBuyer,
  onLocateOnMap,
}) => {
  const isRelief = buyer.organizationType === 'Food Bank & Relief Org';
  const isProcessing = buyer.organizationType === 'Food Processing & Canning';

  return (
    <div className="bg-white border border-[#E6E0D4] rounded-xl overflow-hidden hover:border-[#2D6A4F]/60 shadow-xs transition-all duration-200">
      {/* Top Header */}
      <div className="p-4 border-b border-[#F0ECE4] flex items-start justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-[#1B4332]">{buyer.name}</h3>
            {isRelief && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                <HeartHandshake className="w-3 h-3" />
                Community Relief
              </span>
            )}
          </div>
          <div className="text-xs text-[#524B3E] font-medium mt-0.5">
            {buyer.organizationType} · Contact: {buyer.contactPerson} ({buyer.phone})
          </div>
        </div>

        <div className="text-right">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
            buyer.procurementUrgency === 'immediate'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-stone-50 text-stone-700 border-stone-200'
          }`}>
            {buyer.procurementUrgency === 'immediate' ? 'Immediate Rescue' : 'Flexible Procurement'}
          </span>
        </div>
      </div>

      {/* Main Parameters */}
      <div className="p-4 space-y-3">
        {/* Metric Grid */}
        <div className="grid grid-cols-3 gap-2 bg-[#FAF8F5] p-3 rounded-lg border border-[#EDE7DC] text-center">
          <div>
            <div className="text-[10px] text-[#706A5E] font-medium">Capacity Range</div>
            <div className="text-sm font-bold text-[#1B4332] mt-0.5">
              {buyer.minQuantityKg} - {buyer.maxQuantityKg.toLocaleString()} <span className="text-[10px] font-normal">kg</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[#706A5E] font-medium">Max Budget / kg</div>
            <div className="text-sm font-bold text-[#2D6A4F] mt-0.5">
              ${buyer.maxPricePerKg.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[#706A5E] font-medium">Max Transit Radius</div>
            <div className="text-sm font-bold text-[#1B4332] mt-0.5">
              {buyer.maxDistanceKm} <span className="text-[10px] font-normal">km</span>
            </div>
          </div>
        </div>

        {/* Location & Crop Preferences */}
        <div className="space-y-1.5 text-xs text-[#4A453A]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[#6B7280]">
              <MapPin className="w-3.5 h-3.5 text-[#2D6A4F]" />
              Receiving Facility:
            </span>
            <button
              onClick={() => onLocateOnMap(buyer)}
              className="text-[#2D6A4F] hover:underline font-medium cursor-pointer"
            >
              {buyer.location.name}
            </button>
          </div>

          <div>
            <div className="text-[11px] text-[#6B7280] mb-1">Accepted Crop Types:</div>
            <div className="flex flex-wrap gap-1">
              {buyer.cropPreferences.includes('*') ? (
                <span className="text-[11px] bg-[#E8F0EA] text-[#2D6A4F] px-2 py-0.5 rounded font-medium">
                  All Edible Produce Accepted
                </span>
              ) : (
                buyer.cropPreferences.map(crop => (
                  <span
                    key={crop}
                    className="text-[11px] bg-white border border-[#DDD5C5] text-[#333] px-2 py-0.5 rounded"
                  >
                    {crop}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Specs tag */}
        <div className="flex items-center gap-2 text-[11px] text-[#6B7280] pt-1">
          <span>
            {buyer.acceptsNearPeak
              ? '✓ Accepts near-peak / ripe produce'
              : '✗ Requires high-grade shelf firmness'}
          </span>
        </div>

        {buyer.notes && (
          <p className="text-xs text-[#6B7280] italic bg-[#FAF8F5] p-2 rounded border border-[#EDE7DC]">
            "{buyer.notes}"
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-[#FAF8F5] border-t border-[#EDE7DC] flex items-center justify-between">
        <button
          onClick={() => onLocateOnMap(buyer)}
          className="text-xs text-[#524B3E] hover:text-[#1B4332] font-medium transition-colors cursor-pointer"
        >
          View Map Radius
        </button>

        <button
          onClick={() => onFilterMatchesForBuyer(buyer)}
          className="px-3 py-1.5 bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <span>Find Available Farm Surplus</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
