import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PlaceCard } from '../components/cards/PlaceCards';
import {
  ChevronLeft,
  Settings,
  Heart,
  Briefcase,
  MapPin,
  Sparkles,
  ShieldCheck,
  Compass,
  Award,
  LogOut,
  Edit2,
  ChevronRight,
  RefreshCw,
  Navigation,
  Check,
  X,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const {
    goBack,
    navigate,
    user,
    savedPlaceIds,
    showToast,
    logoutUser,
    firebaseUser,
    currentLocation,
    isLocating,
    detectAndSyncUserLocation,
    updateUserProfile,
  } = useApp();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditLocationModal, setShowEditLocationModal] = useState(false);
  const [customLocationInput, setCustomLocationInput] = useState('');

  // Automatically trigger location detection on profile mount if needed
  useEffect(() => {
    if (!user.location || user.location === 'Detecting Location...' || user.location === 'Varanasi, India') {
      detectAndSyncUserLocation(false);
    }
  }, []);

  // Format accurate join date
  const getFormattedJoinedDate = () => {
    const rawDate = user.joinedDate || user.createdAt;
    if (!rawDate) return 'Member since Sep 2026';
    try {
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return 'Member since Sep 2026';
      return `Member since ${d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
    } catch {
      return 'Member since Sep 2026';
    }
  };

  // Determine current active location string
  const activeLocation =
    user?.location && user.location !== 'Detecting Location...'
      ? user.location
      : currentLocation?.locality && currentLocation.locality !== 'Assi Ghat'
      ? currentLocation.city && !currentLocation.locality.includes(currentLocation.city)
        ? `${currentLocation.locality}, ${currentLocation.city}`
        : currentLocation.locality
      : currentLocation?.city
      ? `${currentLocation.locality || currentLocation.city}, ${currentLocation.city}`
      : 'Detecting Location...';

  const handleSaveCustomLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customLocationInput.trim();
    if (!clean) return;
    await updateUserProfile({
      location: clean,
      homeCity: clean,
    });
    setShowEditLocationModal(false);
    setCustomLocationInput('');
  };

  return (
    <div className="min-h-screen bg-white pb-28 md:pb-16 max-w-2xl mx-auto px-4 pt-4">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2 border-b border-gray-100 mb-6">
        <button
          onClick={goBack}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft size={24} />
        </button>

        <span className="text-xs sm:text-sm font-bold tracking-wider text-gray-900 uppercase">
          04. USER PROFILE
        </span>

        <button
          onClick={() => showToast('Profile settings saved')}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Settings"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* User Info Header Card */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 rounded-3xl bg-[#F8FAF9] border border-gray-200 shadow-2xs text-center sm:text-left">
        <div className="relative">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-[#005B49] shadow-sm"
          />
          <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs shadow-sm font-bold">
            ✓
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-950">
                {user.name}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                {user.email}
              </p>
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-[#005B49] text-xs font-bold border border-emerald-200">
              {user.role}
            </span>
          </div>

          {/* Dynamic Location & Join Date Row */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3 text-xs text-gray-600">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-gray-200 shadow-2xs">
              <MapPin size={13} className="text-[#005B49] shrink-0" />
              <span className="font-semibold text-gray-900">{activeLocation}</span>
            </div>
            <span className="text-gray-400">•</span>
            <span className="font-medium text-gray-600">{getFormattedJoinedDate()}</span>
          </div>

          {/* Live Location Actions */}
          <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <button
              onClick={() => detectAndSyncUserLocation(true)}
              disabled={isLocating}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#005B49] text-white text-xs font-semibold hover:bg-[#004739] transition-all cursor-pointer shadow-2xs disabled:opacity-75"
              title="Detect your current location"
            >
              {isLocating ? (
                <>
                  <RefreshCw size={12} className="animate-spin" />
                  <span>Detecting GPS...</span>
                </>
              ) : (
                <>
                  <Navigation size={12} />
                  <span>Detect My Location</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setCustomLocationInput(activeLocation !== 'Detecting Location...' ? activeLocation : '');
                setShowEditLocationModal(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Edit2 size={11} className="text-gray-500" />
              <span>Edit Location</span>
            </button>
          </div>

          <div className="mt-2.5 flex items-center justify-center sm:justify-start gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
              <ShieldCheck size={12} className="text-emerald-600" />
              <span>{firebaseUser ? (firebaseUser.isAnonymous ? 'Guest Cloud Session' : `Firebase: ${firebaseUser.email}`) : 'Verified Cloud Session'}</span>
            </span>
            {currentLocation.isLiveGps && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                <span>Live GPS (±{currentLocation.accuracy}m)</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Travel Impact & Metrics Banner */}
      <div className="mt-5 p-5 rounded-3xl bg-[#005B49] text-white shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={18} className="text-amber-300" />
          <h2 className="font-bold text-sm sm:text-base tracking-tight">
            Local Tourism Impact
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
          Your travel footprint directly supports local artisans, authentic regional food culture, and sustainable community heritage.
        </p>

        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/15 text-center">
          <div>
            <span className="block text-xl font-extrabold text-amber-300">4</span>
            <span className="text-[11px] text-emerald-100">Trips Planned</span>
          </div>
          <div>
            <span className="block text-xl font-extrabold text-amber-300">18</span>
            <span className="text-[11px] text-emerald-100">Gems Visited</span>
          </div>
          <div>
            <span className="block text-xl font-extrabold text-amber-300">850</span>
            <span className="text-[11px] text-emerald-100">Impact Points</span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Links */}
      <div className="mt-6 space-y-2.5">
        <button
          onClick={() => navigate('/saved')}
          className="w-full p-4 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart size={20} />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-gray-900">Saved Places</h3>
              <p className="text-xs text-gray-500">{savedPlaceIds.length} places in your collection</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </button>

        <button
          onClick={() => navigate('/trip/trip-varanasi-3day')}
          className="w-full p-4 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#005B49] flex items-center justify-center">
              <Compass size={20} />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-gray-900">Active Varanasi Itinerary</h3>
              <p className="text-xs text-gray-500">Day 1 underway • 4 stops scheduled</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </button>

        <button
          onClick={() => navigate('/plan')}
          className="w-full p-4 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-gray-900">Plan a New Journey</h3>
              <p className="text-xs text-gray-500">Customize days, budget and travel vibe</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </button>
      </div>

      {/* Travel Preferences Section */}
      <div className="mt-8">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
          Travel Preferences
        </h2>
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3 text-xs sm:text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Preferred Pace</span>
            <span className="font-semibold text-gray-800">{user?.preferences?.pace || 'Balanced'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Dietary Habits</span>
            <span className="font-semibold text-gray-800">
              {Array.isArray(user?.preferences?.dietary) && user.preferences.dietary.length > 0
                ? user.preferences.dietary.join(', ')
                : 'Local Street Food, Pure Vegetarian'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Accommodation Vibe</span>
            <span className="font-semibold text-gray-800">{user?.preferences?.stayVibe || 'Heritage Haveli'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Local Transport</span>
            <span className="font-semibold text-gray-800">{user?.preferences?.transportStyle || 'Walking & Rickshaw'}</span>
          </div>
        </div>
      </div>

      {/* Logout button */}
      <div className="mt-8 pt-4 border-t border-gray-100">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full py-3.5 rounded-2xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>

      {/* Logout confirmation dialog */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Logout</h3>
            <p className="text-xs text-gray-500 mb-6">
              Are you sure you want to log out of SeizeOn Trip?
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={async () => {
                  setShowLogoutModal(false);
                  await logoutUser();
                }}
                className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold text-xs cursor-pointer hover:bg-rose-700"
              >
                Log Out
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Location Dialog */}
      {showEditLocationModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#005B49] flex items-center justify-center">
                  <MapPin size={16} />
                </div>
                <h3 className="text-base font-bold text-gray-900">Your Base Location</h3>
              </div>
              <button
                onClick={() => setShowEditLocationModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              Set or edit your current base location. This is used for personalized recommendations, local travel tips, and weather.
            </p>

            <form onSubmit={handleSaveCustomLocation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Location or City Name
                </label>
                <input
                  type="text"
                  value={customLocationInput}
                  onChange={(e) => setCustomLocationInput(e.target.value)}
                  placeholder="e.g. Mumbai, Maharashtra or New Delhi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#005B49] focus:border-transparent"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    setShowEditLocationModal(false);
                    await detectAndSyncUserLocation(true);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-[#005B49] font-bold text-xs hover:bg-emerald-100 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Navigation size={13} />
                  <span>Auto-Detect</span>
                </button>
                <button
                  type="submit"
                  disabled={!customLocationInput.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-[#005B49] text-white font-bold text-xs hover:bg-[#004739] disabled:opacity-50 cursor-pointer"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const SavedPlacesPage: React.FC = () => {
  const { goBack, navigate, places, savedPlaceIds } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const savedPlaces = places.filter((p) => savedPlaceIds.includes(p.id));

  const filteredPlaces = savedPlaces.filter((p) => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  return (
    <div className="min-h-screen bg-white pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between py-2 border-b border-gray-100 mb-6">
        <button
          onClick={goBack}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft size={24} />
        </button>

        <span className="text-xs sm:text-sm font-bold tracking-wider text-gray-900 uppercase">
          SAVED COLLECTION
        </span>

        <div className="w-10" />
      </div>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#005B49] tracking-tight">
          Your Saved Places
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          {savedPlaces.length} authentic spots bookmarked for your trip
        </p>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: `All (${savedPlaces.length})` },
          { id: 'food', label: 'Food' },
          { id: 'attraction', label: 'Attractions' },
          { id: 'shopping', label: 'Shopping' },
          { id: 'stay', label: 'Stays' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all ${
              activeCategory === tab.id
                ? 'bg-[#005B49] text-white border-[#005B49]'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredPlaces.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-200">
          <Heart size={36} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 text-sm font-medium">No saved places in this category.</p>
          <button
            onClick={() => navigate('/explore')}
            className="mt-4 px-5 py-2.5 rounded-xl bg-[#005B49] text-white font-bold text-xs hover:bg-[#004739] cursor-pointer"
          >
            Explore Local Spots
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPlaces.map((place) => (
            <PlaceCard key={place.id} place={place} variant="vertical" />
          ))}
        </div>
      )}
    </div>
  );
};
