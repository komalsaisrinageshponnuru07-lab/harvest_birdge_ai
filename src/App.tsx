import React, { useState, useMemo } from 'react';
import {
  FarmerListing,
  BuyerProfile,
  FarmerBuyerMatch,
  AcceptedDispatch,
  DashboardMetrics,
  UrgencyLevel,
} from './types';
import {
  INITIAL_FARMERS_SCENARIO_A,
  INITIAL_BUYERS,
  getRelativeDateString,
  SAMPLE_REGIONS,
} from './utils/sampleData';
import { generateAllSystemMatches } from './utils/matchingEngine';
import { calculateSpoilageUrgency } from './utils/spoilageEngine';
import { Header } from './components/Header';
import { ImpactDashboard } from './components/ImpactDashboard';
import { SurplusLotCard } from './components/SurplusLotCard';
import { MatchCard } from './components/MatchCard';
import { BuyerCard } from './components/BuyerCard';
import { RegionalMap } from './components/RegionalMap';
import { NewListingModal } from './components/NewListingModal';
import { NewBuyerModal } from './components/NewBuyerModal';
import { DispatchManifestModal } from './components/DispatchManifestModal';
import {
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  FileText,
  RotateCcw,
  Sparkles,
  Truck,
  Building2,
  Calendar,
  X,
  Plus,
} from 'lucide-react';

