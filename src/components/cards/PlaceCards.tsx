import React from 'react';
import { Place } from '../../types';
import { FavoriteButton } from '../common/FavoriteButton';
import { MapPin, Star, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface PlaceCardProps {
  place: Place;
  variant?: 'vertical' | 'horizontal-compact' | 'wide-gem';
  className?: string;
  onClick?: () => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  variant = 'vertical',
  className = '',
  onClick,
}) => {
  const { navigate } = useApp();

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      if (place.id === 'shiv-handloom-studio') {
        navigate(`/business/${place.id}`);
      } else {
        navigate(`/place/${place.id}`);
      }
    }
  };

  // Horizontal Compact Card (like Hidden Gems in Home screen - 8.png)
  if (variant === 'wide-gem') {
    return (
      <div
        onClick={handleCardClick}
        className={`group relative flex items-center bg-[#1D1E1B] text-white rounded-3xl overflow-hidden cursor-pointer shadow-md transition-all hover:shadow-lg active:scale-[0.99] border border-gray-800/20 ${className}`}
      >
        {/* Image thumbnail on left */}
        <div className="w-2/5 sm:w-1/3 aspect-4/3 relative overflow-hidden shrink-0">
          <img
            src={place.imageUrl}
            alt={place.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1D1E1B]/80 md:hidden" />
        </div>

        {/* Content on right */}
        <div className="flex-1 p-4 sm:p-5 flex items-center justify-between min-w-0">
          <div className="min-w-0 pr-2">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate group-hover:text-[#F59E0B] transition-colors">
              {place.name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 mt-1">
              {place.categoryLabel} • {place.priceLevel}
            </p>
            <div className="flex items-center gap-2.5 mt-2.5 text-xs text-gray-300">
              <span className="flex items-center gap-1 font-semibold text-amber-400">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                {place.rating}
              </span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-300">{place.distance}</span>
            </div>
          </div>

          <div className="shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-300 group-hover:text-white group-hover:bg-[#005B49] transition-all">
            <ChevronRight size={18} />
          </div>
        </div>
      </div>
    );
  }

  // Vertical card (matches Explore screen - 11.png)
  return (
    <div
      onClick={handleCardClick}
      className={`group relative bg-white rounded-3xl overflow-hidden cursor-pointer border border-gray-100 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col active:scale-[0.99] ${className}`}
    >
      {/* Top Image area */}
      <div className="relative w-full aspect-4/3 overflow-hidden bg-gray-100">
        <img
          src={place.imageUrl}
          alt={place.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Floating Heart Button */}
        <div className="absolute top-3 right-3 z-10">
          <FavoriteButton placeId={place.id} size="sm" variant="floating" />
        </div>

        {/* Verified or Gem Badge if present */}
        {place.isGem && (
          <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-[#005B49]/90 text-white text-[10px] font-semibold tracking-wide backdrop-blur-xs">
            Local Gem
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-gray-900 leading-snug group-hover:text-[#005B49] transition-colors line-clamp-1">
            {place.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {place.categoryLabel} • {place.priceLevel}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-50 text-xs">
          <div className="flex items-center gap-1 font-semibold text-gray-900">
            <Star size={13} className="fill-amber-500 text-amber-500 shrink-0" />
            <span>{place.rating}</span>
            <span className="text-gray-400 font-normal">
              ({place.reviewCount > 999 ? `${(place.reviewCount / 1000).toFixed(1)}K` : place.reviewCount})
            </span>
          </div>

          <div className="flex items-center gap-1 text-gray-500 font-medium text-[11px] sm:text-xs">
            <MapPin size={12} className="text-emerald-700 shrink-0" />
            <span className="truncate max-w-[140px]">{place.distance}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
