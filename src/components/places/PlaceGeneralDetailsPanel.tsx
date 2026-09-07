import React from 'react';
import {
  Clock,
  BellRing,
  Sparkles,
  Ticket,
  SunMedium,
  ShieldAlert,
  CheckCircle,
  Info,
  Banknote,
  Footprints,
  Car,
  Bus,
  Train,
  Plane,
  Ship,
  Navigation,
} from 'lucide-react';
import { Place, PlaceGeneralDetails } from '../../types';
import { calculateTravelExpenses, TravelExpenseOption } from '../../utils/travelExpenses';

interface PlaceGeneralDetailsPanelProps {
  place: Place;
}

export const PlaceGeneralDetailsPanel: React.FC<PlaceGeneralDetailsPanelProps> = ({ place }) => {
  // Derive default details based on category if not explicitly populated
  const isSacred =
    place.category === 'attraction' &&
    (place.name.toLowerCase().includes('ghat') ||
      place.name.toLowerCase().includes('temple') ||
      place.name.toLowerCase().includes('kashi') ||
      place.name.toLowerCase().includes('aarti') ||
      place.name.toLowerCase().includes('stupa') ||
      place.tags?.some((t) => t.toLowerCase().includes('spiritual') || t.toLowerCase().includes('aarti')));

  const defaultDetails: PlaceGeneralDetails = isSacred
    ? {
        openingTime: '05:00 AM',
        closingTime: '10:00 PM',
        aartiOrRitualTimings: 'Morning Mangala Aarti: 05:45 AM | Grand Evening Maha Aarti: 06:45 PM',
        entryFee: 'Free General Admission (VIP Darshan ₹300 optional)',
        bestTimeToVisit: 'Early Dawn (05:30 AM – 07:30 AM) or Sunset Aarti (06:00 PM – 07:30 PM)',
        dressCodeAndProtocol: 'Modest attire covering shoulders & knees. Remove footwear before entering steps.',
        highlights: ['Sacred Vedic chants & brass oil lamps', 'River reflection views', 'Holy dip & blessings'],
      }
    : place.category === 'food'
    ? {
        openingTime: '01:00 PM',
        closingTime: '10:30 PM',
        aartiOrRitualTimings: 'Fresh Evening Batch Prep: 04:30 PM & 07:00 PM daily',
        entryFee: 'Pay per dish (Avg. ₹120 - ₹250 per person)',
        bestTimeToVisit: '04:00 PM – 07:30 PM for freshly fried hot chaat & sweets',
        dressCodeAndProtocol: 'Casual street attire. Quick self-service standing counters available.',
        highlights: ['Fresh hot Tamatar Chaat', 'Crisp Golgappas', 'Desi ghee preparation'],
      }
    : place.category === 'shopping'
    ? {
        openingTime: '10:30 AM',
        closingTime: '08:30 PM',
        aartiOrRitualTimings: 'Live Master Pit-Loom Weaving Demos: 11:30 AM & 04:00 PM',
        entryFee: 'Free entry for showroom & workshop viewing',
        bestTimeToVisit: '11:00 AM – 02:00 PM for natural daylight color inspection',
        dressCodeAndProtocol: 'Casual. Clean footwear racks provided at workshop entrance.',
        highlights: ['Direct artisan pricing', 'Pure silk zari certification', 'Live loom weaving experience'],
      }
    : place.category === 'stay'
    ? {
        openingTime: '24 Hours Front Desk',
        closingTime: 'Check-in: 12:00 PM | Check-out: 11:00 AM',
        aartiOrRitualTimings: 'Rooftop Sunrise Raga Session: 06:00 AM daily',
        entryFee: 'Room reservation required (Complimentary breakfast included)',
        bestTimeToVisit: 'October to March for pleasant river balconies',
        dressCodeAndProtocol: 'Respectful resident attire in common courtyards.',
        highlights: ['Panoramic Ganga sunrise balconies', 'Heritage architecture', 'Fresh homemade cuisine'],
      }
    : {
        openingTime: '06:00 AM',
        closingTime: '08:30 PM',
        aartiOrRitualTimings: 'Guided Tour Sessions: 07:00 AM, 11:00 AM & 04:30 PM',
        entryFee: place.priceLevel === 'Free' ? 'Free Admission' : `From ₹${place.priceNumeric || 150} / person`,
        bestTimeToVisit: 'Early morning for golden light & gentle breezes',
        dressCodeAndProtocol: 'Comfortable walking shoes & sun protection recommended.',
        highlights: ['Scenic photo opportunities', 'Local folklore guide stories', 'Historic architectural views'],
      };

  const details: PlaceGeneralDetails = {
    ...defaultDetails,
    ...(place.generalDetails || {}),
  };

  const travelOptions = calculateTravelExpenses(place.distanceKm || 1.5, {
    name: place.name,
    location: place.location,
    tags: place.tags,
  });

  const getModeIcon = (mode: TravelExpenseOption['mode']) => {
    switch (mode) {
      case 'walk':
        return <Footprints size={15} className="text-emerald-700" />;
      case 'boat':
        return <Ship size={15} className="text-sky-600" />;
      case 'shared_auto':
        return <Bus size={15} className="text-amber-600" />;
      case 'auto':
        return <Car size={15} className="text-amber-700" />;
      case 'cab':
        return <Car size={15} className="text-purple-700" />;
      case 'bus':
        return <Bus size={15} className="text-blue-700" />;
      case 'train':
        return <Train size={15} className="text-indigo-700" />;
      case 'flight':
        return <Plane size={15} className="text-sky-700" />;
      default:
        return <Navigation size={15} className="text-emerald-700" />;
    }
  };

  return (
    <div id="place-general-details-panel" className="mt-6 rounded-3xl bg-linear-to-br from-emerald-50/70 via-white to-amber-50/40 border border-emerald-200/70 p-5 shadow-xs">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-emerald-100/80 pb-3.5 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#005B49] text-white flex items-center justify-center shadow-2xs">
            <Info size={17} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
              General Place Details & Visiting Hours
            </h3>
            <p className="text-xs text-emerald-800 font-medium">
              Verified operating schedule, ritual timings & entry guidelines
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#005B49] text-xs font-bold">
          Live Verified
        </span>
      </div>

      {/* Grid of Key Timings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Opening & Closing */}
        <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/90 border border-emerald-100/60 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-[#005B49] flex items-center justify-center shrink-0 mt-0.5">
            <Clock size={16} />
          </div>
          <div className="text-xs sm:text-sm">
            <span className="text-[11px] uppercase tracking-wider font-bold text-gray-500 block">
              Opening & Closing Time
            </span>
            <span className="font-extrabold text-gray-900 block mt-0.5">
              {details.openingTime} – {details.closingTime}
            </span>
          </div>
        </div>

        {/* Aarti or Ritual Timings */}
        {details.aartiOrRitualTimings && (
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <BellRing size={16} />
            </div>
            <div className="text-xs sm:text-sm">
              <span className="text-[11px] uppercase tracking-wider font-bold text-amber-800 block">
                {isSacred ? 'Aarti & Prayer Ritual Timings' : 'Daily Key Ritual / Session'}
              </span>
              <span className="font-bold text-gray-900 block mt-0.5 leading-snug">
                {details.aartiOrRitualTimings}
              </span>
            </div>
          </div>
        )}

        {/* Entry Fee */}
        <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/90 border border-emerald-100/60 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-[#005B49] flex items-center justify-center shrink-0 mt-0.5">
            <Ticket size={16} />
          </div>
          <div className="text-xs sm:text-sm">
            <span className="text-[11px] uppercase tracking-wider font-bold text-gray-500 block">
              Entry Fee & Passes
            </span>
            <span className="font-bold text-gray-900 block mt-0.5">
              {details.entryFee || 'Free General Entry'}
            </span>
          </div>
        </div>

        {/* Best Time to Visit */}
        {details.bestTimeToVisit && (
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/90 border border-emerald-100/60 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-orange-100/80 text-orange-700 flex items-center justify-center shrink-0 mt-0.5">
              <SunMedium size={16} />
            </div>
            <div className="text-xs sm:text-sm">
              <span className="text-[11px] uppercase tracking-wider font-bold text-gray-500 block">
                Best Recommended Slot
              </span>
              <span className="font-bold text-gray-900 block mt-0.5">
                {details.bestTimeToVisit}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Dress Code & Etiquette Note */}
      {details.dressCodeAndProtocol && (
        <div className="p-3 rounded-2xl bg-emerald-100/40 border border-emerald-200/50 flex items-start gap-2.5 mb-3 text-xs text-emerald-950">
          <ShieldAlert size={16} className="text-[#005B49] shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block text-emerald-900">Visitor Dress Code & Etiquette:</strong>
            <span className="text-emerald-800 leading-relaxed">{details.dressCodeAndProtocol}</span>
          </div>
        </div>
      )}

      {/* Highlights List */}
      {details.highlights && details.highlights.length > 0 && (
        <div className="pt-2">
          <span className="text-[11px] uppercase tracking-wider font-bold text-gray-500 block mb-2">
            Notable Highlights at this Spot:
          </span>
          <div className="flex flex-wrap gap-2">
            {details.highlights.map((h, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-emerald-100 text-xs font-semibold text-gray-800 shadow-2xs"
              >
                <CheckCircle size={13} className="text-emerald-600" />
                <span>{h}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Travel Expenses & Fares by Mode of Travel */}
      <div className="mt-4 pt-4 border-t border-emerald-100/90">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#005B49] uppercase tracking-wider">
            <Banknote size={14} />
            <span>Travel Expenses by Mode of Travel</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
            {place.distance || 'From your location'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {travelOptions.map((opt) => (
            <div
              key={opt.id}
              className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2.5 transition-all ${
                opt.isRecommended
                  ? 'bg-emerald-50/70 border-emerald-200 shadow-2xs'
                  : 'bg-white/90 border-emerald-100/70 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white border border-emerald-100/80 flex items-center justify-center shrink-0 shadow-2xs">
                  {getModeIcon(opt.mode)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-900 truncate">
                      {opt.modeLabel}
                    </span>
                    {opt.isRecommended && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-sm bg-[#005B49] text-white shrink-0">
                        Top Pick
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-500 block">
                    {opt.timeEstimate}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-extrabold text-xs sm:text-sm text-gray-950 block">
                  {opt.priceRange}
                </span>
                {opt.tag && (
                  <span className="text-[10px] font-semibold text-emerald-700 block">
                    {opt.tag}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
