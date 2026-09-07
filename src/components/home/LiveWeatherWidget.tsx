import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sunrise, Sunset, Wind, Droplets, Sun, Sparkles, RefreshCw } from 'lucide-react';

export const LiveWeatherWidget: React.FC = () => {
  const { weather, weatherLoading, currency, setCurrency } = useApp();

  return (
    <div className="rounded-2xl bg-gradient-to-r from-teal-900 via-[#005B49] to-[#004739] text-white p-4 sm:p-5 shadow-sm border border-emerald-800/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Weather condition & temp */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner border border-white/15">
            {weather?.icon || '☀️'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black tracking-tight">
                {weather?.temperature ?? 28}°C
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 font-semibold">
                {weather?.condition || 'Clear & Pleasant'}
              </span>
            </div>
            <p className="text-xs text-emerald-100 font-medium mt-0.5 flex items-center gap-1.5">
              <Sparkles size={12} className="text-amber-300" />
              <span>{weather?.travelRecommendation || 'Ideal for Ganga Sunrise & Ghat Walks'}</span>
            </p>
          </div>
        </div>

        {/* Sunrise / Sunset times essential for Varanasi boat tours & Aarti */}
        <div className="flex items-center gap-3 sm:gap-4 border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
            <Sunrise size={16} className="text-amber-300 shrink-0" />
            <div>
              <div className="text-[10px] text-gray-300 uppercase tracking-wider font-semibold">Sunrise Boat</div>
              <div className="text-xs font-bold text-white">{weather?.sunrise || '05:48 AM'}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
            <Sunset size={16} className="text-orange-300 shrink-0" />
            <div>
              <div className="text-[10px] text-gray-300 uppercase tracking-wider font-semibold">Ganga Aarti</div>
              <div className="text-xs font-bold text-white">{weather?.sunset || '06:18 PM'}</div>
            </div>
          </div>

          {/* Currency Switcher */}
          <div className="hidden lg:flex items-center rounded-xl bg-black/20 p-1 border border-white/10">
            {(['INR', 'USD', 'EUR'] as const).map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => setCurrency(curr)}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currency === curr
                    ? 'bg-white text-[#005B49] shadow-xs'
                    : 'text-emerald-100 hover:text-white'
                }`}
              >
                {curr === 'INR' ? '₹ INR' : curr === 'USD' ? '$ USD' : '€ EUR'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
