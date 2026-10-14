export type CropCategory =
  | 'leafy_greens'
  | 'berries'
  | 'soft_fruits'
  | 'vegetables'
  | 'roots_tubers'
  | 'grains_pulses';

export type FreshnessState =
  | 'freshly_harvested'
  | 'optimal_ripe'
  | 'moderately_ripe'
  | 'overripe_processing_only';

export type StorageCondition =
  | 'cold_storage'
  | 'ambient_shaded'
  | 'open_air';

export type UrgencyLevel = 'critical' | 'high' | 'moderate' | 'low';

export interface LocationPoint {
  name: string;
  region: string;
  x: number; // 0-100 normalized coordinates for map visualizer
  y: number; // 0-100 normalized coordinates
}

export interface FarmerListing {
  id: string;
  farmerName: string;
  farmName: string;
  phone: string;
  location: LocationPoint;
  cropName: string;
  category: CropCategory;
  quantityKg: number;
  remainingKg: number;
  matchedKg: number;
  harvestDate: string; // YYYY-MM-DD
  freshness: FreshnessState;
  expectedPricePerKg: number;
  storageCondition: StorageCondition;
  notes?: string;
  createdAt: string;
  status: 'active' | 'partially_matched' | 'fully_matched' | 'expired';
}

export type BuyerType =
  | 'Food Processing & Canning'
  | 'Supermarket / Grocery Chain'
  | 'Food Bank & Relief Org'
  | 'Wholesale Produce Aggregator'
  | 'Restaurant Cooperative'
  | 'Direct-to-Consumer Box Program';

export interface BuyerProfile {
  id: string;
  name: string;
  organizationType: BuyerType;
  contactPerson: string;
  phone: string;
  location: LocationPoint;
  cropPreferences: string[]; // specific crops or ["*"]
  minQuantityKg: number;
  maxQuantityKg: number;
  maxPricePerKg: number;
  maxDistanceKm: number;
  acceptsNearPeak: boolean;
  procurementUrgency: 'immediate' | 'flexible';
  notes?: string;
}

export interface SpoilageAssessment {
  urgencyScore: number; // 0 to 100
  urgencyLevel: UrgencyLevel;
  estimatedDaysRemaining: number;
  shelfLifeDaysTotal: number;
  daysSinceHarvest: number;
  primaryRiskFactor: string;
  disclaimer: string;
}

export interface MatchScoreBreakdown {
  cropCompatibility: number; // 0-100
  distanceKm: number;
  distanceScore: number; // 0-100
  quantityScore: number; // 0-100
  priceScore: number; // 0-100
  urgencyBoost: number; // 0-20
}

export interface FarmerBuyerMatch {
  id: string;
  listingId: string;
  buyerId: string;
  listing: FarmerListing;
  buyer: BuyerProfile;
  overallScore: number; // 0-100
  breakdown: MatchScoreBreakdown;
  recommendedMatchedKg: number;
  agreedPricePerKg: number;
  spoilageAssessment: SpoilageAssessment;
  rationale: string[];
  status: 'pending' | 'accepted' | 'rejected';
  rejectionReason?: string;
  acceptedAt?: string;
}

export interface AcceptedDispatch {
  id: string;
  matchId: string;
  listingId: string;
  buyerId: string;
  farmerName: string;
  farmName: string;
  buyerName: string;
  buyerType: BuyerType;
  cropName: string;
  quantityKg: number;
  agreedPricePerKg: number;
  totalValue: number;
  distanceKm: number;
  urgencyAtDispatch: UrgencyLevel;
  timestamp: string;
  pickupDeadline: string;
}

export interface DashboardMetrics {
  totalListedSurplusKg: number;
  matchedQuantityKg: number;
  unmatchedSurplusKg: number;
  wasteAvoidedPercentage: number;
  estimatedEconomicValueSaved: number;
  estimatedCo2eAvoidedKg: number;
  criticalLotsCount: number;
  activeListingsCount: number;
  registeredBuyersCount: number;
}