export default function App() {
  // 1. Core State
  const [currentSimulatedDate, setCurrentSimulatedDate] = useState<Date>(new Date());
  const [listings, setListings] = useState<FarmerListing[]>(INITIAL_FARMERS_SCENARIO_A);
  const [buyers, setBuyers] = useState<BuyerProfile[]>(INITIAL_BUYERS);
  const [rejectedMatchIds, setRejectedMatchIds] = useState<Set<string>>(new Set());
  const [dispatches, setDispatches] = useState<AcceptedDispatch[]>([]);

  // 2. Navigation & Modals
  const [activeTab, setActiveTab] = useState<'matches' | 'listings' | 'buyers' | 'map' | 'dispatches'>('matches');
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [isBuyerModalOpen, setIsBuyerModalOpen] = useState(false);
  const [selectedDispatchForModal, setSelectedDispatchForModal] = useState<AcceptedDispatch | null>(null);
  const [highlightedMatchId, setHighlightedMatchId] = useState<string | undefined>(undefined);

  // 3. Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [cropFilter, setCropFilter] = useState<string>('all');
  const [selectedBuyerFilter, setSelectedBuyerFilter] = useState<string>('all');
  const [selectedListingFilter, setSelectedListingFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 4000);
  };

  // 4. Advance Simulation Day (+1 Day)
  const handleAdvanceDay = () => {
    const nextDate = new Date(currentSimulatedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    setCurrentSimulatedDate(nextDate);
    showToast(`Simulation advanced +1 day: Harvest age & spoilage urgency recalculated.`);
  };

  // 5. Scenario Resets
  const handleResetSimulation = (scenario: 'A' | 'B') => {
    setCurrentSimulatedDate(new Date());
    setRejectedMatchIds(new Set());
    setDispatches([]);
    setSelectedListingFilter('all');
    setSelectedBuyerFilter('all');
    setSearchQuery('');

    if (scenario === 'A') {
      setListings(INITIAL_FARMERS_SCENARIO_A);
      setBuyers(INITIAL_BUYERS);
      showToast('Loaded Scenario A: High perishability crisis (Strawberries, Tomatoes, Leafy Greens).');
    } else {
      // Scenario B: Balanced regional vegetable & root harvest
      const scenarioBListings: FarmerListing[] = [
        {
          id: 'farm-b1',
          farmerName: 'Liam O’Connor',
          farmName: 'Emerald Meadow Farms (Simulated)',
          phone: '+1 (555) 777-1234',
          location: { name: 'Emerald North Gate', region: SAMPLE_REGIONS[0], x: 30, y: 35 },
          cropName: 'Cabbage',
          category: 'vegetables',
          quantityKg: 4200,
          remainingKg: 4200,
          matchedKg: 0,
          harvestDate: getRelativeDateString(3),
          freshness: 'optimal_ripe',
          expectedPricePerKg: 0.65,
          storageCondition: 'cold_storage',
          createdAt: new Date().toISOString(),
          status: 'active',
        },
        {
          id: 'farm-b2',
          farmerName: 'Sanjay Deshmukh',
          farmName: 'Kaveri Horticultural Co-op (Simulated)',
          phone: '+1 (555) 888-2345',
          location: { name: 'Kaveri Basin Block 4', region: SAMPLE_REGIONS[1], x: 45, y: 55 },
          cropName: 'Bell Peppers',
          category: 'vegetables',
          quantityKg: 2800,
          remainingKg: 2800,
          matchedKg: 0,
          harvestDate: getRelativeDateString(2),
          freshness: 'optimal_ripe',
          expectedPricePerKg: 1.35,
          storageCondition: 'ambient_shaded',
          createdAt: new Date().toISOString(),
          status: 'active',
        },
        {
          id: 'farm-b3',
          farmerName: 'Clara & Sam Ortiz',
          farmName: 'Sunland Valley Cucumbers (Simulated)',
          phone: '+1 (555) 999-3456',
          location: { name: 'Sunland Station 2', region: SAMPLE_REGIONS[2], x: 72, y: 30 },
          cropName: 'Cucumbers',
          category: 'vegetables',
          quantityKg: 3100,
          remainingKg: 3100,
          matchedKg: 0,
          harvestDate: getRelativeDateString(2),
          freshness: 'moderately_ripe',
          expectedPricePerKg: 0.85,
          storageCondition: 'ambient_shaded',
          createdAt: new Date().toISOString(),
          status: 'active',
        },
        {
          id: 'farm-b4',
          farmerName: 'Zoe Martinez',
          farmName: 'Highland Root Collective (Simulated)',
          phone: '+1 (555) 444-9876',
          location: { name: 'Highland Cold Cellar', region: SAMPLE_REGIONS[3], x: 60, y: 70 },
          cropName: 'Carrots',
          category: 'roots_tubers',
          quantityKg: 5500,
          remainingKg: 5500,
          matchedKg: 0,
          harvestDate: getRelativeDateString(5),
          freshness: 'freshly_harvested',
          expectedPricePerKg: 0.70,
          storageCondition: 'cold_storage',
          createdAt: new Date().toISOString(),
          status: 'active',
        },
      ];
      setListings(scenarioBListings);
      setBuyers(INITIAL_BUYERS);
      showToast('Loaded Scenario B: Balanced vegetable & root surplus coordination.');
    }
  };

  // 6. Generate All Matches dynamically using matching engine
  const matches: FarmerBuyerMatch[] = useMemo(() => {
    return generateAllSystemMatches(listings, buyers, currentSimulatedDate, rejectedMatchIds);
  }, [listings, buyers, currentSimulatedDate, rejectedMatchIds]);

  // 7. Calculate Dashboard Metrics
  const metrics: DashboardMetrics = useMemo(() => {
    const totalListedSurplusKg = listings.reduce((acc, curr) => acc + curr.quantityKg, 0);
    const matchedQuantityKg = listings.reduce((acc, curr) => acc + curr.matchedKg, 0);
    const unmatchedSurplusKg = listings.reduce((acc, curr) => acc + curr.remainingKg, 0);
    const wasteAvoidedPercentage = totalListedSurplusKg > 0
      ? Math.round((matchedQuantityKg / totalListedSurplusKg) * 100)
      : 0;

    const estimatedEconomicValueSaved = dispatches.reduce((acc, d) => acc + d.totalValue, 0);
    // Standard FAO/UNEP food waste greenhouse emission factor: ~2.5 kg CO2e per kg food saved
    const estimatedCo2eAvoidedKg = Math.round(matchedQuantityKg * 2.5);

    const criticalLotsCount = listings.filter(l => {
      if (l.remainingKg <= 0) return false;
      const assessment = calculateSpoilageUrgency(
        l.cropName,
        l.category,
        l.harvestDate,
        l.freshness,
        l.storageCondition,
        currentSimulatedDate
      );
      return assessment.urgencyLevel === 'critical';
    }).length;

    return {
      totalListedSurplusKg,
      matchedQuantityKg,
      unmatchedSurplusKg,
      wasteAvoidedPercentage,
      estimatedEconomicValueSaved,
      estimatedCo2eAvoidedKg,
      criticalLotsCount,
      activeListingsCount: listings.filter(l => l.remainingKg > 0).length,
      registeredBuyersCount: buyers.length,
    };
  }, [listings, buyers, dispatches, currentSimulatedDate]);

  // 8. Filtered Matches
  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      // Status filter
      if (match.status === 'rejected') return false;

      // Single listing or buyer lock
      if (selectedListingFilter !== 'all' && match.listingId !== selectedListingFilter) {
        return false;
      }
      if (selectedBuyerFilter !== 'all' && match.buyerId !== selectedBuyerFilter) {
        return false;
      }

      // Urgency filter
      if (urgencyFilter !== 'all' && match.spoilageAssessment.urgencyLevel !== urgencyFilter) {
        return false;
      }

      // Crop filter
      if (cropFilter !== 'all' && match.listing.cropName.toLowerCase() !== cropFilter.toLowerCase()) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesFarm = match.listing.farmName.toLowerCase().includes(q) || match.listing.farmerName.toLowerCase().includes(q);
        const matchesBuyer = match.buyer.name.toLowerCase().includes(q);
        const matchesCrop = match.listing.cropName.toLowerCase().includes(q);
        const matchesRegion = match.listing.location.region.toLowerCase().includes(q) || match.buyer.location.region.toLowerCase().includes(q);
        if (!matchesFarm && !matchesBuyer && !matchesCrop && !matchesRegion) return false;
      }

      return true;
    });
  }, [matches, selectedListingFilter, selectedBuyerFilter, urgencyFilter, cropFilter, searchQuery]);

  // 9. Filtered Listings
  const filteredListings = useMemo(() => {
    return listings.filter(l => {
      if (urgencyFilter !== 'all') {
        const assessment = calculateSpoilageUrgency(
          l.cropName,
          l.category,
          l.harvestDate,
          l.freshness,
          l.storageCondition,
          currentSimulatedDate
        );
        if (assessment.urgencyLevel !== urgencyFilter) return false;
      }

      if (cropFilter !== 'all' && l.cropName.toLowerCase() !== cropFilter.toLowerCase()) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = l.cropName.toLowerCase().includes(q) || l.farmName.toLowerCase().includes(q) || l.farmerName.toLowerCase().includes(q);
        const matchesLocation = l.location.name.toLowerCase().includes(q) || l.location.region.toLowerCase().includes(q);
        if (!matchesName && !matchesLocation) return false;
      }

      return true;
    });
  }, [listings, urgencyFilter, cropFilter, searchQuery, currentSimulatedDate]);

  // 10. Handlers: Accept Match
  const handleAcceptMatch = (
    match: FarmerBuyerMatch,
    customQuantityKg?: number,
    customPrice?: number
  ) => {
    const qtyToContract = customQuantityKg !== undefined ? customQuantityKg : match.recommendedMatchedKg;
    const finalPrice = customPrice !== undefined ? customPrice : match.agreedPricePerKg;

    // Update the listing's remainingKg & matchedKg
    setListings(prev =>
      prev.map(item => {
        if (item.id === match.listingId) {
          const newMatched = item.matchedKg + qtyToContract;
          const newRemaining = Math.max(0, item.remainingKg - qtyToContract);
          return {
            ...item,
            matchedKg: newMatched,
            remainingKg: newRemaining,
            status: newRemaining === 0 ? 'fully_matched' : 'partially_matched',
          };
        }
        return item;
      })
    );

    // Create Dispatch Manifest
    const newDispatch: AcceptedDispatch = {
      id: `HB-DISP-${Date.now().toString(36).toUpperCase()}`,
      matchId: match.id,
      listingId: match.listingId,
      buyerId: match.buyerId,
      farmerName: match.listing.farmerName,
      farmName: match.listing.farmName,
      buyerName: match.buyer.name,
      buyerType: match.buyer.organizationType,
      cropName: match.listing.cropName,
      quantityKg: qtyToContract,
      agreedPricePerKg: finalPrice,
      totalValue: qtyToContract * finalPrice,
      distanceKm: match.breakdown.distanceKm,
      urgencyAtDispatch: match.spoilageAssessment.urgencyLevel,
      timestamp: new Date().toISOString(),
      pickupDeadline: `${new Date(Date.now() + 18 * 3600 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} today`,
    };

    setDispatches(prev => [newDispatch, ...prev]);
    setSelectedDispatchForModal(newDispatch);
    showToast(
      `✓ Match contracted! ${qtyToContract.toLocaleString()} kg ${match.listing.cropName} dispatched to ${match.buyer.name}.`
    );
  };

  // 11. Handlers: Reject Match
  const handleRejectMatch = (match: FarmerBuyerMatch, reason: string) => {
    setRejectedMatchIds(prev => new Set([...prev, match.id]));
    showToast(`Match declined (${reason}). Updating recommendation queue.`);
  };

  // 12. View on map
  const handleViewMatchOnMap = (match: FarmerBuyerMatch) => {
    setHighlightedMatchId(match.id);
    setActiveTab('map');
  };

  // Distinct list of crop names for filter dropdown
  const uniqueCropNames = useMemo(() => {
    const set = new Set<string>();
    listings.forEach(l => set.add(l.cropName));
    return Array.from(set).sort();
  }, [listings]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col text-[#1F2937]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#1B4332] text-white px-4 py-2.5 rounded-xl shadow-lg border border-[#2D6A4F] text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 text-[#95D5B2] shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-[#95D5B2] hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <Header
        currentSimulatedDate={currentSimulatedDate}
        onAdvanceDay={handleAdvanceDay}
        onResetSimulation={handleResetSimulation}
        onOpenNewListing={() => setIsListingModalOpen(true)}
        onOpenNewBuyer={() => setIsBuyerModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingMatchesCount={matches.filter(m => m.status === 'pending').length}
        criticalLotsCount={metrics.criticalLotsCount}
        activeDispatchesCount={dispatches.length}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        {/* Impact Dashboard */}
        <ImpactDashboard
          metrics={metrics}
          onViewMatches={() => setActiveTab('matches')}
          onViewCriticalListings={() => {
            setUrgencyFilter('critical');
            setActiveTab('listings');
          }}
        />

        {/* Universal Filter and Search Bar (Active on listings, matches, and buyers) */}
        {(activeTab === 'matches' || activeTab === 'listings' || activeTab === 'buyers') && (
          <div className="bg-white border border-[#E6E0D4] rounded-xl p-3 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search crops, farms, buyers, regions..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg focus:outline-none focus:border-[#2D6A4F]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  ×
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Urgency Filter (for matches and listings) */}
              {activeTab !== 'buyers' && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[#787265] text-[11px] font-medium">Urgency:</span>
                  <select
                    value={urgencyFilter}
                    onChange={e => setUrgencyFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs focus:outline-none focus:border-[#2D6A4F]"
                  >
                    <option value="all">All Urgency Levels</option>
                    <option value="critical">Critical (Rescue &lt;36h)</option>
                    <option value="high">High (2-3 days)</option>
                    <option value="moderate">Moderate Window</option>
                    <option value="low">Stable / Fresh</option>
                  </select>
                </div>
              )}

              {/* Crop Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[#787265] text-[11px] font-medium">Crop:</span>
                <select
                  value={cropFilter}
                  onChange={e => setCropFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-xs focus:outline-none focus:border-[#2D6A4F]"
                >
                  <option value="all">All Crops</option>
                  {uniqueCropNames.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Sub-filter Reset */}
              {(selectedListingFilter !== 'all' || selectedBuyerFilter !== 'all' || urgencyFilter !== 'all' || cropFilter !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedListingFilter('all');
                    setSelectedBuyerFilter('all');
                    setUrgencyFilter('all');
                    setCropFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-2.5 py-1.5 text-xs text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Active sub-filter banner */}
        {selectedListingFilter !== 'all' && (
          <div className="mb-4 p-2.5 bg-[#E8F0EA] border border-[#C5DAC9] rounded-lg text-xs text-[#1B4332] flex items-center justify-between">
            <span>
              Showing ranked buyer recommendations for:{' '}
              <strong>{listings.find(l => l.id === selectedListingFilter)?.farmName} ({listings.find(l => l.id === selectedListingFilter)?.cropName})</strong>
            </span>
            <button
              onClick={() => setSelectedListingFilter('all')}
              className="text-[#2D6A4F] hover:underline font-semibold cursor-pointer"
            >
              Show All Lots
            </button>
          </div>
        )}

        {selectedBuyerFilter !== 'all' && (
          <div className="mb-4 p-2.5 bg-[#E8F0EA] border border-[#C5DAC9] rounded-lg text-xs text-[#1B4332] flex items-center justify-between">
            <span>
              Showing farm surplus matches suitable for:{' '}
              <strong>{buyers.find(b => b.id === selectedBuyerFilter)?.name}</strong>
            </span>
            <button
              onClick={() => setSelectedBuyerFilter('all')}
              className="text-[#2D6A4F] hover:underline font-semibold cursor-pointer"
            >
              Show All Buyers
            </button>
          </div>
        )}

        {/* TAB 1: SMART MATCHMAKER */}
        {activeTab === 'matches' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-[#1B4332]">
                  Intelligent Surplus Matching Engine
                </h2>
                <p className="text-xs text-[#787265]">
                  Algorithmic ranking weighted by spoilage urgency, transit distance, volume absorption, and price compatibility
                </p>
              </div>
              <div className="text-xs text-[#524B3E]">
                Showing <strong>{filteredMatches.length}</strong> prioritized match pairing{filteredMatches.length === 1 ? '' : 's'}
              </div>
            </div>

            {filteredMatches.length === 0 ? (
              <div className="bg-white border border-[#E6E0D4] rounded-2xl p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#DDD5C5] text-[#2D6A4F] flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6 text-[#2D6A4F]" />
                </div>
                <h3 className="font-bold text-base text-[#1B4332]">
                  No Matching Farm Surplus Lots Found
                </h3>
                <p className="text-xs text-[#787265] max-w-md mx-auto">
                  All active lots are either fully contracted, or no buyers fit the current filter criteria. Try clearing filters or adding new crop surplus.
                </p>
                <div className="flex justify-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSelectedListingFilter('all');
                      setSelectedBuyerFilter('all');
                      setUrgencyFilter('all');
                      setCropFilter('all');
                      setSearchQuery('');
                    }}
                    className="px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg text-[#2D6A4F] font-semibold cursor-pointer"
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={() => setIsListingModalOpen(true)}
                    className="px-3.5 py-1.5 text-xs bg-[#2D6A4F] text-white rounded-lg font-semibold hover:bg-[#1B4332] cursor-pointer"
                  >
                    List New Surplus
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMatches.map(match => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onAccept={handleAcceptMatch}
                    onReject={handleRejectMatch}
                    onViewOnMap={handleViewMatchOnMap}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SURPLUS LOTS (FARMERS) */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-[#1B4332]">
                  Registered Farm Surplus Inventory
                </h2>
                <p className="text-xs text-[#787265]">
                  Active lots with calculated harvest age, storage condition, and dynamic spoilage urgency scores
                </p>
              </div>
              <button
                onClick={() => setIsListingModalOpen(true)}
                className="px-3.5 py-1.5 bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 self-start cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>List New Harvest Surplus</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredListings.map(listing => (
                <SurplusLotCard
                  key={listing.id}
                  listing={listing}
                  currentSimulatedDate={currentSimulatedDate}
                  onMatchThisLot={lot => {
                    setSelectedListingFilter(lot.id);
                    setActiveTab('matches');
                  }}
                  onSelectForMap={lot => {
                    setActiveTab('map');
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: BUYER DIRECTORY */}
        {activeTab === 'buyers' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-[#1B4332]">Registered Buyer Directory</h2>
                <p className="text-xs text-[#787265]">
                  Regional food processors, supermarkets, relief food banks, and wholesale aggregators
                </p>
              </div>
              <button
                onClick={() => setIsBuyerModalOpen(true)}
                className="px-3.5 py-1.5 bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 self-start cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register New Buyer Profile</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {buyers.map(buyer => (
                <BuyerCard
                  key={buyer.id}
                  buyer={buyer}
                  onFilterMatchesForBuyer={b => {
                    setSelectedBuyerFilter(b.id);
                    setActiveTab('matches');
                  }}
                  onLocateOnMap={b => {
                    setActiveTab('map');
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: REGIONAL LOGISTICS MAP */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <RegionalMap
              listings={listings}
              buyers={buyers}
              matches={matches}
              dispatches={dispatches}
              highlightedMatchId={highlightedMatchId}
              onSelectListing={listing => {
                setSelectedListingFilter(listing.id);
                setActiveTab('matches');
              }}
              onSelectBuyer={buyer => {
                setSelectedBuyerFilter(buyer.id);
                setActiveTab('matches');
              }}
            />
          </div>
        )}

        {/* TAB 5: DISPATCHED MANIFESTS */}
        {activeTab === 'dispatches' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-[#1B4332]">Contracted Produce Dispatches</h2>
                <p className="text-xs text-[#787265]">
                  Verifiable digital bills of lading for accepted matches and completed salvage logistics
                </p>
              </div>
              <div className="text-xs text-[#524B3E]">
                Total Contracted: <strong>{metrics.matchedQuantityKg.toLocaleString()} kg</strong> (${metrics.estimatedEconomicValueSaved.toLocaleString()})
              </div>
            </div>

            {dispatches.length === 0 ? (
              <div className="bg-white border border-[#E6E0D4] rounded-2xl p-8 text-center space-y-3">
                <Truck className="w-10 h-10 text-gray-400 mx-auto" />
                <h3 className="font-bold text-base text-[#1B4332]">No Dispatches Contracted Yet</h3>
                <p className="text-xs text-[#787265] max-w-sm mx-auto">
                  Review the recommended matches in the Smart Matchmaker tab and click "Accept Match & Dispatch" to contract your first surplus rescue lot.
                </p>
                <button
                  onClick={() => setActiveTab('matches')}
                  className="px-4 py-2 bg-[#2D6A4F] text-white text-xs font-semibold rounded-lg hover:bg-[#1B4332] cursor-pointer"
                >
                  Go to Matchmaker
                </button>
              </div>
            ) : (
              <div className="bg-white border border-[#E6E0D4] rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] border-b border-[#EDE7DC] text-[#706A5E] font-semibold">
                      <tr>
                        <th className="p-3">Manifest ID</th>
                        <th className="p-3">Crop & Volume</th>
                        <th className="p-3">Origin Farm</th>
                        <th className="p-3">Target Buyer</th>
                        <th className="p-3">Agreed Price</th>
                        <th className="p-3">Total Value</th>
                        <th className="p-3">Transit</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2EDE2]">
                      {dispatches.map(disp => (
                        <tr key={disp.id} className="hover:bg-[#FAF8F5] transition-colors">
                          <td className="p-3 font-mono font-semibold text-[#1B4332]">{disp.id}</td>
                          <td className="p-3 font-medium">
                            {disp.cropName}{' '}
                            <span className="font-bold text-[#1B4332]">({disp.quantityKg.toLocaleString()} kg)</span>
                          </td>
                          <td className="p-3">{disp.farmName}</td>
                          <td className="p-3 font-medium text-[#2D6A4F]">{disp.buyerName}</td>
                          <td className="p-3">${disp.agreedPricePerKg.toFixed(2)}/kg</td>
                          <td className="p-3 font-bold text-emerald-800">
                            ${disp.totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </td>
                          <td className="p-3 text-[#6B7280]">{disp.distanceKm} km direct</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setSelectedDispatchForModal(disp)}
                              className="px-2.5 py-1 text-xs text-[#2D6A4F] hover:bg-[#E8F0EA] rounded font-semibold border border-[#C5DAC9] cursor-pointer"
                            >
                              View Bill of Lading
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E6E0D4] bg-[#FAF8F5] py-5 text-xs text-[#787265] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1B4332]">HarvestBridge AI</span>
            <span>·</span>
            <span>Smart Crop Surplus Coordination & Spoilage Prevention System</span>
          </div>
          <div className="text-[11px] text-[#8C8578] text-center md:text-right">
            <span>Simulation prototype · Spoilage scores are operational dispatch estimates · No real transactions executed</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <NewListingModal
        isOpen={isListingModalOpen}
        onClose={() => setIsListingModalOpen(false)}
        onSubmit={newListing => {
          setListings(prev => [newListing, ...prev]);
          showToast(`Successfully listed ${newListing.quantityKg.toLocaleString()} kg of ${newListing.cropName}.`);
          setActiveTab('matches');
          setSelectedListingFilter(newListing.id);
        }}
        currentSimulatedDate={currentSimulatedDate}
      />

      <NewBuyerModal
        isOpen={isBuyerModalOpen}
        onClose={() => setIsBuyerModalOpen(false)}
        onSubmit={newBuyer => {
          setBuyers(prev => [newBuyer, ...prev]);
          showToast(`Buyer registered: ${newBuyer.name}.`);
          setActiveTab('buyers');
        }}
      />

      <DispatchManifestModal
        dispatch={selectedDispatchForModal}
        onClose={() => setSelectedDispatchForModal(null)}
      />
    </div>
  );
}
