import { BuyerProfile, FarmerListing, FarmerBuyerMatch, MatchScoreBreakdown, SpoilageAssessment } from '../types';
import { calculateSpoilageUrgency } from './spoilageEngine';

export function calculateDistanceKm(loc1: { x: number; y: number }, loc2: { x: number; y: number }): number {
  const dx = loc1.x - loc2.x;
  const dy = loc1.y - loc2.y;
  const euclidean = Math.sqrt(dx * dx + dy * dy);
  // Scale normalized 100x100 grid to realistic ~120 km regional cluster
  const km = Math.round(euclidean * 1.25);
  return Math.max(2, km); // minimum 2 km local
}

export function computeMatch(
  listing: FarmerListing,
  buyer: BuyerProfile,
  currentSimulatedDate: Date = new Date()
): FarmerBuyerMatch | null {
  // If listing has no remaining quantity, skip
  if (listing.remainingKg <= 0) return null;

  // 1. Crop Compatibility
  const isDirectCropMatch =
    buyer.cropPreferences.includes('*') ||
    buyer.cropPreferences.some(pref => pref.toLowerCase() === listing.cropName.toLowerCase());

  // Also check if buyer is a processing facility and accepts near-peak
  const isProcessingEligible =
    buyer.organizationType === 'Food Processing & Canning' ||
    buyer.organizationType === 'Food Bank & Relief Org';

  if (!isDirectCropMatch && !isProcessingEligible) {
    return null; // completely incompatible crop
  }

  const cropCompatibility = isDirectCropMatch ? 100 : 75;

  // 2. Distance Calculation
  const distanceKm = calculateDistanceKm(listing.location, buyer.location);
  const exceedsDistanceLimit = distanceKm > buyer.maxDistanceKm;

  let distanceScore = 100;
  if (distanceKm <= 12) {
    distanceScore = 100;
  } else if (distanceKm <= 25) {
    distanceScore = 90;
  } else if (distanceKm <= 45) {
    distanceScore = 75;
  } else if (distanceKm <= 70) {
    distanceScore = 55;
  } else if (distanceKm <= 100) {
    distanceScore = 40;
  } else {
    distanceScore = 20;
  }

  if (exceedsDistanceLimit) {
    distanceScore = Math.max(10, distanceScore - 40);
  }

  // 3. Quantity Fit
  const recommendedMatchedKg = Math.min(listing.remainingKg, buyer.maxQuantityKg);
  let quantityScore = 80;

  if (recommendedMatchedKg < buyer.minQuantityKg) {
    // Under buyer minimum threshold
    quantityScore = 30;
  } else {
    const fractionOfSurplusAbsorbed = recommendedMatchedKg / listing.remainingKg;
    // Perfect if absorbs 80-100% of farmer surplus
    if (fractionOfSurplusAbsorbed >= 0.8) {
      quantityScore = 100;
    } else if (fractionOfSurplusAbsorbed >= 0.5) {
      quantityScore = 85;
    } else if (fractionOfSurplusAbsorbed >= 0.25) {
      quantityScore = 70;
    } else {
      quantityScore = 55;
    }
  }

  // 4. Price Alignment
  const expectedPrice = listing.expectedPricePerKg;
  const buyerMax = buyer.maxPricePerKg;
  let priceScore = 0;
  let agreedPrice = expectedPrice;

  if (buyerMax >= expectedPrice) {
    priceScore = 100;
    // Fair agreed price: farmer gets expected ask
    agreedPrice = expectedPrice;
  } else {
    const priceRatio = buyerMax / Math.max(0.01, expectedPrice);
    if (priceRatio >= 0.90) {
      priceScore = 80;
      agreedPrice = buyerMax;
    } else if (priceRatio >= 0.75) {
      priceScore = 60;
      agreedPrice = buyerMax;
    } else if (priceRatio >= 0.60) {
      priceScore = 35;
      agreedPrice = buyerMax;
    } else {
      priceScore = 15;
      agreedPrice = buyerMax;
    }
  }

  // 5. Spoilage Urgency
  const spoilageAssessment = calculateSpoilageUrgency(
    listing.cropName,
    listing.category,
    listing.harvestDate,
    listing.freshness,
    listing.storageCondition,
    currentSimulatedDate
  );

  let urgencyBoost = 0;
  // If urgency is critical or high, proximity and rapid dispatch speed give strong relevance boost
  if (spoilageAssessment.urgencyLevel === 'critical') {
    if (distanceKm <= 25) urgencyBoost = 18;
    else if (distanceKm <= 50) urgencyBoost = 10;
  } else if (spoilageAssessment.urgencyLevel === 'high') {
    if (distanceKm <= 35) urgencyBoost = 12;
    else if (distanceKm <= 60) urgencyBoost = 6;
  }

  // Overall Score Calculation (weighted)
  // Compatibility: 30%, Distance: 25%, Quantity: 20%, Price: 15%, Urgency fit: 10%
  const baseScore =
    cropCompatibility * 0.30 +
    distanceScore * 0.25 +
    quantityScore * 0.20 +
    priceScore * 0.15 +
    (spoilageAssessment.urgencyScore * 0.10);

  const finalScore = Math.min(99, Math.max(15, Math.round(baseScore + urgencyBoost * 0.5)));

  // Generate transparent rationale points
  const rationale: string[] = [];

  // Rationale 1: Distance & transit
  if (distanceKm <= 18) {
    rationale.push(`Ultra-low transit distance (${distanceKm} km), allowing immediate same-day pickup within 1-2 hours.`);
  } else if (distanceKm <= 45) {
    rationale.push(`Favorable regional radius (${distanceKm} km) with standard local haulage feasibility.`);
  } else {
    rationale.push(`Transit distance of ${distanceKm} km is manageable via direct refrigerated or shaded transit.`);
  }

  // Rationale 2: Quantity absorption
  const percentAbsorbed = Math.round((recommendedMatchedKg / listing.remainingKg) * 100);
  if (percentAbsorbed >= 95) {
    rationale.push(`Absorbs 100% of surplus (${recommendedMatchedKg.toLocaleString()} kg), resolving the entire lot in one transaction.`);
  } else {
    rationale.push(`Absorbs ${percentAbsorbed}% of surplus (${recommendedMatchedKg.toLocaleString()} kg of ${listing.remainingKg.toLocaleString()} kg).`);
  }

  // Rationale 3: Price feasibility
  if (buyerMax >= expectedPrice) {
    rationale.push(`Buyer budget ($${buyerMax.toFixed(2)}/kg) fully covers asking price ($${expectedPrice.toFixed(2)}/kg).`);
  } else {
    const discountPct = Math.round(((expectedPrice - buyerMax) / expectedPrice) * 100);
    rationale.push(`Buyer offer is $${buyerMax.toFixed(2)}/kg (${discountPct}% salvage markdown under asking price of $${expectedPrice.toFixed(2)}/kg).`);
  }

  // Rationale 4: Spoilage mitigation
  if (spoilageAssessment.urgencyLevel === 'critical') {
    rationale.push(`CRITICAL URGENCY: Only ~${spoilageAssessment.estimatedDaysRemaining} days remaining before decay; ${buyer.name} provides immediate salvage.`);
  } else if (spoilageAssessment.urgencyLevel === 'high') {
    rationale.push(`HIGH URGENCY: ~${spoilageAssessment.estimatedDaysRemaining} days shelf life; match prevents post-harvest degradation.`);
  } else {
    rationale.push(`Stable freshness: ${spoilageAssessment.estimatedDaysRemaining} days shelf runway for organized transfer.`);
  }

  const breakdown: MatchScoreBreakdown = {
    cropCompatibility,
    distanceKm,
    distanceScore,
    quantityScore,
    priceScore,
    urgencyBoost,
  };

  return {
    id: `match_${listing.id}_${buyer.id}`,
    listingId: listing.id,
    buyerId: buyer.id,
    listing,
    buyer,
    overallScore: finalScore,
    breakdown,
    recommendedMatchedKg,
    agreedPricePerKg: agreedPrice,
    spoilageAssessment,
    rationale,
    status: 'pending',
  };
}

