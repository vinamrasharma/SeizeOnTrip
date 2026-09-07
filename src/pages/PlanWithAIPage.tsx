import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
  Sparkles,
  Minus,
  Plus,
  Compass,
  MapPin,
  Calendar,
  Wallet,
  Heart,
  Users,
  Footprints,
} from 'lucide-react';

export const PlanWithAIPage: React.FC = () => {
  const { goBack, navigate, plannerData, updatePlannerData, showToast } = useApp();

  const [destination, setDestination] = useState(plannerData.destination);
  const [days, setDays] = useState(plannerData.days || 3);
  const [budgetTier, setBudgetTier] = useState<'Budget' | 'Moderate' | 'Luxury'>('Moderate');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    plannerData.interests || ['Food', 'Culture']
  );
  const [travelCompanion, setTravelCompanion] = useState<string>(
    plannerData.travellingAs || 'Solo'
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  const interestOptions = [
    { id: 'Food', label: 'Food', icon: '🍲' },
    { id: 'Culture', label: 'Culture', icon: '🛕' },
    { id: 'Nature', label: 'Nature', icon: '🌿' },
    { id: 'Shopping', label: 'Shopping', icon: '🛍️' },
    { id: 'Relaxation', label: 'Relaxation', icon: '🧘' },
    { id: 'Adventure', label: 'Adventure', icon: '🛶' },
    { id: 'Photography', label: 'Photography', icon: '📸' },
    { id: 'Spiritual', label: 'Spiritual', icon: '✨' },
  ];

  const companionOptions = ['Solo', 'Couple', 'Friends', 'Family'];

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleGenerate = () => {
    updatePlannerData({
      destination,
      days,
      budget: budgetTier === 'Budget' ? '₹3,000 – ₹5,000' : budgetTier === 'Moderate' ? '₹5,000 – ₹10,000' : '₹15,000+',
      interests: selectedInterests,
      travellingAs: travelCompanion,
    });

    setIsGenerating(true);
    setGenerationStep(1);

    setTimeout(() => setGenerationStep(2), 700);
    setTimeout(() => setGenerationStep(3), 1400);
    setTimeout(() => {
      setIsGenerating(false);
      showToast('3-Day Varanasi Itinerary generated!');
      navigate('/trip/trip-varanasi-3day');
    }, 2000);
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12 text-center max-w-md mx-auto">
        <div className="relative mb-8">
          <div className="w-20 h-20 rounded-3xl bg-[#005B49]/10 flex items-center justify-center animate-pulse">
            <Sparkles size={36} className="text-[#005B49] animate-spin duration-3000" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
          </span>
        </div>

        <h2 className="text-2xl font-extrabold text-[#005B49] tracking-tight">
          Crafting Your Local Journey
        </h2>
        <p className="text-sm text-gray-500 mt-2 max-w-xs">
          Balancing sacred ghats, heritage artisan studios, and legendary street food...
        </p>

        <div className="w-full max-w-xs mt-8 space-y-3 text-left text-xs font-semibold text-gray-700">
          <div className={`flex items-center gap-3 p-3 rounded-xl transition-all ${generationStep >= 1 ? 'bg-emerald-50 text-[#005B49] border border-emerald-100' : 'opacity-40'}`}>
            <span className="text-base">📍</span>
            <span>Locating authentic ghats & boatmen</span>
          </div>
          <div className={`flex items-center gap-3 p-3 rounded-xl transition-all ${generationStep >= 2 ? 'bg-emerald-50 text-[#005B49] border border-emerald-100' : 'opacity-40'}`}>
            <span className="text-base">🧵</span>
            <span>Finding verified handloom master weavers</span>
          </div>
          <div className={`flex items-center gap-3 p-3 rounded-xl transition-all ${generationStep >= 3 ? 'bg-emerald-50 text-[#005B49] border border-emerald-100' : 'opacity-40'}`}>
            <span className="text-base">🍲</span>
            <span>Optimizing street food trail near Vishwanath</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-28 md:pb-16 max-w-2xl mx-auto px-5 pt-4">
      {/* Top Header (matches 9.png) */}
      <div className="flex items-center justify-between py-2 mb-4 border-b border-gray-100">
        <button
          onClick={goBack}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft size={24} />
        </button>

        <span className="text-xs sm:text-sm font-bold tracking-wider text-gray-900 uppercase">
          09. PLAN WITH AI
        </span>

        <div className="w-10" />
      </div>

      {/* Main Title (matches 9.png) */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#005B49] tracking-tight">
          Tell us about your trip
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 font-normal">
          We'll craft an itinerary with local food, stays and hidden gems.
        </p>
      </div>

      {/* Form Fields (matches 9.png) */}
      <div className="space-y-6">
        {/* 1. Destination Input */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Where are you going?
          </label>
          <div className="relative">
            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#005B49]" />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Enter destination (e.g. Varanasi)"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:border-[#005B49] focus:ring-1 focus:ring-[#005B49] focus:outline-hidden text-sm sm:text-base text-gray-900 font-medium"
            />
          </div>
        </div>

        {/* 2. Days Stepper (matches 9.png) */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            How many days?
          </label>
          <div className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 bg-gray-50/50">
            <span className="text-sm font-semibold text-gray-700">Trip duration</span>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setDays(Math.max(1, days - 1))}
                className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer shadow-2xs"
                aria-label="Decrease days"
              >
                <Minus size={16} />
              </button>
              <span className="text-base font-extrabold text-gray-900 min-w-[20px] text-center">
                {days}
              </span>
              <button
                type="button"
                onClick={() => setDays(Math.min(14, days + 1))}
                className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer shadow-2xs"
                aria-label="Increase days"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Budget Tier (matches 9.png) */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Budget
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {(['Budget', 'Moderate', 'Luxury'] as const).map((tier) => {
              const active = budgetTier === tier;
              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setBudgetTier(tier)}
                  className={`py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all border cursor-pointer ${
                    active
                      ? 'bg-[#005B49] text-white border-[#005B49] shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {tier}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Travel Companion */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Travelling As
          </label>
          <div className="grid grid-cols-4 gap-2">
            {companionOptions.map((comp) => {
              const active = travelCompanion === comp;
              return (
                <button
                  key={comp}
                  type="button"
                  onClick={() => setTravelCompanion(comp)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-semibold border cursor-pointer transition-all ${
                    active
                      ? 'bg-[#005B49] text-white border-[#005B49]'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {comp}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Interests (matches 9.png) */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            What are you interested in?
          </label>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((item) => {
              const selected = selectedInterests.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleInterest(item.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                    selected
                      ? 'bg-[#005B49] text-white border-[#005B49] shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Generate Button (matches 9.png) */}
      <div className="mt-8 pt-4 border-t border-gray-100">
        <button
          id="plan-generate-btn"
          type="button"
          onClick={handleGenerate}
          className="w-full py-4 rounded-2xl bg-[#005B49] hover:bg-[#004739] text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-md active:scale-[0.99] transition-all cursor-pointer"
        >
          <Sparkles size={18} className="text-amber-300" />
          <span>Generate Itinerary</span>
        </button>
      </div>
    </div>
  );
};
