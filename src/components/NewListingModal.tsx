import React, { useState } from 'react';
import { CropCategory, FreshnessState, StorageCondition, FarmerListing, LocationPoint } from '../types';
import { calculateSpoilageUrgency, CROP_BASE_SHELF_LIFE_DAYS } from '../utils/spoilageEngine';
import { SAMPLE_REGIONS, getRelativeDateString } from '../utils/sampleData';
import { X, Sprout, AlertCircle, Info, ShieldCheck } from 'lucide-react';

interface NewListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (listing: FarmerListing) => void;
  currentSimulatedDate: Date;
}

const COMMON_CROPS: { name: string; category: CropCategory; defaultPrice: number }[] = [
  { name: 'Strawberries', category: 'berries', defaultPrice: 2.80 },
  { name: 'Tomatoes', category: 'soft_fruits', defaultPrice: 1.10 },
  { name: 'Spinach', category: 'leafy_greens', defaultPrice: 1.70 },
  { name: 'Bell Peppers', category: 'vegetables', defaultPrice: 1.45 },
  { name: 'Mangoes', category: 'soft_fruits', defaultPrice: 1.90 },
  { name: 'Lettuce', category: 'leafy_greens', defaultPrice: 1.30 },
  { name: 'Sweet Corn', category: 'vegetables', defaultPrice: 0.85 },
  { name: 'Cucumbers', category: 'vegetables', defaultPrice: 0.90 },
  { name: 'Potatoes', category: 'roots_tubers', defaultPrice: 0.60 },
  { name: 'Onions', category: 'roots_tubers', defaultPrice: 0.50 },
  { name: 'Blueberries', category: 'berries', defaultPrice: 3.50 },
  { name: 'Apples', category: 'soft_fruits', defaultPrice: 1.25 },
];

