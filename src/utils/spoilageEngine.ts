import { CropCategory, FreshnessState, StorageCondition, SpoilageAssessment, UrgencyLevel } from '../types';

export const CROP_BASE_SHELF_LIFE_DAYS: Record<string, { days: number; category: CropCategory; optimalTemp: string }> = {
  'Strawberries': { days: 3, category: 'berries', optimalTemp: '0-2°C' },
  'Blueberries': { days: 6, category: 'berries', optimalTemp: '0-2°C' },
  'Raspberries': { days: 2.5, category: 'berries', optimalTemp: '0-1°C' },
  'Spinach': { days: 3.5, category: 'leafy_greens', optimalTemp: '1-4°C' },
  'Lettuce': { days: 4, category: 'leafy_greens', optimalTemp: '1-4°C' },
  'Coriander / Cilantro': { days: 3, category: 'leafy_greens', optimalTemp: '2-4°C' },
  'Tomatoes': { days: 7, category: 'soft_fruits', optimalTemp: '12-15°C' },
  'Bell Peppers': { days: 8, category: 'vegetables', optimalTemp: '7-10°C' },
  'Cucumbers': { days: 7, category: 'vegetables', optimalTemp: '10-12°C' },
  'Green Beans': { days: 6, category: 'vegetables', optimalTemp: '5-7°C' },
  'Mangoes': { days: 8, category: 'soft_fruits', optimalTemp: '13°C' },
  'Bananas': { days: 6, category: 'soft_fruits', optimalTemp: '13-14°C' },
  'Sweet Corn': { days: 4, category: 'vegetables', optimalTemp: '0-2°C' },
  'Cabbage': { days: 16, category: 'vegetables', optimalTemp: '0-2°C' },
  'Carrots': { days: 24, category: 'roots_tubers', optimalTemp: '0-2°C' },
  'Potatoes': { days: 45, category: 'roots_tubers', optimalTemp: '8-10°C' },
  'Onions': { days: 60, category: 'roots_tubers', optimalTemp: '0-4°C dry' },
  'Apples': { days: 30, category: 'soft_fruits', optimalTemp: '0-4°C' },
};

const CATEGORY_DEFAULT_DAYS: Record<CropCategory, number> = {
  leafy_greens: 3.5,
  berries: 3,
  soft_fruits: 7,
  vegetables: 8,
  roots_tubers: 35,
  grains_pulses: 120,
};

const STORAGE_MULTIPLIERS: Record<StorageCondition, number> = {
  cold_storage: 1.45,
  ambient_shaded: 1.0,
  open_air: 0.65,
};

const FRESHNESS_PENALTY: Record<FreshnessState, number> = {
  freshly_harvested: 0,
  optimal_ripe: 0.15,
  moderately_ripe: 0.35,
  overripe_processing_only: 0.6,
};

export function calculateSpoilageUrgency(
  cropName: string,
  category: CropCategory,
  harvestDateStr: string,
  freshness: FreshnessState,
  storage: StorageCondition,
  currentSimulatedDate: Date = new Date()
): SpoilageAssessment {
  const cropData = CROP_BASE_SHELF_LIFE_DAYS[cropName];
  const baseDays = cropData ? cropData.days : (CATEGORY_DEFAULT_DAYS[category] || 7);

  // Storage factor extends or reduces shelf life
  const storageMultiplier = STORAGE_MULTIPLIERS[storage] || 1.0;
  const totalEffectiveShelfLifeDays = Math.max(1, baseDays * storageMultiplier);

  // Calculate elapsed days
  const harvestDate = new Date(harvestDateStr);
  const diffMs = currentSimulatedDate.getTime() - harvestDate.getTime();
  const daysSinceHarvest = Math.max(0, diffMs / (1000 * 60 * 60 * 24));

  // Freshness penalty simulates advanced biological aging already present at listing
  const freshnessRatio = FRESHNESS_PENALTY[freshness] || 0;
  const adjustedElapsedDays = daysSinceHarvest + (freshnessRatio * totalEffectiveShelfLifeDays);

  const daysRemaining = Math.max(0, totalEffectiveShelfLifeDays - adjustedElapsedDays);
  const remainingFraction = Math.max(0, Math.min(1, daysRemaining / totalEffectiveShelfLifeDays));

  // Urgency score: inverse of remaining fraction (0 = fresh/no urgency, 100 = immediate loss risk)
  let urgencyScore = Math.round((1 - remainingFraction) * 100);

  // Adjust for high perishability items: berries/leafy greens escalate urgency faster
  if (category === 'berries' || category === 'leafy_greens') {
    urgencyScore = Math.min(100, Math.round(urgencyScore * 1.15));
  }

  let urgencyLevel: UrgencyLevel = 'low';
  let primaryRiskFactor = 'Standard ambient degradation window.';

  if (urgencyScore >= 75 || daysRemaining <= 1.2) {
    urgencyLevel = 'critical';
    primaryRiskFactor = daysRemaining <= 0.8
      ? 'Critical decay imminent within 12–24h. Immediate processing or local dispatch required.'
      : 'Less than 36h shelf life remaining. Urgent proximity matching recommended.';
  } else if (urgencyScore >= 50 || daysRemaining <= 2.5) {
    urgencyLevel = 'high';
    primaryRiskFactor = storage === 'open_air'
      ? 'Uncooled storage accelerating moisture loss and cell softening.'
      : 'Mid-ripeness window shrinking. Priority buyer dispatch within 48h needed.';
  } else if (urgencyScore >= 25 || daysRemaining <= 5) {
    urgencyLevel = 'moderate';
    primaryRiskFactor = 'Stable condition. Recommend matching within 3–4 days for optimal return.';
  } else {
    urgencyLevel = 'low';
    primaryRiskFactor = 'Produce is fresh with ample logistical runway. Regular order fulfillment suitable.';
  }

  return {
    urgencyScore: Math.min(100, Math.max(5, urgencyScore)),
    urgencyLevel,
    estimatedDaysRemaining: Number(daysRemaining.toFixed(1)),
    shelfLifeDaysTotal: Number(totalEffectiveShelfLifeDays.toFixed(1)),
    daysSinceHarvest: Number(daysSinceHarvest.toFixed(1)),
    primaryRiskFactor,
    disclaimer: 'Estimated priority score for logistics planning — not a guaranteed biological spoilage prediction.',
  };
}
