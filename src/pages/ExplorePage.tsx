import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SearchBar } from '../components/common/SearchBar';
import { SectionHeader } from '../components/common/Feedback';
import { ExploreFilterTabs } from '../components/common/CategoryComponents';
import { PlaceCard } from '../components/cards/PlaceCards';
import { LiveLocationBar } from '../components/common/LiveLocationBar';
import { ChevronLeft, Map, ChevronDown, MapPin } from 'lucide-react';

export const ExplorePage: React.FC = () => {
  const { goBack, navigate, places, selectedCity, setSelectedCity } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'food' && p.category === 'food') return true;
      if (selectedFilter === 'attractions' && p.category === 'attraction') return true;
      if (selectedFilter === 'shopping' && p.category === 'shopping') return true;
      if (selectedFilter === 'experiences' && p.category === 'experience') return true;
      if (selectedFilter === 'stay' && p.category === 'stay') return true;

      return false;
    });
  }, [places, selectedFilter, searchQuery]);

  // Curated groups for default view (matching 11.png)
  const popularPlaces = places.filter(
    (p) => ['kashi-chaat-corner', 'dashashwamedh-ghat', 'shiv-handloom-studio'].includes(p.id)
  );
  const localExperiences = places.filter(
    (p) => ['sunrise-boat-tour', 'banarasi-cooking-class'].includes(p.id)
  );
  const recommendedStays = places.filter(
    (p) => ['ganga-view-homestay', 'brijrama-palace'].includes(p.id)
  );

  return (
    <div className="min-h-screen pb-24 md:pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      {/* Top App Header (matches 11.png) */}
      <div className="flex items-center justify-between py-2 mb-4">
        <button
          onClick={goBack}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Live Locality & GPS Location selector */}
        <LiveLocationBar compact={true} />

        {/* Map Button */}
        <button
          onClick={() => navigate('/trip/trip-varanasi-3day/map')}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="View on Map"
        >
          <Map size={22} />
        </button>
      </div>

      {/* Main Title & Subtitle (matches 11.png) */}
      <div className="mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#005B49] tracking-tight">
          Explore Local
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 font-normal">
          Discover authentic places, experiences and hidden gems near you.
        </p>
      </div>

      {/* Full Live Locality Bar with live GPS, free reverse geocoding & Varanasi hubs */}
      <div className="mb-5">
        <LiveLocationBar />
      </div>

      {/* Search Bar */}
      <div className="mb-5">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search for food, places, experiences..."
        />
      </div>

      {/* Category Pills (matches 11.png) */}
      <div className="mb-8">
        <ExploreFilterTabs
          selected={selectedFilter}
          onSelect={setSelectedFilter}
        />
      </div>

      {/* If Search or Filter applied, show unified search results */}
      {searchQuery || selectedFilter !== 'all' ? (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Results ({filteredPlaces.length})
            </h2>
            <button
              onClick={() => {
                setSelectedFilter('all');
                setSearchQuery('');
              }}
              className="text-xs font-semibold text-[#005B49] hover:underline"
            >
              Reset filters
            </button>
          </div>

          {filteredPlaces.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-200">
              <p className="text-gray-500 text-sm">No places found matching your search.</p>
              <button
                onClick={() => {
                  setSelectedFilter('all');
                  setSearchQuery('');
                }}
                className="mt-3 px-4 py-2 bg-[#005B49] text-white rounded-xl text-xs font-bold"
              >
                Show all places
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPlaces.map((place) => (
                <PlaceCard key={place.id} place={place} variant="vertical" />
              ))}
            </div>
          )}
        </section>
      ) : (
        /* Default Layout matching 11.png screenshots with 3 distinct rows */
        <div className="space-y-9">
          {/* 1. Popular Near You */}
          <section>
            <SectionHeader
              title="Popular Near You"
              actionText="View all"
              onAction={() => setSelectedFilter('attractions')}
            />
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {popularPlaces.map((place) => (
                <PlaceCard key={place.id} place={place} variant="vertical" />
              ))}
            </div>
          </section>

          {/* 2. Local Experiences */}
          <section>
            <SectionHeader
              title="Local Experiences"
              actionText="View all"
              onAction={() => setSelectedFilter('experiences')}
            />
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {localExperiences.map((place) => (
                <PlaceCard key={place.id} place={place} variant="vertical" />
              ))}
            </div>
          </section>

          {/* 3. Recommended Stays */}
          <section>
            <SectionHeader
              title="Recommended Stays"
              actionText="View all"
              onAction={() => setSelectedFilter('stay')}
            />
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedStays.map((place) => (
                <PlaceCard key={place.id} place={place} variant="vertical" />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
