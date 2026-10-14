import React, { useState } from 'react';
import { AcceptedDispatch } from '../types';
import { X, CheckCircle, Printer, Copy, Check, FileText, Truck, ShieldCheck } from 'lucide-react';

interface DispatchManifestModalProps {
  dispatch: AcceptedDispatch | null;
  onClose: () => void;
}

export const DispatchManifestModal: React.FC<DispatchManifestModalProps> = ({
  dispatch,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!dispatch) return null;

  const handleCopySummary = () => {
    const text = `=== HARVESTBRIDGE AI DISPATCH MANIFEST ===
Manifest ID: ${dispatch.id}
Date & Time: ${new Date(dispatch.timestamp).toLocaleString()}
Crop: ${dispatch.cropName} (${dispatch.quantityKg.toLocaleString()} kg)
Agreed Price: $${dispatch.agreedPricePerKg.toFixed(2)}/kg (Total: $${dispatch.totalValue.toLocaleString()})
Producer: ${dispatch.farmName} (${dispatch.farmerName})
Buyer: ${dispatch.buyerName} (${dispatch.buyerType})
Transit Distance: ${dispatch.distanceKm} km
Pickup Window Deadline: ${dispatch.pickupDeadline}
Status: Contracted & Scheduled for Transit
=========================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#DDD5C5]">
        {/* Header */}
        <div className="p-5 border-b border-[#EFECE4] flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2D6A4F] text-white flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#A7F3D0]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1B4332]">Produce Dispatch Manifest</h2>
              <p className="text-xs text-[#787265]">
                Official digital handover note & transit contract
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

        {/* Manifest Body Styled as Document */}
        <div className="p-6 space-y-5 bg-[#FCFBF7]">
          {/* Top Document Header */}
          <div className="border border-[#E0D9CB] bg-white p-4 rounded-xl shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE4]">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#2D6A4F]">
                  Manifest Document
                </span>
                <div className="text-sm font-bold text-[#1B4332] font-mono">{dispatch.id}</div>
              </div>
              <div className="text-right text-xs text-[#706A5E]">
                <div>Issued: {new Date(dispatch.timestamp).toLocaleDateString()}</div>
                <div className="font-semibold text-emerald-700 flex items-center gap-1 justify-end">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Contract Validated</span>
                </div>
              </div>
            </div>

            {/* Parties Table */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-[#FAF8F5] rounded-lg border border-[#EDE7DC]">
                <div className="text-[10px] text-[#6B7280] uppercase font-semibold">Origin Farm</div>
                <div className="font-bold text-[#1B4332] mt-0.5">{dispatch.farmName}</div>
                <div className="text-[#555]">{dispatch.farmerName}</div>
              </div>
              <div className="p-2.5 bg-[#FAF8F5] rounded-lg border border-[#EDE7DC]">
                <div className="text-[10px] text-[#6B7280] uppercase font-semibold">Destination Buyer</div>
                <div className="font-bold text-[#1B4332] mt-0.5">{dispatch.buyerName}</div>
                <div className="text-[#555]">{dispatch.buyerType}</div>
              </div>
            </div>

            {/* Produce & Financials */}
            <div className="border-t border-[#F0ECE4] pt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="text-[10px] text-[#706A5E]">Contract Volume</div>
                <div className="text-base font-bold text-[#1B4332]">
                  {dispatch.quantityKg.toLocaleString()} <span className="text-xs font-normal">kg</span>
                </div>
                <div className="text-[10px] text-[#2D6A4F]">{dispatch.cropName}</div>
              </div>

              <div>
                <div className="text-[10px] text-[#706A5E]">Settlement Rate</div>
                <div className="text-base font-bold text-[#1B4332]">
                  ${dispatch.agreedPricePerKg.toFixed(2)} <span className="text-xs font-normal">/ kg</span>
                </div>
                <div className="text-[10px] text-[#706A5E]">Agreed Price</div>
              </div>

              <div>
                <div className="text-[10px] text-[#706A5E]">Total Gross Value</div>
                <div className="text-base font-bold text-[#2D6A4F]">
                  ${dispatch.totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <div className="text-[10px] text-emerald-700">Salvaged Value</div>
              </div>
            </div>
          </div>

          {/* Logistics Handling Directives */}
          <div className="bg-white border border-[#E0D9CB] p-4 rounded-xl text-xs space-y-2">
            <div className="font-bold text-[#1B4332] flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#2D6A4F]" />
              <span>Transit & Quality Preservation Instructions</span>
            </div>
            <ul className="space-y-1 text-[#4A453A] pl-1">
              <li>
                <strong>Estimated Transit Distance:</strong> {dispatch.distanceKm} km direct regional route.
              </li>
              <li>
                <strong>Pickup / Receiving Deadline:</strong> {dispatch.pickupDeadline} (prioritize within cold storage buffer).
              </li>
              <li>
                <strong>Spoilage Urgency at Match:</strong> <span className="capitalize">{dispatch.urgencyAtDispatch}</span> tier priority.
              </li>
              <li>
                <strong>Driver Protocol:</strong> Inspect crating seal upon departure; confirm temperature-regulated tarping.
              </li>
            </ul>
          </div>

          {/* Stamp & Verification */}
          <div className="flex items-center justify-between p-3 bg-[#E8F0EA] rounded-xl border border-[#C5DAC9] text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#2D6A4F]" />
              <div>
                <div className="font-bold text-[#1B4332]">HarvestBridge Verified Match</div>
                <div className="text-[11px] text-[#4A6452]">Simulated algorithmic escrow & logistics clearance</div>
              </div>
            </div>
            <div className="text-right text-[10px] text-[#4A6452] font-mono">
              AUTH-OK-2026
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-[#EFECE4] flex items-center justify-between gap-3">
          <button
            onClick={handleCopySummary}
            className="px-3.5 py-2 text-xs font-semibold text-[#2D6A4F] hover:bg-[#FAF8F5] border border-[#DDD5C5] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Manifest</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm cursor-pointer ml-auto"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
