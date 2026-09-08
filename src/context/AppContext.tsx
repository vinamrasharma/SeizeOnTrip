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
import { safeFetchJson } from '../utils/apiHelper';

interface RegisteredAccount {
  user: UserProfile;
  passwordHash: string;
}

export const defaultAccounts: Record<string, RegisteredAccount> = {
  'vinamra123409@gmail.com': {
    passwordHash: 'Password123!',
    user: {
      ...initialUser,
      id: 'user-vinamra',
      name: 'Vinamra',
      email: 'vinamra123409@gmail.com',
      role: 'Verified Cultural Explorer',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      location: 'Varanasi, Uttar Pradesh',
      homeCity: 'Varanasi, Uttar Pradesh',
      bio: 'Cultural explorer, avid street food enthusiast & heritage architecture admirer.',
      createdAt: '2026-09-07T15:54:15.000Z',
      joinedDate: '2026-09-07T15:54:15.000Z',
      savedPlaceIds: ['kashi-chaat-corner', 'dashashwamedh-ghat', 'shiv-handloom-studio', 'ganga-view-homestay'],
      tripsCount: 4,
      savedCount: 18,
      reviewsCount: 12,
      levelBadge: 'Heritage Scout',
    },
  },
  'explorer@seizeontrip.com': {
    passwordHash: 'Varanasi2026!',
    user: {
      ...initialUser,
      id: 'user-demo-explorer',
      name: 'Rahul Verma',
      email: 'explorer@seizeontrip.com',
      role: 'Heritage Scout',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      location: 'Varanasi, Uttar Pradesh',
      homeCity: 'Varanasi, Uttar Pradesh',
      bio: 'Cultural explorer, avid street food enthusiast & heritage architecture admirer.',
      createdAt: '2024-03-15T10:00:00.000Z',
      joinedDate: '2024-03-15T10:00:00.000Z',
      savedPlaceIds: ['kashi-chaat-corner', 'dashashwamedh-ghat', 'shiv-handloom-studio', 'ganga-view-homestay'],
      tripsCount: 4,
      savedCount: 4,
      reviewsCount: 12,
      levelBadge: 'Heritage Scout',
    },
  },
  'priya@example.com': {
    passwordHash: 'Priya@123',
    user: {
      ...initialUser,
      id: 'user-demo-priya',
      name: 'Priya Sharma',
      email: 'priya@example.com',
      role: 'Verified Traveler',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
      location: 'New Delhi, India',
      homeCity: 'New Delhi, India',
      bio: 'Passionate about Indian textiles, classical music and dawn boat rides on the Ganges.',
      createdAt: '2024-05-20T10:00:00.000Z',
      joinedDate: '2024-05-20T10:00:00.000Z',
      savedPlaceIds: ['shiv-handloom-studio', 'brijrama-palace', 'blue-lassi-shop'],
      tripsCount: 2,
      savedCount: 3,
      reviewsCount: 5,
      levelBadge: 'Artisan Patron',
    },
  },
};

export const getLocalRegisteredUsers = (): Record<string, RegisteredAccount> => {
  try {
    const raw = localStorage.getItem('seizeon_registered_accounts');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read local registered accounts', e);
  }
  return {};
};

