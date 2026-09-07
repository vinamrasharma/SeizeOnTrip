import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Navigation,
  MapPin,
  Compass,
  Footprints,
  Car,
  ExternalLink,
  Map,
  X,
  Copy,
  Check,
  Crosshair,
  Share2,
  Banknote,
  Bus,
  Train,
  Plane,
  Ship,
} from 'lucide-react';
import { calculateTravelExpenses } from '../../utils/travelExpenses';

interface DirectionsModalProps {
  place: {
    id?: string;
    name: string;
    address?: string;
    categoryLabel?: string;
    imageUrl?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  isOpen: boolean;
  onClose: () => void;
}

export const DirectionsModal: React.FC<DirectionsModalProps> = ({
  place,
  isOpen,
  onClose,
}) => {
  const { currentLocation, calculateDistanceTo, navigate, showToast } = useApp();
  const [travelMode, setTravelMode] = useState<'walking' | 'driving'>('walking');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const distInfo = calculateDistanceTo(place.coordinates);
  const userLat = currentLocation.coordinates.lat;
  const userLng = currentLocation.coordinates.lng;
  const destLat = place.coordinates?.lat || 25.3176;
  const destLng = place.coordinates?.lng || 82.9739;

  const expenseOptions = calculateTravelExpenses(distInfo.distanceKm, {
    name: place.name,
    location: place.address,
  });

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${destLat},${destLng}&travelmode=${travelMode}`;

  const handleOpenGoogleMaps = () => {
    window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenInAppMap = () => {
    onClose();
    navigate('/trip/trip-varanasi-3day/map');
  };

  const handleCopyCoordinates = () => {
    const text = `${place.name}\nCoordinates: ${destLat}, ${destLng}\nFrom your location: ${distInfo.formatted} (${travelMode === 'walking' ? `~${distInfo.walkMinutes} min walk` : `~${distInfo.driveMinutes} min drive`})\nDirections: ${googleMapsUrl}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('📋 Directions and coordinates copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      id="directions-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        id="directions-modal-content"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
      >
        {/* Header with destination and close button */}
        <div className="relative p-5 bg-[#005B49] text-white flex items-start justify-between">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-1">
              <Compass size={14} className="animate-spin text-emerald-300" style={{ animationDuration: '8s' }} />
              <span>Wayfinding & Navigation</span>
            </div>
            <h3 className="text-xl font-extrabold text-white truncate leading-tight">
              {place.name}
            </h3>
            <p className="text-xs text-emerald-100/80 truncate mt-0.5">
              {place.address || 'Destination coordinates verified'}
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close directions"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Travel Mode Toggle */}
        <div className="p-4 bg-gray-50/80 border-b border-gray-100 flex items-center justify-center gap-3">
          <button
            onClick={() => setTravelMode('walking')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              travelMode === 'walking'
                ? 'bg-white text-[#005B49] shadow-xs border border-emerald-200/80'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Footprints size={16} />
            <span>Walk (~{distInfo.walkMinutes} min) • ₹0</span>
          </button>

          <button
            onClick={() => setTravelMode('driving')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              travelMode === 'driving'
                ? 'bg-white text-[#005B49] shadow-xs border border-emerald-200/80'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Car size={16} />
            <span>
              Ride (~{distInfo.driveMinutes} min) •{' '}
              {expenseOptions.find((e) => e.mode === 'auto' || e.mode === 'cab')?.priceRange || 'Cab/Auto'}
            </span>
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {/* Waypoint Route Visualizer */}
          <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100 relative">
            {/* Origin */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                <Crosshair size={14} className="animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-white px-1.5 py-0.5 rounded border border-emerald-200/60">
                    {currentLocation.isLiveGps ? 'Your Accurate GPS Position' : 'Current Origin'}
                  </span>
                  {currentLocation.accuracy && (
                    <span className="text-[10px] text-emerald-700 font-mono">
                      (±{currentLocation.accuracy}m GPS accuracy)
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-gray-900 mt-1 truncate">
                  {currentLocation.locality}
                </h4>
                <p className="text-xs text-gray-500 truncate">
                  {currentLocation.formattedAddress || `${currentLocation.sublocality || ''} ${currentLocation.city || ''}`}
                </p>
              </div>
            </div>

            {/* Connecting Vertical Line with Distance Pill */}
            <div className="my-2.5 ml-3.5 pl-6 border-l-2 border-dashed border-emerald-300 py-1.5">
              <div className="inline-flex items-center gap-2 bg-white px-2.5 py-1 rounded-full text-xs font-extrabold text-[#005B49] shadow-2xs border border-emerald-200">
                <span>{distInfo.formatted}</span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-600 font-semibold">{distInfo.bearing}</span>
                <span className="text-gray-300">•</span>
                <span className="text-emerald-700">
                  {travelMode === 'walking' ? `~${distInfo.walkMinutes}m on foot` : `~${distInfo.driveMinutes}m ride`}
                </span>
              </div>
            </div>

            {/* Destination */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                <MapPin size={14} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 bg-white px-1.5 py-0.5 rounded border border-red-200/60">
                  Target Destination
                </span>
                <h4 className="text-sm font-bold text-gray-900 mt-1 truncate">
                  {place.name}
                </h4>
                <p className="text-xs text-gray-500 font-mono">
                  {destLat.toFixed(4)}°N, {destLng.toFixed(4)}°E
                </p>
              </div>
            </div>
          </div>

          {/* Real-time Guidance Tip */}
          <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/70 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
            <Compass size={16} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">Navigation Tip</p>
              <p className="mt-0.5 text-amber-800">
                {distInfo.distanceKm < 1.5
                  ? `At ${distInfo.formatted}, walking along the vibrant local street corridors offers the fastest, most scenic experience.`
                  : `Distance is ${distInfo.formatted}. We recommend an e-rickshaw, auto, or ride-share for a breezy ${distInfo.driveMinutes}-minute trip.`}
              </p>
            </div>
          </div>

          {/* Travel Expenses & Estimated Fares by Mode */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-3.5 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#005B49] uppercase tracking-wider">
                <Banknote size={14} />
                <span>Estimated Travel Expenses</span>
              </div>
              <span className="text-[10px] text-gray-500 font-semibold">
                {distInfo.formatted} away
              </span>
            </div>

            <div className="space-y-1.5">
              {expenseOptions.slice(0, 4).map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    if (opt.mode === 'walk') setTravelMode('walking');
                    else setTravelMode('driving');
                  }}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                    (travelMode === 'walking' && opt.mode === 'walk') ||
                    (travelMode === 'driving' && (opt.mode === 'auto' || opt.mode === 'cab' || opt.mode === 'shared_auto'))
                      ? 'bg-emerald-50 text-emerald-950 font-semibold border border-emerald-200/60'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="truncate font-medium">{opt.modeLabel}</span>
                    {opt.tag && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-gray-100 text-gray-600 font-semibold">
                        {opt.tag}
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-gray-900">{opt.priceRange}</span>
                    <span className="text-gray-400 text-[10px] ml-1.5 font-medium">({opt.timeEstimate})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="space-y-2.5 pt-1">
            {/* 1. Launch Turn-by-Turn in Google Maps */}
            <button
              id="btn-open-google-maps-directions"
              onClick={handleOpenGoogleMaps}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#005B49] hover:bg-[#004739] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              <Navigation size={18} />
              <span>Start Turn-by-Turn in Google Maps</span>
              <ExternalLink size={14} className="opacity-80 ml-0.5" />
            </button>

            {/* 2. View on Trip Interactive Map */}
            <button
              id="btn-view-on-inapp-map"
              onClick={handleOpenInAppMap}
              className="w-full py-3 px-4 rounded-2xl border-2 border-emerald-200 hover:border-[#005B49] text-[#005B49] hover:bg-emerald-50/50 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
            >
              <Map size={16} />
              <span>View Route on Interactive Map</span>
            </button>

            {/* 3. Copy Details & Coordinates */}
            <button
              id="btn-copy-directions-info"
              onClick={handleCopyCoordinates}
              className="w-full py-2.5 px-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? 'Copied Coordinates to Clipboard' : 'Copy Route & Coordinates'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