export const NewListingModal: React.FC<NewListingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentSimulatedDate,
}) => {
  const [farmerName, setFarmerName] = useState('Gabriel Morales');
  const [farmName, setFarmName] = useState('Green Valley Harvest Co-op (Simulated)');
  const [phone, setPhone] = useState('+1 (555) 678-9012');
  const [cropName, setCropName] = useState('Tomatoes');
  const [category, setCategory] = useState<CropCategory>('soft_fruits');
  const [quantityKg, setQuantityKg] = useState<number>(2000);
  const [harvestDate, setHarvestDate] = useState<string>(getRelativeDateString(2));
  const [freshness, setFreshness] = useState<FreshnessState>('optimal_ripe');
  const [storageCondition, setStorageCondition] = useState<StorageCondition>('ambient_shaded');
  const [expectedPricePerKg, setExpectedPricePerKg] = useState<number>(1.05);
  const [selectedRegion, setSelectedRegion] = useState<string>(SAMPLE_REGIONS[0]);
  const [notes, setNotes] = useState<string>('Surplus harvest from secondary greenhouse run; ready for rapid dispatch.');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Live preview of spoilage urgency
  const liveAssessment = calculateSpoilageUrgency(
    cropName,
    category,
    harvestDate,
    freshness,
    storageCondition,
    currentSimulatedDate
  );

  const handleSelectCrop = (crop: { name: string; category: CropCategory; defaultPrice: number }) => {
    setCropName(crop.name);
    setCategory(crop.category);
    setExpectedPricePerKg(crop.defaultPrice);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName.trim()) {
      setError('Please provide a crop name.');
      return;
    }
    if (quantityKg <= 0) {
      setError('Quantity must be greater than 0 kg.');
      return;
    }
    if (expectedPricePerKg <= 0) {
      setError('Expected price must be greater than $0.');
      return;
    }

    // Determine coordinate based on region seed
    const regionIndex = Math.max(0, SAMPLE_REGIONS.indexOf(selectedRegion));
    const angle = (regionIndex / SAMPLE_REGIONS.length) * 2 * Math.PI;
    const radius = 30 + (regionIndex % 3) * 15;
    const x = Math.round(50 + Math.cos(angle) * radius);
    const y = Math.round(50 + Math.sin(angle) * radius);

    const location: LocationPoint = {
      name: `${farmName.split(' ')[0]} Farm Gate`,
      region: selectedRegion,
      x: Math.max(10, Math.min(90, x)),
      y: Math.max(10, Math.min(90, y)),
    };

    const newListing: FarmerListing = {
      id: `farm-${Date.now().toString(36)}`,
      farmerName: farmerName.trim() || 'Verified Grower',
      farmName: farmName.trim() || 'Regional Farm Lot',
      phone: phone.trim() || '+1 (555) 000-0000',
      location,
      cropName: cropName.trim(),
      category,
      quantityKg: Number(quantityKg),
      remainingKg: Number(quantityKg),
      matchedKg: 0,
      harvestDate,
      freshness,
      expectedPricePerKg: Number(expectedPricePerKg),
      storageCondition,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    onSubmit(newListing);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-xl border border-[#DDD5C5]">
        {/* Header */}
        <div className="p-5 border-b border-[#EFECE4] flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2D6A4F] text-white flex items-center justify-center">
              <Sprout className="w-4 h-4 text-[#A7F3D0]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1B4332]">List Crop Surplus</h2>
              <p className="text-xs text-[#787265]">
                Register surplus harvest to match with nearby processors, grocery chains, & food banks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Farmer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Farmer / Contact Name
              </label>
              <input
                type="text"
                required
                value={farmerName}
                onChange={e => setFarmerName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#DDD5C5] focus:outline-none focus:border-[#2D6A4F]"
                placeholder="e.g. Samuel Green"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Farm / Cooperative Name
              </label>
              <input
                type="text"
                required
                value={farmName}
                onChange={e => setFarmName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#DDD5C5] focus:outline-none focus:border-[#2D6A4F]"
                placeholder="e.g. Pine Ridge Farms (Simulated)"
              />
            </div>
          </div>

          {/* Quick Crop Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">
              Select or Enter Crop
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_CROPS.slice(0, 8).map(crop => (
                <button
                  type="button"
                  key={crop.name}
                  onClick={() => handleSelectCrop(crop)}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
                    cropName === crop.name
                      ? 'bg-[#2D6A4F] text-white border-[#2D6A4F]'
                      : 'bg-[#F9F7F2] text-[#4A453A] border-[#DDD5C5] hover:bg-[#EFECE4]'
                  }`}
                >
                  {crop.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#6B7280] mb-0.5">Crop Name</label>
                <input
                  type="text"
                  required
                  value={cropName}
                  onChange={e => setCropName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#DDD5C5] focus:outline-none focus:border-[#2D6A4F]"
                  placeholder="e.g. Tomatoes"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#6B7280] mb-0.5">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as CropCategory)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#DDD5C5] focus:outline-none focus:border-[#2D6A4F] bg-white"
                >
                  <option value="soft_fruits">Soft Fruits (Tomatoes, Mangoes, Peaches)</option>
                  <option value="berries">Berries (Strawberries, Blueberries)</option>
                  <option value="leafy_greens">Leafy Greens (Spinach, Lettuce, Herbs)</option>
                  <option value="vegetables">Vegetables (Peppers, Corn, Cucumbers)</option>
                  <option value="roots_tubers">Roots & Tubers (Potatoes, Carrots, Onions)</option>
                  <option value="grains_pulses">Grains & Pulses</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quantity and Expected Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Surplus Quantity (kg)
              </label>
              <input
                type="number"
                required
                min="10"
                step="50"
                value={quantityKg}
                onChange={e => setQuantityKg(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#DDD5C5] focus:outline-none focus:border-[#2D6A4F]"
                placeholder="1000"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Expected Price per kg ($)
              </label>
              <input
                type="number"
                required
                min="0.1"
                step="0.05"
                value={expectedPricePerKg}
                onChange={e => setExpectedPricePerKg(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#DDD5C5] focus:outline-none focus:border-[#2D6A4F]"
                placeholder="1.20"
              />
            </div>
          </div>

          {/* Harvest Date & Quick Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#374151]">
                  Harvest Date
                </label>
                <div className="flex gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setHarvestDate(getRelativeDateString(0))}
                    className="text-[#2D6A4F] hover:underline cursor-pointer"
                  >
                    Today
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setHarvestDate(getRelativeDateString(1))}
                    className="text-[#2D6A4F] hover:underline cursor-pointer"
                  >
                    Yesterday
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setHarvestDate(getRelativeDateString(3))}
                    className="text-[#2D6A4F] hover:underline cursor-pointer"
                  >
                    3d ago
                  </button>
                </div>
              </div>
              <input
                type="date"
                required
                value={harvestDate}
                onChange={e => setHarvestDate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#DDD5C5] focus:outline-none focus:border-[#2D6A4F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Freshness Level
              </label>
              <select
                value={freshness}
                onChange={e => setFreshness(e.target.value as FreshnessState)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#DDD5C5] focus:outline-none focus:border-[#2D6A4F] bg-white"
              >
                <option value="freshly_harvested">Freshly Harvested (Peak Firmness)</option>
                <option value="optimal_ripe">Optimal Ripe (Prime Fresh Retail)</option>
                <option value="moderately_ripe">Moderately Ripe (Ready to Eat / Process)</option>
                <option value="overripe_processing_only">Near Peak (Processing & Puree Only)</option>
              </select>
            </div>
          </div>

          {/* Storage & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Storage Condition
              </label>
              <select
                value={storageCondition}
                onChange={e => setStorageCondition(e.target.value as StorageCondition)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#DDD5C5] focus:outline-none focus:border-[#2D6A4F] bg-white"
              >
                <option value="cold_storage">Cold Storage (Refrigerated)</option>
                <option value="ambient_shaded">Ambient Shaded Warehouse</option>
                <option value="open_air">Open Air / Field Staged</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Regional Hub
              </label>
              <select
                value={selectedRegion}
                onChange={e => setSelectedRegion(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#DDD5C5] focus:outline-none focus:border-[#2D6A4F] bg-white"
              >
                {SAMPLE_REGIONS.map(reg => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">
              Field Notes / Packaging Specs (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-[#DDD5C5] focus:outline-none focus:border-[#2D6A4F]"
              placeholder="e.g. Crated in 20kg lugs, ready for immediate loading"
            />
          </div>

          {/* Real-time Spoilage Urgency Preview & Disclaimer */}
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C5] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1B4332] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
                Estimated Spoilage Urgency:
              </span>
              <span className="text-xs font-bold text-[#2D6A4F]">
                {liveAssessment.urgencyScore} / 100 ({liveAssessment.urgencyLevel.toUpperCase()})
              </span>
            </div>

            <div className="w-full bg-[#E5DFD3] rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  liveAssessment.urgencyLevel === 'critical'
                    ? 'bg-red-500'
                    : liveAssessment.urgencyLevel === 'high'
                    ? 'bg-amber-500'
                    : 'bg-emerald-600'
                }`}
                style={{ width: `${liveAssessment.urgencyScore}%` }}
              />
            </div>

            <p className="text-[11px] text-[#554F42]">
              <strong>Logistics Window:</strong> ~{liveAssessment.estimatedDaysRemaining} days remaining ({liveAssessment.primaryRiskFactor})
            </p>

            <div className="flex items-start gap-1.5 pt-1 text-[10px] text-[#787265] border-t border-[#EDE7DC]">
              <Info className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0 mt-0.5" />
              <span>
                <strong>Important Notice:</strong> Spoilage urgency is an estimated priority score to optimize transport dispatch order, not a guaranteed biological spoilage prediction.
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#EFECE4]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#4A453A] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              Register & Find Buyers
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
