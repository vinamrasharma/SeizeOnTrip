import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FavoriteButton } from '../components/common/FavoriteButton';
import { RatingStars } from '../components/common/RatingStars';
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
} from 'lucide-react';

export const BusinessDetailPage: React.FC<{ placeId?: string }> = ({ placeId }) => {
  const { goBack, navigate, places, showToast, currentTrip, setCurrentTrip } = useApp();

  const currentId = placeId || 'shiv-handloom-studio';
  const place = places.find((p) => p.id === currentId) || places[2]; // Default to Shiv Handloom Studio

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
      {/* Top Header Bar (matches 5.png) */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <button
          onClick={goBack}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft size={24} />
        </button>

        <span className="text-xs sm:text-sm font-bold tracking-wider text-gray-900 uppercase">
          06. BUSINESS PROFILE
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

      {/* Hero Image with rounded bottom corners (matches 5.png) */}
      <div className="relative w-full aspect-16/10 sm:aspect-16/9 overflow-hidden bg-gray-100">
        <img
          src={place.imageUrl}
          alt={place.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      </div>

      {/* Main Details Container (matches 5.png) */}
      <div className="px-5 pt-5 pb-6">
        {/* Title & Subtitle */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
          {place.name}
        </h1>
        <p className="text-base text-gray-600 mt-1 font-medium">
          {place.subtitle || 'Authentic Banarasi Handloom'}
        </p>

        {/* Rating and Metadata Row */}
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

        {/* Distance from itinerary */}
        <div className="flex items-center gap-1.5 mt-2.5 text-sm text-gray-500">
          <MapPin size={16} className="text-gray-400 shrink-0" />
          <span>{place.distance}</span>
        </div>

        {/* Verified Local Business Badge (matches 5.png) */}
        <div className="mt-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-[#005B49] text-xs font-bold border border-emerald-100">
            <CheckCircle2 size={15} className="text-[#005B49] shrink-0" />
            <span>Verified Local Business</span>
          </div>
        </div>

        {/* Why AI Recommends This Box (matches 5.png) */}
        <div className="mt-6 p-5 rounded-3xl bg-[#FBFDFB] border border-emerald-100/90 shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-[#005B49]" />
            <h2 className="text-base font-bold text-gray-900">
              Why AI recommends this
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
                  <span>Matches your interest in culture & shopping</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#005B49] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    ✓
                  </span>
                  <span>Within your budget range</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#005B49] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    ✓
                  </span>
                  <span>Near your Day 1 itinerary route (2 km)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#005B49] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    ✓
                  </span>
                  <span className="font-semibold text-[#005B49]">94% match score</span>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* About Section (matches 5.png) */}
        <div className="mt-6">
          <h2 className="text-base font-bold text-gray-900 mb-2">About</h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-normal">
            {place.description}
          </p>
        </div>

        {/* Practical details: address & timings */}
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

        {/* Reviews snippet link */}
        <div className="mt-6 p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Customer Reviews
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

      {/* Sticky Bottom Actions (matches 5.png) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/90 px-4 py-3 safe-area-pb">
        <div className="max-w-3xl mx-auto flex items-center gap-2.5 sm:gap-3">
          {/* Add to Trip Primary button */}
          <button
            id="detail-add-trip-btn"
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

          {/* Get Directions Secondary button */}
          <button
            id="detail-directions-btn"
            onClick={() => {
              setShowDirectionsModal(true);
              showToast(`Navigating to ${place.name}...`);
            }}
            className="flex-1 py-3.5 px-4 rounded-2xl border-2 border-[#005B49] text-[#005B49] hover:bg-[#005B49]/5 font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
          >
            <Navigation size={18} />
            <span>Get Directions</span>
          </button>

          {/* Call icon button */}
          <a
            href={`tel:${place.phone || '+919838014592'}`}
            className="w-13 h-13 rounded-2xl border-2 border-gray-200 hover:border-gray-300 text-gray-800 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all shrink-0 cursor-pointer"
            aria-label="Call Business"
          >
            <Phone size={20} className="text-[#005B49]" />
          </a>
        </div>
      </div>

      {/* Directions Modal */}
      {showDirectionsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-gray-900">Directions to {place.name}</h3>
            <p className="text-xs text-gray-500 mt-1">{place.address}</p>
            <div className="my-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-900 leading-relaxed">
              <strong>Recommended Route:</strong> 12 min via Godowlia Road. Auto-rickshaws and walking trails accessible from Dashashwamedh Ghat.
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={() => {
                  setShowDirectionsModal(false);
                  navigate('/trip/trip-varanasi-3day/map');
                }}
                className="flex-1 py-3 rounded-xl bg-[#005B49] text-white font-bold text-xs cursor-pointer"
              >
                View on Trip Map
              </button>
              <button
                onClick={() => setShowDirectionsModal(false)}
                className="px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
