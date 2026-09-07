import React, { useState } from 'react';
import {
  Banknote,
  Ticket,
  Footprints,
  Car,
  Bus,
  Train,
  Plane,
  Ship,
  Navigation,
  Check,
  Info,
  CreditCard,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Coins,
  ReceiptText,
} from 'lucide-react';
import { Place } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  calculateTravelExpenses,
  calculateWholePlaceExpenses,
  TravelExpenseOption,
} from '../../utils/travelExpenses';
import { DirectionsModal } from '../common/DirectionsModal';

interface PlaceExpenseComparisonCardProps {
  place: Place;
  className?: string;
  onOpenDirections?: () => void;
}

export const PlaceExpenseComparisonCard: React.FC<PlaceExpenseComparisonCardProps> = ({
  place,
  className = '',
  onOpenDirections,
}) => {
  const { currentLocation, calculateDistanceTo } = useApp();
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);

  // Compute live distance
  const distInfo = calculateDistanceTo(place.coordinates);
  const distanceKm = place.distanceKm ?? distInfo.distanceKm;

  // Compute whole place expenses
  const expenseSummary = calculateWholePlaceExpenses(place, distanceKm);
  const options = expenseSummary.travel.options;

  // Active selected travel mode
  const [selectedModeId, setSelectedModeId] = useState<string>(
    expenseSummary.travel.recommendedMode?.id || options[0]?.id || 'auto'
  );

  const selectedTravelOption =
    options.find((o) => o.id === selectedModeId) || options[0];

  // Dynamic calculated whole trip expense based on selected travel mode
  const visitCost = expenseSummary.visit.amount;
  const travelMin = selectedTravelOption ? selectedTravelOption.minPrice : 0;
  const travelMax = selectedTravelOption ? selectedTravelOption.maxPrice : 0;

  const totalMin = visitCost + travelMin;
  const totalMax = visitCost + travelMax;
  const isCompletelyFree = totalMin === 0 && totalMax === 0;

  const totalDisplay = isCompletelyFree
    ? '₹0 (Completely Free)'
    : totalMin === totalMax
    ? `₹${totalMin.toLocaleString()}`
    : `₹${totalMin.toLocaleString()} – ₹${totalMax.toLocaleString()}`;

  const getModeIcon = (mode: TravelExpenseOption['mode'], size = 18) => {
    switch (mode) {
      case 'walk':
        return <Footprints size={size} className="text-emerald-700" />;
      case 'boat':
        return <Ship size={size} className="text-sky-600" />;
      case 'shared_auto':
        return <Bus size={size} className="text-amber-600" />;
      case 'auto':
        return <Car size={size} className="text-amber-700" />;
      case 'cab':
        return <Car size={size} className="text-purple-700" />;
      case 'bus':
        return <Bus size={size} className="text-blue-700" />;
      case 'train':
        return <Train size={size} className="text-indigo-700" />;
      case 'flight':
        return <Plane size={size} className="text-sky-700" />;
      default:
        return <Navigation size={size} className="text-emerald-700" />;
    }
  };

  return (
    <div
      id="place-expenses-breakdown-container"
      className={`rounded-3xl bg-white border border-gray-100 shadow-xs p-5 sm:p-6 ${className}`}
    >
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100 mb-5">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-black text-[#005B49] uppercase tracking-wider mb-1">
            <ReceiptText size={15} />
            <span>Complete Trip Cost Analysis</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-gray-950 tracking-tight">
            Travel & Visit Expenses
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Clear separation between destination visit fees and transit fares from your live location
          </p>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#005B49] font-bold text-xs border border-emerald-200/80">
            <Navigation size={12} />
            <span>{place.distance || distInfo.formatted}</span>
          </span>
          <span className="text-[11px] text-gray-400">
            Origin: {currentLocation.locality || 'Current Location'}
          </span>
        </div>
      </div>

      {/* 2. Highlight Banner: Combined Whole Trip Outlay */}
      <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#005B49] to-[#004739] text-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-1">
              <Coins size={14} />
              <span>Whole Estimated Outlay (Visit + Travel)</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-baseline gap-2">
              <span>{totalDisplay}</span>
              <span className="text-xs sm:text-sm font-normal text-emerald-100/80">
                per person
              </span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-3 border border-white/15 text-xs">
            <div className="font-bold text-emerald-100 mb-1 flex items-center gap-1.5">
              <span>Expense Equation:</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap text-white font-medium text-[13px]">
              <span className="px-2 py-0.5 rounded-md bg-white/20 text-emerald-100">
                🎟️ Visit: {expenseSummary.visit.formatted}
              </span>
              <span className="text-emerald-300 font-bold">+</span>
              <span className="px-2 py-0.5 rounded-md bg-white/20 text-emerald-100">
                🚗 Travel: {selectedTravelOption?.priceRange || '₹0'} ({selectedTravelOption?.modeLabel})
              </span>
              <span className="text-emerald-300 font-bold">=</span>
              <span className="font-extrabold text-amber-300">
                {totalDisplay}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Two Distinct Modules: Visit Expense vs. Travel Expense */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Module A: Visit Expense (Tickets, Darshan, Offerings, On-site) */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-emerald-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#005B49] flex items-center justify-center font-bold">
                  <Ticket size={17} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-gray-900">
                    Visit & Venue Expense
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Admission fees, tickets & activities
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-black text-sm sm:text-base text-emerald-900 block">
                  {expenseSummary.visit.formatted}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-100/70 inline-block">
                  {expenseSummary.visit.isFree ? 'Zero Entry Fee' : 'Ticketed Admission'}
                </span>
              </div>
            </div>

            {/* Visit breakdown items */}
            <div className="space-y-2.5 my-3">
              {expenseSummary.visit.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between p-2.5 rounded-xl bg-white border border-emerald-100/70 text-xs shadow-2xs"
                >
                  <div>
                    <span className="font-bold text-gray-900 block">{item.label}</span>
                    {item.note && (
                      <span className="text-[11px] text-gray-500 block mt-0.5">
                        {item.note}
                      </span>
                    )}
                  </div>
                  <span className="font-extrabold text-gray-900 shrink-0 ml-2">
                    {item.cost}
                  </span>
                </div>
              ))}

              {/* Stated entry fee policy */}
              <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-100/60 text-xs">
                <span className="text-gray-500 text-[11px] block">Published Fee Policy:</span>
                <span className="font-semibold text-gray-800 block mt-0.5">
                  {expenseSummary.visit.entryFeeText}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-emerald-100/70 flex items-center gap-2 text-[11px] text-emerald-800">
            <ShieldCheck size={14} className="shrink-0 text-[#005B49]" />
            <span>
              {expenseSummary.visit.isFree
                ? 'Free public access. Beware of touts offering unauthorized fast-track entry.'
                : 'Official tickets can be purchased at the venue counter or authorized desk.'}
            </span>
          </div>
        </div>

        {/* Module B: Travel Expense (Transit, Fares, Options by Mode) */}
        <div className="rounded-2xl border border-amber-100/90 bg-amber-50/30 p-4.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-amber-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Car size={17} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-gray-900">
                    Travel & Transit Expense
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Fares based on {distInfo.formatted} from you
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-black text-sm sm:text-base text-amber-950 block">
                  {selectedTravelOption?.priceRange}
                </span>
                <span className="text-[10px] font-bold text-amber-800 px-2 py-0.5 rounded-full bg-amber-100 inline-block">
                  {selectedTravelOption?.timeEstimate}
                </span>
              </div>
            </div>

            {/* Travel modes interactive selector */}
            <div className="space-y-2 my-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                Select your travel mode to recalculate total:
              </span>

              {options.slice(0, 5).map((opt) => {
                const isSelected = selectedModeId === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedModeId(opt.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#005B49] shadow-2xs ring-1 ring-[#005B49]'
                        : 'bg-white/70 border-amber-100/80 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                        {getModeIcon(opt.mode, 14)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-900 truncate">
                            {opt.modeLabel}
                          </span>
                          {opt.isRecommended && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-sm bg-[#005B49] text-white">
                              Recommended
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-500 block truncate">
                          {opt.timeEstimate}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-2">
                      <div>
                        <span className="font-extrabold text-xs sm:text-sm text-gray-950 block">
                          {opt.priceRange}
                        </span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-[#005B49] bg-[#005B49] text-white'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check size={10} strokeWidth={3} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-amber-100/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <CreditCard size={13} className="text-[#005B49]" />
              <span>UPI / QR accepted on almost all transit</span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onOpenDirections) {
                  onOpenDirections();
                } else {
                  setShowDirectionsModal(true);
                }
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#005B49] hover:bg-[#004739] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <Navigation size={12} />
              <span>Show Route</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>

      <DirectionsModal
        place={place}
        isOpen={showDirectionsModal}
        onClose={() => setShowDirectionsModal(false)}
      />
    </div>
  );
};
