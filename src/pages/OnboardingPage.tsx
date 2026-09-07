import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight, ChevronRight } from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const { navigate } = useApp();
  const [step, setStep] = useState<number>(1);

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else {
      navigate('/home');
    }
  };

  const handleSkip = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between items-center px-6 pt-12 pb-10 max-w-md mx-auto relative select-none">
      {/* Top Content */}
      <div className="w-full text-center mt-4">
        {step === 1 ? (
          <>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#005B49] tracking-tight">
              Discover local
            </h1>
            <p className="mt-3 text-base sm:text-lg text-gray-700 leading-relaxed max-w-xs mx-auto font-normal">
              Find local food, stays, artisans and experiences along your journey.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#005B49] tracking-tight">
              Make an impact
            </h1>
            <p className="mt-3 text-base sm:text-lg text-gray-700 leading-relaxed max-w-xs mx-auto font-normal">
              Every local discovery helps bring tourism closer to the community.
            </p>
          </>
        )}
      </div>

      {/* Center Illustration Area */}
      <div className="w-full my-6 flex-1 flex items-center justify-center">
        <div className="relative w-full aspect-3/4 max-h-[500px] rounded-b-[48px] overflow-hidden shadow-xl border border-gray-100">
          {step === 1 ? (
            <img
              src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80"
              alt="Discover local artisans and market stalls"
              className="w-full h-full object-cover transition-opacity duration-300"
            />
          ) : (
            <img
              src="https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&fit=crop&q=80"
              alt="Make an impact with local communities"
              className="w-full h-full object-cover transition-opacity duration-300"
            />
          )}

          {/* Artistic warm gradient glow at base */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-4 left-4 right-4 text-white text-xs font-medium backdrop-blur-md bg-black/30 p-2.5 rounded-xl border border-white/20">
            {step === 1
              ? '✨ Supporting 450+ artisan studios & traditional weavers'
              : '🌱 100% direct-to-local tourism contribution'}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="w-full mt-2">
        {step === 1 ? (
          <div className="flex items-center justify-between w-full px-2">
            {/* Pagination Indicators & Skip */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#005B49]" />
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              </div>
              <button
                onClick={handleSkip}
                className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              >
                Skip
              </button>
            </div>

            {/* Next Round Button with Arrow */}
            <button
              id="onboarding-next-btn"
              onClick={handleNext}
              className="w-14 h-14 rounded-full bg-[#005B49] hover:bg-[#004739] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer"
              aria-label="Next step"
            >
              <ArrowRight size={22} />
            </button>
          </div>
        ) : (
          <div className="w-full">
            <button
              id="onboarding-get-started-btn"
              onClick={handleNext}
              className="w-full py-4 px-6 rounded-2xl bg-[#005B49] hover:bg-[#004739] text-white font-bold text-lg shadow-lg active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
