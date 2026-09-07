import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FavoriteButton } from '../components/common/FavoriteButton';
import { RatingStars } from '../components/common/RatingStars';
import { PlaceGeneralDetailsPanel } from '../components/places/PlaceGeneralDetailsPanel';
import { PlaceExpenseComparisonCard } from '../components/places/PlaceExpenseComparisonCard';
import { DirectionsModal } from '../components/common/DirectionsModal';
import {
  ChevronLeft,
  Share2,
  CheckCircle2,
  MapPin,
  Phone,
  Navigation,
  Clock,
  Plus,
  Check,
  Sparkles,
  ExternalLink,
  Tag,
} from 'lucide-react';

export const GenericPlaceDetailPage: React.FC<{ placeId: string }> = ({ placeId }) => {
  const { goBack, navigate, places, showToast } = useApp();

  const place = places.find((p) => p.id === placeId) || places[0];
  const [isAddedToTrip, setIsAddedToTrip] = useState(false);
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);

  const handleAddToTrip = () => {
    setIsAddedToTrip(true);
    showToast(`Added ${place.name} to Day 1 itinerary!`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: place.name,
        text: `Check out ${place.name} on SeizeOn Trip!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-white pb-28 md:pb-16 max-w-3xl mx-auto">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <button
          onClick={goBack}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft size={24} />
        </button>

        <span className="text-xs sm:text-sm font-bold tracking-wider text-gray-900 uppercase">
          PLACE DISCOVERY
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Share"
          >
            <Share2 size={18} />
          </button>
          <FavoriteButton placeId={place.id} size="md" variant="subtle" />
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative w-full aspect-16/10 sm:aspect-16/9 overflow-hidden bg-gray-100">
        <img
          src={place.imageUrl}
          alt={place.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        {place.isGem && (
          <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-[#005B49] text-white text-xs font-bold shadow-md">
            ✨ Verified Local Gem
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-5 pt-5 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
          {place.name}
        </h1>
        <p className="text-base text-gray-600 mt-1 font-medium">
          {place.subtitle || place.categoryLabel}
        </p>

        {/* Rating and Meta */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3 text-sm text-gray-700">
          <div
            onClick={() => navigate(`/reviews/${place.id}`)}
            className="flex items-center gap-1 cursor-pointer hover:underline"
          >
            <span className="text-amber-500 font-bold">★</span>
            <span className="font-bold text-gray-900">{place.rating}</span>
            <span className="text-gray-500">({place.reviewCount} reviews)</span>
          </div>
          <span className="text-gray-300">|</span>
          <span className="font-medium text-gray-800">{place.categoryLabel}</span>
          <span className="text-gray-400">•</span>
          <span className="font-medium text-gray-800">{place.priceLevel}</span>
        </div>

        <div className="flex items-center gap-2 mt-2.5 text-sm text-gray-600 flex-wrap">
          <button
            type="button"
            onClick={() => setShowDirectionsModal(true)}
            className="flex items-center gap-1.5 font-semibold text-[#005B49] bg-emerald-50 hover:bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200/60 transition-colors cursor-pointer"
            title="Click to view route and directions from current location"
          >
            <Navigation size={13} className="shrink-0" />
            <span>{place.distance || 'Calculated distance'}</span>
          </button>
          <span className="text-gray-300">•</span>
          <div className="flex items-center gap-1 text-gray-700 font-medium">
            <MapPin size={14} className="text-emerald-700 shrink-0" />
            <span>{place.location || place.address || 'Tourism Destination'}</span>
          </div>
        </div>

        {/* AI match card */}
        <div className="mt-6 p-5 rounded-3xl bg-[#FBFDFB] border border-emerald-100/90 shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-[#005B49]" />
            <h2 className="text-base font-bold text-gray-900">
              Why travelers love this
            </h2>
          </div>

          <ul className="space-y-2.5 text-sm text-gray-700">
            {place.aiReasons && place.aiReasons.length > 0 ? (
              place.aiReasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#005B49] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    ✓
                  </span>
                  <span className="leading-snug">{reason}</span>
                </li>
              ))
            ) : (
              <>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#005B49] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    ✓
                  </span>
                  <span>Authentic taste and cultural heritage</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#005B49] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    ✓
                  </span>
                  <span>Directly supports indigenous craft and local owners</span>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* About */}
        <div className="mt-6">
          <h2 className="text-base font-bold text-gray-900 mb-2">About</h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-normal">
            {place.description}
          </p>
        </div>

        {/* Tags */}
        {place.tags && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {place.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Complete Travel & Visit Expenses (Shows Travel and Visit Expenses Differently) */}
        <PlaceExpenseComparisonCard
          place={place}
          className="mt-6"
          onOpenDirections={() => setShowDirectionsModal(true)}
        />

        {/* General Details Panel (Opening, Closing, Aarti & Ritual Timings) */}
        <PlaceGeneralDetailsPanel place={place} />

        {/* Address and Timings */}
        <div className="mt-6 pt-6 border-t border-gray-100 space-y-3 text-xs sm:text-sm text-gray-600">
          {place.address && (
            <div className="flex items-start gap-2.5">
              <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
              <span>{place.address}</span>
            </div>
          )}
          {place.timings && (
            <div className="flex items-center gap-2.5">
              <Clock size={16} className="text-gray-400 shrink-0" />
              <span>{place.timings}</span>
            </div>
          )}
        </div>

        {/* Customer reviews row */}
        <div className="mt-6 p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Traveler Reviews
            </span>
            <div className="flex items-center gap-2 mt-1">
              <RatingStars rating={place.rating} size={15} />
              <span className="text-sm font-bold text-gray-900">
                {place.rating} / 5.0
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate(`/reviews/${place.id}`)}
            className="text-xs font-bold text-[#005B49] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Read all ({place.reviewCount})</span>
            <ExternalLink size={12} />
          </button>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/90 px-4 py-3 safe-area-pb">
        <div className="max-w-3xl mx-auto flex items-center gap-2.5 sm:gap-3">
          <button
            id="generic-add-trip-btn"
            onClick={handleAddToTrip}
            className={`flex-1 py-3.5 px-4 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              isAddedToTrip
                ? 'bg-emerald-700 text-white'
                : 'bg-[#005B49] hover:bg-[#004739] text-white active:scale-[0.98]'
            }`}
          >
            {isAddedToTrip ? (
              <>
                <Check size={18} />
                <span>Added to Trip</span>
              </>
            ) : (
              <>
                <Plus size={18} />
                <span>Add to Trip</span>
              </>
            )}
          </button>

          <button
            id="generic-directions-btn"
            onClick={() => {
              setShowDirectionsModal(true);
              showToast(`Navigating to ${place.name}...`);
            }}
            className="flex-1 py-3.5 px-4 rounded-2xl border-2 border-[#005B49] text-[#005B49] hover:bg-[#005B49]/5 font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
          >
            <Navigation size={18} />
            <span>Get Directions</span>
          </button>

          {place.phone && (
            <a
              href={`tel:${place.phone}`}
              className="w-13 h-13 rounded-2xl border-2 border-gray-200 hover:border-gray-300 text-gray-800 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all shrink-0 cursor-pointer"
              aria-label="Call Place"
            >
              <Phone size={20} className="text-[#005B49]" />
            </a>
          )}
        </div>
      </div>

      <DirectionsModal
        place={place}
        isOpen={showDirectionsModal}
        onClose={() => setShowDirectionsModal(false)}
      />
    </div>
  );
};
