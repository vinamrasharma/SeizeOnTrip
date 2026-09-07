import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  size?: number;
  showValue?: boolean;
  className?: string;
  count?: number;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxStars = 5,
  size = 14,
  showValue = false,
  className = '',
  count,
}) => {
  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5 text-amber-500">
        {[...Array(maxStars)].map((_, i) => {
          const fillPercentage = Math.max(0, Math.min(1, rating - i));
          return (
            <div key={i} className="relative inline-block">
              {fillPercentage === 1 ? (
                <Star size={size} className="fill-amber-500 text-amber-500" />
              ) : fillPercentage > 0 ? (
                <div className="relative">
                  <Star size={size} className="text-gray-300" />
                  <div
                    className="absolute top-0 left-0 overflow-hidden"
                    style={{ width: `${fillPercentage * 100}%` }}
                  >
                    <Star size={size} className="fill-amber-500 text-amber-500" />
                  </div>
                </div>
              ) : (
                <Star size={size} className="text-gray-200" />
              )}
            </div>
          );
        })}
      </div>
      {showValue && (
        <span className="font-semibold text-xs text-gray-800 ml-0.5">
          {rating.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className="text-xs text-gray-500">
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
};
