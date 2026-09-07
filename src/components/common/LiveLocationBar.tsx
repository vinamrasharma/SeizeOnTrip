import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MapPin,
  Navigation,
  Crosshair,
  ChevronDown,
  X,
  Compass,
  Check,
  AlertCircle,
  Search,
  Loader2,
  Wind,
  Info,
  Clock,
  Ship,
  Car,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { VaranasiLocality, LocationSearchResult } from '../../types';

interface LiveLocationBarProps {
  compact?: boolean;
  className?: string;
  onSelectLocality?: () => void;
}

export const LiveLocationBar: React.FC<LiveLocationBarProps> = ({
  compact = false,
  className = '',
  onSelectLocality,
}) => {
  const {
    currentLocation,
    isLocating,
    locationError,
    localities,
    fetchLiveLocation,
    selectLocality,
    setCustomLocation,
    searchLocations,
    airQuality,
    culturalGuide,
    showToast,
  } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<'search' | 'localities' | 'tariffs'>('search');

  const handleLocalityPick = (loc: VaranasiLocality) => {
    selectLocality(loc);
    setShowModal(false);
    if (onSelectLocality) onSelectLocality();
  };

  const handleCustomPlaceSelect = (place: LocationSearchResult) => {
    setCustomLocation({
      name: place.name,
      locality: place.locality,
      coordinates: place.coordinates,
      formattedAddress: place.formattedAddress,
      source: place.source,
    });
    setShowModal(false);
    if (onSelectLocality) onSelectLocality();
  };

  const handleDetectGPS = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await fetchLiveLocation();
  };

  if (compact) {
    return (
      <>
        <div
          id="compact-location-bar"
          onClick={() => {
            setModalTab('search');
            setShowModal(true);
          }}
          className={`group flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100/80 text-[#005B49] text-xs font-semibold border border-emerald-200/70 transition-all cursor-pointer shadow-2xs ${className}`}
          title="Click to write your location, search nearby places, or detect GPS"
        >
          <div className="relative flex items-center justify-center">
            {currentLocation.isLiveGps ? (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
            ) : (
              <MapPin size={13} className="text-[#005B49]" />
            )}
          </div>
          <span className="truncate max-w-[130px] sm:max-w-[190px]">
            {currentLocation.locality}
          </span>
          <ChevronDown size={12} className="text-emerald-700 opacity-70 group-hover:opacity-100 transition-opacity" />
        </div>

        {showModal && (
          <LocalitySearchModal
            initialTab={modalTab}
            currentLocation={currentLocation}
            localities={localities}
            isLocating={isLocating}
            airQuality={airQuality}
            culturalGuide={culturalGuide}
            onClose={() => setShowModal(false)}
            onSelectLocality={handleLocalityPick}
            onSelectCustomPlace={handleCustomPlaceSelect}
            onDetectGPS={handleDetectGPS}
            searchLocations={searchLocations}
            setCustomLocation={setCustomLocation}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div
        id="live-location-banner"
        className={`w-full rounded-2xl bg-white border border-emerald-100/90 p-3.5 sm:p-4 shadow-xs transition-all ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Active Locality & Status */}
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                currentLocation.isLiveGps
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-emerald-50 text-[#005B49] border border-emerald-200/60'
              }`}
            >
              {currentLocation.isLiveGps ? (
                <Navigation size={18} className="animate-pulse" />
              ) : (
                <MapPin size={20} />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  {currentLocation.isLiveGps
                    ? 'Live GPS Detected'
                    : currentLocation.source?.includes('Written')
                    ? 'Custom Detected Spot'
                    : 'Current Locality'}
                </span>

                {/* Free Air Quality API Indicator */}
                {airQuality && (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-100"
                    title={`AQI: ${airQuality.aqi} • ${airQuality.recommendation}`}
                  >
                    <Wind size={11} className="text-sky-600" />
                    <span>AQI {airQuality.aqi} ({airQuality.status})</span>
                  </span>
                )}

                {currentLocation.accuracy && (
                  <span className="text-[11px] text-gray-500 hidden md:inline">
                    ±{currentLocation.accuracy}m
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-0.5">
                <h3 className="text-base font-bold text-gray-900 truncate">
                  {currentLocation.locality}
                </h3>
                <span className="text-gray-400 text-sm">•</span>
                <span className="text-xs text-gray-500 truncate">
                  {currentLocation.sublocality || currentLocation.city || 'Varanasi'}
                </span>
              </div>

              <p className="text-[11px] text-gray-400 mt-0.5 font-mono truncate">
                {currentLocation.coordinates.lat.toFixed(4)}°N, {currentLocation.coordinates.lng.toFixed(4)}°E
                {currentLocation.source && ` • ${currentLocation.source}`}
              </p>
            </div>
          </div>

          {/* Right: Write Location, GPS Action & Tariffs */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0 flex-wrap">
            {/* Writing / Search Option Button */}
            <button
              id="btn-write-search-location"
              onClick={() => {
                setModalTab('search');
                setShowModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#005B49] hover:bg-[#004739] text-white shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Write your location or search nearby places"
            >
              <Search size={14} />
              <span>Write / Search Place</span>
            </button>

            {/* GPS Auto-detect Button */}
            <button
              id="btn-detect-live-gps"
              onClick={handleDetectGPS}
              disabled={isLocating}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isLocating
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 active:scale-95'
              }`}
              title="Detect live coordinates via free browser and reverse geocode API"
            >
              <Crosshair size={14} className={isLocating ? 'animate-spin' : ''} />
              <span>{isLocating ? 'Detecting...' : 'Detect GPS'}</span>
            </button>

            {/* Free Cultural & Boat Tariffs Guide */}
            <button
              id="btn-open-cultural-guide"
              onClick={() => {
                setModalTab('tariffs');
                setShowModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors cursor-pointer"
              title="View authorized boat tariffs, Aarti timings & transit fares"
            >
              <Ship size={13} className="text-amber-700" />
              <span className="hidden sm:inline">Tariffs & Aartis</span>
            </button>
          </div>
        </div>

        {/* Quick Locality Switch Chips */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold text-gray-400 shrink-0 mr-1">
            Famous Hubs:
          </span>
          {localities.map((loc) => {
            const isSelected =
              !currentLocation.isLiveGps && currentLocation.locality.toLowerCase().includes(loc.name.toLowerCase());
            return (
              <button
                key={loc.id}
                onClick={() => handleLocalityPick(loc)}
                className={`text-xs px-2.5 py-1 rounded-lg shrink-0 transition-all font-medium cursor-pointer ${
                  isSelected
                    ? 'bg-[#005B49] text-white font-bold shadow-2xs'
                    : 'bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-[#005B49] border border-gray-200/70'
                }`}
              >
                {loc.name}
              </button>
            );
          })}
        </div>

        {/* Error notice if location permission was denied */}
        {locationError && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-800">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} className="text-amber-600 shrink-0" />
              <span>{locationError}</span>
            </div>
            <button
              onClick={() => {
                setModalTab('search');
                setShowModal(true);
              }}
              className="font-bold underline text-amber-900 hover:text-amber-950 shrink-0 ml-2 cursor-pointer"
            >
              Write Location
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <LocalitySearchModal
          initialTab={modalTab}
          currentLocation={currentLocation}
          localities={localities}
          isLocating={isLocating}
          airQuality={airQuality}
          culturalGuide={culturalGuide}
          onClose={() => setShowModal(false)}
          onSelectLocality={handleLocalityPick}
          onSelectCustomPlace={handleCustomPlaceSelect}
          onDetectGPS={handleDetectGPS}
          searchLocations={searchLocations}
          setCustomLocation={setCustomLocation}
        />
      )}
    </>
  );
};

interface LocalitySearchModalProps {
  initialTab?: 'search' | 'localities' | 'tariffs';
  currentLocation: any;
  localities: VaranasiLocality[];
  isLocating: boolean;
  airQuality: any;
  culturalGuide: any;
  onClose: () => void;
  onSelectLocality: (loc: VaranasiLocality) => void;
  onSelectCustomPlace: (place: LocationSearchResult) => void;
  onDetectGPS: (e?: React.MouseEvent) => void;
  searchLocations: (query: string) => Promise<LocationSearchResult[]>;
  setCustomLocation: (customLoc: {
    name: string;
    locality?: string;
    coordinates: { lat: number; lng: number };
    formattedAddress?: string;
    source?: string;
  }) => void;
}

const LocalitySearchModal: React.FC<LocalitySearchModalProps> = ({
  initialTab = 'search',
  currentLocation,
  localities,
  isLocating,
  airQuality,
  culturalGuide,
  onClose,
  onSelectLocality,
  onSelectCustomPlace,
  onDetectGPS,
  searchLocations,
  setCustomLocation,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'localities' | 'tariffs'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocodingWritten, setIsGeocodingWritten] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically on modal open if on search tab
  useEffect(() => {
    if (activeTab === 'search' && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [activeTab]);

  // Debounced search when user types
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchLocations(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [searchQuery, searchLocations]);

  // Handle direct "Detect & Set Written Location"
  const handleDetectWrittenLocation = async () => {
    if (!searchQuery.trim()) return;
    setIsGeocodingWritten(true);
    try {
      // 1. Try searchLocations first
      const results = await searchLocations(searchQuery.trim());
      if (results && results.length > 0) {
        onSelectCustomPlace(results[0]);
        return;
      }

      // 2. Fallback geocode via OpenStreetMap Nominatim directly
      const q = encodeURIComponent(`${searchQuery.trim()}, Varanasi, Uttar Pradesh, India`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`, {
        headers: { 'User-Agent': 'SeizeOnTrip-Explorer/1.0' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          setCustomLocation({
            name: searchQuery.trim(),
            locality: 'Detected Nearby Spot',
            coordinates: { lat, lng },
            formattedAddress: data[0].display_name,
            source: 'OpenStreetMap Geocoded',
          });
          onClose();
          return;
        }
      }

      // 3. Fallback: center around Varanasi central with user's written label
      setCustomLocation({
        name: searchQuery.trim(),
        locality: 'Varanasi',
        coordinates: { lat: 25.3176, lng: 82.9739 },
        formattedAddress: `${searchQuery.trim()}, Varanasi, Uttar Pradesh`,
        source: 'User Written Locality',
      });
      onClose();
    } catch (e) {
      console.warn('Geocoding written location error:', e);
      setCustomLocation({
        name: searchQuery.trim(),
        locality: 'Varanasi',
        coordinates: { lat: 25.3176, lng: 82.9739 },
        formattedAddress: `${searchQuery.trim()}, Varanasi, Uttar Pradesh`,
        source: 'User Written Locality',
      });
      onClose();
    } finally {
      setIsGeocodingWritten(false);
    }
  };

  const quickLandmarks = [
    { name: 'Kashi Vishwanath Temple', area: 'Old City', lat: 25.3108, lng: 83.0092 },
    { name: 'Assi Ghat', area: 'South Ghats', lat: 25.2958, lng: 83.0089 },
    { name: 'Dashashwamedh Ghat', area: 'Central Riverfront', lat: 25.3075, lng: 83.0105 },
    { name: 'BHU Main Gate (Lanka)', area: 'University Zone', lat: 25.2799, lng: 82.9995 },
    { name: 'Godowlia Chowk', area: 'Central Market', lat: 25.3087, lng: 83.0065 },
    { name: 'Varanasi Cantt Station', area: 'Cantonment', lat: 25.3283, lng: 82.9863 },
    { name: 'Namo Ghat', area: 'North Riverfront', lat: 25.3347, lng: 83.0315 },
    { name: 'Sarnath Dhamek Stupa', area: 'Sarnath Heritage', lat: 25.3811, lng: 83.0242 },
  ];

  return (
    <div
      id="locality-selector-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/70 via-white to-amber-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#005B49] flex items-center justify-center text-white shadow-xs">
              <Compass size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900">
                Set Your Location & Explore
              </h2>
              <p className="text-xs text-gray-500">
                Write a spot, pick a landmark, or detect device GPS (dist & routes recalculate live)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-5 pt-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
          <button
            id="tab-search-written"
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'search'
                ? 'border-[#005B49] text-[#005B49] bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Search size={14} />
            <span>Write / Search Place</span>
          </button>

          <button
            id="tab-iconic-localities"
            onClick={() => setActiveTab('localities')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'localities'
                ? 'border-[#005B49] text-[#005B49] bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <MapPin size={14} />
            <span>Iconic Zones ({localities.length})</span>
          </button>

          <button
            id="tab-tariffs-guide"
            onClick={() => setActiveTab('tariffs')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'tariffs'
                ? 'border-[#005B49] text-[#005B49] bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Ship size={14} />
            <span>Tariffs & Aartis</span>
          </button>
        </div>

        {/* GPS Quick Action Strip */}
        <div className="p-3 sm:px-5 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Crosshair size={16} className={isLocating ? 'animate-spin' : ''} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-emerald-950 truncate">
                {currentLocation.isLiveGps
                  ? `Active Live GPS: ${currentLocation.locality}`
                  : 'Auto-Detect Live Coordinates via GPS'}
              </p>
              <p className="text-[11px] text-emerald-700 truncate">
                Free Browser Geolocation + OpenStreetMap Reverse Geocoding
              </p>
            </div>
          </div>
          <button
            id="btn-modal-detect-gps"
            onClick={() => {
              onDetectGPS();
            }}
            disabled={isLocating}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isLocating ? 'Detecting...' : 'Detect Live GPS'}
          </button>
        </div>

        {/* TAB 1: Search / Write Location Option */}
        {activeTab === 'search' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Writing Input Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="location-search-input"
                className="text-xs font-bold text-gray-700 flex items-center justify-between"
              >
                <span>Write your current location or nearby place</span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  Free Search & Geocoding API
                </span>
              </label>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  ref={inputRef}
                  id="location-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleDetectWrittenLocation();
                  }}
                  placeholder="e.g., BHU Gate, Godowlia, Hotel Surya, Assi Ghat, Sigra..."
                  className="w-full pl-10 pr-24 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#005B49] focus:bg-white transition-all shadow-inner"
                />

                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                ) : null}

                {/* Instant Detect Button on Input */}
                <button
                  id="btn-instant-detect-written"
                  onClick={handleDetectWrittenLocation}
                  disabled={!searchQuery.trim() || isGeocodingWritten}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#005B49] hover:bg-[#004739] text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                  title="Detect coordinates for written location"
                >
                  {isGeocodingWritten ? <Loader2 size={13} className="animate-spin" /> : 'Set'}
                </button>
              </div>

              <p className="text-[11px] text-gray-500">
                Tip: You can write any landmark, street, colony, or hotel in Varanasi.
              </p>
            </div>

            {/* If user typed a query, show custom detection action */}
            {searchQuery.trim().length > 1 && (
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-emerald-950 truncate">
                    Use written spot: &quot;{searchQuery.trim()}&quot;
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    Geocode coordinates & update walking distances
                  </p>
                </div>
                <button
                  id="btn-apply-written-place"
                  onClick={handleDetectWrittenLocation}
                  disabled={isGeocodingWritten}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#005B49] hover:bg-[#004739] text-white shadow-xs cursor-pointer transition-all active:scale-95 shrink-0"
                >
                  {isGeocodingWritten ? 'Detecting...' : 'Detect & Set'}
                </button>
              </div>
            )}

            {/* Real-time Search Suggestions from /api/location/search */}
            {isSearching ? (
              <div className="p-6 flex flex-col items-center justify-center text-gray-500 gap-2">
                <Loader2 size={24} className="animate-spin text-[#005B49]" />
                <span className="text-xs">Searching nearby landmarks & geocoding...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                  Matching Places & Landmarks ({searchResults.length})
                </p>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {searchResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onSelectCustomPlace(item)}
                      className="p-3 rounded-2xl border border-gray-200 hover:border-[#005B49] hover:bg-emerald-50/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 group-hover:bg-[#005B49] group-hover:text-white text-[#005B49] flex items-center justify-center shrink-0 transition-colors">
                          <MapPin size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-[#005B49] transition-colors truncate">
                              {item.name}
                            </h4>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                              {item.category}
                            </span>
                            {item.distanceKm !== null && item.distanceKm !== undefined && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                {item.distanceKm < 1
                                  ? `${Math.round(item.distanceKm * 1000)}m away`
                                  : `${item.distanceKm.toFixed(1)} km away`}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {item.formattedAddress}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-[#005B49] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                        <span>Select</span>
                        <ChevronRight size={13} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Popular Varanasi Landmarks Quick Buttons */}
            <div className="pt-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 px-1">
                Popular Nearby Hubs & Landmarks
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickLandmarks.map((lm, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCustomLocation({
                        name: lm.name,
                        locality: lm.area,
                        coordinates: { lat: lm.lat, lng: lm.lng },
                        formattedAddress: `${lm.name}, ${lm.area}, Varanasi`,
                        source: 'Varanasi Landmark Quick Pick',
                      });
                      onClose();
                    }}
                    className="p-2.5 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-left transition-all cursor-pointer flex items-center justify-between gap-2 group"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 group-hover:text-[#005B49] truncate">
                        {lm.name}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">{lm.area}</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 shrink-0">
                      Set Spot
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Browse Iconic Localities */}
        {activeTab === 'localities' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
              Iconic Varanasi Localities ({localities.length})
            </p>
            {localities.map((loc) => {
              const isSelected =
                !currentLocation.isLiveGps &&
                currentLocation.locality.toLowerCase().includes(loc.name.toLowerCase());
              return (
                <div
                  key={loc.id}
                  onClick={() => onSelectLocality(loc)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'border-[#005B49] bg-emerald-50/60 shadow-xs'
                      : 'border-gray-200/80 hover:border-emerald-300 hover:bg-gray-50/80'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-gray-900">
                        {loc.name}
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                        {loc.zone}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {loc.tagline}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {loc.keyAttractions.map((att, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded-md text-gray-700 font-medium"
                        >
                          {att}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0 pt-1">
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-[#005B49] text-white flex items-center justify-center">
                        <Check size={14} />
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 hover:text-emerald-800">
                        Select
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: Cultural Guide, Aarti Timings & Boat Tariffs */}
        {activeTab === 'tariffs' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Aarti Timings */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-[#005B49]" />
                <h3 className="text-sm font-bold text-gray-900">
                  Daily Ganga Aarti Timings (Official)
                </h3>
              </div>
              <div className="space-y-2">
                {culturalGuide?.aartis?.map((aarti: any) => (
                  <div
                    key={aarti.id}
                    className="p-3 rounded-xl border border-gray-200 bg-gray-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">
                        {aarti.name} • {aarti.ghat}
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        Best view: {aarti.bestViewSpot}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                        Summer: {aarti.summerTime}
                      </span>
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                        Winter: {aarti.winterTime}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Official Boat Tariffs */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-1.5">
                <Ship size={16} className="text-emerald-700" />
                <h3 className="text-sm font-bold text-gray-900">
                  Authorized Boat Tariff Rates
                </h3>
              </div>
              <p className="text-[11px] text-gray-500 mb-2.5">
                {culturalGuide?.boatTariffs?.guideNote || 'Municipal rates to avoid being overcharged by touts.'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {culturalGuide?.boatTariffs?.rates?.map((rate: any, i: number) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/40 text-center"
                  >
                    <p className="text-xs font-bold text-emerald-950">{rate.type}</p>
                    <p className="text-sm font-extrabold text-[#005B49] my-0.5">{rate.fare}</p>
                    <p className="text-[10px] text-gray-500">{rate.route}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Transit Fares */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Car size={16} className="text-gray-700" />
                <h3 className="text-sm font-bold text-gray-900">
                  Local Transit Benchmarks
                </h3>
              </div>
              <div className="space-y-1.5">
                {culturalGuide?.transitFares?.map((tf: any, i: number) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl border border-gray-100 bg-white text-xs flex items-center justify-between gap-2"
                  >
                    <span className="font-semibold text-gray-800">{tf.route}</span>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-emerald-700 font-bold">Shared E-Rickshaw: {tf.eRickshawShared}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">Auto: {tf.privateAuto}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Heritage Etiquette */}
            {culturalGuide?.localEtiquetteTips && (
              <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-900">
                <p className="font-bold flex items-center gap-1.5 mb-1 text-amber-950">
                  <Info size={14} className="text-amber-700" />
                  <span>Kashi Local Etiquette Tip</span>
                </p>
                <p className="text-[11px] leading-relaxed">
                  {culturalGuide.localEtiquetteTips[0]}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-3 sm:px-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500">Active Location:</span>
            <span className="text-xs font-bold text-gray-900 truncate max-w-[200px]">
              {currentLocation.locality}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-gray-900 hover:bg-black text-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
