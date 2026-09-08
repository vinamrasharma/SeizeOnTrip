import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SearchBar } from '../components/common/SearchBar';
import { SectionHeader } from '../components/common/Feedback';
import { PlaceCard } from '../components/cards/PlaceCards';
import { LiveLocationBar } from '../components/common/LiveLocationBar';
import {
  ChevronLeft,
  Map as MapIcon,
  ChevronDown,
  MapPin,
  Globe,
  Compass,
  Wallet,
  Sparkles,
  Layers,
  Filter,
  Flame,
  Clock,
  ShieldCheck,
  RefreshCw,
  Search,
} from 'lucide-react';
import { Place } from '../types';
import { calculateWholePlaceExpenses } from '../utils/travelExpenses';
import { safeFetchJson } from '../utils/apiHelper';
import { Coins, Navigation as NavigationIcon, Banknote } from 'lucide-react';

export const ExplorePage: React.FC = () => {
  const { goBack, navigate, places, calculateDistanceTo } = useApp();

  // Region Scope: 'india' | 'world' | 'local' | 'all'
  const [regionScope, setRegionScope] = useState<'india' | 'world' | 'local' | 'all'>('all');
  const [selectedSubRegion, setSelectedSubRegion] = useState<string>('all');

  // Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Budget Plan filter
  const [budgetPlanFilter, setBudgetPlanFilter] = useState<'all' | 'free' | 'budget' | 'moderate' | 'luxury'>('all');

  // Search query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dynamic API places (fetched from /api/places/discover)
  const [apiDiscoveredPlaces, setApiDiscoveredPlaces] = useState<Place[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(false);

  // Quick destinations for India & World
  const indiaDestinations = [
    { id: 'all', label: 'All of India' },
    { id: 'Varanasi', label: 'Varanasi' },
    { id: 'Jaipur', label: 'Jaipur' },
    { id: 'Jodhpur', label: 'Jodhpur' },
    { id: 'Udaipur', label: 'Udaipur' },
    { id: 'Delhi', label: 'Delhi' },
    { id: 'Agra', label: 'Agra' },
    { id: 'Mumbai', label: 'Mumbai' },
    { id: 'Goa', label: 'Goa' },
    { id: 'Kerala', label: 'Kerala' },
    { id: 'Mysore', label: 'Mysuru' },
    { id: 'Madurai', label: 'Madurai' },
    { id: 'Rishikesh', label: 'Rishikesh' },
    { id: 'Amritsar', label: 'Amritsar' },
  ];

  const worldDestinations = [
    { id: 'all', label: 'Whole World' },
    { id: 'Tokyo', label: 'Tokyo' },
    { id: 'Paris', label: 'Paris' },
    { id: 'Rome', label: 'Rome' },
    { id: 'Bali', label: 'Bali' },
    { id: 'Dubai', label: 'Dubai' },
    { id: 'Singapore', label: 'Singapore' },
    { id: 'Bangkok', label: 'Bangkok' },
  ];

  // Fetch from free discovery API when search query is typed or sub-region clicked
  useEffect(() => {
    let isMounted = true;

    const fetchDiscovered = async () => {
      const q = searchQuery.trim() || (selectedSubRegion !== 'all' ? selectedSubRegion : '');
      if (!q && regionScope === 'all') {
        setApiDiscoveredPlaces([]);
        return;
      }

      setIsLoadingApi(true);
      try {
        const catParam = selectedCategory !== 'all' ? `&category=${selectedCategory}` : '';
        const regionParam = regionScope !== 'all' ? `&region=${regionScope}` : '';
        const url = `/api/places/discover?query=${encodeURIComponent(q)}${catParam}${regionParam}`;
        const res = await safeFetchJson<{ places: Place[] }>(url);
        if (res.ok && isMounted && Array.isArray(res.data?.places)) {
          setApiDiscoveredPlaces(res.data.places);
        }
      } catch (err) {
        console.warn('Discovery API fetch error:', err);
      } finally {
        if (isMounted) setIsLoadingApi(false);
      }
    };

    const timeout = setTimeout(fetchDiscovered, 350);
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [searchQuery, selectedSubRegion, regionScope, selectedCategory]);

  // Combined pool of places (merging context places with API discovered places, deduplicated by id)
  const combinedPlaces = useMemo(() => {
    const map = new Map<string, Place>();
    places.forEach((p) => map.set(p.id, p));
    apiDiscoveredPlaces.forEach((p) => {
      if (!map.has(p.id)) {
        map.set(p.id, p);
      }
    });
    return Array.from(map.values());
  }, [places, apiDiscoveredPlaces]);

  // Filter combined places based on active scope, category, budget plan and search
  const filteredPlaces = useMemo(() => {
    return combinedPlaces.filter((p) => {
      const locLower = (p.location || '').toLowerCase();
      const nameLower = (p.name || '').toLowerCase();
      const descLower = (p.description || '').toLowerCase();
      const tagsString = (p.tags || []).join(' ').toLowerCase();

      // 1. Region Scope Filter
      const isWorldNonIndia =
        locLower.includes('japan') ||
        locLower.includes('france') ||
        locLower.includes('indonesia') ||
        locLower.includes('italy') ||
        locLower.includes('uae') ||
        locLower.includes('dubai') ||
        locLower.includes('thailand') ||
        locLower.includes('paris') ||
        locLower.includes('tokyo') ||
        locLower.includes('rome') ||
        locLower.includes('bali') ||
        locLower.includes('singapore') ||
        tagsString.includes('international') ||
        tagsString.includes('world');

      if (regionScope === 'india') {
        if (isWorldNonIndia) return false;
      } else if (regionScope === 'world') {
        if (!isWorldNonIndia) return false;
      } else if (regionScope === 'local') {
        // Local Varanasi & live GPS proximity
        if (!locLower.includes('varanasi') && !locLower.includes('ghat') && !p.isGem) return false;
      }

      // 2. Sub-Region Specific Chip
      if (selectedSubRegion !== 'all') {
        const target = selectedSubRegion.toLowerCase();
        const matchesSub =
          locLower.includes(target) ||
          nameLower.includes(target) ||
          tagsString.includes(target);
        if (!matchesSub) return false;
      }

      // 3. Category Filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // 4. Budget Plan Filter (Issue 5: Filter with their budget plan)
      const cost = p.priceNumeric ?? (p.priceLevel === 'Free' ? 0 : 300);
      if (budgetPlanFilter === 'free' && cost > 0 && p.priceLevel !== 'Free') {
        return false;
      }
      if (budgetPlanFilter === 'budget' && (cost === 0 || cost > 1000)) {
        return false;
      }
      if (budgetPlanFilter === 'moderate' && (cost <= 1000 || cost > 4000)) {
        return false;
      }
      if (budgetPlanFilter === 'luxury' && cost <= 4000) {
        return false;
      }

      // 5. Search Text Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          nameLower.includes(q) ||
          locLower.includes(q) ||
          descLower.includes(q) ||
          tagsString.includes(q) ||
          (p.categoryLabel && p.categoryLabel.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [combinedPlaces, regionScope, selectedSubRegion, selectedCategory, budgetPlanFilter, searchQuery]);

  return (
    <div className="min-h-screen pb-28 md:pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between py-2 mb-4">
        <button
          onClick={goBack}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Live Locality & GPS Location indicator */}
        <LiveLocationBar compact={true} />

        {/* Map Button */}
        <button
          onClick={() => navigate('/trip/trip-varanasi-3day/map')}
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#005B49] bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
          aria-label="View on Map"
          title="Interactive Map View"
        >
          <MapIcon size={20} />
        </button>
      </div>

      {/* Main Page Title */}
      <div className="mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[#005B49] text-xs font-extrabold mb-1">
          <Globe size={13} />
          <span>GLOBAL & PAN-INDIA EXPLORER</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
          Explore Places & Budget Plans
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Browse destinations across India and the whole world with custom budget estimates.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-5">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search any destination, monument, street food, or country..."
        />
      </div>

      {/* 1. Global / Pan-India / Local Scope Switcher (Issue 5) */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] uppercase tracking-wider font-black text-gray-500 flex items-center gap-1">
            <Compass size={13} className="text-[#005B49]" />
            <span>Select Region Scope</span>
          </label>
          <span className="text-[11px] font-bold text-gray-400">
            {filteredPlaces.length} places available
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'all', label: 'All Places', icon: '✨' },
            { id: 'india', label: 'All Over India', icon: '🇮🇳' },
            { id: 'world', label: 'Whole World', icon: '🌍' },
            { id: 'local', label: 'Near Me (GPS)', icon: '📍' },
          ].map((scope) => {
            const active = regionScope === scope.id;
            return (
              <button
                key={scope.id}
                onClick={() => {
                  setRegionScope(scope.id as any);
                  setSelectedSubRegion('all');
                }}
                className={`py-2.5 px-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 ${
                  active
                    ? 'bg-[#005B49] text-white border-[#005B49] shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>{scope.icon}</span>
                <span className="truncate">{scope.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick City / Destination Chips */}
      {(regionScope === 'india' || regionScope === 'world' || regionScope === 'all') && (
        <div className="flex items-center gap-1.5 mb-5 overflow-x-auto no-scrollbar pb-1">
          <span className="text-[11px] font-bold text-gray-400 shrink-0">Popular:</span>
          {(regionScope === 'world' ? worldDestinations : indiaDestinations).map((dest) => {
            const isSelected = selectedSubRegion === dest.id;
            return (
              <button
                key={dest.id}
                onClick={() => setSelectedSubRegion(dest.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#005B49] text-white border-[#005B49]'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {dest.label}
              </button>
            );
          })}
        </div>
      )}

      {/* 2. Budget Plan Filter Bar (Issue 5: "with their budget plan") */}
      <div className="mb-5 p-3.5 rounded-2xl bg-[#F8FAF9] border border-gray-200/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-gray-800">
            <Wallet size={14} className="text-[#005B49]" />
            <span>Filter by Budget Plan</span>
          </div>
          {budgetPlanFilter !== 'all' && (
            <button
              onClick={() => setBudgetPlanFilter('all')}
              className="text-[11px] font-bold text-[#005B49] hover:underline cursor-pointer"
            >
              Reset Budget
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {[
            { id: 'all', label: 'All Budgets' },
            { id: 'free', label: 'Free / Backpacker (₹0)' },
            { id: 'budget', label: 'Budget (₹100 – ₹1,000)' },
            { id: 'moderate', label: 'Moderate (₹1,000 – ₹4,000)' },
            { id: 'luxury', label: 'Luxury (₹4,000+)' },
          ].map((b) => {
            const active = budgetPlanFilter === b.id;
            return (
              <button
                key={b.id}
                onClick={() => setBudgetPlanFilter(b.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border whitespace-nowrap cursor-pointer transition-all ${
                  active
                    ? 'bg-[#005B49] text-white border-[#005B49] shadow-2xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {b.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Category Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all', label: 'All Categories' },
          { id: 'attraction', label: 'Attractions & Heritage' },
          { id: 'food', label: 'Food & Chaat' },
          { id: 'experience', label: 'Experiences & Tours' },
          { id: 'stay', label: 'Stays & Haveli' },
          { id: 'shopping', label: 'Artisans & Silk' },
        ].map((cat) => {
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                active
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Live API Loading State */}
      {isLoadingApi && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-semibold mb-4 animate-pulse border border-emerald-100">
          <RefreshCw size={14} className="animate-spin text-[#005B49]" />
          <span>Searching global destination catalog & OpenStreetMap free API...</span>
        </div>
      )}

      {/* Places Display Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-black text-gray-950">
            {filteredPlaces.length} Destinations Discovered
          </h2>
          <span className="text-xs text-gray-500 font-medium">
            Tap any place for details & timings
          </span>
        </div>

        {filteredPlaces.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 px-4">
            <Compass size={36} className="mx-auto text-gray-400 mb-3" />
            <h3 className="text-base font-bold text-gray-800">No destinations found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              We couldn't find places matching your current region, budget plan, or search filter.
            </p>
            <button
              onClick={() => {
                setRegionScope('all');
                setSelectedSubRegion('all');
                setSelectedCategory('all');
                setBudgetPlanFilter('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2.5 bg-[#005B49] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPlaces.map((place) => {
              const distInfo = calculateDistanceTo(place.coordinates);
              const distanceKm = place.distanceKm ?? distInfo.distanceKm;
              const expenseSummary = calculateWholePlaceExpenses(place, distanceKm);

              return (
                <div
                  key={place.id}
                  onClick={() => {
                    if (place.id === 'shiv-handloom-studio') {
                      navigate(`/business/${place.id}`);
                    } else {
                      navigate(`/place/${place.id}`);
                    }
                  }}
                  className="group bg-white rounded-3xl border border-gray-200/90 shadow-2xs hover:shadow-md hover:border-[#005B49]/40 transition-all cursor-pointer flex flex-col overflow-hidden"
                >
                  {/* Image container with badges */}
                  <div className="relative aspect-4/3 overflow-hidden bg-gray-100">
                    <img
                      src={place.imageUrl}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Hype / Verified Badge */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                      {place.hypeBadge ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/90 backdrop-blur-xs text-rose-700 shadow-xs">
                          {place.hypeBadge}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-xs text-[#005B49] shadow-xs">
                          {place.categoryLabel}
                        </span>
                      )}
                    </div>

                    {/* Rating Pill */}
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-black/70 backdrop-blur-xs text-white flex items-center gap-1">
                      <span className="text-amber-400">★</span>
                      <span>{place.rating}</span>
                    </div>

                    {/* Whole Expense overlay tag (Whole Travel + Visit Expense) */}
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="px-2.5 py-1 rounded-xl bg-gray-950/85 backdrop-blur-xs text-white shadow-sm border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[11px] font-black text-emerald-300 truncate">
                          <Coins size={12} className="text-amber-400 shrink-0" />
                          <span className="truncate">Whole Est: {expenseSummary.whole.formatted}</span>
                        </div>
                        <span className="text-[10px] text-gray-300 shrink-0 font-medium ml-1">
                          {place.distance || distInfo.formatted}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-gray-950 group-hover:text-[#005B49] transition-colors line-clamp-1">
                        {place.name}
                      </h3>

                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <MapPin size={12} className="text-gray-400 shrink-0" />
                        <span className="truncate">{place.location}</span>
                      </div>

                      <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                        {place.description}
                      </p>

                      {/* Explicit Travel + Visit Expense Breakdown Box */}
                      <div className="mt-3 p-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-100/90 text-xs">
                        <div className="flex items-center justify-between font-bold text-gray-900 mb-1">
                          <span className="flex items-center gap-1 text-[11px] text-[#005B49]">
                            <Banknote size={12} />
                            <span>Total Est. Outlay:</span>
                          </span>
                          <span className="font-black text-emerald-950">
                            {expenseSummary.whole.formatted}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-gray-600 pt-1 border-t border-emerald-100/70">
                          <span className="truncate">
                            🎟️ Visit: <strong className="text-gray-900">{expenseSummary.visit.formatted}</strong>
                          </span>
                          <span className="text-gray-300 mx-1">•</span>
                          <span className="truncate">
                            🚗 Travel: <strong className="text-gray-900">~{expenseSummary.travel.formattedRange}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer: Opening times & tags */}
                    <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1 text-gray-500 font-medium">
                        <Clock size={11} className="text-[#005B49]" />
                        <span className="truncate max-w-[120px]">
                          {place.generalDetails?.openingTime
                            ? `${place.generalDetails.openingTime} – ${place.generalDetails.closingTime}`
                            : place.timings || 'Daily Hours'}
                        </span>
                      </div>

                      <span className="font-bold text-[#005B49] group-hover:underline">
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Free API Attribution Footer */}
      <div className="text-center py-4 border-t border-gray-100 text-[11px] font-medium text-gray-400 flex items-center justify-center gap-1.5">
        <ShieldCheck size={14} className="text-[#005B49]" />
        <span>
          Powered by Global OpenStreetMap API, BigDataCloud Geocoding & Curated World Travel Directory
        </span>
      </div>
    </div>
  );
};