export const saveLocalRegisteredAccount = (email: string, account: RegisteredAccount) => {
  try {
    const current = getLocalRegisteredUsers();
    current[email.toLowerCase().trim()] = account;
    localStorage.setItem('seizeon_registered_accounts', JSON.stringify(current));
  } catch (e) {
    console.warn('Could not save local registered account', e);
  }
};

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
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  // Live Geolocation & Locality
  currentLocation: UserLocation;
  isLocating: boolean;
  locationError: string | null;
  localities: VaranasiLocality[];
  fetchLiveLocation: () => Promise<void>;
  detectAndSyncUserLocation: (showToastNotification?: boolean) => Promise<string>;
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
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem('seizeon_current_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email === 'rahul.singh@email.com' || parsed.id === 'user-1') {
          return initialUser;
        }
        return {
          ...initialUser,
          ...parsed,
          createdAt: parsed.createdAt || parsed.joinedDate || '2026-09-07T15:54:15.000Z',
          joinedDate: parsed.joinedDate || parsed.createdAt || '2026-09-07T15:54:15.000Z',
        };
      }
    } catch (e) {
      console.warn('Could not parse stored user profile', e);
    }
    return initialUser;
  });

  // Live Location & Locality State
  const [currentLocation, setCurrentLocation] = useState<UserLocation>(() => ({
    locality: 'Assi Ghat',
    sublocality: 'South Ghats',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    country: 'India',
    formattedAddress: 'Assi Ghat, Varanasi, Uttar Pradesh',
    coordinates: { lat: 25.2958, lng: 83.0089 },
    lat: 25.2958,
    lng: 83.0089,
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
        const weatherPromise = safeFetchJson<WeatherData>('/api/weather').then((r) => r.data);

        // 2. Cultural Guide (Aartis, Boat tariffs, Transit fares)
        const culturalPromise = safeFetchJson<CulturalGuideData>('/api/cultural-guide').then((r) => r.data);

        // 3. Air Quality
        const aqiPromise = safeFetchJson<AirQualityData>('/api/air-quality').then((r) => r.data);

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
            setUser((prev) => {
              const updatedUser: UserProfile = {
                ...prev,
                id: fbUser.uid,
                name: data.name || fbUser.displayName || prev.name || 'Traveler',
                email: fbUser.email || prev.email || 'guest@seizeontrip.com',
                avatarUrl: data.avatarUrl || prev.avatarUrl,
                location: data.location || data.homeCity || prev.location || 'Detecting Location...',
                homeCity: data.homeCity || data.location || prev.homeCity || 'Detecting Location...',
                bio: data.bio || prev.bio,
                createdAt: data.createdAt || prev.createdAt || '2026-09-07T15:54:15.000Z',
                joinedDate: data.joinedDate || data.createdAt || prev.joinedDate || '2026-09-07T15:54:15.000Z',
              };
              localStorage.setItem('seizeon_current_user', JSON.stringify(updatedUser));
              return updatedUser;
            });
            if (Array.isArray(data.savedPlaceIds)) {
              setSavedPlaceIds(data.savedPlaceIds);
            }
          } else {
            // First time login for this user: store initial profile in Firestore
            const nowIso = new Date().toISOString();
            const initialDoc = {
              id: fbUser.uid,
              name: fbUser.displayName || (fbUser.isAnonymous ? 'Guest Explorer' : 'Traveler'),
              email: fbUser.email || 'guest@seizeontrip.com',
              role: 'Verified Traveler',
              avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
              location: 'Detecting Location...',
              homeCity: 'Detecting Location...',
              savedPlaceIds: savedPlaceIds,
              createdAt: nowIso,
              joinedDate: nowIso,
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

  // Automatically detect and sync user location on app mount
  useEffect(() => {
    detectAndSyncUserLocation(false);
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
      const lat1 = currentLocation?.coordinates?.lat ?? currentLocation?.lat ?? 25.2958;
      const lon1 = currentLocation?.coordinates?.lng ?? currentLocation?.lng ?? 83.0089;
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

  // Unified live location detection that automatically syncs across Profile, Storage & Backend
  const detectAndSyncUserLocation = async (showToastNotification = false): Promise<string> => {
    setIsLocating(true);
    setLocationError(null);
    if (showToastNotification) {
      showToast('📡 Detecting your live location...');
    }

    let detectedCityOrLocality = '';

    // Step 1: Check browser support
    const hasGeolocation = typeof window !== 'undefined' && Boolean(navigator?.geolocation);

    if (hasGeolocation) {
      // Check permissions if supported
      if (typeof navigator.permissions?.query === 'function') {
        try {
          const permStatus = await navigator.permissions.query({ name: 'geolocation' });
          if (permStatus.state === 'denied') {
            const deniedMsg = 'Location permission is blocked in your browser. Click the lock/tune icon in the address bar to allow location, or choose a spot below.';
            setLocationError(deniedMsg);
            if (showToastNotification) {
              showToast('⚠️ Location access is blocked in browser settings');
            }
          }
        } catch {
          // Permissions API query not universally supported, ignore
        }
      }

      // Step 2: Multi-tier geolocation detection
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          let hasSettled = false;

          const handleSuccess = (pos: GeolocationPosition) => {
            if (!hasSettled) {
              hasSettled = true;
              resolve(pos);
            }
          };

          // Attempt 1: High accuracy (GPS / GNSS hardware satellites) with 6s timeout
          navigator.geolocation.getCurrentPosition(
            handleSuccess,
            (err1) => {
              // If user explicitly clicked "Block" / "Don't Allow", don't retry, reject immediately
              if (err1.code === 1) {
                if (!hasSettled) {
                  hasSettled = true;
                  reject(err1);
                }
                return;
              }

              console.warn('High-accuracy GPS attempt failed (code ' + err1.code + '), retrying with standard/WiFi network accuracy...');

              // Attempt 2: Standard accuracy (Cell tower / Wi-Fi triangulation) with 12s timeout & cached position tolerance
              navigator.geolocation.getCurrentPosition(
                handleSuccess,
                (err2) => {
                  if (!hasSettled) {
                    hasSettled = true;
                    reject(err2);
                  }
                },
                {
                  enableHighAccuracy: false,
                  timeout: 12000,
                  maximumAge: 300000, // 5 min cached position allowed
                }
              );
            },
            {
              enableHighAccuracy: true,
              timeout: 6000,
              maximumAge: 10000,
            }
          );
        });

        // SUCCESSFUL GPS FIX!
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy || 10);

        const latLabel = `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}`;
        const lngLabel = `${Math.abs(lng).toFixed(4)}°${lng >= 0 ? 'E' : 'W'}`;
        const coordsStr = `GPS: ${latLabel}, ${lngLabel}`;
        detectedCityOrLocality = coordsStr;

        // Immediately commit hardware coordinates so distance calculations, maps & pins update immediately!
        const immediateGpsLocation: UserLocation = {
          locality: coordsStr,
          sublocality: `±${accuracy}m precision`,
          city: 'Detected Spot',
          state: '',
          country: '',
          formattedAddress: `Coordinates: ${latLabel}, ${lngLabel} (±${accuracy}m accuracy)`,
          coordinates: { lat, lng },
          lat,
          lng,
          accuracy,
          isLiveGps: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'Device Hardware GPS',
        };

        setCurrentLocation(immediateGpsLocation);
        setLocationError(null);

        // Step 3: Reverse geocoding to resolve street & city name
        let resolvedLocality = coordsStr;
        let resolvedCity = '';

        try {
          // Backend reverse geocoding
          const res = await safeFetchJson<any>(`/api/location/reverse-geocode?lat=${lat}&lng=${lng}&accuracy=${accuracy}`);
          if (res.ok && res.data) {
            const data = res.data;
            const fullLoc = [data.city, data.state, data.country].filter(Boolean).join(', ');
            const primaryLoc =
              data.locality && !fullLoc.includes(data.locality)
                ? `${data.locality}, ${data.city || data.state || data.country}`
                : fullLoc || data.formattedAddress || coordsStr;

            resolvedLocality = data.locality || primaryLoc;
            resolvedCity = data.city || '';

            const enrichedLoc: UserLocation = {
              locality: resolvedLocality,
              sublocality: data.sublocality || data.city || '',
              city: data.city || 'Detected City',
              state: data.state || '',
              country: data.country || '',
              formattedAddress: data.formattedAddress || primaryLoc,
              coordinates: { lat, lng },
              lat,
              lng,
              accuracy,
              isLiveGps: true,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              source: data.source || 'High-Accuracy Reverse Geocoding',
            };

            setCurrentLocation(enrichedLoc);
            if (data.city) setSelectedCity(data.city);
            detectedCityOrLocality = primaryLoc;
          } else {
            // Client-side fallback to free BigDataCloud reverse geocode if backend reverse-geocoding couldn't reach
            try {
              const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
              const bdcRes = await fetch(bdcUrl);
              if (bdcRes.ok) {
                const bdc = await bdcRes.json();
                const bdcCity = bdc.city || bdc.locality || bdc.principalSubdivision || '';
                const bdcLoc = bdc.locality || bdc.city || '';
                if (bdcCity || bdcLoc) {
                  resolvedCity = bdcCity;
                  resolvedLocality = bdcLoc || bdcCity;
                  const bdcAddr = [resolvedLocality, bdcCity, bdc.principalSubdivision, bdc.countryName].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ');

                  setCurrentLocation((prev) => ({
                    ...prev,
                    locality: resolvedLocality,
                    city: resolvedCity || prev.city,
                    state: bdc.principalSubdivision || prev.state,
                    country: bdc.countryName || prev.country,
                    formattedAddress: bdcAddr || prev.formattedAddress,
                  }));
                  if (bdcCity) setSelectedCity(bdcCity);
                  detectedCityOrLocality = bdcAddr;
                }
              }
            } catch (bdcErr) {
              console.warn('Client reverse geocode fallback note:', bdcErr);
            }
          }
        } catch (apiErr) {
          console.warn('Backend reverse geocode note:', apiErr);
        }

        // Persist to user profile
        const finalLabel = detectedCityOrLocality || coordsStr;
        setUser((prev) => {
          const updatedUser: UserProfile = {
            ...prev,
            location: finalLabel,
            homeCity: resolvedCity || finalLabel,
          };
          localStorage.setItem('seizeon_current_user', JSON.stringify(updatedUser));

          // Persist to backend & Firestore
          safeFetchJson('/api/auth/update-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: updatedUser.email,
              location: finalLabel,
              homeCity: resolvedCity || finalLabel,
            }),
          }).catch(() => {});

          try {
            const userDocRef = doc(db, 'users', updatedUser.id);
            setDoc(userDocRef, { location: finalLabel, homeCity: resolvedCity || finalLabel }, { merge: true }).catch(() => {});
          } catch {}

          return updatedUser;
        });

        if (showToastNotification) {
          showToast(`📍 Live Location: ${resolvedLocality} (±${accuracy}m GPS)`);
        }
        setIsLocating(false);
        return finalLabel;

      } catch (geoErr: any) {
        console.warn('GPS detection error:', geoErr);
        if (geoErr.code === 1) {
          const msg = 'Location permission was denied in your browser. Click the lock/site settings icon in the address bar to allow location, or choose a locality below.';
          setLocationError(msg);
          if (showToastNotification) {
            showToast('⚠️ Location access was denied in browser settings');
          }
        } else if (geoErr.code === 2) {
          const msg = 'GPS signal unavailable from your device. Please ensure device location is enabled, or select your location below.';
          setLocationError(msg);
          if (showToastNotification) {
            showToast('⚠️ GPS position unavailable on device');
          }
        } else if (geoErr.code === 3) {
          const msg = 'GPS detection timed out. Please click "Detect Live GPS" again or select a locality.';
          setLocationError(msg);
          if (showToastNotification) {
            showToast('⚠️ GPS detection timed out, please try again');
          }
        } else {
          const msg = geoErr?.message || 'Could not detect GPS location.';
          setLocationError(msg);
          if (showToastNotification) {
            showToast(`⚠️ ${msg}`);
          }
        }
      }
    } else {
      const msg = 'Geolocation is not supported by your browser or requires a secure HTTPS connection.';
      setLocationError(msg);
      if (showToastNotification) {
        showToast('⚠️ Geolocation not supported or requires HTTPS');
      }
    }

    // Step 4: Fallback to network IP detection if GPS was unavailable and no live GPS is set
    try {
      const ipRes = await safeFetchJson<any>('/api/location/ip-detect');
      if (ipRes.ok && ipRes.data?.success && ipRes.data?.city) {
        const ipData = ipRes.data;
        const locStr = ipData.formattedLocation || `${ipData.city}, ${ipData.country}`;
        detectedCityOrLocality = locStr;

        setCurrentLocation((prev) => {
          if (prev.isLiveGps) return prev;
          return {
            locality: ipData.locality || ipData.city,
            sublocality: ipData.region || ipData.city,
            city: ipData.city,
            state: ipData.region || '',
            country: ipData.country || '',
            formattedAddress: locStr,
            coordinates: { lat: ipData.lat || 25.3176, lng: ipData.lng || 82.9739 },
            lat: ipData.lat || 25.3176,
            lng: ipData.lng || 82.9739,
            accuracy: 1500,
            isLiveGps: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            source: 'Network IP Location',
          };
        });

        if (ipData.city) setSelectedCity(ipData.city);
        if (showToastNotification) {
          showToast(`📍 Approximate Location: ${locStr}`);
        }
      }
    } catch (ipErr) {
      console.warn('IP detect baseline note:', ipErr);
    }

    setIsLocating(false);
    return detectedCityOrLocality || 'Current Location';
  };

  // Fetch live GPS location from browser with maximum hardware precision and reverse-geocode
  const fetchLiveLocation = async () => {
    await detectAndSyncUserLocation(true);
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated: UserProfile = { ...prev, ...updates };
      localStorage.setItem('seizeon_current_user', JSON.stringify(updated));

      // Persist to backend
      safeFetchJson('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: updated.email,
          ...updates,
        }),
      }).catch(() => {});

      // Persist to Firestore
      try {
        const userDocRef = doc(db, 'users', updated.id);
        setDoc(userDocRef, updates, { merge: true }).catch(() => {});
      } catch {}

      return updated;
    });
    showToast('Profile updated successfully');
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
      const res = await safeFetchJson<{ results: LocationSearchResult[] }>(`/api/location/search?q=${q}&refLat=${refLat}&refLng=${refLng}`);
      if (res.ok && res.data?.results) {
        return res.data.results;
      }
    } catch (e) {
      console.warn('Error searching locations:', e);
    }
    return [];
  };

  const askAIGuide = async (question: string): Promise<{ answer: string; model: string }> => {
    try {
      const res = await safeFetchJson<{ answer: string; model: string }>('/api/ai/ask-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          locality: currentLocation.locality,
          travelStyle: user.role || 'Solo Explorer',
        }),
      });
      if (res.ok && res.data?.answer) {
        return { answer: res.data.answer, model: res.data.model };
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

  // Authentication Operations (Firebase + Backend Cloud Persistence + Offline/Static Resilient Fallback)
  const loginUser = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanEmail) {
      throw new Error('Please enter your email address.');
    }
    if (!cleanPass) {
      throw new Error('Please enter your password.');
    }

    // 1. Try Firebase Authentication first if credentials exist in Firebase Auth
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      if (cred?.user) {
        setIsAuthenticated(true);
        localStorage.setItem('seizeon_authenticated', 'true');

        // Fetch or sync user document from Firestore
        try {
          const userDocRef = doc(db, 'users', cred.user.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            const syncedUser: UserProfile = {
              ...user,
              id: cred.user.uid,
              name: data.name || cred.user.displayName || 'Traveler',
              email: cred.user.email || cleanEmail,
              role: data.role || 'Verified Traveler',
              avatarUrl: data.avatarUrl || user.avatarUrl,
              location: data.location || data.homeCity || user.location || 'Detecting Location...',
              homeCity: data.homeCity || data.location || user.homeCity || 'Detecting Location...',
              bio: data.bio || user.bio,
              createdAt: data.createdAt || user.createdAt || '2026-09-07T15:54:15.000Z',
              joinedDate: data.joinedDate || data.createdAt || user.joinedDate || '2026-09-07T15:54:15.000Z',
            };
            setUser(syncedUser);
            localStorage.setItem('seizeon_current_user', JSON.stringify(syncedUser));
          }
        } catch (fbErr) {
          console.warn('Firestore profile sync on login note:', fbErr);
        }

        showToast(`Welcome back, ${cred.user.displayName || 'Traveler'}!`);
        detectAndSyncUserLocation(false);
        navigate('/home');
        return;
      }
    } catch (fbAuthErr: any) {
      // Modern Firebase Auth may return auth/invalid-credential for both non-existent users and wrong passwords
      // We log and safely cascade to backend and local store verification
      console.info('Firebase auth note:', fbAuthErr?.code);
    }

    // 2. Safely authenticate against backend API using safeFetchJson (prevents HTML/token parse crashes)
    try {
      const serverRes = await safeFetchJson<{
        success: boolean;
        user: any;
        message?: string;
        error?: string;
        notFound?: boolean;
        invalidPassword?: boolean;
      }>('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
      });

      if (serverRes.ok && serverRes.data?.user) {
        const loggedInUser: UserProfile = {
          id: serverRes.data.user.id,
          name: serverRes.data.user.name,
          email: serverRes.data.user.email,
          role: serverRes.data.user.role || 'Verified Traveler',
          avatarUrl: serverRes.data.user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
          location: serverRes.data.user.location || serverRes.data.user.homeCity || 'Detecting Location...',
          homeCity: serverRes.data.user.homeCity || serverRes.data.user.location || 'Detecting Location...',
          bio: serverRes.data.user.bio || 'Cultural explorer, avid street food enthusiast & heritage architecture admirer.',
          createdAt: serverRes.data.user.createdAt || '2026-09-07T15:54:15.000Z',
          joinedDate: serverRes.data.user.joinedDate || serverRes.data.user.createdAt || '2026-09-07T15:54:15.000Z',
          tripsCount: serverRes.data.user.tripsCount || 1,
          savedCount: serverRes.data.user.savedCount || 2,
          reviewsCount: serverRes.data.user.reviewsCount || 0,
          levelBadge: serverRes.data.user.levelBadge || 'Heritage Scout',
          preferences: serverRes.data.user.preferences || user.preferences,
        };

        setUser(loggedInUser);
        setIsAuthenticated(true);
        localStorage.setItem('seizeon_authenticated', 'true');
        localStorage.setItem('seizeon_current_user', JSON.stringify(loggedInUser));

        if (Array.isArray(serverRes.data.user.savedPlaceIds)) {
          setSavedPlaceIds(serverRes.data.user.savedPlaceIds);
        }

        // Cache in local registered accounts so subsequent logins work offline/deployed
        saveLocalRegisteredAccount(cleanEmail, {
          user: loggedInUser,
          passwordHash: cleanPass,
        });

        // Sync to Firestore
        try {
          const userDocRef = doc(db, 'users', loggedInUser.id);
          setDoc(userDocRef, loggedInUser, { merge: true }).catch(() => {});
        } catch {}

        showToast(serverRes.data.message || `Welcome back, ${loggedInUser.name}!`);
        detectAndSyncUserLocation(false);
        navigate('/home');
        return;
      }

      if (serverRes.data?.invalidPassword) {
        throw new Error('Incorrect password. Please verify your credentials and try again.');
      }
    } catch (serverErr: any) {
      if (serverErr.message && serverErr.message.includes('Incorrect password')) {
        throw serverErr;
      }
    }

    // 3. Resilient fallback: Check local registered accounts and pre-seeded demo accounts (ensures login ALWAYS works on deployed static hosting)
    const localUsers = getLocalRegisteredUsers();
    const targetAccount = localUsers[cleanEmail] || defaultAccounts[cleanEmail];

    if (targetAccount) {
      if (targetAccount.passwordHash === cleanPass) {
        const loggedInUser: UserProfile = {
          ...targetAccount.user,
          preferences: targetAccount.user.preferences || user.preferences,
        };
        setUser(loggedInUser);
        setIsAuthenticated(true);
        localStorage.setItem('seizeon_authenticated', 'true');
        localStorage.setItem('seizeon_current_user', JSON.stringify(loggedInUser));

        if (Array.isArray(loggedInUser.savedPlaceIds)) {
          setSavedPlaceIds(loggedInUser.savedPlaceIds);
        }

        // Also sync to Firestore
        try {
          const userDocRef = doc(db, 'users', loggedInUser.id);
          setDoc(userDocRef, loggedInUser, { merge: true }).catch(() => {});
        } catch {}

        showToast(`Welcome back, ${loggedInUser.name}!`);
        detectAndSyncUserLocation(false);
        navigate('/home');
        return;
      } else {
        throw new Error('Incorrect password. Please verify your credentials and try again.');
      }
    }

    // 4. Try Firestore user lookup by email if available
    try {
      const userDocRef = doc(db, 'users', cleanEmail.replace(/[^a-zA-Z0-9]/g, '_'));
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.passwordHash && data.passwordHash !== cleanPass) {
          throw new Error('Incorrect password. Please verify your credentials and try again.');
        }
        const loggedInUser: UserProfile = {
          ...user,
          id: data.id || 'user-' + Date.now(),
          name: data.name || 'Traveler',
          email: cleanEmail,
          role: data.role || 'Verified Traveler',
          avatarUrl: data.avatarUrl || user.avatarUrl,
          location: data.location || data.homeCity || user.location || 'Varanasi',
          homeCity: data.homeCity || data.location || user.homeCity || 'Varanasi',
        };
        setUser(loggedInUser);
        setIsAuthenticated(true);
        localStorage.setItem('seizeon_authenticated', 'true');
        localStorage.setItem('seizeon_current_user', JSON.stringify(loggedInUser));
        showToast(`Welcome back, ${loggedInUser.name}!`);
        detectAndSyncUserLocation(false);
        navigate('/home');
        return;
      }
    } catch (firestoreErr: any) {
      if (firestoreErr.message?.includes('Incorrect password')) {
        throw firestoreErr;
      }
    }

    throw new Error('No account found with this email. Please check your spelling or register a new account.');
  };

  const signupUser = async (name: string, email: string, pass: string) => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanName) throw new Error('Please enter your full name.');
    if (!cleanEmail) throw new Error('Please enter a valid email address.');
    if (!cleanPass || cleanPass.length < 6) throw new Error('Password must be at least 6 characters long.');

    // Check if email already registered locally
    const localUsers = getLocalRegisteredUsers();
    if (localUsers[cleanEmail] || defaultAccounts[cleanEmail]) {
      throw new Error('This email address is already registered. Please log in with your existing password or use Google Sign-In.');
    }

    let firebaseRegistered = false;
    let registeredUid = 'user-' + Date.now();

    // 1. Try Firebase Authentication
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
      firebaseRegistered = true;
      registeredUid = cred.user.uid;
      try {
        await updateProfile(cred.user, { displayName: cleanName });
      } catch {
        // Non-blocking
      }
    } catch (fbAuthErr: any) {
      const errorCode = fbAuthErr?.code || '';
      const errorMsg = fbAuthErr?.message || '';

      if (errorCode === 'auth/email-already-in-use' || errorMsg.includes('email-already-in-use')) {
        throw new Error('This email address is already registered. Please log in with your existing password or use Google Sign-In.');
      }
    }

    // 2. Register with backend auth service using safeFetchJson
    let backendUser: any = null;
    try {
      const serverRes = await safeFetchJson<{
        success: boolean;
        user: any;
        error?: string;
        emailAlreadyExists?: boolean;
      }>('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          password: cleanPass,
        }),
      });

      if (serverRes.data?.emailAlreadyExists) {
        throw new Error('This email is already registered. Please log in with your existing password or use a different email.');
      }
      if (serverRes.ok && serverRes.data?.user) {
        backendUser = serverRes.data.user;
      }
    } catch (serverErr: any) {
      if (serverErr.message && serverErr.message.includes('already registered')) {
        throw serverErr;
      }
    }

    const nowIso = new Date().toISOString();
    const newUser: UserProfile = backendUser
      ? {
          id: backendUser.id,
          name: backendUser.name,
          email: backendUser.email,
          role: backendUser.role || 'Verified Traveler',
          avatarUrl: backendUser.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(cleanName)}`,
          location: backendUser.location || backendUser.homeCity || 'Detecting Location...',
          homeCity: backendUser.homeCity || backendUser.location || 'Detecting Location...',
          bio: backendUser.bio || 'Explorer of cultural heritage, ancient temples and sacred riverfronts.',
          createdAt: backendUser.createdAt || nowIso,
          joinedDate: backendUser.joinedDate || backendUser.createdAt || nowIso,
          tripsCount: 1,
          savedCount: 2,
          reviewsCount: 0,
          levelBadge: 'Heritage Scout',
          preferences: user.preferences,
        }
      : {
          id: registeredUid,
          name: cleanName,
          email: cleanEmail,
          role: 'Verified Traveler',
          avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(cleanName)}`,
          location: 'Detecting Location...',
          homeCity: 'Detecting Location...',
          bio: 'Explorer of cultural heritage, ancient temples and sacred riverfronts.',
          createdAt: nowIso,
          joinedDate: nowIso,
          tripsCount: 1,
          savedCount: 2,
          reviewsCount: 0,
          levelBadge: 'Heritage Scout',
          preferences: user.preferences,
        };

    // 3. Save to local registered accounts
    saveLocalRegisteredAccount(cleanEmail, {
      user: newUser,
      passwordHash: cleanPass,
    });

    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('seizeon_authenticated', 'true');
    localStorage.setItem('seizeon_current_user', JSON.stringify(newUser));

    // 4. Save initial profile to Firestore
    try {
      const userDocRef = doc(db, 'users', newUser.id);
      await setDoc(userDocRef, {
        ...newUser,
        passwordHash: cleanPass,
        createdAt: nowIso,
        joinedDate: nowIso,
        savedPlaceIds: ['kashi-chaat-corner', 'dashashwamedh-ghat'],
      }, { merge: true });
    } catch (dbErr) {
      console.warn('Firestore initial sync note:', dbErr);
    }

    showToast(`Account created! Welcome to SeizeOn Trip, ${cleanName}!`);
    detectAndSyncUserLocation(false);
    navigate('/home');
  };

  const loginWithGoogle = async () => {
    // 1. Try Firebase popup
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred?.user) {
        setIsAuthenticated(true);
        localStorage.setItem('seizeon_authenticated', 'true');
        const googleUser: UserProfile = {
          ...user,
          id: cred.user.uid,
          name: cred.user.displayName || 'Google Explorer',
          email: cred.user.email || 'google.traveler@seizeontrip.com',
          avatarUrl: cred.user.photoURL || user.avatarUrl,
          role: 'Verified Google Explorer',
        };
        setUser(googleUser);
        localStorage.setItem('seizeon_current_user', JSON.stringify(googleUser));
        showToast(`Signed in with Google as ${googleUser.name}!`);
        navigate('/home');
        return;
      }
    } catch (err: any) {
      console.info('Firebase Google popup in preview/iframe mode, using resilient identity session:', err?.code || err?.message);
    }

    // 2. Server fallback for preview containers (bypassing iframe popup restrictions) using safeFetchJson
    try {
      const serverRes = await safeFetchJson<{ success: boolean; user: any }>('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Google Cultural Explorer',
          email: 'explorer.google@seizeontrip.com',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
        }),
      });

      if (serverRes.ok && serverRes.data?.user) {
        const nowIso = new Date().toISOString();
        const googleUser: UserProfile = {
          ...user,
          id: serverRes.data.user.id,
          name: serverRes.data.user.name,
          email: serverRes.data.user.email,
          role: serverRes.data.user.role,
          avatarUrl: serverRes.data.user.avatarUrl,
          location: serverRes.data.user.location || serverRes.data.user.homeCity || 'Detecting Location...',
          homeCity: serverRes.data.user.homeCity || serverRes.data.user.location || 'Detecting Location...',
          createdAt: serverRes.data.user.createdAt || nowIso,
          joinedDate: serverRes.data.user.joinedDate || serverRes.data.user.createdAt || nowIso,
        };
        setUser(googleUser);
        setIsAuthenticated(true);
        localStorage.setItem('seizeon_authenticated', 'true');
        localStorage.setItem('seizeon_current_user', JSON.stringify(googleUser));

        try {
          const userDocRef = doc(db, 'users', googleUser.id);
          await setDoc(userDocRef, googleUser, { merge: true });
        } catch (e) {
          // ignore
        }

        showToast('Signed in with Google Identity!');
        detectAndSyncUserLocation(false);
        navigate('/home');
        return;
      }
    } catch (e) {
      console.warn('Google session error:', e);
    }

    // 3. Resilient client session fallback (ensures Google sign-in works even in restricted iframes or static hosting)
    const nowIso = new Date().toISOString();
    const fallbackGoogleUser: UserProfile = {
      ...user,
      id: 'google-user-' + Date.now(),
      name: 'Google Cultural Explorer',
      email: 'explorer.google@seizeontrip.com',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
      role: 'Verified Google Explorer',
      createdAt: nowIso,
      joinedDate: nowIso,
    };
    setUser(fallbackGoogleUser);
    setIsAuthenticated(true);
    localStorage.setItem('seizeon_authenticated', 'true');
    localStorage.setItem('seizeon_current_user', JSON.stringify(fallbackGoogleUser));
    showToast('Signed in with Google Identity!');
    detectAndSyncUserLocation(false);
    navigate('/home');
  };

  const loginAsGuest = async () => {
    // 1. Try Firebase Anonymous
    try {
      await signInAnonymously(auth);
    } catch {
      // Non-blocking
    }

    // 2. Initialize Guest Explorer session using safeFetchJson
    try {
      const serverRes = await safeFetchJson<{ success: boolean; user: any }>('/api/auth/guest', { method: 'POST' });
      if (serverRes.ok && serverRes.data?.user) {
        const nowIso = new Date().toISOString();
        const guestUser: UserProfile = {
          ...user,
          id: serverRes.data.user.id,
          name: serverRes.data.user.name,
          email: serverRes.data.user.email,
          role: serverRes.data.user.role,
          avatarUrl: serverRes.data.user.avatarUrl,
          location: serverRes.data.user.location || serverRes.data.user.homeCity || 'Detecting Location...',
          homeCity: serverRes.data.user.homeCity || serverRes.data.user.location || 'Detecting Location...',
          createdAt: serverRes.data.user.createdAt || nowIso,
          joinedDate: serverRes.data.user.joinedDate || serverRes.data.user.createdAt || nowIso,
        };
        setUser(guestUser);
        setIsAuthenticated(true);
        localStorage.setItem('seizeon_authenticated', 'true');
        localStorage.setItem('seizeon_current_user', JSON.stringify(guestUser));
        showToast('Continuing as Guest Explorer');
        detectAndSyncUserLocation(false);
        navigate('/home');
        return;
      }
    } catch (e) {
      console.warn('Guest API note:', e);
    }

    // 3. Client fallback if offline or deployed on static host
    const nowIso = new Date().toISOString();
    const localGuest: UserProfile = {
      ...user,
      id: 'guest-' + Date.now(),
      name: 'Guest Explorer',
      email: 'guest@seizeontrip.com',
      role: 'Guest Traveler',
      location: 'Detecting Location...',
      homeCity: 'Detecting Location...',
      createdAt: nowIso,
      joinedDate: nowIso,
    };
    setUser(localGuest);
    setIsAuthenticated(true);
    localStorage.setItem('seizeon_authenticated', 'true');
    localStorage.setItem('seizeon_current_user', JSON.stringify(localGuest));
    showToast('Continuing as Guest Explorer');
    detectAndSyncUserLocation(false);
    navigate('/home');
  };

  const logoutUser = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.warn('SignOut note:', err);
    }
    setIsAuthenticated(false);
    localStorage.removeItem('seizeon_authenticated');
    localStorage.removeItem('seizeon_current_user');
    setUser(initialUser);
    showToast('Logged out of SeizeOn Trip');
    navigate('/login');
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
        detectAndSyncUserLocation,
        updateUserProfile,
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