export function rankMatchesForListing(
  listing: FarmerListing,
  buyers: BuyerProfile[],
  currentSimulatedDate: Date = new Date()
): FarmerBuyerMatch[] {
  const matches: FarmerBuyerMatch[] = [];

  for (const buyer of buyers) {
    const match = computeMatch(listing, buyer, currentSimulatedDate);
    if (match) {
      matches.push(match);
    }
  }

  // Sort descending by overall match score
  return matches.sort((a, b) => b.overallScore - a.overallScore);
}

export function generateAllSystemMatches(
  listings: FarmerListing[],
  buyers: BuyerProfile[],
  currentSimulatedDate: Date = new Date(),
  rejectedMatchIds: Set<string> = new Set()
): FarmerBuyerMatch[] {
  const allMatches: FarmerBuyerMatch[] = [];

  for (const listing of listings) {
    if (listing.status === 'fully_matched' || listing.remainingKg <= 0) continue;
    const ranked = rankMatchesForListing(listing, buyers, currentSimulatedDate);
    for (const match of ranked) {
      if (rejectedMatchIds.has(match.id)) {
        match.status = 'rejected';
      }
      allMatches.push(match);
    }
  }

  // Overall sort by urgency first (critical lots on top), then overallScore
  return allMatches.sort((a, b) => {
    // Priority score combines urgency and match quality
    const urgencyWeightA = a.spoilageAssessment.urgencyScore;
    const urgencyWeightB = b.spoilageAssessment.urgencyScore;
    const scoreA = a.overallScore * 0.65 + urgencyWeightA * 0.35;
    const scoreB = b.overallScore * 0.65 + urgencyWeightB * 0.35;
    return scoreB - scoreA;
  });
}
