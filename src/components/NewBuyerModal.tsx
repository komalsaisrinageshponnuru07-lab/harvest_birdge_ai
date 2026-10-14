import React, { useState } from 'react';
import { BuyerProfile, BuyerType, LocationPoint } from '../types';
import { SAMPLE_REGIONS } from '../utils/sampleData';
import { X, Building2, AlertCircle } from 'lucide-react';

interface NewBuyerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (buyer: BuyerProfile) => void;
}

const COMMON_CROPS = [
  'Tomatoes',
  'Strawberries',
  'Spinach',
  'Bell Peppers',
  'Mangoes',
  'Potatoes',
  'Lettuce',
  'Cucumbers',
  'Sweet Corn',
  'Onions',
  'Blueberries',
];

export const NewBuyerModal: React.FC<NewBuyerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('Cascadia Food Preservation Hub (Simulated)');
  const [organizationType, setOrganizationType] = useState<BuyerType>('Food Processing & Canning');
  const [contactPerson, setContactPerson] = useState('Elena Rostova');
  const [phone, setPhone] = useState('+1 (555) 888-9900');
  const [selectedRegion, setSelectedRegion] = useState<string>(SAMPLE_REGIONS[1]);
  const [selectedCrops, setSelectedCrops] = useState<string[]>(['Tomatoes', 'Bell Peppers', 'Mangoes']);
  const [acceptsAll, setAcceptsAll] = useState(false);
  const [minQuantityKg, setMinQuantityKg] = useState<number>(500);
  const [maxQuantityKg, setMaxQuantityKg] = useState<number>(3000);
  const [maxPricePerKg, setMaxPricePerKg] = useState<number>(1.25);
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(60);
  const [acceptsNearPeak, setAcceptsNearPeak] = useState<boolean>(true);
  const [procurementUrgency, setProcurementUrgency] = useState<'immediate' | 'flexible'>('immediate');
  const [notes, setNotes] = useState('Central receiving dock open 6am - 4pm daily with refrigerated pallet bays.');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleCrop = (crop: string) => {
    if (selectedCrops.includes(crop)) {
      setSelectedCrops(selectedCrops.filter(c => c !== crop));
    } else {
      setSelectedCrops([...selectedCrops, crop]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide an organization name.');
      return;
    }
    if (!acceptsAll && selectedCrops.length === 0) {
      setError('Please select at least one crop preference or choose "Accept All Edible Crops".');
      return;
    }
    if (maxQuantityKg < minQuantityKg) {
      setError('Maximum quantity must be greater than or equal to minimum quantity.');
      return;
    }

    // Assign coordinate based on region
    const regionIndex = Math.max(0, SAMPLE_REGIONS.indexOf(selectedRegion));
    const angle = (regionIndex / SAMPLE_REGIONS.length) * 2 * Math.PI + 0.5;
    const radius = 25 + (regionIndex % 3) * 12;
    const x = Math.round(50 + Math.cos(angle) * radius);
    const y = Math.round(50 + Math.sin(angle) * radius);

    const location: LocationPoint = {
      name: `${name.split(' ')[0]} Central Receiving`,
      region: selectedRegion,
      x: Math.max(10, Math.min(90, x)),
      y: Math.max(10, Math.min(90, y)),
    };

    const newBuyer: BuyerProfile = {
      id: `buyer-${Date.now().toString(36)}`,
      name: name.trim(),
      organizationType,
      contactPerson: contactPerson.trim() || 'Procurement Officer',
      phone: phone.trim() || '+1 (555) 000-0000',
      location,
      cropPreferences: acceptsAll ? ['*'] : selectedCrops,
      minQuantityKg: Number(minQuantityKg),
      maxQuantityKg: Number(maxQuantityKg),
      maxPricePerKg: Number(maxPricePerKg),
      maxDistanceKm: Number(maxDistanceKm),
      acceptsNearPeak,
      procurementUrgency,
      notes: notes.trim() || undefined,
    };

    onSubmit(newBuyer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-xl border border-[#DDD5C5]">
        {/* Header */}
        <div className="p-5 border-b border-[#EFECE4] flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1B4332] text-white flex items-center justify-center">
              <Building2 className="w-4 h-4 text-[#A7F3D0]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1B4332]">Register Buyer Profile</h2>
              <p className="text-xs text-[#787265]">
                Configure procurement criteria to receive automated surplus match alerts
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Org details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Organization / Company Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#DDD5C5] focus:outline-none focus:border-[#2D6A4F]"
                placeholder="e.g. Apex Cannery Works (Simulated)"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Organization Type
              </label>
              <select
                value={organizationType}
                onChange={e => setOrganizationType(e.target.value as BuyerType)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#DDD5C5] focus:outline-none focus:border-[#2D6A4F] bg-white"
              >
                <option value="Food Processing & Canning">Food Processing & Canning</option>
                <option value="Supermarket / Grocery Chain">Supermarket / Grocery Chain</option>
                <option value="Food Bank & Relief Org">Food Bank & Relief Org</option>
                <option value="Wholesale Produce Aggregator">Wholesale Produce Aggregator</option>
                <option value="Restaurant Cooperative">Restaurant Cooperative</option>
                <option value="Direct-to-Consumer Box Program">Direct-to-Consumer Box Program</option>
              </select>
            </div>
          </div>

          {/* Contact Person & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Procurement Contact Person
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={e => setContactPerson(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#DDD5C5] focus:outline-none focus:border-[#2D6A4F]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#DDD5C5] focus:outline-none focus:border-[#2D6A4F]"
              />
            </div>
          </div>

          {/* Location & Radius */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Receiving Hub / Region
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

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Max Transit Distance (km)
              </label>
              <input
                type="number"
                min="5"
                max="200"
                step="5"
                value={maxDistanceKm}
                onChange={e => setMaxDistanceKm(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#DDD5C5] focus:outline-none focus:border-[#2D6A4F]"
              />
            </div>
          </div>

          {/* Quantity Limits & Max Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Min Quantity (kg)
              </label>
              <input
                type="number"
                min="50"
                step="50"
                value={minQuantityKg}
                onChange={e => setMinQuantityKg(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#DDD5C5] focus:outline-none focus:border-[#2D6A4F]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Max Quantity (kg)
              </label>
              <input
                type="number"
                min="100"
                step="100"
                value={maxQuantityKg}
                onChange={e => setMaxQuantityKg(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#DDD5C5] focus:outline-none focus:border-[#2D6A4F]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Max Price per kg ($)
              </label>
              <input
                type="number"
                min="0.1"
                step="0.05"
                value={maxPricePerKg}
                onChange={e => setMaxPricePerKg(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-lg border border-[#DDD5C5] focus:outline-none focus:border-[#2D6A4F]"
              />
            </div>
          </div>

          {/* Crop Preferences */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#374151]">
                Crop Requirements & Preferences
              </label>
              <label className="flex items-center gap-1.5 text-xs text-[#2D6A4F] cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptsAll}
                  onChange={e => setAcceptsAll(e.target.checked)}
                  className="rounded text-[#2D6A4F]"
                />
                <span className="font-medium">Accept All Edible Crops</span>
              </label>
            </div>

            {!acceptsAll && (
              <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-[#FAF8F5] border border-[#DDD5C5]">
                {COMMON_CROPS.map(crop => {
                  const isSelected = selectedCrops.includes(crop);
                  return (
                    <button
                      type="button"
                      key={crop}
                      onClick={() => toggleCrop(crop)}
                      className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#2D6A4F] text-white border-[#2D6A4F]'
                          : 'bg-white text-[#4A453A] border-[#DDD5C5] hover:bg-gray-50'
                      }`}
                    >
                      {crop} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Additional Preferences */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <label className="flex items-center gap-2 p-3 rounded-lg border border-[#DDD5C5] bg-[#FAF8F5] cursor-pointer">
              <input
                type="checkbox"
                checked={acceptsNearPeak}
                onChange={e => setAcceptsNearPeak(e.target.checked)}
                className="rounded text-[#2D6A4F]"
              />
              <div>
                <div className="text-xs font-semibold text-[#374151]">Accept Near-Peak / Ripe</div>
                <div className="text-[11px] text-[#6B7280]">Can absorb soft or fully ripe produce for processing</div>
              </div>
            </label>

            <div className="p-3 rounded-lg border border-[#DDD5C5] bg-[#FAF8F5]">
              <div className="text-xs font-semibold text-[#374151] mb-1">Procurement Urgency</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setProcurementUrgency('immediate')}
                  className={`flex-1 py-1 px-2 text-xs rounded font-medium cursor-pointer ${
                    procurementUrgency === 'immediate'
                      ? 'bg-[#2D6A4F] text-white'
                      : 'bg-white text-[#4A453A] border border-[#DDD5C5]'
                  }`}
                >
                  Immediate Rescue
                </button>
                <button
                  type="button"
                  onClick={() => setProcurementUrgency('flexible')}
                  className={`flex-1 py-1 px-2 text-xs rounded font-medium cursor-pointer ${
                    procurementUrgency === 'flexible'
                      ? 'bg-[#2D6A4F] text-white'
                      : 'bg-white text-[#4A453A] border border-[#DDD5C5]'
                  }`}
                >
                  Flexible Weekly
                </button>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">
              Dock Hours & Receiving Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-[#DDD5C5] focus:outline-none focus:border-[#2D6A4F]"
            />
          </div>

          {/* Buttons */}
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
              Register Buyer Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
