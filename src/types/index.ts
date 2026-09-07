export type CategoryType = 'food' | 'stay' | 'shopping' | 'experience' | 'transport' | 'attraction' | 'culture';

export interface PlaceGeneralDetails {
  openingTime?: string;
  closingTime?: string;
  aartiOrRitualTimings?: string; // e.g. "Morning Aarti: 07:00 AM, Evening Aarti: 07:00 PM"
  entryFee?: string; // e.g. "Free / ₹50 for museum entry"
  bestTimeToVisit?: string; // e.g. "Early Morning 05:30 AM - 08:00 AM"
  dressCodeAndProtocol?: string; // e.g. "Modest clothing, shoes off before steps"
  highlights?: string[];
  contactOrBooking?: string;
}

export interface Place {
  id: string;
  name: string;
  subtitle?: string;
  category: CategoryType;
  categoryLabel: string;
  location: string;
  rating: number;
  reviewCount: number;
  priceLevel: string; // e.g. '₹₹', 'Free', '₹₹₹'
  priceNumeric?: number;
  distance?: string; // e.g. '12 km', '1.2 km'
  imageUrl: string;
  galleryUrls?: string[];
  isVerified?: boolean;
  isGem?: boolean;
  isTrending?: boolean;
  hypeScore?: number;
  weeklyVisitors?: string;
  hypeBadge?: string;
  approxCostPerPerson?: number;
  tags?: string[];
  description: string;
  aiMatchScore?: number;
  aiReasons?: string[];
  address?: string;
  phone?: string;
  timings?: string;
  generalDetails?: PlaceGeneralDetails;
  coordinates?: {
    lat: number;
    lng: number;
  };
  distanceKm?: number;
  walkMinutes?: number;
  driveMinutes?: number;
  bearing?: string;
}

export interface DistanceInfo {
  distanceKm: number;
  formatted: string;
  walkMinutes: number;
  driveMinutes: number;
  bearing: string;
  directionsUrl: string;
}

export interface Review {
  id: string;
  placeId: string;
  userName: string;
  userAvatar: string;
  date: string;
  rating: number;
  comment: string;
  photos?: string[];
  helpfulCount: number;
  reply?: {
    author: string;
    text: string;
    date: string;
  };
  tags?: ('food' | 'service' | 'ambience')[];
}

export interface ItineraryStop {
  id: string;
  placeId: string;
  title: string;
  description: string;
  locationName: string;
  time: string;
  duration: string;
  distance?: string;
  imageUrl: string;
  categoryLabel: string;
  priceLevel?: string;
  rating?: number;
  badge?: string; // 'Local Business', 'Verified Gem', etc.
  iconType?: 'ghat' | 'food' | 'shopping' | 'stay' | 'walk';
  localTip?: string;
  costEstimate?: string;
  notes?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface TripDay {
  dayNumber: number;
  title: string;
  dateStr?: string;
  stops: ItineraryStop[];
  estimatedCost: number;
  localTip?: string;
}

export interface Trip {
  id: string;
  title: string;
  subtitle?: string;
  destination: string;
  daysCount?: number;
  totalDays?: number;
  budget?: string;
  budgetTier?: string;
  totalEstimatedCost: number;
  interests: string[];
  travelType?: string;
  travellingAs?: string;
  days: TripDay[];
  currentDay: number;
  coverImage: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  isUnread: boolean;
  type: 'trip' | 'gem' | 'review' | 'ai' | 'offer';
  linkRoute?: string;
}

export interface PlannerFormData {
  destination: string;
  days: number;
  budget: string;
  interests: string[];
  travellingAs: 'Solo' | 'Couple' | 'Family' | 'Friends' | 'With Strangers' | string;
  pace: 'Relaxed' | 'Balanced' | 'Active';
  dietary: string[];
  stayVibe: string;
  transportStyle: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  email: string;
  avatarUrl: string;
  location: string;
  homeCity?: string;
  bio: string;
  tripsCount: number;
  savedCount: number;
  reviewsCount: number;
  levelBadge: string;
  preferences: {
    language: string;
    defaultLocation: string;
    distanceUnit: string;
    theme: string;
    pushNotifications: boolean;
    tripReminders: boolean;
    localOffers: boolean;
    communityUpdates: boolean;
    pace?: 'Relaxed' | 'Balanced' | 'Active';
    dietary?: string[];
    stayVibe?: string;
    transportStyle?: string;
  };
}

export interface UserLocation {
  locality: string;
  sublocality?: string;
  city: string;
  state?: string;
  country?: string;
  formattedAddress?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  accuracy?: number;
  isLiveGps: boolean;
  timestamp?: string;
  source?: string;
}

export interface VaranasiLocality {
  id: string;
  name: string;
  tagline: string;
  zone: 'South Ghats' | 'Central Riverfront' | 'Old City Heritage' | 'Weavers Quarter' | 'North Heritage' | 'University & South';
  coordinates: {
    lat: number;
    lng: number;
  };
  keyAttractions: string[];
}

export interface LocationSearchResult {
  id: string;
  name: string;
  locality: string;
  category: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  formattedAddress: string;
  distanceKm?: number | null;
  source: string;
}

export interface CulturalGuideData {
  city: string;
  aartis: Array<{
    id: string;
    name: string;
    ghat: string;
    summerTime: string;
    winterTime: string;
    bestViewSpot: string;
    entryFee: string;
    status: string;
  }>;
  boatTariffs: {
    guideNote: string;
    rates: Array<{
      type: string;
      fare: string;
      route: string;
    }>;
  };
  transitFares: Array<{
    route: string;
    eRickshawShared: string;
    privateAuto: string;
    walkingMins: string;
  }>;
  localEtiquetteTips: string[];
}

export interface AirQualityData {
  city: string;
  aqi: number;
  pm25: number;
  status: string;
  recommendation: string;
  source: string;
}
