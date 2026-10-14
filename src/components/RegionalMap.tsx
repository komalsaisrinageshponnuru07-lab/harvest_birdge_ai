import React, { useState } from 'react';
import { FarmerListing, BuyerProfile, FarmerBuyerMatch, AcceptedDispatch } from '../types';
import { calculateDistanceKm } from '../utils/matchingEngine';
import { Sprout, Building2, MapPin, Truck, Layers, Filter, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

interface RegionalMapProps {
  listings: FarmerListing[];
  buyers: BuyerProfile[];
  matches: FarmerBuyerMatch[];
  dispatches: AcceptedDispatch[];
  highlightedMatchId?: string;
  onSelectListing: (listing: FarmerListing) => void;
  onSelectBuyer: (buyer: BuyerProfile) => void;
}

export const RegionalMap: React.FC<RegionalMapProps> = ({
  listings,
  buyers,
  matches,
  dispatches,
  highlightedMatchId,
  onSelectListing,
  onSelectBuyer,
}) => {
  const [selectedEntity, setSelectedEntity] = useState<
    | { type: 'farm'; data: FarmerListing }
    | { type: 'buyer'; data: BuyerProfile }
    | null
  >(null);

  const [showFarms, setShowFarms] = useState(true);
  const [showBuyers, setShowBuyers] = useState(true);
  const [showActiveRoutes, setShowActiveRoutes] = useState(true);
  const [showPotentialRoutes, setShowPotentialRoutes] = useState(true);

  // Find active match routes from dispatches
  const activeRoutes = dispatches.map(disp => {
    const listing = listings.find(l => l.id === disp.listingId);
    const buyer = buyers.find(b => b.id === disp.buyerId);
    return {
      dispatch: disp,
      from: listing?.location,
      to: buyer?.location,
    };
  }).filter(r => r.from && r.to);

  // Top pending matches to show as potential routes
  const topPendingMatches = matches
    .filter(m => m.status === 'pending' && m.overallScore >= 70)
    .slice(0, 6);

  return (
    <div className="bg-white border border-[#E6E0D4] rounded-2xl overflow-hidden shadow-xs">
      {/* Map Control Bar */}
      <div className="p-4 bg-[#FAF8F5] border-b border-[#EDE7DC] flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#1B4332]">Regional Agricultural Logistics Grid</h3>
            <span className="text-[11px] bg-[#E8F0EA] text-[#2D6A4F] px-2 py-0.5 rounded font-medium">
              ~120 km Zone Visualizer
            </span>
          </div>
          <p className="text-xs text-[#787265] mt-0.5">
            Spatial distribution of surplus farm gates, processing canneries, and dispatch routes
          </p>
        </div>

        {/* Toggle Layers */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setShowFarms(!showFarms)}
            className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
              showFarms
                ? 'bg-[#2D6A4F] text-white border-[#2D6A4F]'
                : 'bg-white text-gray-600 border-[#DDD5C5]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-300" />
            <span>Farms ({listings.length})</span>
          </button>

          <button
            onClick={() => setShowBuyers(!showBuyers)}
            className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
              showBuyers
                ? 'bg-[#1B4332] text-white border-[#1B4332]'
                : 'bg-white text-gray-600 border-[#DDD5C5]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Buyers ({buyers.length})</span>
          </button>

          <button
            onClick={() => setShowActiveRoutes(!showActiveRoutes)}
            className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
              showActiveRoutes
                ? 'bg-emerald-700 text-white border-emerald-700'
                : 'bg-white text-gray-600 border-[#DDD5C5]'
            }`}
          >
            <Truck className="w-3 h-3" />
            <span>Active Dispatches ({activeRoutes.length})</span>
          </button>
        </div>
      </div>

      {/* Map Graphic Canvas */}
      <div className="relative bg-[#F7F4EC] w-full aspect-4/3 sm:aspect-16/9 max-h-[560px] overflow-hidden select-none">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full cursor-crosshair"
          onClick={() => setSelectedEntity(null)}
        >
          {/* Subtle agricultural grid & terrain styling */}
          <defs>
            <pattern id="agri-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#EAE4D5" strokeWidth="0.4" />
            </pattern>
            {/* Soft hill shading */}
            <linearGradient id="valley-shade" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F2EDE2" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#EDE6D6" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Background Grid */}
          <rect width="100" height="100" fill="url(#valley-shade)" />
          <rect width="100" height="100" fill="url(#agri-grid)" />

          {/* Concentric Distance Rings from Regional Center (50, 50) */}
          <circle cx="50" cy="50" r="16" fill="none" stroke="#DCD4C2" strokeWidth="0.4" strokeDasharray="1,1" />
          <circle cx="50" cy="50" r="32" fill="none" stroke="#DCD4C2" strokeWidth="0.4" strokeDasharray="1,1" />
          <circle cx="50" cy="50" r="48" fill="none" stroke="#DCD4C2" strokeWidth="0.4" strokeDasharray="1,1" />

          {/* Concentric Ring Labels */}
          <text x="51" y="34.5" fill="#A89E8C" fontSize="1.8" fontFamily="sans-serif">20 km</text>
          <text x="51" y="18.5" fill="#A89E8C" fontSize="1.8" fontFamily="sans-serif">40 km</text>
          <text x="51" y="2.8" fill="#A89E8C" fontSize="1.8" fontFamily="sans-serif">60 km radius</text>

          {/* Simulated River Corridor */}
          <path
            d="M 10,85 C 30,75 35,50 48,45 C 65,40 70,25 90,15"
            fill="none"
            stroke="#C9DCD9"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <text x="25" y="77" fill="#8AA8A3" fontSize="1.6" fontStyle="italic">Green River Canal</text>

          {/* Potential High-Score Matches (Dashed Lines) */}
          {showPotentialRoutes &&
            topPendingMatches.map(m => {
              const from = m.listing.location;
              const to = m.buyer.location;
              const isSelected = highlightedMatchId === m.id;
              return (
                <g key={m.id}>
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={isSelected ? '#2D6A4F' : '#94A3B8'}
                    strokeWidth={isSelected ? '0.9' : '0.45'}
                    strokeDasharray="1.2,1.2"
                    opacity={isSelected ? 0.9 : 0.45}
                  />
                </g>
              );
            })}

          {/* Active Contracted Dispatches (Solid Emerald Animated Lines) */}
          {showActiveRoutes &&
            activeRoutes.map((route, idx) => {
              if (!route.from || !route.to) return null;
              const midX = (route.from.x + route.to.x) / 2;
              const midY = (route.from.y + route.to.y) / 2;
              return (
                <g key={idx}>
                  <line
                    x1={route.from.x}
                    y1={route.from.y}
                    x2={route.to.x}
                    y2={route.to.y}
                    stroke="#10B981"
                    strokeWidth="0.85"
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                  {/* Transit Truck Dot */}
                  <circle cx={midX} cy={midY} r="1.4" fill="#1B4332" stroke="#FFFFFF" strokeWidth="0.4" />
                </g>
              );
            })}

          {/* Buyers Pins (Circles with Building Symbol) */}
          {showBuyers &&
            buyers.map(buyer => {
              const isSelected =
                selectedEntity?.type === 'buyer' && selectedEntity.data.id === buyer.id;
              return (
                <g
                  key={buyer.id}
                  transform={`translate(${buyer.location.x}, ${buyer.location.y})`}
                  className="cursor-pointer"
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedEntity({ type: 'buyer', data: buyer });
                    onSelectBuyer(buyer);
                  }}
                >
                  <circle
                    r={isSelected ? 3.5 : 2.5}
                    fill="#C06C4C"
                    stroke="#FFFFFF"
                    strokeWidth="0.6"
                    className="transition-all hover:scale-125"
                  />
                  <circle r={isSelected ? 5 : 0} fill="none" stroke="#C06C4C" strokeWidth="0.4" opacity="0.6" />
                  <text
                    y="-3.5"
                    textAnchor="middle"
                    fill="#4A3427"
                    fontSize="1.9"
                    fontWeight="600"
                    className="pointer-events-none drop-shadow-xs"
                  >
                    {buyer.name.split(' ')[0]}
                  </text>
                </g>
              );
            })}

          {/* Farms Pins (Circles with Sprout Leaf) */}
          {showFarms &&
            listings.map(farm => {
              const isSelected =
                selectedEntity?.type === 'farm' && selectedEntity.data.id === farm.id;
              const isCritical = farm.freshness === 'overripe_processing_only';
              const isMatched = farm.remainingKg <= 0;

              return (
                <g
                  key={farm.id}
                  transform={`translate(${farm.location.x}, ${farm.location.y})`}
                  className="cursor-pointer"
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedEntity({ type: 'farm', data: farm });
                    onSelectListing(farm);
                  }}
                >
                  <circle
                    r={isSelected ? 3.6 : 2.6}
                    fill={isMatched ? '#9CA3AF' : isCritical ? '#DC2626' : '#2D6A4F'}
                    stroke="#FFFFFF"
                    strokeWidth="0.6"
                    className="transition-all hover:scale-125"
                  />
                  {isSelected && (
                    <circle r="5.2" fill="none" stroke="#2D6A4F" strokeWidth="0.4" opacity="0.6" />
                  )}
                  <text
                    y="4.5"
                    textAnchor="middle"
                    fill="#1B4332"
                    fontSize="1.8"
                    fontWeight="600"
                    className="pointer-events-none drop-shadow-xs"
                  >
                    {farm.cropName} ({farm.remainingKg}k)
                  </text>
                </g>
              );
            })}
        </svg>

        {/* Selected Entity Mini Card Overlay */}
        {selectedEntity && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-[#DDD5C5] shadow-lg text-xs space-y-2 z-20">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#2D6A4F] tracking-wider">
                  {selectedEntity.type === 'farm' ? 'Farm Surplus Gate' : 'Buyer Receiving Dock'}
                </span>
                <h4 className="font-bold text-[#1B4332]">
                  {selectedEntity.type === 'farm'
                    ? selectedEntity.data.farmName
                    : selectedEntity.data.name}
                </h4>
              </div>
              <button
                onClick={() => setSelectedEntity(null)}
                className="text-gray-400 hover:text-gray-600 font-bold px-1"
              >
                ×
              </button>
            </div>

            {selectedEntity.type === 'farm' ? (
              <div className="space-y-1 text-[#4A453A]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Crop & Surplus:</span>
                  <span className="font-semibold text-[#1B4332]">
                    {selectedEntity.data.cropName} · {selectedEntity.data.remainingKg.toLocaleString()} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Asking Price:</span>
                  <span className="font-semibold text-[#1B4332]">
                    ${selectedEntity.data.expectedPricePerKg.toFixed(2)}/kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Location Hub:</span>
                  <span className="text-gray-700">{selectedEntity.data.location.name}</span>
                </div>
                <button
                  onClick={() => onSelectListing(selectedEntity.data)}
                  className="w-full mt-2 py-1.5 bg-[#2D6A4F] text-white font-semibold rounded text-center text-xs hover:bg-[#1B4332] cursor-pointer"
                >
                  View Matches for this Farm
                </button>
              </div>
            ) : (
              <div className="space-y-1 text-[#4A453A]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Organization:</span>
                  <span className="font-semibold">{selectedEntity.data.organizationType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Capacity:</span>
                  <span className="font-semibold">
                    {selectedEntity.data.minQuantityKg} - {selectedEntity.data.maxQuantityKg.toLocaleString()} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Max Price:</span>
                  <span className="font-semibold text-[#2D6A4F]">
                    ${selectedEntity.data.maxPricePerKg.toFixed(2)}/kg
                  </span>
                </div>
                <button
                  onClick={() => onSelectBuyer(selectedEntity.data)}
                  className="w-full mt-2 py-1.5 bg-[#1B4332] text-white font-semibold rounded text-center text-xs hover:bg-black cursor-pointer"
                >
                  View Buyer Profile
                </button>
              </div>
            )}
          </div>
        )}

        {/* Map Legend */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-3 py-2 rounded-lg border border-[#EDE7DC] text-[10px] space-y-1 text-[#4A453A] hidden sm:block">
          <div className="font-bold text-[#1B4332] mb-1">Spatial Legend</div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F]" />
            <span>Farm Surplus Gate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C06C4C]" />
            <span>Processor / Buyer Dock</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span>Critical Spoilage Lot</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-emerald-500" />
            <span>Active Contracted Dispatch</span>
          </div>
        </div>
      </div>

      {/* Map Note / Distance disclaimer */}
      <div className="p-3 bg-[#FAF8F5] border-t border-[#EDE7DC] flex items-center justify-between text-xs text-[#706A5E]">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#2D6A4F]" />
          <span>Regional coordinate model: 1 grid unit ≈ 1.25 km. Transit times estimated using regional road multipliers.</span>
        </div>
        <span className="font-medium text-[#1B4332] hidden md:inline">
          {listings.filter(l => l.remainingKg > 0).length} active farm lots · {buyers.length} registered buyers
        </span>
      </div>
    </div>
  );
};
