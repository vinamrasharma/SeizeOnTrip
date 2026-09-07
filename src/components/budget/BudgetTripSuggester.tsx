import React, { useState, useMemo } from 'react';
import { Place } from '../../types';
import { useApp } from '../../context/AppContext';
import { PlaceCard } from '../cards/PlaceCards';
import {
  Wallet,
  Calendar,
  Sparkles,
  CheckCircle,
  TrendingDown,
  ArrowRight,
  Plus,
  Compass,
  Sliders,
  Info,
} from 'lucide-react';

interface BudgetTripSuggesterProps {
  className?: string;
  onSelectItinerary?: (days: number, budget: string) => void;
}

export const BudgetTripSuggester: React.FC<BudgetTripSuggesterProps> = ({
  className = '',
  onSelectItinerary,
}) => {
  const { places, navigate, updatePlannerData, showToast } = useApp();

  // State
  const [totalBudget, setTotalBudget] = useState<number>(6000);
  const [days, setDays] = useState<number>(3);
  const [travellers, setTravellers] = useState<'Solo' | 'Couple' | 'Group'>('Solo');

  // Budget presets
  const budgetPresets = [
    { label: 'Backpacker', amount: 2500, days: 2 },
    { label: 'Smart Explorer', amount: 6000, days: 3 },
    { label: 'Cultural Heritage', amount: 12000, days: 4 },
    { label: 'Royal Indulgence', amount: 24000, days: 3 },
  ];

  // Calculations
  const dailyBudget = useMemo(() => {
    return Math.round(totalBudget / days);
  }, [totalBudget, days]);

  const personMultiplier = travellers === 'Solo' ? 1 : travellers === 'Couple' ? 1.8 : 3;

  // Breakdown estimations
  const breakdown = useMemo(() => {
    return {
      stay: Math.round(dailyBudget * 0.42),
      food: Math.round(dailyBudget * 0.28),
      activities: Math.round(dailyBudget * 0.20),
      transport: Math.round(dailyBudget * 0.10),
    };
  }, [dailyBudget]);

  // Determine Budget Tier
  const tier = useMemo(() => {
    if (dailyBudget < 1800) return { name: 'Budget-Savvy', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (dailyBudget < 5000) return { name: 'Moderate & Balanced', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    return { name: 'Premium Heritage', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  }, [dailyBudget]);

  // Suggested Places algorithm based on daily budget
  const suggestedPlaces = useMemo(() => {
    return places.filter((place) => {
      const cost = place.priceNumeric || (place.priceLevel === 'Free' ? 0 : 250);

      if (dailyBudget < 1800) {
        // Under ₹1,800/day: Free ghats, affordable street eats, reasonable activities
        return cost <= 600 || place.priceLevel === 'Free' || place.isGem;
      } else if (dailyBudget < 5000) {
        // Under ₹5,000/day: Medium homestays, cooking class, boat tours, chaat
        return cost <= 3000;
      } else {
        // Luxury: includes BrijRama, boutique handloom, private boat tours
        return true;
      }
    }).slice(0, 6);
  }, [places, dailyBudget]);

  // Estimated itinerary total of suggested places
  const estimatedPlacesCost = useMemo(() => {
    return suggestedPlaces.reduce((acc, p) => acc + (p.priceNumeric || 0), 0);
  }, [suggestedPlaces]);

  const savingsRemaining = totalBudget - (estimatedPlacesCost + breakdown.stay * days);

  const handleApplyBudgetToPlan = () => {
    const budgetString =
      totalBudget < 4000
        ? '₹2,500 – ₹4,000'
        : totalBudget < 10000
        ? '₹5,000 – ₹10,000'
        : '₹15,000+';

    updatePlannerData({
      budget: budgetString,
      days: days,
      travellingAs: travellers,
    });

    showToast(`Budget of ₹${totalBudget.toLocaleString()} for ${days} days applied!`);
    navigate('/plan');
  };

  return (
    <div className={`p-5 sm:p-7 rounded-3xl bg-white border border-gray-200 shadow-md ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#005B49] text-xs font-bold border border-emerald-100 mb-2">
            <Wallet size={14} />
            <span>Smart Budget Explorer</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-950 tracking-tight">
            Find Places That Fit Your Budget & Days
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Tell us how much you want to spend, and we'll calculate your daily allowance & curated spots
          </p>
        </div>

        <div className={`px-3 py-1.5 rounded-2xl border text-xs font-bold self-start sm:self-auto ${tier.color}`}>
          {tier.name}
        </div>
      </div>

      {/* Quick Preset Chips */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
        <span className="text-xs font-bold text-gray-500 shrink-0">Popular:</span>
        {budgetPresets.map((preset) => {
          const isSelected = totalBudget === preset.amount && days === preset.days;
          return (
            <button
              key={preset.label}
              onClick={() => {
                setTotalBudget(preset.amount);
                setDays(preset.days);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-[#005B49] text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {preset.label} (₹{preset.amount.toLocaleString()} / {preset.days}d)
            </button>
          );
        })}
      </div>

      {/* Interactive Controls Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 rounded-2xl bg-[#F8FAF9] border border-gray-200/80 mb-6">
        {/* 1. Total Budget Slider */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Total Budget
            </label>
            <span className="text-lg sm:text-xl font-extrabold text-[#005B49]">
              ₹{totalBudget.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min={1500}
            max={35000}
            step={500}
            value={totalBudget}
            onChange={(e) => setTotalBudget(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#005B49]"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
            <span>₹1,500</span>
            <span>₹15,000</span>
            <span>₹35,000+</span>
          </div>
        </div>

        {/* 2. Number of Days */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Trip Duration
            </label>
            <span className="text-base font-extrabold text-gray-900">
              {days} {days === 1 ? 'Day' : 'Days'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5, 7].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  days === d
                    ? 'bg-[#005B49] text-white shadow-2xs'
                    : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* 3. Travelling As */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Travel Style
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['Solo', 'Couple', 'Group'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTravellers(t)}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  travellers === t
                    ? 'bg-[#005B49] text-white shadow-2xs'
                    : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calculated Daily Allocation Pill Bar */}
      <div className="p-4 rounded-2xl bg-white border border-gray-200 mb-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <span className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
            Daily Recommended Spending (~₹{dailyBudget.toLocaleString()} / day)
          </span>
          <span className="text-xs text-gray-500 font-medium">
            For {travellers} traveler • {days} days duration
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100">
            <span className="block text-gray-500 text-[11px]">🏨 Stay & Haveli</span>
            <span className="font-extrabold text-blue-950 text-sm">₹{breakdown.stay}</span>
            <span className="text-[10px] text-blue-600 block mt-0.5">~40%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-orange-50/70 border border-orange-100">
            <span className="block text-gray-500 text-[11px]">🍲 Food & Chaat</span>
            <span className="font-extrabold text-orange-950 text-sm">₹{breakdown.food}</span>
            <span className="text-[10px] text-orange-600 block mt-0.5">~30%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100">
            <span className="block text-gray-500 text-[11px]">🛶 Boats & Tours</span>
            <span className="font-extrabold text-purple-950 text-sm">₹{breakdown.activities}</span>
            <span className="text-[10px] text-purple-600 block mt-0.5">~20%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
            <span className="block text-gray-500 text-[11px]">🛺 Rickshaw & Misc</span>
            <span className="font-extrabold text-emerald-950 text-sm">₹{breakdown.transport}</span>
            <span className="text-[10px] text-emerald-600 block mt-0.5">~10%</span>
          </div>
        </div>
      </div>

      {/* Suggested Places Under This Budget */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#005B49]" />
            <h3 className="text-base font-bold text-gray-900">
              Suggested Places & Experiences Under Your ₹{totalBudget.toLocaleString()} Budget
            </h3>
          </div>
          <span className="text-xs text-gray-500 font-medium">
            {suggestedPlaces.length} matching spots
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          {suggestedPlaces.map((place) => (
            <div
              key={place.id}
              onClick={() => {
                if (place.id === 'shiv-handloom-studio') {
                  navigate(`/business/${place.id}`);
                } else {
                  navigate(`/place/${place.id}`);
                }
              }}
              className="p-3 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all bg-white cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-4/3 rounded-xl overflow-hidden mb-2">
                  <img
                    src={place.imageUrl}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold backdrop-blur-xs">
                    {place.priceNumeric ? `~₹${place.priceNumeric}` : place.priceLevel}
                  </div>
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-1 group-hover:text-[#005B49]">
                  {place.name}
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                  {place.categoryLabel} • {place.distance}
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                <span className="text-amber-600 font-bold">★ {place.rating}</span>
                <span className="text-[#005B49] font-bold group-hover:underline">View →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plan With This Budget CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#005B49] text-white">
        <div>
          <h4 className="font-extrabold text-base tracking-tight">
            Ready to build a {days}-Day Varanasi Journey for ₹{totalBudget.toLocaleString()}?
          </h4>
          <p className="text-xs text-emerald-100 mt-0.5">
            We'll automatically sequence these places into a balanced daily schedule with walking routes.
          </p>
        </div>

        <button
          id="budget-apply-plan-btn"
          onClick={handleApplyBudgetToPlan}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-[#005B49] font-extrabold text-sm hover:bg-amber-50 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <span>Create {days}-Day Itinerary</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
