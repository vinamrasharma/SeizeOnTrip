import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
  Share2,
  Edit3,
  Calendar,
  Wallet,
  User,
  MapPin,
  Clock,
  Lightbulb,
  Map,
  Sliders,
  ChevronRight,
  Sparkles,
  Check,
} from 'lucide-react';
import { ItineraryStop } from '../types';

export const ItineraryDetailPage: React.FC = () => {
  const { goBack, navigate, currentTrip, showToast } = useApp();
  const [activeDayNumber, setActiveDayNumber] = useState<number>(1);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);

  const activeDay =
    currentTrip.days.find((d) => d.dayNumber === activeDayNumber) || currentTrip.days[0];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentTrip.title,
        text: `Check out my ${currentTrip.title} on SeizeOn Trip!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Itinerary link copied to clipboard!');
    }
  };

  const getStopIcon = (category: string) => {
    switch (category) {
      case 'Ghats & Rivers':
      case 'experience':
        return '🛶';
      case 'Local Food':
      case 'food':
        return '🍲';
      case 'Artisans':
      case 'shopping':
        return '🧵';
      case 'Cultural Event':
      case 'attraction':
        return '🪔';
      default:
        return '📍';
    }
  };

  return (
    <div className="min-h-screen bg-white pb-28 md:pb-16 max-w-2xl mx-auto px-4 pt-3">
      {/* Top Header Bar (matches 10.png) */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md py-2 flex items-center justify-between border-b border-gray-100">
        <button
          onClick={goBack}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft size={24} />
        </button>

        <span className="text-xs sm:text-sm font-bold tracking-wider text-gray-900 uppercase">
          03. ITINERARY
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Share Itinerary"
          >
            <Share2 size={18} />
          </button>
          <button
            onClick={() => setShowCustomizeModal(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Edit Itinerary"
          >
            <Edit3 size={18} />
          </button>
        </div>
      </div>

      {/* Hero Overview Card (matches 10.png) */}
      <div className="mt-4 p-5 rounded-3xl bg-[#F8FAF9] border border-gray-200/80 shadow-2xs">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
          {currentTrip.title}
        </h1>
        <p className="text-sm font-medium text-gray-600 mt-1">
          {currentTrip.subtitle}
        </p>

        {/* Badges row: 3 Days, Moderate, Solo (matches 10.png) */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-800 shadow-2xs">
            <Calendar size={13} className="text-[#005B49]" />
            <span>{currentTrip.totalDays} Days</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-800 shadow-2xs">
            <Wallet size={13} className="text-[#005B49]" />
            <span>{currentTrip.budgetTier}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-800 shadow-2xs">
            <User size={13} className="text-[#005B49]" />
            <span>{currentTrip.travellingAs}</span>
          </div>
        </div>
      </div>

      {/* Day Selector Tabs (matches 10.png) */}
      <div className="flex items-center gap-2.5 mt-6 mb-5 overflow-x-auto no-scrollbar">
        {currentTrip.days.map((day) => {
          const isActive = day.dayNumber === activeDayNumber;
          return (
            <button
              key={day.dayNumber}
              onClick={() => setActiveDayNumber(day.dayNumber)}
              className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#005B49] text-white shadow-xs'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Day {day.dayNumber}
            </button>
          );
        })}
      </div>

      {/* Active Day Title (matches 10.png) */}
      <div className="mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
          Day {activeDay.dayNumber} — {activeDay.theme}
        </h2>
      </div>

      {/* Vertical Timeline Items with Connecting Lines (matches 10.png) */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-emerald-200/80">
        {activeDay.stops.map((stop, index) => {
          return (
            <div
              key={stop.id}
              onClick={() => {
                if (stop.placeId === 'shiv-handloom-studio') {
                  navigate(`/business/${stop.placeId}`);
                } else if (stop.placeId) {
                  navigate(`/place/${stop.placeId}`);
                }
              }}
              className="relative group cursor-pointer"
            >
              {/* Timeline marker icon bullet */}
              <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-[#005B49] text-white flex items-center justify-center text-[10px] font-bold ring-4 ring-white shadow-xs">
                {index + 1}
              </div>

              {/* Stop Card */}
              <div className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-2xs hover:shadow-md hover:border-gray-300 transition-all">
                {/* Time & Duration Header */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                  <div className="flex items-center gap-1 font-semibold text-[#005B49]">
                    <Clock size={12} />
                    <span>{stop.time}</span>
                  </div>
                  <span>{stop.duration}</span>
                </div>

                {/* Place Name and Category */}
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-[#005B49] transition-colors">
                    {stop.name}
                  </h3>
                  <span className="text-xs text-gray-500 font-medium shrink-0">
                    {stop.category}
                  </span>
                </div>

                {/* Sub-description note */}
                <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                  {stop.description}
                </p>

                {/* Subtle View Detail indicator */}
                <div className="flex items-center gap-1 text-[11px] font-semibold text-[#005B49] mt-2 group-hover:underline">
                  <span>View place details</span>
                  <ChevronRight size={12} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Local Tip Box (matches 10.png) */}
      <div className="mt-8 p-4 rounded-2xl bg-[#FFFBEB] border border-amber-200/80 flex items-start gap-3 shadow-2xs">
        <div className="p-1.5 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
          <Lightbulb size={18} />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block mb-0.5">
            Local Tip
          </span>
          <p className="text-xs sm:text-sm text-amber-950 leading-relaxed">
            {activeDay.localTip ||
              'Take a walking tour of the alleys between Assi and Dashashwamedh for the best street food and hidden shrine courtyards.'}
          </p>
        </div>
      </div>

      {/* Sticky Bottom Actions (matches 10.png) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/90 px-4 py-3 safe-area-pb">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          {/* View on Map Secondary Button */}
          <button
            id="itinerary-map-btn"
            onClick={() => navigate('/trip/trip-varanasi-3day/map')}
            className="flex-1 py-3.5 px-4 rounded-2xl border-2 border-[#005B49] text-[#005B49] hover:bg-[#005B49]/5 font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
          >
            <Map size={18} />
            <span>View on Map</span>
          </button>

          {/* Customize Primary Button */}
          <button
            id="itinerary-customize-btn"
            onClick={() => setShowCustomizeModal(true)}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-[#005B49] hover:bg-[#004739] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] shadow-md"
          >
            <Sliders size={18} />
            <span>Customize</span>
          </button>
        </div>
      </div>

      {/* Customize Modal */}
      {showCustomizeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in slide-in-from-bottom-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Customize Itinerary</h3>
            <p className="text-xs text-gray-500 mb-4">
              Add or remove stops from Day {activeDay.dayNumber} or adjust schedule pace.
            </p>
            <div className="space-y-3 mb-6">
              <button
                onClick={() => {
                  showToast('Pace updated to Relaxed (+30m between stops)');
                  setShowCustomizeModal(false);
                }}
                className="w-full p-3 rounded-2xl border border-gray-200 text-left hover:border-[#005B49] hover:bg-emerald-50/40 text-xs font-semibold"
              >
                🌿 Switch to Relaxed Pace (Fewer stops, more leisure)
              </button>
              <button
                onClick={() => {
                  showToast('Food walk stops highlighted');
                  setShowCustomizeModal(false);
                }}
                className="w-full p-3 rounded-2xl border border-gray-200 text-left hover:border-[#005B49] hover:bg-emerald-50/40 text-xs font-semibold"
              >
                🍲 Focus More on Street Food & Chai Stalls
              </button>
              <button
                onClick={() => {
                  showToast('Artisan and silk weaving workshops prioritized');
                  setShowCustomizeModal(false);
                }}
                className="w-full p-3 rounded-2xl border border-gray-200 text-left hover:border-[#005B49] hover:bg-emerald-50/40 text-xs font-semibold"
              >
                🧵 Add More Heritage Textile & Handloom Studios
              </button>
            </div>
            <button
              onClick={() => setShowCustomizeModal(false)}
              className="w-full py-3.5 rounded-2xl bg-[#005B49] text-white font-bold text-sm cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
