import React, { useState, useMemo } from 'react';
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
  Search,
  Flame,
  UserCheck,
  ShieldCheck,
  Sliders,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Check,
  Layers,
  Utensils,
  Hotel,
  Ticket,
  Car,
} from 'lucide-react';
import { Place } from '../types';

export const PlanWithAIPage: React.FC = () => {
  const { goBack, navigate, plannerData, updatePlannerData, places, showToast } = useApp();

  // Form States
  const [destination, setDestination] = useState(plannerData.destination || 'Varanasi');
  const [days, setDays] = useState(plannerData.days || 3);
  const [totalBudget, setTotalBudget] = useState<number>(7500);
  const [budgetInputText, setBudgetInputText] = useState<string>('7500');
  const [spendingPriority, setSpendingPriority] = useState<'Balanced' | 'Foodie' | 'Heritage Stays' | 'Experiences' | 'Shopping'>('Balanced');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    plannerData.interests || ['Food', 'Culture']
  );
  const [travelCompanion, setTravelCompanion] = useState<string>(
    plannerData.travellingAs || 'Solo'
  );

  // Travel With Strangers States
  const [strangerMatchEnabled, setStrangerMatchEnabled] = useState<boolean>(
    plannerData.travellingAs === 'With Strangers'
  );
  const [selectedCoTravelers, setSelectedCoTravelers] = useState<string[]>(['cotrav-1']);

  // Trendy Places Search State
  const [trendySearch, setTrendySearch] = useState<string>('');
  const [selectedTrendyPlaces, setSelectedTrendyPlaces] = useState<string[]>([]);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  // Interest options
  const interestOptions = [
    { id: 'Food', label: 'Food & Chaat', icon: '🍲' },
    { id: 'Culture', label: 'Culture & Temples', icon: '🛕' },
    { id: 'Nature', label: 'River & Nature', icon: '🌿' },
    { id: 'Shopping', label: 'Artisans & Silk', icon: '🛍️' },
    { id: 'Relaxation', label: 'Yoga & Peace', icon: '🧘' },
    { id: 'Adventure', label: 'Boat Rides', icon: '🛶' },
    { id: 'Photography', label: 'Photo Spots', icon: '📸' },
    { id: 'Spiritual', label: 'Ganga Aarti', icon: '✨' },
  ];

  const companionOptions = [
    { id: 'Solo', label: 'Solo', icon: '🚶' },
    { id: 'Couple', label: 'Couple', icon: '👫' },
    { id: 'Friends', label: 'Friends', icon: '👥' },
    { id: 'Family', label: 'Family', icon: '👨‍👩‍👧' },
    { id: 'With Strangers', label: 'With Strangers', icon: '🤝' },
  ];

  // Verified Strangers Looking for Co-Travelers
  const availableStrangers = [
    {
      id: 'cotrav-1',
      name: 'Kavita R.',
      age: 26,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      interests: ['Street Food', 'Ghat Walks'],
      dates: 'Flexible this week',
      budgetTier: 'Budget Explorer',
      verified: true,
      bio: 'Solo explorer from Delhi looking to share morning sunrise boat rides and split taxi fares.',
    },
    {
      id: 'cotrav-2',
      name: 'Marcus Chen',
      age: 29,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      interests: ['Photography', 'Heritage Weavers'],
      dates: 'Next 3 days',
      budgetTier: 'Moderate',
      verified: true,
      bio: 'Travel photographer documenting historic looms and ancient architecture. Happy to share rides.',
    },
    {
      id: 'cotrav-3',
      name: 'Aditya & Priya',
      age: 27,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      interests: ['Culinary Trails', 'Evening Aarti'],
      dates: 'Weekend trip',
      budgetTier: 'Backpacker',
      verified: true,
      bio: 'Foodie duo aiming to taste all 12 famous chaats and attend Maha Aarti together.',
    },
  ];

  // Trendy Places filtered by search term
  const trendyPlaces = useMemo(() => {
    const term = trendySearch.toLowerCase().trim();
    return places
      .filter((p) => p.isTrending || p.isGem || (p.hypeScore && p.hypeScore > 85))
      .filter((p) => {
        if (!term) return true;
        return (
          p.name.toLowerCase().includes(term) ||
          p.location.toLowerCase().includes(term) ||
          p.tags?.some((t) => t.toLowerCase().includes(term)) ||
          p.categoryLabel.toLowerCase().includes(term)
        );
      });
  }, [places, trendySearch]);

  // Budget calculations
  const dailyBudget = useMemo(() => {
    return Math.round(totalBudget / Math.max(1, days));
  }, [totalBudget, days]);

  // Dynamic budget allocation based on spending priority
  const budgetAllocation = useMemo(() => {
    let stayPct = 0.4;
    let foodPct = 0.3;
    let actPct = 0.2;
    let transPct = 0.1;

    if (spendingPriority === 'Foodie') {
      stayPct = 0.3;
      foodPct = 0.45;
      actPct = 0.15;
      transPct = 0.1;
    } else if (spendingPriority === 'Heritage Stays') {
      stayPct = 0.55;
      foodPct = 0.22;
      actPct = 0.15;
      transPct = 0.08;
    } else if (spendingPriority === 'Experiences') {
      stayPct = 0.32;
      foodPct = 0.23;
      actPct = 0.35;
      transPct = 0.1;
    } else if (spendingPriority === 'Shopping') {
      stayPct = 0.3;
      foodPct = 0.25;
      actPct = 0.35;
      transPct = 0.1;
    }

    return {
      stay: Math.round(dailyBudget * stayPct),
      food: Math.round(dailyBudget * foodPct),
      activities: Math.round(dailyBudget * actPct),
      transport: Math.round(dailyBudget * transPct),
      stayPct: Math.round(stayPct * 100),
      foodPct: Math.round(foodPct * 100),
      actPct: Math.round(actPct * 100),
      transPct: Math.round(transPct * 100),
    };
  }, [dailyBudget, spendingPriority]);

  // Handlers for budget slider & input
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setTotalBudget(val);
    setBudgetInputText(val.toString());
  };

  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setBudgetInputText(raw);
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setTotalBudget(Math.min(250000, parsed));
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const toggleTrendyPlace = (placeId: string) => {
    setSelectedTrendyPlaces((prev) =>
      prev.includes(placeId) ? prev.filter((id) => id !== placeId) : [...prev, placeId]
    );
  };

  const toggleCoTraveler = (id: string) => {
    setSelectedCoTravelers((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleGenerate = () => {
    const budgetCategory =
      totalBudget < 5000 ? 'Budget' : totalBudget < 15000 ? 'Moderate' : 'Luxury';

    updatePlannerData({
      destination,
      days,
      budget: `₹${totalBudget.toLocaleString()} (${budgetCategory})`,
      interests: selectedInterests,
      travellingAs: travelCompanion,
    });

    setIsGenerating(true);
    setGenerationStep(1);

    setTimeout(() => setGenerationStep(2), 700);
    setTimeout(() => setGenerationStep(3), 1400);
    setTimeout(() => {
      setIsGenerating(false);
      showToast(
        travelCompanion === 'With Strangers'
          ? 'Group Itinerary with Co-Travelers generated!'
          : `Personalized ${days}-Day Itinerary for ${destination} generated!`
      );
      navigate('/trip/trip-varanasi-3day');
    }, 2100);
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
          Crafting Your AI Itinerary
        </h2>
        <p className="text-sm text-gray-500 mt-2 max-w-xs">
          Balancing your ₹{totalBudget.toLocaleString()} budget with authentic spots & {travelCompanion.toLowerCase()} preferences...
        </p>

        <div className="w-full max-w-xs mt-8 space-y-3 text-left text-xs font-semibold text-gray-700">
          <div
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
              generationStep >= 1
                ? 'bg-emerald-50 text-[#005B49] border border-emerald-100'
                : 'opacity-40'
            }`}
          >
            <span className="text-base">📍</span>
            <span>Plotting daily route in {destination}</span>
          </div>
          <div
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
              generationStep >= 2
                ? 'bg-emerald-50 text-[#005B49] border border-emerald-100'
                : 'opacity-40'
            }`}
          >
            <span className="text-base">💰</span>
            <span>Allocating ₹{dailyBudget}/day across stays, meals & experiences</span>
          </div>
          <div
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
              generationStep >= 3
                ? 'bg-emerald-50 text-[#005B49] border border-emerald-100'
                : 'opacity-40'
            }`}
          >
            <span className="text-base">🔥</span>
            <span>Integrating {selectedTrendyPlaces.length > 0 ? `${selectedTrendyPlaces.length} selected trendy spots` : 'top-rated viral gems'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32 md:pb-20 max-w-3xl mx-auto px-4 sm:px-6 pt-4">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2 mb-4 border-b border-gray-100">
        <button
          onClick={goBack}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[#005B49] text-xs font-bold">
          <Sparkles size={14} />
          <span>SMART AI TRIP PLANNER</span>
        </div>

        <div className="w-10" />
      </div>

      {/* Main Title */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#005B49] tracking-tight">
          Plan Your Trip with AI
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Custom budget slider, trendy places discovery & group travel with verified strangers.
        </p>
      </div>

      <div className="space-y-7">
        {/* 1. Destination Input */}
        <div className="p-4 rounded-3xl bg-gray-50 border border-gray-200/80">
          <label className="block text-xs uppercase tracking-wider font-extrabold text-gray-500 mb-2">
            1. Where are you heading?
          </label>
          <div className="relative">
            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#005B49]" />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Enter destination (e.g. Varanasi, Jaipur, Tokyo, Paris)"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-[#005B49] focus:ring-1 focus:ring-[#005B49] focus:outline-hidden text-sm sm:text-base text-gray-900 font-bold shadow-2xs"
            />
          </div>
        </div>

        {/* 2. Days Stepper */}
        <div className="p-4 rounded-3xl bg-gray-50 border border-gray-200/80 flex items-center justify-between">
          <div>
            <label className="block text-xs uppercase tracking-wider font-extrabold text-gray-500">
              2. Trip Duration
            </label>
            <span className="text-sm font-semibold text-gray-700">How many days?</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDays(Math.max(1, days - 1))}
              className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer shadow-2xs font-bold"
              aria-label="Decrease days"
            >
              <Minus size={16} />
            </button>
            <span className="text-base font-extrabold text-gray-900 min-w-[36px] text-center">
              {days} {days === 1 ? 'day' : 'days'}
            </span>
            <button
              type="button"
              onClick={() => setDays(Math.min(21, days + 1))}
              className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer shadow-2xs font-bold"
              aria-label="Increase days"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* 3. Writable & Slider Bar for Budget (Issue 4) */}
        <div className="p-5 rounded-3xl bg-linear-to-br from-emerald-50/60 via-white to-amber-50/40 border border-emerald-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Wallet size={16} className="text-[#005B49]" />
                <label className="text-xs uppercase tracking-wider font-extrabold text-gray-600">
                  3. Total Trip Budget (Writable & Slider)
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Drag the bar OR type in your exact budget below
              </p>
            </div>

            {/* Writable input box */}
            <div className="flex items-center bg-white border-2 border-[#005B49] rounded-2xl px-3 py-1.5 shadow-xs self-start sm:self-auto">
              <span className="text-sm font-extrabold text-[#005B49] mr-1">₹</span>
              <input
                type="text"
                value={budgetInputText}
                onChange={handleTextInputChange}
                placeholder="7500"
                className="w-24 text-base font-black text-gray-950 focus:outline-hidden"
              />
              <span className="text-[11px] font-bold text-gray-500 uppercase ml-1">INR</span>
            </div>
          </div>

          {/* Interactive Range Slider */}
          <div className="space-y-2 mb-4">
            <input
              type="range"
              min={1000}
              max={50000}
              step={500}
              value={totalBudget}
              onChange={handleSliderChange}
              className="w-full h-2.5 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-[#005B49]"
            />
            <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 px-1">
              <span>₹1,000 (Backpacker)</span>
              <span>₹25,000</span>
              <span>₹50,000+ (Luxury)</span>
            </div>
          </div>

          {/* Daily breakdown badge */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-emerald-100 shadow-2xs mb-4">
            <span className="text-xs font-semibold text-gray-600">
              Calculated Daily Allowance:
            </span>
            <span className="text-sm font-extrabold text-[#005B49]">
              ≈ ₹{dailyBudget.toLocaleString()} / day
            </span>
          </div>

          {/* Where to Spend - Priority Selector */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-extrabold text-gray-600 mb-2">
              Where do you want to spend most?
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {(['Balanced', 'Foodie', 'Heritage Stays', 'Experiences', 'Shopping'] as const).map(
                (p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSpendingPriority(p)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      spendingPriority === p
                        ? 'bg-[#005B49] text-white border-[#005B49] shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            </div>

            {/* Visual breakdown bars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
                <div className="flex items-center gap-1 text-gray-500 mb-1">
                  <Hotel size={13} className="text-emerald-700" />
                  <span className="font-bold">Stays ({budgetAllocation.stayPct}%)</span>
                </div>
                <div className="font-black text-gray-900">₹{budgetAllocation.stay}/day</div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
                <div className="flex items-center gap-1 text-gray-500 mb-1">
                  <Utensils size={13} className="text-amber-600" />
                  <span className="font-bold">Food ({budgetAllocation.foodPct}%)</span>
                </div>
                <div className="font-black text-gray-900">₹{budgetAllocation.food}/day</div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
                <div className="flex items-center gap-1 text-gray-500 mb-1">
                  <Ticket size={13} className="text-blue-600" />
                  <span className="font-bold">Activities ({budgetAllocation.actPct}%)</span>
                </div>
                <div className="font-black text-gray-900">₹{budgetAllocation.activities}/day</div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
                <div className="flex items-center gap-1 text-gray-500 mb-1">
                  <Car size={13} className="text-purple-600" />
                  <span className="font-bold">Transport ({budgetAllocation.transPct}%)</span>
                </div>
                <div className="font-black text-gray-900">₹{budgetAllocation.transport}/day</div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Travel Companion & "Travel with Strangers" (Issue 4) */}
        <div className="p-5 rounded-3xl bg-gray-50 border border-gray-200/80">
          <div className="flex items-center justify-between mb-3">
            <div>
              <label className="block text-xs uppercase tracking-wider font-extrabold text-gray-500">
                4. Travelling Companion
              </label>
              <span className="text-sm font-bold text-gray-900">Who are you travelling with?</span>
            </div>

            {travelCompanion === 'With Strangers' && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
                🤝 Co-Traveler Mode
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
            {companionOptions.map((comp) => {
              const active = travelCompanion === comp.id;
              return (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() => {
                    setTravelCompanion(comp.id);
                    if (comp.id === 'With Strangers') {
                      setStrangerMatchEnabled(true);
                      showToast('Activated "Travel With Strangers" matchmaking!');
                    } else {
                      setStrangerMatchEnabled(false);
                    }
                  }}
                  className={`py-3 px-2 rounded-2xl text-xs font-bold border cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                    active
                      ? 'bg-[#005B49] text-white border-[#005B49] shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{comp.icon}</span>
                  <span>{comp.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dedicated "Travel With Strangers" Match Panel */}
          {(travelCompanion === 'With Strangers' || strangerMatchEnabled) && (
            <div className="mt-4 p-4 rounded-2xl bg-white border border-amber-200 shadow-xs animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Users size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-gray-900">
                      Travel with Verified Strangers & Split Costs
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Save up to 40% on boat charters, cabs & shared guides
                    </p>
                  </div>
                </div>

                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck size={13} />
                  <span>ID Verified</span>
                </span>
              </div>

              <span className="text-[11px] font-bold text-gray-600 block mb-2 uppercase tracking-wider">
                Select Compatible Co-Travelers for Your Route:
              </span>

              <div className="space-y-2.5 mb-3">
                {availableStrangers.map((st) => {
                  const isSelected = selectedCoTravelers.includes(st.id);
                  return (
                    <div
                      key={st.id}
                      onClick={() => toggleCoTraveler(st.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-300'
                          : 'bg-gray-50/60 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <img
                        src={st.avatar}
                        alt={st.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0 mt-0.5 border"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-gray-900">{st.name}</span>
                            <span className="text-[11px] text-gray-500">• {st.age}y</span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-sm">
                              ✓ Verified
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-amber-800">{st.dates}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{st.bio}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          {st.interests.map((it, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-semibold bg-white px-1.5 py-0.5 rounded-md border text-gray-600"
                            >
                              {it}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-2 ${
                          isSelected
                            ? 'bg-[#005B49] border-[#005B49] text-white'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 text-[11px] text-amber-900 flex items-center gap-2">
                <ShieldCheck size={16} className="text-amber-700 shrink-0" />
                <span>
                  Safety First: All strangers undergo phone + photo verification with emergency contact protocols.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 5. Suggest Trendy Places & Search Bar (Issue 4) */}
        <div className="p-5 rounded-3xl bg-white border border-gray-200/90 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Flame size={18} className="text-rose-500" />
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 tracking-tight">
                  5. Trendy & Viral Places to Include
                </h3>
                <p className="text-xs text-gray-500">
                  Search & pick trending spots to auto-prioritize in your itinerary
                </p>
              </div>
            </div>

            {selectedTrendyPlaces.length > 0 && (
              <span className="text-xs font-bold text-[#005B49] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                {selectedTrendyPlaces.length} selected
              </span>
            )}
          </div>

          {/* Search Bar for Trendy Places */}
          <div className="relative mb-3.5">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={trendySearch}
              onChange={(e) => setTrendySearch(e.target.value)}
              placeholder="Search trendy places (e.g. chaat, ghat, lassi, handloom, aarti)..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs sm:text-sm font-medium focus:outline-hidden focus:border-[#005B49]"
            />
          </div>

          {/* Trendy Places Carousel / Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {trendyPlaces.length > 0 ? (
              trendyPlaces.map((p) => {
                const isSelected = selectedTrendyPlaces.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => toggleTrendyPlace(p.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-emerald-50/80 border-[#005B49] ring-1 ring-[#005B49]'
                        : 'bg-white border-gray-100 hover:border-gray-200 shadow-2xs'
                    }`}
                  >
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 shadow-2xs"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-xs text-gray-900 truncate">{p.name}</h4>
                        <span className="text-[10px] font-bold text-amber-500">★ {p.rating}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">{p.location}</p>

                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-100 truncate">
                          {p.hypeBadge || '🔥 Trendy'}
                        </span>
                        <span className="text-[10px] text-gray-500 font-semibold">
                          {p.priceLevel || 'Free'}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-1 ${
                        isSelected
                          ? 'bg-[#005B49] border-[#005B49] text-white'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected ? <Check size={12} strokeWidth={3} /> : <Plus size={12} className="text-gray-400" />}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center py-6 text-xs text-gray-500">
                No trendy places match "{trendySearch}". Try searching "ghat", "chaat", or "silk".
              </div>
            )}
          </div>
        </div>

        {/* 6. Interests */}
        <div className="p-5 rounded-3xl bg-gray-50 border border-gray-200/80">
          <label className="block text-xs uppercase tracking-wider font-extrabold text-gray-500 mb-2">
            6. What are you interested in?
          </label>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((item) => {
              const selected = selectedInterests.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleInterest(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                    selected
                      ? 'bg-[#005B49] text-white border-[#005B49] shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
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

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/90 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="hidden sm:block">
            <span className="text-xs text-gray-500 block">Total Budget</span>
            <span className="text-base font-black text-gray-900">₹{totalBudget.toLocaleString()}</span>
          </div>

          <button
            id="plan-generate-btn"
            type="button"
            onClick={handleGenerate}
            className="flex-1 py-4 px-5 rounded-2xl bg-[#005B49] hover:bg-[#004739] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
          >
            <Sparkles size={18} className="text-amber-300" />
            <span>
              Generate {days}-Day AI Plan {travelCompanion === 'With Strangers' ? 'with Co-Travelers' : ''}
            </span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
