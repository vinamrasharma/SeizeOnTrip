import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
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
  Route,
  ArrowRight,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';
import { ItineraryStop } from '../types';

export const MapViewPage: React.FC = () => {
  const { goBack, navigate, currentTrip, currentLocation, isLocating, fetchLiveLocation, showToast } = useApp();

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [selectedStopIndex, setSelectedStopIndex] = useState<number>(0);
  const [showDirectionsDrawer, setShowDirectionsDrawer] = useState<boolean>(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const activeDay = currentTrip.days[selectedDayIndex] || currentTrip.days[0];
  const stops = activeDay?.stops || [];
  const currentStop = stops[selectedStopIndex] || stops[0];

  // Helper to get coordinates for a stop (with safe fallback if missing)
  const getStopCoordinates = (stop: ItineraryStop, index: number): [number, number] => {
    if (stop.coordinates?.lat && stop.coordinates?.lng) {
      return [stop.coordinates.lat, stop.coordinates.lng];
    }
    // Fallback based on city / destination
    const baseLat = currentLocation?.coordinates?.lat ?? currentLocation?.lat ?? 25.3176;
    const baseLng = currentLocation?.coordinates?.lng ?? currentLocation?.lng ?? 82.9739;
    return [baseLat + (index * 0.008 - 0.015), baseLng + (index * 0.006 - 0.01)];
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCoords: [number, number] = stops.length > 0 ? getStopCoordinates(stops[0], 0) : [25.3176, 82.9739];

      const map = L.map(mapContainerRef.current, {
        center: initialCoords,
        zoom: 14,
        zoomControl: false,
      });

      // Free OpenStreetMap Tile Layer (Zero Cost, Worldwide Coverage)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      // Clean up map when unmounting
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers, Route Polyline & Bounds when activeDay or stops change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || stops.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Clear existing route line
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    const latLngs: [number, number][] = [];

    stops.forEach((stop, index) => {
      const coords = getStopCoordinates(stop, index);
      latLngs.push(coords);

      const isSelected = index === selectedStopIndex;

      // Custom high-contrast numbered pin icon
      const customIcon = L.divIcon({
        className: 'custom-stop-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="w-9 h-9 rounded-full ${
              isSelected
                ? 'bg-[#005B49] ring-4 ring-emerald-300 ring-opacity-80 scale-110 shadow-xl'
                : 'bg-emerald-800 shadow-md hover:scale-105'
            } text-white font-extrabold flex items-center justify-center text-xs border-2 border-white transition-all">
              ${index + 1}
            </div>
            <div class="absolute -bottom-1 w-2 h-2 bg-inherit rotate-45 border-r border-b border-white"></div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });

      const marker = L.marker(coords, { icon: customIcon }).addTo(map);

      // Popup with place info and action
      const popupHtml = `
        <div style="font-family: inherit; padding: 4px; min-width: 170px;">
          <div style="font-size: 10px; font-weight: 700; color: #005B49; text-transform: uppercase; margin-bottom: 2px;">
            Stop ${index + 1} • ${stop.time}
          </div>
          <div style="font-size: 14px; font-weight: 800; color: #111827; line-height: 1.2; margin-bottom: 4px;">
            ${stop.title}
          </div>
          <div style="font-size: 11px; color: #4B5563; margin-bottom: 6px;">
            ${stop.locationName}
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; border-top: 1px solid #E5E7EB; padding-top: 6px;">
            <span style="font-weight: 700; color: #15803D;">${stop.priceLevel || 'Free'}</span>
            <span style="color: #6B7280;">${stop.duration}</span>
          </div>
        </div>
      `;
      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        setSelectedStopIndex(index);
      });

      markersRef.current.push(marker);
    });

    // Draw route line connecting Stop 1 -> Stop 2 -> Stop 3 -> Stop 4
    if (latLngs.length > 1) {
      const polyline = L.polyline(latLngs, {
        color: '#005B49',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(map);

      polylineRef.current = polyline;
    }

    // Fit map bounds to encompass all stops comfortably
    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    }
  }, [selectedDayIndex, stops]);

  // Center on selected stop when user taps a card
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !stops[selectedStopIndex]) return;

    const coords = getStopCoordinates(stops[selectedStopIndex], selectedStopIndex);
    map.panTo(coords, { animate: true });

    // Open popup for selected marker
    const targetMarker = markersRef.current[selectedStopIndex];
    if (targetMarker) {
      targetMarker.openPopup();
    }
  }, [selectedStopIndex]);

  // Update user's live GPS pin on the map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !currentLocation) return;

    const userLat = currentLocation.coordinates?.lat ?? currentLocation.lat;
    const userLng = currentLocation.coordinates?.lng ?? currentLocation.lng;

    if (typeof userLat !== 'number' || typeof userLng !== 'number' || isNaN(userLat) || isNaN(userLng)) {
      return;
    }

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLat, userLng]);
    } else {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-7 h-7 rounded-full bg-emerald-400 opacity-60 animate-ping"></div>
            <div class="w-4 h-4 rounded-full bg-[#005B49] border-2 border-white shadow-lg"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      userMarkerRef.current = L.marker([userLat, userLng], { icon: userIcon })
        .addTo(map)
        .bindPopup(`<b>You are here</b><br>${currentLocation.locality || 'Live GPS Position'}`);
    }
  }, [currentLocation]);

  // Handlers for zoom and locate
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleRecenter = async () => {
    const userLat = currentLocation?.coordinates?.lat ?? currentLocation?.lat;
    const userLng = currentLocation?.coordinates?.lng ?? currentLocation?.lng;
    if (typeof userLat === 'number' && typeof userLng === 'number' && !isNaN(userLat) && !isNaN(userLng) && mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLat, userLng], 15);
      showToast(`Centered on ${currentLocation.locality || 'your live location'}`);
    } else {
      await fetchLiveLocation();
    }
  };

  // Open external turn-by-turn navigation in Google Maps
  const openExternalDirections = (stop: ItineraryStop, index: number) => {
    const coords = getStopCoordinates(stop, index);
    const dest = `${coords[0]},${coords[1]}`;
    let origin = '';
    const userLat = currentLocation?.coordinates?.lat ?? currentLocation?.lat;
    const userLng = currentLocation?.coordinates?.lng ?? currentLocation?.lng;
    if (typeof userLat === 'number' && typeof userLng === 'number') {
      origin = `${userLat},${userLng}`;
    } else if (index > 0 && stops[index - 1]) {
      const prevCoords = getStopCoordinates(stops[index - 1], index - 1);
      origin = `${prevCoords[0]},${prevCoords[1]}`;
    }

    const url = origin
      ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=walking`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.title + ' ' + stop.locationName)}`;

    window.open(url, '_blank');
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-100 flex flex-col">
      {/* Top Floating Header */}
      <div className="absolute top-4 left-4 right-4 z-1000 flex items-center justify-between pointer-events-none">
        <button
          onClick={goBack}
          className="w-11 h-11 rounded-full bg-white text-gray-800 shadow-md flex items-center justify-center hover:bg-gray-50 pointer-events-auto transition-transform active:scale-95 cursor-pointer border border-gray-100"
          aria-label="Back"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Day selection tabs */}
        <div className="pointer-events-auto flex items-center bg-white/95 backdrop-blur-md p-1 rounded-full shadow-md border border-gray-100 max-w-[280px] sm:max-w-none overflow-x-auto no-scrollbar">
          {currentTrip.days.map((day, dIdx) => (
            <button
              key={day.dayNumber}
              onClick={() => {
                setSelectedDayIndex(dIdx);
                setSelectedStopIndex(0);
                showToast(`Viewing Day ${day.dayNumber} Route`);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedDayIndex === dIdx
                  ? 'bg-[#005B49] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Day {day.dayNumber}
            </button>
          ))}
        </div>

        {/* Route directions toggle */}
        <button
          onClick={() => setShowDirectionsDrawer(!showDirectionsDrawer)}
          className={`w-11 h-11 rounded-full shadow-md flex items-center justify-center pointer-events-auto transition-transform active:scale-95 cursor-pointer border border-gray-100 ${
            showDirectionsDrawer ? 'bg-[#005B49] text-white' : 'bg-white text-gray-800 hover:bg-gray-50'
          }`}
          aria-label="Toggle Route Directions"
          title="Turn-by-turn Route Guide"
        >
          <Route size={20} />
        </button>
      </div>

      {/* Map Action Controls (Zoom & Live GPS) */}
      <div className="absolute right-4 top-20 z-1000 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 rounded-xl bg-white text-gray-800 shadow-md flex items-center justify-center hover:bg-gray-50 active:scale-95 border border-gray-100 cursor-pointer"
          aria-label="Zoom In"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 rounded-xl bg-white text-gray-800 shadow-md flex items-center justify-center hover:bg-gray-50 active:scale-95 border border-gray-100 cursor-pointer"
          aria-label="Zoom Out"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={handleRecenter}
          className={`w-10 h-10 rounded-xl bg-white text-[#005B49] shadow-md flex items-center justify-center hover:bg-gray-50 active:scale-95 border border-gray-100 cursor-pointer ${
            isLocating ? 'animate-pulse text-emerald-600' : ''
          }`}
          title="Center on Live GPS position"
          aria-label="Current Location"
        >
          <Navigation size={18} className={currentLocation ? 'fill-[#005B49]' : ''} />
        </button>
      </div>

      {/* Free Leaflet OpenStreetMap Container */}
      <div id="leaflet-map-canvas" ref={mapContainerRef} className="flex-1 w-full h-full z-0" />

      {/* Route Directions Drawer / Overlay */}
      {showDirectionsDrawer && (
        <div className="absolute inset-x-4 top-20 bottom-36 sm:bottom-28 z-1000 max-w-md mx-auto bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200 p-5 flex flex-col overflow-hidden animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Route size={18} className="text-[#005B49]" />
              <h3 className="font-extrabold text-sm sm:text-base text-gray-900">
                Day {activeDay.dayNumber} Turn-by-Turn Route
              </h3>
            </div>
            <button
              onClick={() => setShowDirectionsDrawer(false)}
              className="text-xs font-bold text-gray-500 hover:text-gray-900 px-2 py-1 rounded-lg hover:bg-gray-100"
            >
              Close
            </button>
          </div>

          <p className="text-xs text-gray-500 mb-3">
            Sequence of destinations from Stop 1 to Stop {stops.length}. Follow this planned flow:
          </p>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {stops.map((stop, idx) => {
              const isLast = idx === stops.length - 1;
              const nextStop = stops[idx + 1];
              return (
                <div key={stop.id} className="relative">
                  <div
                    onClick={() => {
                      setSelectedStopIndex(idx);
                      setShowDirectionsDrawer(false);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      selectedStopIndex === idx
                        ? 'bg-emerald-50 border-emerald-300'
                        : 'bg-white border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#005B49] text-white flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-800">{stop.time}</span>
                          <span className="text-xs font-semibold text-gray-500">{stop.duration}</span>
                        </div>
                        <h4 className="font-bold text-sm text-gray-900 truncate">{stop.title}</h4>
                        <p className="text-xs text-gray-500 truncate">{stop.locationName}</p>
                      </div>
                    </div>
                  </div>

                  {!isLast && nextStop && (
                    <div className="my-1.5 ml-3.5 pl-6 border-l-2 border-dashed border-emerald-300 flex items-center gap-2 py-1 text-[11px] text-gray-500 font-medium">
                      <span>Travel to Stop {idx + 2}</span>
                      <ArrowRight size={12} className="text-emerald-700" />
                      <span className="text-gray-700 font-bold">{nextStop.locationName}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-600">Total Stops: {stops.length}</span>
            <span className="font-bold text-emerald-800">Free OpenStreetMap Engine</span>
          </div>
        </div>
      )}

      {/* Bottom Stop Carousel & Directions Card (matches user request 3) */}
      <div className="absolute bottom-4 left-4 right-4 z-1000 max-w-xl mx-auto pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/90 p-4 pointer-events-auto">
          {/* Day & Stops Summary Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#005B49] text-white flex items-center justify-center text-xs font-bold">
                {selectedStopIndex + 1}
              </span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Stop {selectedStopIndex + 1} of {stops.length}
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Clock size={13} className="text-gray-400" />
              <span className="font-bold">{currentStop?.time || 'Scheduled'}</span>
            </div>
          </div>

          {/* Current Stop Details */}
          {currentStop && (
            <div className="flex items-center gap-3">
              <img
                src={currentStop.imageUrl}
                alt={currentStop.title}
                className="w-16 h-16 rounded-2xl object-cover shrink-0 shadow-2xs"
              />

              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-sm sm:text-base text-gray-950 truncate">
                  {currentStop.title}
                </h4>
                <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                  <MapPin size={12} className="shrink-0 text-gray-400" />
                  <span>{currentStop.locationName}</span>
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100/70 text-[#005B49] text-[11px] font-bold">
                    {currentStop.categoryLabel}
                  </span>
                  <span className="text-xs font-semibold text-gray-600">
                    Est. {currentStop.costEstimate || currentStop.priceLevel || 'Free'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Stop Stepper Navigation & External Turn-by-Turn GPS Button */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => setSelectedStopIndex((prev) => Math.max(0, prev - 1))}
              disabled={selectedStopIndex === 0}
              className="px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Prev
            </button>

            <button
              id="map-external-directions-btn"
              onClick={() => openExternalDirections(currentStop, selectedStopIndex)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#005B49] hover:bg-[#004739] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all cursor-pointer"
            >
              <Navigation size={14} />
              <span>Get Directions</span>
              <ExternalLink size={12} className="opacity-80" />
            </button>

            <button
              onClick={() => setSelectedStopIndex((prev) => Math.min(stops.length - 1, prev + 1))}
              disabled={selectedStopIndex === stops.length - 1}
              className="px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
