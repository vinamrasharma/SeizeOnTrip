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
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  X,
  Compass,
} from 'lucide-react';
import { ItineraryStop, TripDay } from '../types';

export const ItineraryDetailPage: React.FC = () => {
  const { goBack, navigate, currentTrip, setCurrentTrip, showToast } = useApp();
  const [activeDayNumber, setActiveDayNumber] = useState<number>(1);
  const [showCustomizeModal, setShowCustomizeModal] = useState<boolean>(false);
  const [editingStopId, setEditingStopId] = useState<string | null>(null);

  // Active Day
  const activeDay =
    currentTrip.days.find((d) => d.dayNumber === activeDayNumber) || currentTrip.days[0];

  // Temporary editing state for customization modal
  const [editableStops, setEditableStops] = useState<ItineraryStop[]>([]);
  const [editableLocalTip, setEditableLocalTip] = useState<string>('');
  const [editableDayTitle, setEditableDayTitle] = useState<string>('');

  // Open customize modal and initialize with current day data
  const handleOpenCustomize = (stopIdToFocus?: string) => {
    setEditableStops(JSON.parse(JSON.stringify(activeDay.stops)));
    setEditableLocalTip(
      activeDay.localTip ||
        'Take a walking tour of the alleys between Assi and Dashashwamedh for the best street food and hidden shrine courtyards.'
    );
    setEditableDayTitle(activeDay.title || `Day ${activeDay.dayNumber}`);
    setEditingStopId(stopIdToFocus || null);
    setShowCustomizeModal(true);
  };

  // Update a field on a specific stop during customization
  const handleStopFieldChange = (
    index: number,
    field: keyof ItineraryStop,
    value: string
  ) => {
    setEditableStops((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Add a new stop to the day
  const handleAddNewStop = () => {
    const newStop: ItineraryStop = {
      id: `custom-stop-${Date.now()}`,
      placeId: '',
      title: 'New Cultural Destination',
      locationName: currentTrip.destination || 'City Center',
      description: 'Custom stop added to personalized journey',
      time: '03:00 PM',
      duration: '1–2 hr',
      categoryLabel: 'Custom',
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
      priceLevel: 'Free',
    };
    setEditableStops((prev) => [...prev, newStop]);
    showToast('New stop added! Customize its timing and location.');
  };

  // Remove a stop
  const handleRemoveStop = (index: number) => {
    if (editableStops.length <= 1) {
      showToast('Each day requires at least one stop.');
      return;
    }
    setEditableStops((prev) => prev.filter((_, i) => i !== index));
  };

  // Move stop up/down
  const handleMoveStop = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === editableStops.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    setEditableStops((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  // Save changes into currentTrip (preserving local tips intact)
  const handleSaveCustomizations = () => {
    setCurrentTrip((prevTrip) => {
      const updatedDays = prevTrip.days.map((day) => {
        if (day.dayNumber === activeDayNumber) {
          return {
            ...day,
            title: editableDayTitle || day.title,
            stops: editableStops,
            // Crucial: preserve local tip strictly, never remove it!
            localTip: editableLocalTip || day.localTip,
          };
        }
        return day;
      });

      return {
        ...prevTrip,
        days: updatedDays,
      };
    });

    setShowCustomizeModal(false);
    showToast(`Day ${activeDayNumber} timings & route updated! Local tips preserved.`);
  };

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

  return (
    <div className="min-h-screen bg-white pb-32 md:pb-20 max-w-2xl mx-auto px-4 pt-3">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md py-2 flex items-center justify-between border-b border-gray-100">
        <button
          onClick={goBack}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft size={24} />
        </button>

        <span className="text-xs sm:text-sm font-bold tracking-wider text-gray-900 uppercase">
          03. ITINERARY & ROUTE
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
            onClick={() => handleOpenCustomize()}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#005B49] bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
            aria-label="Customize Schedule & Timings"
            title="Customize Timings & Places"
          >
            <Edit3 size={18} />
          </button>
        </div>
      </div>

      {/* Hero Overview Card */}
      <div className="mt-4 p-5 rounded-3xl bg-[#F8FAF9] border border-gray-200/80 shadow-2xs">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
              {currentTrip.title}
            </h1>
            <p className="text-sm font-medium text-gray-600 mt-1">
              {currentTrip.subtitle || `${currentTrip.destination} • Customized Local Itinerary`}
            </p>
          </div>
          <button
            onClick={() => handleOpenCustomize()}
            className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-[#005B49] hover:bg-emerald-50 flex items-center gap-1 shadow-2xs cursor-pointer shrink-0"
          >
            <Sliders size={13} />
            <span>Customize</span>
          </button>
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-800 shadow-2xs">
            <Calendar size={13} className="text-[#005B49]" />
            <span>{currentTrip.days.length} Days</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-800 shadow-2xs">
            <Wallet size={13} className="text-[#005B49]" />
            <span>{currentTrip.budgetTier || currentTrip.budget || 'Custom Budget'}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-800 shadow-2xs">
            <User size={13} className="text-[#005B49]" />
            <span>{currentTrip.travellingAs || 'Traveler'}</span>
          </div>
        </div>
      </div>

      {/* Day Selector Tabs */}
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

      {/* Active Day Title & Customize Shortcut */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Day {activeDay.dayNumber} — {activeDay.title}
          </h2>
          <span className="text-xs text-gray-500 font-medium">
            {activeDay.stops.length} scheduled visits • Tap any stop to view details or edit timings
          </span>
        </div>

        <button
          onClick={() => handleOpenCustomize()}
          className="text-xs font-bold text-[#005B49] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Edit3 size={13} />
          <span>Edit Times</span>
        </button>
      </div>

      {/* Vertical Timeline Items with Connecting Lines */}
      <div className="relative pl-6 sm:pl-8 space-y-5 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-emerald-200/80">
        {activeDay.stops.map((stop, index) => {
          return (
            <div key={stop.id} className="relative group">
              {/* Timeline marker icon bullet */}
              <div className="absolute -left-6 sm:-left-8 top-2 w-6 h-6 rounded-full bg-[#005B49] text-white flex items-center justify-center text-[10px] font-bold ring-4 ring-white shadow-xs">
                {index + 1}
              </div>

              {/* Stop Card */}
              <div className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all">
                {/* Time, Duration & Quick Time Edit Button */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-[#005B49] bg-emerald-50 px-2.5 py-0.5 rounded-md">
                    <Clock size={12} />
                    <span>{stop.time}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-500">{stop.duration}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCustomize(stop.id);
                      }}
                      className="p-1 rounded-md text-gray-400 hover:text-[#005B49] hover:bg-gray-100 transition-colors cursor-pointer"
                      title="Change timing of this visit"
                    >
                      <Edit3 size={13} />
                    </button>
                  </div>
                </div>

                {/* Place Name and Category */}
                <div
                  onClick={() => {
                    if (stop.placeId === 'shiv-handloom-studio') {
                      navigate(`/business/${stop.placeId}`);
                    } else if (stop.placeId) {
                      navigate(`/place/${stop.placeId}`);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-base font-extrabold text-gray-900 group-hover:text-[#005B49] transition-colors">
                      {stop.title}
                    </h3>
                    <span className="text-xs text-gray-500 font-medium shrink-0">
                      {stop.categoryLabel}
                    </span>
                  </div>

                  {/* Location subtitle */}
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <MapPin size={12} className="text-gray-400 shrink-0" />
                    <span className="truncate">{stop.locationName}</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed">
                    {stop.description}
                  </p>
                </div>

                {/* Card footer: Cost and details link */}
                <div className="flex items-center justify-between border-t border-gray-100 mt-3 pt-2 text-[11px]">
                  <span className="font-semibold text-emerald-800">
                    Est. {stop.costEstimate || stop.priceLevel || 'Free'}
                  </span>

                  <button
                    onClick={() => {
                      if (stop.placeId === 'shiv-handloom-studio') {
                        navigate(`/business/${stop.placeId}`);
                      } else if (stop.placeId) {
                        navigate(`/place/${stop.placeId}`);
                      }
                    }}
                    className="flex items-center gap-0.5 font-bold text-[#005B49] hover:underline cursor-pointer"
                  >
                    <span>Place info & timings</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Local Tip Box (Issue 5: Must never be removed upon changing time!) */}
      <div id="itinerary-local-tip-box" className="mt-8 p-4.5 rounded-3xl bg-linear-to-r from-[#FFFBEB] via-[#FEF3C7]/40 to-amber-50 border border-amber-300/80 flex items-start gap-3.5 shadow-2xs">
        <div className="p-2 rounded-2xl bg-amber-200/80 text-amber-900 shrink-0 mt-0.5 shadow-2xs">
          <Lightbulb size={20} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-900 block mb-0.5">
              Verified Local Tip (Always Preserved)
            </span>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full">
              Day {activeDay.dayNumber} Tip
            </span>
          </div>
          <p className="text-xs sm:text-sm text-amber-950 font-medium leading-relaxed mt-1">
            {activeDay.localTip ||
              'Take a walking tour of the alleys between Assi and Dashashwamedh for the best street food, hidden shrine courtyards, and avoid the main road traffic during sunset.'}
          </p>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/90 px-4 py-3 safe-area-pb">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          {/* View on Map Secondary Button */}
          <button
            id="itinerary-map-btn"
            onClick={() => navigate('/trip/trip-varanasi-3day/map')}
            className="flex-1 py-3.5 px-4 rounded-2xl border-2 border-[#005B49] text-[#005B49] hover:bg-[#005B49]/5 font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
          >
            <Map size={18} />
            <span>Interactive Map</span>
          </button>

          {/* Customize Primary Button */}
          <button
            id="itinerary-customize-btn"
            onClick={() => handleOpenCustomize()}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-[#005B49] hover:bg-[#004739] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] shadow-md"
          >
            <Sliders size={18} />
            <span>Customize Timings</span>
          </button>
        </div>
      </div>

      {/* Comprehensive Customization Modal (Issue 5) */}
      {showCustomizeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-gray-900">
                  Customize Day {activeDayNumber} Timings & Stops
                </h3>
                <p className="text-xs text-emerald-800 font-medium">
                  Adjust when & where to visit. Local tips are permanently preserved.
                </p>
              </div>
              <button
                onClick={() => setShowCustomizeModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Day Title Edit */}
            <div className="mb-4">
              <label className="block text-[11px] uppercase tracking-wider font-extrabold text-gray-500 mb-1">
                Day Theme Title
              </label>
              <input
                type="text"
                value={editableDayTitle}
                onChange={(e) => setEditableDayTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm font-bold rounded-xl border border-gray-200 focus:border-[#005B49] focus:outline-hidden"
              />
            </div>

            {/* Stops list with customizable timings */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 mb-4">
              <label className="block text-[11px] uppercase tracking-wider font-extrabold text-gray-500">
                Stops & Timings Sequence ({editableStops.length} stops)
              </label>

              {editableStops.map((stop, idx) => (
                <div
                  key={stop.id || idx}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    editingStopId === stop.id
                      ? 'bg-emerald-50/70 border-[#005B49] ring-1 ring-[#005B49]'
                      : 'bg-gray-50/70 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-5 h-5 rounded-full bg-[#005B49] text-white text-[10px] font-extrabold flex items-center justify-center">
                      {idx + 1}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveStop(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded-md text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
                        title="Move Earlier"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveStop(idx, 'down')}
                        disabled={idx === editableStops.length - 1}
                        className="p-1 rounded-md text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
                        title="Move Later"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveStop(idx)}
                        className="p-1 rounded-md text-rose-500 hover:bg-rose-50 cursor-pointer"
                        title="Remove Stop"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Destination Name */}
                  <div className="mb-2">
                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-0.5">
                      Where to visit
                    </label>
                    <input
                      type="text"
                      value={stop.title}
                      onChange={(e) => handleStopFieldChange(idx, 'title', e.target.value)}
                      placeholder="Place name"
                      className="w-full px-2.5 py-1.5 text-xs sm:text-sm font-bold text-gray-900 bg-white rounded-lg border border-gray-200 focus:outline-hidden focus:border-[#005B49]"
                    />
                  </div>

                  {/* Timing & Duration Row */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-500 mb-0.5 flex items-center gap-1">
                        <Clock size={11} className="text-[#005B49]" />
                        <span>Visit Time (When)</span>
                      </label>
                      <input
                        type="text"
                        value={stop.time}
                        onChange={(e) => handleStopFieldChange(idx, 'time', e.target.value)}
                        placeholder="e.g. 08:30 AM"
                        className="w-full px-2.5 py-1.5 text-xs font-bold text-emerald-900 bg-white rounded-lg border border-gray-200 focus:outline-hidden focus:border-[#005B49]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-500 mb-0.5">
                        Duration (How long)
                      </label>
                      <input
                        type="text"
                        value={stop.duration}
                        onChange={(e) => handleStopFieldChange(idx, 'duration', e.target.value)}
                        placeholder="e.g. 1.5 hr"
                        className="w-full px-2.5 py-1.5 text-xs font-bold text-gray-800 bg-white rounded-lg border border-gray-200 focus:outline-hidden focus:border-[#005B49]"
                      />
                    </div>
                  </div>

                  {/* Location Area */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-0.5">
                      Locality / Sub-Area
                    </label>
                    <input
                      type="text"
                      value={stop.locationName}
                      onChange={(e) => handleStopFieldChange(idx, 'locationName', e.target.value)}
                      placeholder="Location address or landmark"
                      className="w-full px-2.5 py-1.5 text-xs text-gray-700 bg-white rounded-lg border border-gray-200 focus:outline-hidden focus:border-[#005B49]"
                    />
                  </div>
                </div>
              ))}

              {/* Add Stop Button */}
              <button
                type="button"
                onClick={handleAddNewStop}
                className="w-full py-2.5 rounded-xl border border-dashed border-[#005B49] text-[#005B49] hover:bg-emerald-50 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                <span>+ Add Another Stop to Day {activeDayNumber}</span>
              </button>

              {/* Local Tip Preservation Section */}
              <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 mt-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Lightbulb size={14} className="text-amber-800" />
                  <label className="text-[11px] uppercase tracking-wider font-extrabold text-amber-900">
                    Local Tip (Protected & Preserved)
                  </label>
                </div>
                <textarea
                  rows={2}
                  value={editableLocalTip}
                  onChange={(e) => setEditableLocalTip(e.target.value)}
                  placeholder="Local insider advice for this day's route..."
                  className="w-full p-2 text-xs font-medium text-amber-950 bg-white/90 rounded-xl border border-amber-200 focus:outline-hidden focus:border-amber-400"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowCustomizeModal(false)}
                className="px-4 py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCustomizations}
                className="flex-1 py-3 px-4 rounded-xl bg-[#005B49] hover:bg-[#004739] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Save size={15} />
                <span>Save Timings & Route</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
