import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LiveLocationBar } from '../components/common/LiveLocationBar';
import {
  ChevronLeft,
  Navigation,
  ZoomIn,
  ZoomOut,
  Layers,
  MapPin,
  Clock,
  Compass,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export const MapViewPage: React.FC = () => {
  const { goBack, navigate, currentTrip, currentLocation, isLocating, fetchLiveLocation, showToast } = useApp();
  const [selectedStopIndex, setSelectedStopIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeLayer, setActiveLayer] = useState<'all' | 'food' | 'culture'>('all');

  const activeDay = currentTrip.days[0]; // Day 1
  const stops = activeDay.stops;
  const currentStop = stops[selectedStopIndex] || stops[0];

  // Coordinates for Varanasi map SVG representation
  const mapMarkers = [
    { id: 'assi', x: 220, y: 380, label: '1', name: 'Assi Ghat', time: '09:00 AM', stopIndex: 0 },
    { id: 'lassi', x: 310, y: 270, label: '2', name: 'Blue Lassi Shop', time: '11:30 AM', stopIndex: 1 },
    { id: 'handloom', x: 380, y: 220, label: '3', name: 'Shiv Handloom Studio', time: '02:00 PM', stopIndex: 2 },
    { id: 'dashashwamedh', x: 290, y: 320, label: '4', name: 'Dashashwamedh Ghat', time: '06:30 PM', stopIndex: 3 },
  ];

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#E8ECE9] flex flex-col">
      {/* Top Floating App Bar (matches 12.png) */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <button
          onClick={goBack}
          className="w-11 h-11 rounded-full bg-white text-gray-800 shadow-md flex items-center justify-center hover:bg-gray-50 pointer-events-auto transition-transform active:scale-95 cursor-pointer border border-gray-100"
          aria-label="Back"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-3.5 py-2 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-gray-100 flex items-center gap-2">
            <Compass size={16} className="text-[#005B49]" />
            <span className="text-xs sm:text-sm font-bold text-gray-900">
              Day 1: Varanasi Ghats
            </span>
          </div>

          <div className="hidden sm:block">
            <LiveLocationBar compact={true} />
          </div>
        </div>

        {/* Layer toggle button */}
        <button
          onClick={() => {
            const next = activeLayer === 'all' ? 'food' : activeLayer === 'food' ? 'culture' : 'all';
            setActiveLayer(next);
            showToast(`Map Filter: ${next.toUpperCase()}`);
          }}
          className="w-11 h-11 rounded-full bg-white text-gray-800 shadow-md flex items-center justify-center hover:bg-gray-50 pointer-events-auto transition-transform active:scale-95 cursor-pointer border border-gray-100"
          aria-label="Toggle Map Layers"
        >
          <Layers size={18} />
        </button>
      </div>

      {/* Floating Map Zoom Controls on Right */}
      <div className="absolute right-4 top-24 z-20 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.15))}
          className="w-10 h-10 rounded-xl bg-white text-gray-800 shadow-md flex items-center justify-center hover:bg-gray-50 active:scale-95 border border-gray-100 cursor-pointer"
          aria-label="Zoom in"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(0.85, z - 0.15))}
          className="w-10 h-10 rounded-xl bg-white text-gray-800 shadow-md flex items-center justify-center hover:bg-gray-50 active:scale-95 border border-gray-100 cursor-pointer"
          aria-label="Zoom out"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={async () => {
            setZoomLevel(1);
            await fetchLiveLocation();
          }}
          className={`w-10 h-10 rounded-xl bg-white text-[#005B49] shadow-md flex items-center justify-center hover:bg-gray-50 active:scale-95 border border-gray-100 cursor-pointer ${
            isLocating ? 'animate-spin text-emerald-600' : ''
          }`}
          title="Detect live GPS position"
          aria-label="Current location"
        >
          <Navigation size={18} className={isLocating ? '' : 'fill-[#005B49]'} />
        </button>
      </div>

      {/* Interactive Map Visualizer Canvas */}
      <div className="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center">
        <div
          className="w-full h-full max-w-4xl max-h-[800px] transition-transform duration-300 relative select-none"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg
            viewBox="0 0 600 600"
            className="w-full h-full drop-shadow-sm"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Background land tone */}
            <rect width="600" height="600" fill="#EBF0EC" />

            {/* City road grids */}
            <g stroke="#DCE3DD" strokeWidth="6" strokeLinecap="round">
              <line x1="80" y1="120" x2="420" y2="120" />
              <line x1="120" y1="40" x2="120" y2="520" />
              <line x1="200" y1="80" x2="200" y2="560" />
              <line x1="50" y1="240" x2="360" y2="240" />
              <line x1="60" y1="360" x2="300" y2="360" />
              <line x1="70" y1="460" x2="280" y2="460" />
            </g>

            {/* Ganga River (Curving along the east side of Varanasi) */}
            <path
              d="M 280 0 C 320 150, 240 320, 180 600 L 600 600 L 600 0 Z"
              fill="#CFE6F2"
            />
            {/* Water flow wave accents */}
            <path
              d="M 320 80 Q 340 120 330 180"
              stroke="#A8D5EA"
              strokeWidth="3"
              fill="none"
              strokeDasharray="4 4"
            />
            <path
              d="M 270 260 Q 280 320 250 380"
              stroke="#A8D5EA"
              strokeWidth="3"
              fill="none"
              strokeDasharray="4 4"
            />
            <path
              d="M 220 440 Q 230 480 200 540"
              stroke="#A8D5EA"
              strokeWidth="3"
              fill="none"
              strokeDasharray="4 4"
            />

            {/* River label */}
            <text
              x="420"
              y="280"
              fill="#528AA5"
              fontSize="16"
              fontWeight="bold"
              letterSpacing="3"
              transform="rotate(65, 420, 280)"
            >
              GANGES RIVER
            </text>

            {/* Dotted Itinerary Walking Trail connecting Stop 1 -> 2 -> 3 -> 4 */}
            <path
              d="M 220 380 L 310 270 L 380 220 L 290 320"
              stroke="#005B49"
              strokeWidth="4"
              strokeDasharray="6 6"
              strokeLinecap="round"
              fill="none"
            />

            {/* Map Markers for Itinerary Stops */}
            {mapMarkers.map((marker) => {
              const isSelected = selectedStopIndex === marker.stopIndex;
              return (
                <g
                  key={marker.id}
                  onClick={() => setSelectedStopIndex(marker.stopIndex)}
                  className="cursor-pointer group"
                >
                  {/* Radar pulse for selected pin */}
                  {isSelected && (
                    <circle
                      cx={marker.x}
                      cy={marker.y}
                      r="22"
                      fill="#005B49"
                      fillOpacity="0.25"
                      className="animate-ping"
                    />
                  )}

                  {/* Pin Body */}
                  <circle
                    cx={marker.x}
                    cy={marker.y}
                    r={isSelected ? '16' : '13'}
                    fill={isSelected ? '#005B49' : '#F59E0B'}
                    stroke="#FFFFFF"
                    strokeWidth="3"
                    className="transition-all duration-200"
                  />

                  {/* Pin Number */}
                  <text
                    x={marker.x}
                    y={marker.y + 4}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize={isSelected ? '12' : '10'}
                    fontWeight="bold"
                  >
                    {marker.label}
                  </text>

                  {/* Marker Callout Label */}
                  <rect
                    x={marker.x + 18}
                    y={marker.y - 12}
                    width={marker.name.length * 7.5 + 16}
                    height="24"
                    rx="12"
                    fill="#FFFFFF"
                    stroke="#E5E7EB"
                    strokeWidth="1"
                    filter="drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
                  />
                  <text
                    x={marker.x + 26}
                    y={marker.y + 4}
                    fill="#1F2937"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    {marker.name}
                  </text>
                </g>
              );
            })}

            {/* Live User Location GPS Pulse Pin */}
            {(() => {
              const userX = Math.max(
                80,
                Math.min(
                  520,
                  Math.round(
                    ((currentLocation.coordinates.lng - 82.97) / (83.04 - 82.97)) * 440 + 80
                  )
                )
              );
              const userY = Math.max(
                80,
                Math.min(
                  520,
                  Math.round(
                    (1 - (currentLocation.coordinates.lat - 25.27) / (25.35 - 25.27)) * 440 + 80
                  )
                )
              );

              return (
                <g className="transition-all duration-500">
                  <circle
                    cx={userX}
                    cy={userY}
                    r="20"
                    fill="#0284C7"
                    fillOpacity="0.25"
                    className="animate-ping"
                  />
                  <circle
                    cx={userX}
                    cy={userY}
                    r="9"
                    fill="#0284C7"
                    stroke="#FFFFFF"
                    strokeWidth="3"
                  />
                  <circle cx={userX} cy={userY} r="3" fill="#FFFFFF" />

                  {/* Badge */}
                  <rect
                    x={userX - 60}
                    y={userY - 28}
                    width="120"
                    height="20"
                    rx="10"
                    fill="#0F172A"
                    fillOpacity="0.9"
                  />
                  <text
                    x={userX}
                    y={userY - 14}
                    textAnchor="middle"
                    fill="#38BDF8"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    ● You are here
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>
      </div>

      {/* Bottom Selected Stop Carousel Card (matches 12.png) */}
      <div className="absolute bottom-6 left-4 right-4 z-30 max-w-lg mx-auto">
        <div className="p-4 rounded-3xl bg-white shadow-xl border border-gray-100 flex flex-col gap-3 animate-in slide-in-from-bottom-3">
          {/* Top meta row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#005B49] text-white flex items-center justify-center text-xs font-bold">
                {selectedStopIndex + 1}
              </span>
              <span className="text-xs font-semibold text-[#005B49] flex items-center gap-1">
                <Clock size={12} />
                {currentStop.time} ({currentStop.duration})
              </span>
            </div>

            {/* Prev/Next stop toggles */}
            <div className="flex items-center gap-1">
              <button
                disabled={selectedStopIndex === 0}
                onClick={() => setSelectedStopIndex((i) => Math.max(0, i - 1))}
                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 disabled:opacity-30 cursor-pointer"
              >
                ‹
              </button>
              <button
                disabled={selectedStopIndex === stops.length - 1}
                onClick={() => setSelectedStopIndex((i) => Math.min(stops.length - 1, i + 1))}
                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 disabled:opacity-30 cursor-pointer"
              >
                ›
              </button>
            </div>
          </div>

          {/* Place Title & Description */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              {currentStop.name}
            </h3>
            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
              {currentStop.description}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                if (currentStop.placeId === 'shiv-handloom-studio') {
                  navigate(`/business/${currentStop.placeId}`);
                } else if (currentStop.placeId) {
                  navigate(`/place/${currentStop.placeId}`);
                } else {
                  showToast(`Viewing details for ${currentStop.name}`);
                }
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#005B49] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#004739] cursor-pointer"
            >
              <span>View Stop Details</span>
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => showToast(`Starting live GPS walking directions to ${currentStop.name}`)}
              className="py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-gray-50 cursor-pointer"
            >
              <Navigation size={13} className="text-[#005B49]" />
              <span>Directions</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
