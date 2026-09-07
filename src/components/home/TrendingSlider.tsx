import React, { useState, useEffect, useRef } from 'react';
import { Place } from '../../types';
import { useApp } from '../../context/AppContext';
import { FavoriteButton } from '../common/FavoriteButton';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Users,
  Star,
  MapPin,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

interface TrendingSliderProps {
  places: Place[];
  className?: string;
}

export const TrendingSlider: React.FC<TrendingSliderProps> = ({
  places,
  className = '',
}) => {
  const { navigate } = useApp();
  const trendingPlaces = places.filter((p) => p.isTrending || p.hypeScore);
  const items = trendingPlaces.length > 0 ? trendingPlaces : places.slice(0, 4);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play interval
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [items.length, isPaused]);

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const activePlace = items[currentIndex];

  return (
    <div
      className={`relative w-full ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slider Header */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-orange-100 text-orange-600 shadow-2xs">
            <Flame size={18} className="fill-orange-500 text-orange-500 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-1.5">
              <span>Hyped & Most Visited</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-extrabold uppercase tracking-wider">
                Live Pulse
              </span>
            </h2>
            <p className="text-xs text-gray-500">
              Trending places with highest visitor footfall in Varanasi right now
            </p>
          </div>
        </div>

        {/* Carousel controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            className="w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center transition-all active:scale-95 shadow-2xs cursor-pointer"
            aria-label="Previous trending place"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleNext}
            className="w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center transition-all active:scale-95 shadow-2xs cursor-pointer"
            aria-label="Next trending place"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Main Feature Slide Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gray-950 text-white shadow-xl min-h-[360px] sm:min-h-[400px] flex flex-col justify-between group transition-all">
        {/* Background Image with rich cinematic gradients */}
        <div className="absolute inset-0 z-0">
          <img
            src={activePlace.imageUrl}
            alt={activePlace.name}
            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-black/20" />
        </div>

        {/* Top Badges Row */}
        <div className="relative z-10 p-4 sm:p-6 flex items-start justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {/* Hyped badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-black shadow-md tracking-wide">
              <Flame size={14} className="fill-white" />
              <span>{activePlace.hypeBadge || `🔥 ${activePlace.hypeScore || 98}% HYPE SCORE`}</span>
            </div>

            {/* Live visitors metric */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-amber-300 text-xs font-semibold border border-white/10">
              <Users size={13} />
              <span>{activePlace.weeklyVisitors || '25K+ visited this week'}</span>
            </div>
          </div>

          <div className="shrink-0">
            <FavoriteButton placeId={activePlace.id} size="md" variant="floating" />
          </div>
        </div>

        {/* Bottom Details Content */}
        <div className="relative z-10 p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="max-w-xl">
              {/* Category and Rating */}
              <div className="flex items-center gap-2.5 text-xs text-gray-300 mb-1.5 font-medium">
                <span className="px-2 py-0.5 rounded-md bg-white/20 text-white font-bold backdrop-blur-xs">
                  {activePlace.categoryLabel}
                </span>
                <span>•</span>
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  {activePlace.rating} ({activePlace.reviewCount})
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-gray-300">
                  <MapPin size={13} />
                  {activePlace.distance}
                </span>
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {activePlace.name}
              </h3>
              <p className="text-sm text-gray-200 mt-1 line-clamp-2 font-normal leading-relaxed">
                {activePlace.description}
              </p>
            </div>

            {/* Action button */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  if (activePlace.id === 'shiv-handloom-studio') {
                    navigate(`/business/${activePlace.id}`);
                  } else {
                    navigate(`/place/${activePlace.id}`);
                  }
                }}
                className="px-5 py-3 rounded-2xl bg-[#005B49] hover:bg-[#004739] text-white font-bold text-sm flex items-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <span>Explore Spot</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Slider Pagination Indicator Dots & Quick Jump */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/15">
            <div className="flex items-center gap-1.5">
              {items.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentIndex === idx
                      ? 'w-8 bg-amber-400'
                      : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="text-[11px] font-mono text-gray-400 tracking-wider">
              <span className="text-white font-bold">{currentIndex + 1}</span> / {items.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
