import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RatingStars } from '../components/common/RatingStars';
import {
  ChevronLeft,
  ThumbsUp,
  MessageSquarePlus,
  Filter,
  CheckCircle,
  Star,
  X,
} from 'lucide-react';

export const ReviewsPage: React.FC<{ placeId?: string }> = ({ placeId }) => {
  const { goBack, places, reviews, addReview, user, showToast } = useApp();

  const currentId = placeId || 'shiv-handloom-studio';
  const place = places.find((p) => p.id === currentId) || places[2];
  const placeReviews = reviews[currentId] || [];

  const [activeFilter, setActiveFilter] = useState<'all' | 'verified' | '5star'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New review form state
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [hoverRating, setHoverRating] = useState<number>(0);

  const filteredReviews = placeReviews.filter((r) => {
    if (activeFilter === 'verified') return r.isVerifiedBuyer;
    if (activeFilter === '5star') return r.rating === 5;
    return true;
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      showToast('Please write your review feedback');
      return;
    }

    addReview(currentId, {
      userName: user.name,
      userAvatar: user.avatarUrl,
      rating: newRating,
      comment: newComment,
      isVerifiedBuyer: true,
    });

    setNewComment('');
    setShowAddModal(false);
  };

  return (
    <div className="min-h-screen bg-white pb-24 max-w-2xl mx-auto px-4 pt-4">
      {/* Top Header (matches 13.png) */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md py-2 flex items-center justify-between border-b border-gray-100">
        <button
          onClick={goBack}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft size={24} />
        </button>

        <span className="text-xs sm:text-sm font-bold tracking-wider text-gray-900 uppercase">
          07. REVIEWS & RATINGS
        </span>

        <button
          onClick={() => setShowAddModal(true)}
          className="text-xs font-bold text-[#005B49] hover:text-[#004739] flex items-center gap-1 cursor-pointer"
        >
          <MessageSquarePlus size={16} />
          <span>Write</span>
        </button>
      </div>

      {/* Place Header Summary Card */}
      <div className="mt-4 p-4 rounded-3xl bg-[#F9FBF9] border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">{place.name}</h1>
          <p className="text-xs text-gray-500">{place.subtitle}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <span className="text-amber-500 font-bold">★</span>
            <span className="text-base font-extrabold text-gray-900">{place.rating}</span>
          </div>
          <span className="text-xs text-gray-500">{placeReviews.length} total reviews</span>
        </div>
      </div>

      {/* Ratings Breakdown Grid (matches 13.png) */}
      <div className="my-6 p-5 rounded-3xl bg-white border border-gray-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Big Score Block */}
          <div className="flex flex-col items-center justify-center sm:pr-6 sm:border-r border-gray-100">
            <span className="text-4xl sm:text-5xl font-black text-gray-950">
              {place.rating.toFixed(1)}
            </span>
            <RatingStars rating={place.rating} size={18} className="mt-2" />
            <span className="text-xs text-gray-500 mt-1 font-medium">
              Based on {place.reviewCount} experiences
            </span>
          </div>

          {/* Rating percentage bars */}
          <div className="flex-1 w-full space-y-1.5 text-xs text-gray-600">
            {[
              { stars: 5, pct: 78 },
              { stars: 4, pct: 16 },
              { stars: 3, pct: 4 },
              { stars: 2, pct: 1 },
              { stars: 1, pct: 1 },
            ].map((bar) => (
              <div key={bar.stars} className="flex items-center gap-2">
                <span className="w-10 text-right font-medium">{bar.stars} star</span>
                <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#005B49]"
                    style={{ width: `${bar.pct}%` }}
                  />
                </div>
                <span className="w-8 text-left text-gray-400 font-mono text-[11px]">
                  {bar.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Chips (matches 13.png) */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: `All (${placeReviews.length})` },
          { id: 'verified', label: 'Verified Travelers' },
          { id: '5star', label: '5 Star Only' },
        ].map((chip) => (
          <button
            key={chip.id}
            onClick={() => setActiveFilter(chip.id as any)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === chip.id
                ? 'bg-[#005B49] text-white border-[#005B49]'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Review Cards List (matches 13.png) */}
      <div className="space-y-4">
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200/80 shadow-2xs"
          >
            {/* User row */}
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-3">
                <img
                  src={rev.userAvatar}
                  alt={rev.userName}
                  className="w-9 h-9 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-gray-900">{rev.userName}</h4>
                    {rev.isVerifiedBuyer && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">
                        <CheckCircle size={10} /> Verified
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400">{rev.date}</span>
                </div>
              </div>

              <RatingStars rating={rev.rating} size={13} />
            </div>

            {/* Comment */}
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              {rev.comment}
            </p>

            {/* Helpful Counter */}
            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100 text-xs text-gray-500">
              <button
                onClick={() => showToast('Marked review as helpful')}
                className="inline-flex items-center gap-1 hover:text-[#005B49] transition-colors cursor-pointer"
              >
                <ThumbsUp size={13} />
                <span>Helpful ({rev.helpfulCount})</span>
              </button>
              <button
                onClick={() => showToast('Review reported to moderators for verification')}
                className="hover:text-gray-800 transition-colors text-[11px]"
              >
                Report
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Write Review Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Review {place.name}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Your Overall Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setNewRating(star)}
                      className="p-1 text-2xl transition-transform active:scale-125"
                    >
                      <Star
                        size={28}
                        className={`${
                          (hoverRating || newRating) >= star
                            ? 'fill-amber-500 text-amber-500'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-bold text-gray-700 ml-2">
                    {newRating} / 5
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Your Experience
                </label>
                <textarea
                  rows={4}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share details about the craft quality, artisans met, prices, or recommendations for fellow travelers..."
                  className="w-full p-3.5 rounded-2xl border border-gray-200 text-sm focus:border-[#005B49] focus:outline-hidden"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-xl bg-[#005B49] text-white font-bold text-sm hover:bg-[#004739] cursor-pointer shadow-md"
                >
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-3.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
