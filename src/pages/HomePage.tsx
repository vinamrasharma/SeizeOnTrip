import React from 'react';
import { useApp } from '../context/AppContext';
import { SearchBar } from '../components/common/SearchBar';
import { SectionHeader } from '../components/common/Feedback';
import { CATEGORIES, CategoryCircleCard } from '../components/common/CategoryComponents';
import { PlaceCard } from '../components/cards/PlaceCards';
import { TrendingSlider } from '../components/home/TrendingSlider';
import { BudgetTripSuggester } from '../components/budget/BudgetTripSuggester';
import { LiveWeatherWidget } from '../components/home/LiveWeatherWidget';
import { LiveLocationBar } from '../components/common/LiveLocationBar';
import { Bell, ArrowRight, Sparkles, Compass, Flame, Wallet } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user, navigate, places, unreadNotificationsCount } = useApp();

  const hiddenGems = places.filter((p) => p.isGem);
  const featuredGem = places.find((p) => p.id === 'kashi-chaat-corner') || places[0];
  const secondGem = places.find((p) => p.id === 'shiv-handloom-studio') || places[1];

  return (
    <div className="min-h-screen pb-24 md:pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      {/* Top Header (matches 8.png) */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight flex items-center gap-1.5">
            <span>Hello, {user.name.split(' ')[0]}</span>
            <span className="text-2xl animate-bounce">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
            Good morning • Discover authentic Varanasi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/notifications')}
            className="relative w-11 h-11 rounded-full bg-white border border-gray-200/80 shadow-xs flex items-center justify-center text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>
        </div>
      </div>

      {/* Live Locality & GPS Location Banner with Free Reverse Geocoding API */}
      <div className="mb-4">
        <LiveLocationBar />
      </div>

      {/* Search Input Bar (matches 8.png) */}
      <div className="mb-4">
        <SearchBar
          readOnly
          showArrow
          onClick={() => navigate('/explore')}
          placeholder="Where do you want to go in Varanasi?"
        />
      </div>

      {/* Live Free Weather & Astronomical Timings (Open-Meteo) */}
      <div className="mb-6">
        <LiveWeatherWidget />
      </div>

      {/* 1. SLIDER AT THE START OF THE SITE: Most Visited & Hyped Places Right Now */}
      <section className="mb-8">
        <TrendingSlider places={places} />
      </section>

      {/* Main AI Planning Banner (matches 8.png) */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg mb-8 bg-[#004739] text-white">
        {/* Scenic Background image with custom dark green gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1571536802807-30451e3955d8?w=1200&auto=format&fit=crop&q=80"
            alt="Varanasi travel destination"
            className="w-full h-full object-cover opacity-35 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#00382D] via-[#004739]/95 to-[#005B49]/85" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-md">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold tracking-wide uppercase text-amber-300 mb-3 border border-white/10">
              <Sparkles size={12} />
              <span>Intelligent Itinerary</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Plan your trip with AI
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-200 font-normal leading-relaxed">
              Get a personalized itinerary with authentic local food, stays, and hidden experiences.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                id="home-plan-with-ai-btn"
                onClick={() => navigate('/plan')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-[#005B49] font-bold text-sm hover:bg-amber-50 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <span>Plan with AI</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Graphic Guide Companion Badge on desktop */}
          <div className="hidden md:flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center w-56">
            <div className="w-14 h-14 rounded-full bg-amber-400 text-[#005B49] flex items-center justify-center mb-2 shadow-sm font-black text-xl">
              <Compass size={28} />
            </div>
            <span className="font-bold text-sm text-white">Varanasi Expert</span>
            <span className="text-xs text-gray-300 mt-0.5">3-Day Route Ready</span>
            <button
              onClick={() => navigate('/trip/trip-varanasi-3day')}
              className="mt-3 text-xs font-semibold text-amber-300 hover:text-white underline cursor-pointer"
            >
              View active trip →
            </button>
          </div>
        </div>
      </div>

      {/* 2. BUDGET & DURATION EXPLORER: Suggests places under budget & for number of days */}
      <section className="mb-10">
        <BudgetTripSuggester />
      </section>

      {/* Explore Local Categories (matches 8.png) */}
      <section className="mb-8">
        <SectionHeader
          title="Explore Local"
          actionText="View all"
          onAction={() => navigate('/explore')}
        />
        <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar py-2">
          {CATEGORIES.map((cat) => (
            <CategoryCircleCard
              key={cat.id}
              category={cat}
              onClick={(catId) => navigate(`/explore?cat=${catId}`)}
            />
          ))}
        </div>
      </section>

      {/* Hidden Gems Near You (matches 8.png) */}
      <section className="mb-10">
        <SectionHeader
          title="Hidden Gems Near You"
          actionText="View all"
          onAction={() => navigate('/explore')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PlaceCard place={featuredGem} variant="wide-gem" />
          <PlaceCard place={secondGem} variant="wide-gem" />
        </div>
      </section>

      {/* Recommended for You Grid */}
      <section className="mb-8">
        <SectionHeader
          title="Popular Cultural Experiences"
          subtitle="Top rated tours & handloom workshops along the sacred ghats"
          actionText="See all"
          onAction={() => navigate('/explore')}
        />
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {places.slice(0, 4).map((place) => (
            <PlaceCard key={place.id} place={place} variant="vertical" />
          ))}
        </div>
      </section>
    </div>
  );
};
