import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Place,
  Trip,
  NotificationItem,
  UserProfile,
  PlannerFormData,
  Review,
  UserLocation,
  VaranasiLocality,
  LocationSearchResult,
  CulturalGuideData,
  AirQualityData,
  DistanceInfo,
} from '../types';
import { currentUser as initialUser, mockPlaces, sampleTrip, mockNotifications, mockReviews } from '../data/mockData';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  updateProfile,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
  User,
} from '../lib/firebase';

export interface WeatherData {
  city: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  travelRecommendation: string;
  sunrise: string;
  sunset: string;
  uvIndex: number;
  source: string;
}

interface AppContextType {
  currentRoute: string;
  navigate: (route: string) => void;
  goBack: () => void;
  // Auth state
  isAuthenticated: boolean;
  firebaseUser: User | null;
  isAuthLoading: boolean;
  user: UserProfile;
  loginUser: (email: string, pass: string) => Promise<void>;
  signupUser: (name: string, email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logoutUser: () => Promise<void>;
  updateUserPreferences: (prefs: Partial<UserProfile['preferences']>) => void;
  // Live Geolocation & Locality
  currentLocation: UserLocation;
  isLocating: boolean;
  locationError: string | null;
  localities: VaranasiLocality[];
  fetchLiveLocation: () => Promise<void>;
  selectLocality: (locality: VaranasiLocality) => void;
  setCustomLocation: (customLoc: {
    name: string;
    locality?: string;
    city?: string;
    state?: string;
    country?: string;
    coordinates: { lat: number; lng: number };
    formattedAddress?: string;
    source?: string;
  }) => void;
  searchLocations: (query: string) => Promise<LocationSearchResult[]>;
  calculateDistanceTo: (targetCoords?: { lat: number; lng: number }) => DistanceInfo;
  // Places & Saved
  places: Place[];
  savedPlaceIds: string[];
  toggleSavePlace: (id: string) => void;
  isPlaceSaved: (id: string) => boolean;
  // Trips
  currentTrip: Trip;
  setCurrentTrip: React.Dispatch<React.SetStateAction<Trip>>;
  saveTripToCloud: (tripToSave: Trip) => Promise<void>;
  // Planner
  plannerData: PlannerFormData;
  updatePlannerData: (data: Partial<PlannerFormData>) => void;
  resetPlanner: () => void;
  // Notifications & Reviews
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  unreadNotificationsCount: number;
  reviews: Record<string, Review[]>;
  addReview: (placeId: string, review: Omit<Review, 'id' | 'date' | 'helpfulCount'>) => void;
  // Feedback & Preferences
  toastMessage: string | null;
  showToast: (msg: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  deviceViewMode: 'responsive' | 'mobile-frame';
  setDeviceViewMode: (mode: 'responsive' | 'mobile-frame') => void;
  // Free External API Data
  weather: WeatherData | null;
  weatherLoading: boolean;
  culturalGuide: CulturalGuideData | null;
  airQuality: AirQualityData | null;
  askAIGuide: (question: string) => Promise<{ answer: string; model: string }>;
  currency: 'INR' | 'USD' | 'EUR';
  setCurrency: (curr: 'INR' | 'USD' | 'EUR') => void;
  formatPrice: (inrAmount: number) => string;
}

export const defaultVaranasiLocalities: VaranasiLocality[] = [
  {
    id: 'assi-ghat',
    name: 'Assi Ghat',
    tagline: 'Subah-e-Banaras, Morning Yoga & Aarti',
    zone: 'South Ghats',
    coordinates: { lat: 25.2958, lng: 83.0089 },
    keyAttractions: ['Assi Ghat Cultural Plaza', 'Sunrise Boat Tour', 'Ganga View Homestay'],
  },
  {
    id: 'dashashwamedh',
    name: 'Dashashwamedh Ghat',
    tagline: 'Heart of Evening Ganga Aarti & Boat Docks',
    zone: 'Central Riverfront',
    coordinates: { lat: 25.3075, lng: 83.0105 },
    keyAttractions: ['Dashashwamedh Ghat', 'BrijRama Palace', 'Evening Aarti Boats'],
  },
  {
    id: 'godowlia',
    name: 'Godowlia Chowk',
    tagline: 'Culinary Hub, Famous Chaat & Vibrant Markets',
    zone: 'Central Riverfront',
    coordinates: { lat: 25.3087, lng: 83.0065 },
    keyAttractions: ['Kashi Chaat Corner', 'Banarasi Paan Stalls', 'Vishwanath Corridor Gate'],
  },
  {
    id: 'chowk-vishwanath',
    name: 'Chowk & Vishwanath Gali',
    tagline: 'Golden Temple Alleys, Thatheri Bazar & Sweets',
    zone: 'Old City Heritage',
    coordinates: { lat: 25.3108, lng: 83.0092 },
    keyAttractions: ['Kashi Local Kitchen', 'Shri Kashi Vishwanath Temple', 'Blue Lassi Shop'],
  },
  {
    id: 'madanpura',
    name: 'Madanpura Weavers Quarter',
    tagline: 'Historic Silk Looms & 4th-Gen Master Artisans',
    zone: 'Weavers Quarter',
    coordinates: { lat: 25.2995, lng: 83.0035 },
    keyAttractions: ['Shiv Handloom Studio', 'Zari Weaving Units', 'Artisan Guilds'],
  },
  {
    id: 'sarnath',
    name: 'Sarnath Heritage Zone',
    tagline: 'Dhamek Stupa, Deer Park & Buddhist Antiquity',
    zone: 'North Heritage',
    coordinates: { lat: 25.3811, lng: 83.0214 },
    keyAttractions: ['Dhamek Stupa', 'Archaeological Museum', 'Thai Buddhist Monastery'],
  },
  {
    id: 'lanka-bhu',
    name: 'Lanka (BHU Campus)',
    tagline: 'University Hub, Pahalwan Lassi & Vishwanath Temple',
    zone: 'University & South',
    coordinates: { lat: 25.2815, lng: 82.9995 },
    keyAttractions: ['New Vishwanath Temple (VT)', 'Pahalwan Lassi', 'Bharat Kala Bhavan'],
  },
  {
    id: 'cantt-nadesar',
    name: 'Varanasi Cantt / Nadesar',
    tagline: 'Transit Hub, Heritage Palaces & Luxury Stays',
    zone: 'North Heritage',
    coordinates: { lat: 25.3285, lng: 82.9856 },
    keyAttractions: ['Varanasi Junction Station', 'Nadesar Palace Gardens'],
  },
];

const defaultPlannerData: PlannerFormData = {
  destination: 'Varanasi, Uttar Pradesh',
  days: 3,
  budget: '₹5,000 – ₹10,000',
  interests: ['Culture', 'Food'],
  travellingAs: 'Solo',
  pace: 'Balanced',
  dietary: ['Local Street Food', 'Pure Veg'],
  stayVibe: 'Heritage Haveli',
  transportStyle: 'Walking & Rickshaw',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation State with browser history sync - auto route to /home if authenticated
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('seizeon_authenticated') === 'true';
  });

  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) return hash;
    const isAuth = localStorage.getItem('seizeon_authenticated') === 'true';
    return isAuth ? '/home' : '/login';
  });

  const [routeHistory, setRouteHistory] = useState<string[]>([currentRoute]);
  
  // Auth & Profile State
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserProfile>(initialUser);

  // Live Location & Locality State
  const [currentLocation, setCurrentLocation] = useState<UserLocation>(() => ({
    locality: 'Assi Ghat',
    sublocality: 'South Ghats',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    country: 'India',
    formattedAddress: 'Assi Ghat, Varanasi, Uttar Pradesh',
    coordinates: { lat: 25.2958, lng: 83.0089 },
    accuracy: 10,
    isLiveGps: false,
    timestamp: 'Initial',
    source: 'Varanasi Heritage Zone',
  }));

  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [localities] = useState<VaranasiLocality[]>(defaultVaranasiLocalities);

  // Places & Saved
  const [rawPlaces] = useState<Place[]>(mockPlaces);
  const [savedPlaceIds, setSavedPlaceIds] = useState<string[]>([
    'kashi-chaat-corner',
    'dashashwamedh-ghat',
    'shiv-handloom-studio',
    'ganga-view-homestay',
  ]);
  
  // Trips & Planner
  const [currentTrip, setCurrentTrip] = useState<Trip>(sampleTrip);
  const [plannerData, setPlannerData] = useState<PlannerFormData>(defaultPlannerData);
  
  // Notifications & Reviews
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const [reviews, setReviews] = useState<Record<string, Review[]>>(mockReviews);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('Varanasi');
  const [deviceViewMode, setDeviceViewMode] = useState<'responsive' | 'mobile-frame'>('responsive');

  // Free API data
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(true);
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR'>('INR');
  const [culturalGuide, setCulturalGuide] = useState<CulturalGuideData | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);

  // Handle Hash Changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash !== currentRoute) {
        setCurrentRoute(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentRoute]);

  // Fetch Live Weather, Cultural Guide & Air Quality from Free API endpoints
  useEffect(() => {
    const fetchFreeApiData = async () => {
      try {
        setWeatherLoading(true);
        // 1. Weather
        const weatherPromise = fetch('/api/weather')
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null);

        // 2. Cultural Guide (Aartis, Boat tariffs, Transit fares)
        const culturalPromise = fetch('/api/cultural-guide')
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null);

        // 3. Air Quality
        const aqiPromise = fetch('/api/air-quality')
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null);

        const [weatherData, culturalData, aqiData] = await Promise.all([
          weatherPromise,
          culturalPromise,
          aqiPromise,
        ]);

        if (weatherData) setWeather(weatherData);
        if (culturalData) setCulturalGuide(culturalData);
        if (aqiData) setAirQuality(aqiData);
      } catch (err) {
        console.warn('Could not fetch free API datasets, fallback will be used', err);
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchFreeApiData();
    // Refresh weather & air quality every 10 minutes
    const interval = setInterval(fetchFreeApiData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Firebase Auth State Listener & Firestore profile synchronization
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      setIsAuthLoading(false);

      if (fbUser) {
        setIsAuthenticated(true);
        localStorage.setItem('seizeon_authenticated', 'true');
        // Synchronize or load user profile from Firestore
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            setUser((prev) => ({
              ...prev,
              id: fbUser.uid,
              name: data.name || fbUser.displayName || 'Traveler',
              email: fbUser.email || 'guest@seizeontrip.com',
              avatarUrl: data.avatarUrl || prev.avatarUrl,
              homeCity: data.homeCity || 'Varanasi, India',
              bio: data.bio || prev.bio,
            }));
            if (Array.isArray(data.savedPlaceIds)) {
              setSavedPlaceIds(data.savedPlaceIds);
            }
          } else {
            // First time login for this user: store initial profile in Firestore
            const initialDoc = {
              id: fbUser.uid,
              name: fbUser.displayName || (fbUser.isAnonymous ? 'Guest Explorer' : 'Traveler'),
              email: fbUser.email || 'guest@seizeontrip.com',
              role: 'Verified Traveler',
              avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
              homeCity: 'Varanasi, India',
              savedPlaceIds: savedPlaceIds,
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, initialDoc, { merge: true });
          }
        } catch (e) {
          console.warn('Firestore user profile sync note:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Calculate dynamic distance and direction from user's current location to target coordinates
  const calculateDistanceTo = useCallback(
    (targetCoords?: { lat: number; lng: number }): DistanceInfo => {
      if (!targetCoords || typeof targetCoords.lat !== 'number' || typeof targetCoords.lng !== 'number') {
        return {
          distanceKm: 1.2,
          formatted: '1.2 km away',
          walkMinutes: 15,
          driveMinutes: 5,
          bearing: 'Nearby',
          directionsUrl: '#',
        };
      }
      const lat1 = currentLocation.coordinates.lat;
      const lon1 = currentLocation.coordinates.lng;
      const lat2 = targetCoords.lat;
      const lon2 = targetCoords.lng;

      const R = 6371; // Earth radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const lat1Rad = (lat1 * Math.PI) / 180;
      const lat2Rad = (lat2 * Math.PI) / 180;

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const km = R * c;

      let formatted = '';
      if (km < 0.05) {
        formatted = '0 m • Right here';
      } else if (km < 1) {
        formatted = `${Math.round(km * 1000)} m away`;
      } else if (km < 10) {
        formatted = `${km.toFixed(1)} km away`;
      } else {
        formatted = `${Math.round(km).toLocaleString()} km away`;
      }

      // Walking speed ~ 4.5 km/h -> ~13 mins per km
      const walkMinutes = Math.max(1, Math.round(km * 13));
      // Driving / Auto speed ~ 25-30 km/h in urban India -> ~2.4 mins per km
      const driveMinutes = Math.max(2, Math.round(km * 2.4));

      // Calculate compass bearing
      const y = Math.sin(dLon) * Math.cos(lat2Rad);
      const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
      const brng = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
      const compassDirections = [
        'North (N)',
        'North-East (NE)',
        'East (E)',
        'South-East (SE)',
        'South (S)',
        'South-West (SW)',
        'West (W)',
        'North-West (NW)',
      ];
      const bearing = compassDirections[Math.round(brng / 45) % 8];

      const travelmode = km > 2.5 ? 'driving' : 'walking';
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${lat1},${lon1}&destination=${lat2},${lon2}&travelmode=${travelmode}`;

      return { distanceKm: km, formatted, walkMinutes, driveMinutes, bearing, directionsUrl };
    },
    [currentLocation.coordinates]
  );

  // Dynamic places with distance updated in real-time from current live location
  const places = useMemo(() => {
    return rawPlaces.map((place) => {
      const distInfo = calculateDistanceTo(place.coordinates);
      return {
        ...place,
        distance: distInfo.formatted,
        distanceKm: distInfo.distanceKm,
        walkMinutes: distInfo.walkMinutes,
        driveMinutes: distInfo.driveMinutes,
        bearing: distInfo.bearing,
      };
    });
  }, [rawPlaces, calculateDistanceTo]);

  // Fetch live GPS location from browser with maximum hardware precision and reverse-geocode
  const fetchLiveLocation = async () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      const err = 'Geolocation is not supported by your browser.';
      setLocationError(err);
      showToast(err);
      return;
    }

    setIsLocating(true);
    setLocationError(null);
    showToast('📡 Acquiring high-precision GPS lock...');

    try {
      // Hardware GPS query: enableHighAccuracy: true, maximumAge: 0 forces fresh sensor reading
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0,
        });
      });

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const accuracy = Math.round(position.coords.accuracy || 8);

      // Call our high-precision reverse-geocoding backend
      try {
        const res = await fetch(`/api/location/reverse-geocode?lat=${lat}&lng=${lng}&accuracy=${accuracy}`);
        if (res.ok) {
          const data = await res.json();
          const detectedLocation: UserLocation = {
            locality: data.locality || 'Current Location',
            sublocality: data.sublocality || data.city || '',
            city: data.city || 'Detected City',
            state: data.state || '',
            country: data.country || '',
            formattedAddress: data.formattedAddress,
            coordinates: { lat, lng },
            accuracy,
            isLiveGps: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            source: data.source || 'High-Accuracy Reverse Geocoding',
          };

          setCurrentLocation(detectedLocation);
          if (data.city) setSelectedCity(data.city);
          showToast(`📍 Accurate Location: ${detectedLocation.locality} (±${accuracy}m GPS)`);
          return;
        }
      } catch (apiErr) {
        console.warn('Backend geocode API error, trying client-side fallback:', apiErr);
      }

      // Client-side fallback if backend API is unreachable
      try {
        const osmRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=18`
        );
        if (osmRes.ok) {
          const osmData = await osmRes.json();
          const addr = osmData.address || {};
          const spot = addr.amenity || addr.building || addr.road || addr.suburb || addr.neighbourhood || 'Current Spot';
          const city = addr.city || addr.town || addr.municipality || addr.county || 'Detected City';
          const detectedLocation: UserLocation = {
            locality: `${spot}${city ? `, ${city}` : ''}`,
            sublocality: addr.suburb || addr.neighbourhood || city,
            city,
            state: addr.state || '',
            country: addr.country || '',
            formattedAddress: osmData.display_name,
            coordinates: { lat, lng },
            accuracy,
            isLiveGps: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            source: 'OpenStreetMap Direct Precision Geocoding',
          };
          setCurrentLocation(detectedLocation);
          if (city) setSelectedCity(city);
          showToast(`📍 Accurate Location: ${detectedLocation.locality} (±${accuracy}m GPS)`);
          return;
        }
      } catch (osmErr) {
        console.warn('Direct OSM geocode error:', osmErr);
      }

      // Exact GPS coordinates fallback (No assumptions)
      const latLabel = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`;
      const lngLabel = `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'W'}`;
      const fallbackLocation: UserLocation = {
        locality: `Live Position (${latLabel}, ${lngLabel})`,
        sublocality: `Accuracy: ±${accuracy}m`,
        city: 'Your GPS Location',
        state: '',
        country: '',
        formattedAddress: `Coordinates: ${latLabel}, ${lngLabel} (±${accuracy}m accuracy)`,
        coordinates: { lat, lng },
        accuracy,
        isLiveGps: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'Device Hardware GPS',
      };
      setCurrentLocation(fallbackLocation);
      showToast(`📍 High-Accuracy GPS: ${fallbackLocation.locality}`);
    } catch (geoErr: any) {
      console.warn('Geolocation error:', geoErr);
      let errorMsg = 'Could not access location.';
      if (geoErr.code === 1) {
        errorMsg = 'Location permission was denied. Please allow browser location access or choose a locality.';
      } else if (geoErr.code === 2) {
        errorMsg = 'GPS signal temporarily unavailable. Please try again.';
      } else if (geoErr.code === 3) {
        errorMsg = 'GPS acquisition timed out. Please try again.';
      }
      setLocationError(errorMsg);
      showToast(errorMsg);
    } finally {
      setIsLocating(false);
    }
  };

  const selectLocality = (loc: VaranasiLocality) => {
    setCurrentLocation({
      locality: loc.name,
      sublocality: loc.zone,
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      country: 'India',
      formattedAddress: `${loc.name}, ${loc.zone}, Varanasi`,
      coordinates: loc.coordinates,
      accuracy: 10,
      isLiveGps: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'Selected Varanasi Locality',
    });
    setSelectedCity('Varanasi');
    setLocationError(null);
    showToast(`📍 Locality switched to ${loc.name}! Distances updated.`);
  };

  const setCustomLocation = (customLoc: {
    name: string;
    locality?: string;
    city?: string;
    state?: string;
    country?: string;
    coordinates: { lat: number; lng: number };
    formattedAddress?: string;
    source?: string;
  }) => {
    const locCity = customLoc.city || customLoc.locality || 'Custom Spot';
    setCurrentLocation({
      locality: customLoc.name,
      sublocality: customLoc.locality || customLoc.name,
      city: locCity,
      state: customLoc.state || '',
      country: customLoc.country || '',
      formattedAddress: customLoc.formattedAddress || `${customLoc.name}, ${locCity}`,
      coordinates: customLoc.coordinates,
      accuracy: 12,
      isLiveGps: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: customLoc.source || 'Written Location / Custom Spot',
    });
    if (locCity) setSelectedCity(locCity);
    setLocationError(null);
    showToast(`📍 Location set to "${customLoc.name}"! Distances updated.`);
  };

  const searchLocations = async (query: string): Promise<LocationSearchResult[]> => {
    try {
      const q = encodeURIComponent(query.trim());
      const refLat = currentLocation.coordinates.lat;
      const refLng = currentLocation.coordinates.lng;
      const res = await fetch(`/api/location/search?q=${q}&refLat=${refLat}&refLng=${refLng}`);
      if (res.ok) {
        const data = await res.json();
        return data.results || [];
      }
    } catch (e) {
      console.warn('Error searching locations:', e);
    }
    return [];
  };

  const askAIGuide = async (question: string): Promise<{ answer: string; model: string }> => {
    try {
      const res = await fetch('/api/ai/ask-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          locality: currentLocation.locality,
          travelStyle: user.role || 'Solo Explorer',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return { answer: data.answer, model: data.model };
      }
    } catch (e) {
      console.warn('AI guide error, using fallback:', e);
    }
    return {
      answer: `In Varanasi around ${currentLocation.locality}, the early mornings along the ghats offer the purest spiritual energy and pleasant temperatures. Walk along the riverfront to experience the city at its best.`,
      model: 'Local Heritage System',
    };
  };

  const navigate = (route: string) => {
    window.location.hash = route;
    setCurrentRoute(route);
    setRouteHistory((prev) => [...prev, route]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (routeHistory.length > 1) {
      const newHistory = [...routeHistory];
      newHistory.pop();
      const prevRoute = newHistory[newHistory.length - 1];
      setRouteHistory(newHistory);
      window.location.hash = prevRoute;
      setCurrentRoute(prevRoute);
    } else {
      navigate('/home');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  // Firebase Auth Operations
  const loginUser = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      setIsAuthenticated(true);
      localStorage.setItem('seizeon_authenticated', 'true');
      showToast(`Welcome back, ${cred.user.displayName || 'Traveler'}!`);
      navigate('/home');
    } catch (err: any) {
      const errorCode = err?.code || '';
      const errorMsg = err?.message || '';

      // If Email/Password provider is not toggled on in Firebase Console
      if (errorCode === 'auth/operation-not-allowed' || errorMsg.includes('operation-not-allowed')) {
        console.info('Firebase Email Auth disabled in console; starting local explorer session.');
        setIsAuthenticated(true);
        localStorage.setItem('seizeon_authenticated', 'true');
        setUser((prev) => ({
          ...prev,
          email,
          name: email.split('@')[0] || 'Traveler',
        }));
        showToast(`Welcome back, ${email.split('@')[0] || 'Traveler'}!`);
        navigate('/home');
        return;
      }

      if (errorCode === 'auth/user-not-found' || errorMsg.includes('user-not-found')) {
        throw new Error('No account found with this email. Please check the spelling or sign up.');
      }
      if (errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential' || errorMsg.includes('invalid-credential')) {
        throw new Error('Incorrect password or email. Please verify and try again.');
      }

      throw new Error(err.message || 'Invalid credentials');
    }
  };

  const signupUser = async (name: string, email: string, pass: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      try {
        await updateProfile(cred.user, { displayName: name });
      } catch {
        // Non-critical profile name update
      }
      
      // Save profile to Firestore
      try {
        const userDocRef = doc(db, 'users', cred.user.uid);
        await setDoc(userDocRef, {
          id: cred.user.uid,
          name,
          email,
          role: 'Verified Traveler',
          homeCity: 'Varanasi, India',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
          savedPlaceIds: [],
          createdAt: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.warn('Firestore profile initial sync:', dbErr);
      }

      setIsAuthenticated(true);
      localStorage.setItem('seizeon_authenticated', 'true');
      setUser((prev) => ({ ...prev, id: cred.user.uid, name, email }));
      showToast(`Account created! Welcome to SeizeOn Trip.`);
      navigate('/home');
    } catch (err: any) {
      const errorCode = err?.code || '';
      const errorMsg = err?.message || '';

      // 1. If the email is already in use, attempt seamless sign-in or give clear guidance
      if (errorCode === 'auth/email-already-in-use' || errorMsg.includes('email-already-in-use')) {
        try {
          const signinCred = await signInWithEmailAndPassword(auth, email, pass);
          setIsAuthenticated(true);
          localStorage.setItem('seizeon_authenticated', 'true');
          setUser((prev) => ({
            ...prev,
            id: signinCred.user.uid,
            email: signinCred.user.email || email,
            name: signinCred.user.displayName || name || email.split('@')[0],
          }));
          showToast(`Welcome back! That email is already registered, so we logged you in.`);
          navigate('/home');
          return;
        } catch {
          // If password doesn't match the existing account, prompt clearly
          throw new Error('This email address is already registered. Please log in with your existing password or use Google Sign-In.');
        }
      }

      // 2. If Email/Password provider is not toggled on in Firebase Console
      if (errorCode === 'auth/operation-not-allowed' || errorMsg.includes('operation-not-allowed')) {
        console.info('Firebase Email Auth disabled in console; creating explorer session.');
        setIsAuthenticated(true);
        localStorage.setItem('seizeon_authenticated', 'true');
        const localUid = 'user-' + Date.now();
        const localUser: UserProfile = {
          id: localUid,
          name: name || 'Traveler',
          email: email || 'traveler@seizeontrip.com',
          role: 'Explorer',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
          location: 'Varanasi, India',
          homeCity: 'Varanasi, India',
          bio: 'Cultural explorer, avid street food enthusiast & heritage architecture admirer.',
          tripsCount: 1,
          savedCount: 4,
          reviewsCount: 0,
          levelBadge: 'Heritage Scout',
          preferences: {
            language: 'English',
            defaultLocation: 'Varanasi, India',
            distanceUnit: 'Kilometres (km)',
            theme: 'Light',
            pushNotifications: true,
            tripReminders: true,
            localOffers: true,
            communityUpdates: false,
            pace: 'Balanced',
            dietary: ['Local Street Food', 'Pure Vegetarian'],
            stayVibe: 'Heritage Haveli',
            transportStyle: 'Walking & Rickshaw',
          },
        };
        setUser(localUser);
        showToast(`Account created! Welcome, ${name || 'Traveler'}.`);
        navigate('/home');
        return;
      }

      throw new Error(err.message || 'Unable to register account');
    }
  };

  const loginWithGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      setIsAuthenticated(true);
      localStorage.setItem('seizeon_authenticated', 'true');
      showToast(`Signed in with Google as ${cred.user.displayName || 'Traveler'}!`);
      navigate('/home');
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      throw new Error(err.message || 'Google sign-in failed');
    }
  };

  const loginAsGuest = async () => {
    try {
      await signInAnonymously(auth);
      setIsAuthenticated(true);
      localStorage.setItem('seizeon_authenticated', 'true');
      showToast('Continuing as Guest Explorer');
      navigate('/home');
    } catch (err: any) {
      console.warn('Anonymous sign-in not enabled in console, falling back locally:', err);
      setIsAuthenticated(true);
      localStorage.setItem('seizeon_authenticated', 'true');
      setUser((prev) => ({
        ...prev,
        id: 'guest-' + Date.now(),
        name: 'Guest Explorer',
        email: 'guest@seizeontrip.com',
        role: 'Guest Traveler',
      }));
      showToast('Continuing as Guest Explorer');
      navigate('/home');
    }
  };

  const logoutUser = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      localStorage.removeItem('seizeon_authenticated');
      showToast('Logged out of SeizeOn Trip');
      navigate('/login');
    } catch (err: any) {
      console.error('Logout error:', err);
      setIsAuthenticated(false);
      localStorage.removeItem('seizeon_authenticated');
      navigate('/login');
    }
  };

  // Save place toggle with Firestore persistence
  const toggleSavePlace = async (id: string) => {
    const exists = savedPlaceIds.includes(id);
    const updated = exists ? savedPlaceIds.filter((item) => item !== id) : [...savedPlaceIds, id];
    setSavedPlaceIds(updated);

    const place = places.find((p) => p.id === id);
    const name = place ? place.name : 'Place';
    showToast(exists ? `Removed ${name} from saved` : `Saved ${name} to your collection`);

    // Persist to Firestore if user logged in
    if (firebaseUser) {
      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        await setDoc(userDocRef, { savedPlaceIds: updated }, { merge: true });
      } catch (err) {
        console.warn('Error saving to Firestore:', err);
      }
    }
  };

  const isPlaceSaved = (id: string) => savedPlaceIds.includes(id);

  const updateUserPreferences = (prefs: Partial<UserProfile['preferences']>) => {
    setUser((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, ...prefs },
    }));
    showToast('Preferences updated');
  };

  // Save Trip to Cloud Firestore
  const saveTripToCloud = async (tripToSave: Trip) => {
    if (firebaseUser) {
      try {
        const tripsCollection = collection(db, 'trips');
        await addDoc(tripsCollection, {
          userId: firebaseUser.uid,
          title: tripToSave.title,
          destination: tripToSave.destination,
          daysCount: tripToSave.daysCount,
          days: tripToSave.days,
          createdAt: serverTimestamp(),
        });
        showToast('Itinerary synced securely to your cloud profile!');
      } catch (err) {
        console.warn('Could not persist trip to Firestore:', err);
      }
    }
  };

  const updatePlannerData = (data: Partial<PlannerFormData>) => {
    setPlannerData((prev) => ({ ...prev, ...data }));
  };

  const resetPlanner = () => {
    setPlannerData(defaultPlannerData);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isUnread: false } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
    showToast('All notifications marked as read');
  };

  const unreadNotificationsCount = notifications.filter((n) => n.isUnread).length;

  const addReview = async (
    placeId: string,
    reviewData: Omit<Review, 'id' | 'date' | 'helpfulCount'>
  ) => {
    const newReview: Review = {
      ...reviewData,
      id: `rev-new-${Date.now()}`,
      date: 'Just now',
      helpfulCount: 0,
    };
    setReviews((prev) => ({
      ...prev,
      [placeId]: [newReview, ...(prev[placeId] || [])],
    }));
    showToast('Review published successfully!');

    // Persist review to Firestore
    if (firebaseUser) {
      try {
        const revCollection = collection(db, 'reviews');
        await addDoc(revCollection, {
          placeId,
          userId: firebaseUser.uid,
          userName: reviewData.userName,
          rating: reviewData.rating,
          comment: reviewData.comment,
          createdAt: serverTimestamp(),
        });
      } catch (e) {
        console.warn('Error persisting review to Firestore:', e);
      }
    }
  };

  // Currency Formatter
  const formatPrice = (inrAmount: number) => {
    if (currency === 'USD') {
      const usd = Math.round(inrAmount / 86.5);
      return `$${usd}`;
    }
    if (currency === 'EUR') {
      const eur = Math.round(inrAmount / 93.0);
      return `€${eur}`;
    }
    return `₹${inrAmount.toLocaleString()}`;
  };

  return (
    <AppContext.Provider
      value={{
        currentRoute,
        navigate,
        goBack,
        isAuthenticated,
        firebaseUser,
        isAuthLoading,
        user,
        loginUser,
        signupUser,
        loginWithGoogle,
        loginAsGuest,
        logoutUser,
        updateUserPreferences,
        currentLocation,
        isLocating,
        locationError,
        localities,
        fetchLiveLocation,
        selectLocality,
        setCustomLocation,
        searchLocations,
        calculateDistanceTo,
        places,
        savedPlaceIds,
        toggleSavePlace,
        isPlaceSaved,
        currentTrip,
        setCurrentTrip,
        saveTripToCloud,
        plannerData,
        updatePlannerData,
        resetPlanner,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        unreadNotificationsCount,
        reviews,
        addReview,
        toastMessage,
        showToast,
        selectedCity,
        setSelectedCity,
        deviceViewMode,
        setDeviceViewMode,
        weather,
        weatherLoading,
        culturalGuide,
        airQuality,
        askAIGuide,
        currency,
        setCurrency,
        formatPrice,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
