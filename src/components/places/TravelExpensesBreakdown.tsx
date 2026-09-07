import React, { useState } from 'react';
import {
  Footprints,
  Car,
  Bus,
  Train,
  Plane,
  Ship,
  Sparkles,
  ArrowRight,
  Info,
  Navigation,
  Check,
  TrendingUp,
  CreditCard,
  Banknote,
} from 'lucide-react';
import { Place } from '../../types';
import { useApp } from '../../context/AppContext';
import { calculateTravelExpenses, TravelExpenseOption } from '../../utils/travelExpenses';
import { DirectionsModal } from '../common/DirectionsModal';

interface TravelExpensesBreakdownProps {
  place: Place;
  className?: string;
  onOpenDirections?: () => void;
}

export const TravelExpensesBreakdown: React.FC<TravelExpensesBreakdownProps> = ({
  place,
  className = '',
  onOpenDirections,
}) => {
  const { currentLocation, calculateDistanceTo } = useApp();
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);

  // Compute live distance
  const distInfo = calculateDistanceTo(place.coordinates);
  const distanceKm = place.distanceKm ?? distInfo.distanceKm;

  // Calculate expense options
  const expenseOptions = calculateTravelExpenses(distanceKm, {
    name: place.name,
    location: place.location,
    tags: place.tags,
  });

  const getModeIcon = (mode: TravelExpenseOption['mode']) => {
    switch (mode) {
      case 'walk':
        return <Footprints size={18} className="text-emerald-700" />;
      case 'boat':
        return <Ship size={18} className="text-sky-600" />;
      case 'shared_auto':
        return <Bus size={18} className="text-amber-600" />;
      case 'auto':
        return <Car size={18} className="text-amber-700" />;
      case 'cab':
        return <Car size={18} className="text-purple-700" />;
      case 'bus':
        return <Bus size={18} className="text-blue-700" />;
      case 'train':
        return <Train size={18} className="text-indigo-700" />;
      case 'flight':
        return <Plane size={18} className="text-sky-700" />;
      default:
        return <Navigation size={18} className="text-emerald-700" />;
    }
  };

  const getTagBadgeClass = (color?: TravelExpenseOption['tagColor']) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'amber':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'purple':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'blue':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div
      id="travel-expenses-breakdown-card"
      className={`rounded-3xl bg-white border border-gray-100 shadow-xs p-5 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 mb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#005B49] uppercase tracking-wider mb-0.5">
            <Banknote size={14} />
            <span>Travel Expenses by Mode of Travel</span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-gray-950 tracking-tight">
            How to Reach & Estimated Fares
          </h3>
        </div>

        <div className="text-right">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-[#005B49] font-bold text-xs border border-emerald-200/60">
            <Navigation size={11} />
            <span>{place.distance || distInfo.formatted}</span>
          </span>
          <p className="text-[10px] text-gray-400 mt-0.5">
            From {currentLocation.locality || 'your location'}
          </p>
        </div>
      </div>

      {/* Options List */}
      <div className="space-y-3">
        {expenseOptions.map((opt) => (
          <div
            key={opt.id}
            className={`p-3.5 rounded-2xl border transition-all ${
              opt.isRecommended
                ? 'bg-emerald-50/40 border-emerald-200/90 shadow-2xs'
                : 'bg-gray-50/60 hover:bg-white border-gray-100'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              {/* Left icon and mode name */}
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  {getModeIcon(opt.mode)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-sm text-gray-900 leading-tight">
                      {opt.modeLabel}
                    </h4>
                    {opt.tag && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTagBadgeClass(
                          opt.tagColor
                        )}`}
                      >
                        {opt.tag}
                      </span>
                    )}
                    {opt.isRecommended && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#005B49] text-white">
                        Recommended
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                    {opt.description}
                  </p>
                </div>
              </div>

              {/* Right Fare and Duration */}
              <div className="text-right shrink-0">
                <div className="font-extrabold text-sm sm:text-base text-gray-950">
                  {opt.priceRange}
                </div>
                <div className="text-xs font-semibold text-emerald-800 mt-0.5">
                  {opt.timeEstimate}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Navigation Action */}
      <div className="mt-4 pt-3.5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <CreditCard size={14} className="text-emerald-700 shrink-0" />
          <span>UPI / QR payments accepted on 95% of autos, cabs & kiosks</span>
        </div>

        <button
          onClick={() => {
            if (onOpenDirections) {
              onOpenDirections();
            } else {
              setShowDirectionsModal(true);
            }
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#005B49] hover:bg-[#004739] text-white font-bold text-xs transition-all shadow-xs active:scale-[0.98] cursor-pointer"
        >
          <Navigation size={13} />
          <span>Show Route & Start GPS Navigation</span>
          <ArrowRight size={13} />
        </button>
      </div>

      <DirectionsModal
        place={place}
        isOpen={showDirectionsModal}
        onClose={() => setShowDirectionsModal(false)}
      />
    </div>
  );
};
