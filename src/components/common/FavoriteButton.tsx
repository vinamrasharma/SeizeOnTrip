import React from 'react';
import { Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface FavoriteButtonProps {
  placeId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'floating' | 'subtle' | 'pill';
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  placeId,
  size = 'md',
  className = '',
  variant = 'floating',
}) => {
  const { isPlaceSaved, toggleSavePlace } = useApp();
  const saved = isPlaceSaved(placeId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleSavePlace(placeId);
  };

  const sizeClasses = {
    sm: 'w-7 h-7 p-1.5',
    md: 'w-8 h-8 p-1.5',
    lg: 'w-10 h-10 p-2',
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  };

  if (variant === 'pill') {
    return (
      <button
        id={`fav-btn-pill-${placeId}`}
        onClick={handleClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
          saved
            ? 'bg-rose-50 border-rose-200 text-rose-600'
            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
        } ${className}`}
        aria-label={saved ? 'Remove from saved' : 'Save place'}
      >
        <Heart
          size={14}
          className={`${saved ? 'fill-rose-500 text-rose-500' : 'text-gray-600'}`}
        />
        <span>{saved ? 'Saved' : 'Save'}</span>
      </button>
    );
  }

  return (
    <button
      id={`fav-btn-${placeId}`}
      onClick={handleClick}
      aria-label={saved ? 'Remove from saved' : 'Save place'}
      className={`rounded-full transition-all duration-200 active:scale-90 flex items-center justify-center ${
        variant === 'floating'
          ? 'bg-black/30 backdrop-blur-md hover:bg-black/40 text-white shadow-sm'
          : 'bg-white/90 hover:bg-white text-gray-700 shadow-sm border border-gray-100'
      } ${sizeClasses[size]} ${className}`}
    >
      <Heart
        size={iconSizes[size]}
        className={`transition-colors ${
          saved ? 'fill-rose-500 text-rose-500' : 'stroke-[2.2]'
        }`}
      />
    </button>
  );
};
