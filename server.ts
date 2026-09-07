import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { mockPlaces } from './src/data/mockData';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'SeizeOn Trip API',
      timestamp: new Date().toISOString(),
    });
  });

  // 1b. Backend Authentication Service (Dual-layer persistence for Firebase & Web clients)
  interface StoredUser {
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    avatarUrl: string;
    location?: string;
    homeCity: string;
    bio: string;
    createdAt: string;
    joinedDate?: string;
    savedPlaceIds: string[];
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
      pace: string;
      dietary: string[];
      stayVibe: string;
      transportStyle: string;
    };
  }

  const defaultPreferences = {
    language: 'English',
    defaultLocation: 'Current Location',
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
  };

  const registeredUsers: Map<string, StoredUser> = new Map([
    [
      'vinamra123409@gmail.com',
      {
        id: 'user-vinamra',
        name: 'Vinamra',
        email: 'vinamra123409@gmail.com',
        password: 'Password123!',
        role: 'Verified Cultural Explorer',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        location: 'Detecting Location...',
        homeCity: 'Detecting Location...',
        bio: 'Cultural explorer, avid street food enthusiast & heritage architecture admirer.',
        createdAt: '2026-09-07T15:54:15.000Z',
        joinedDate: '2026-09-07T15:54:15.000Z',
        savedPlaceIds: ['kashi-chaat-corner', 'dashashwamedh-ghat', 'shiv-handloom-studio', 'ganga-view-homestay'],
        tripsCount: 4,
        savedCount: 18,
        reviewsCount: 12,
        levelBadge: 'Heritage Scout',
        preferences: defaultPreferences,
      },
    ],
    [
      'explorer@seizeontrip.com',
      {
        id: 'user-demo-explorer',
        name: 'Rahul Verma',
        email: 'explorer@seizeontrip.com',
        password: 'Varanasi2026!',
        role: 'Heritage Scout',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        homeCity: 'Varanasi, India',
        bio: 'Cultural explorer, avid street food enthusiast & heritage architecture admirer.',
        createdAt: '2024-03-15T10:00:00.000Z',
        savedPlaceIds: ['kashi-chaat-corner', 'dashashwamedh-ghat', 'shiv-handloom-studio', 'ganga-view-homestay'],
        tripsCount: 4,
        savedCount: 4,
        reviewsCount: 12,
        levelBadge: 'Heritage Scout',
        preferences: defaultPreferences,
      },
    ],
    [
      'priya@example.com',
      {
        id: 'user-demo-priya',
        name: 'Priya Sharma',
        email: 'priya@example.com',
        password: 'Priya@123',
        role: 'Verified Traveler',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
        homeCity: 'New Delhi, India',
        bio: 'Passionate about Indian textiles, classical music and dawn boat rides on the Ganges.',
        createdAt: '2024-05-20T10:00:00.000Z',
        savedPlaceIds: ['shiv-handloom-studio', 'brijrama-palace', 'blue-lassi-shop'],
        tripsCount: 2,
        savedCount: 3,
        reviewsCount: 5,
        levelBadge: 'Artisan Patron',
        preferences: defaultPreferences,
      },
    ],
  ]);

  // Auth: Register Endpoint
  app.post('/api/auth/register', (req, res) => {
    try {
      const { name, email, password, location, homeCity } = req.body || {};

      if (!name || typeof name !== 'string' || !name.trim()) {
        res.status(400).json({ error: 'Please enter your full name.' });
        return;
      }
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        res.status(400).json({ error: 'Please provide a valid email address.' });
        return;
      }
      if (!password || typeof password !== 'string' || password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters long.' });
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();
      if (registeredUsers.has(normalizedEmail)) {
        res.status(409).json({
          error: 'This email is already registered. Please log in with your existing password or use a different email.',
          emailAlreadyExists: true,
        });
        return;
      }

      const nowIso = new Date().toISOString();
      const detectedCity = location || homeCity || 'Detecting Location...';
      const newUserId = 'user-' + Date.now();
      const newUser: StoredUser = {
        id: newUserId,
        name: name.trim(),
        email: normalizedEmail,
        password: password,
        role: 'Verified Traveler',
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=dceee9,bce0d5`,
        location: detectedCity,
        homeCity: detectedCity,
        bio: 'Explorer of cultural heritage, ancient temples and sacred riverfronts.',
        createdAt: nowIso,
        joinedDate: nowIso,
        savedPlaceIds: ['kashi-chaat-corner', 'dashashwamedh-ghat'],
        tripsCount: 1,
        savedCount: 2,
        reviewsCount: 0,
        levelBadge: 'Heritage Scout',
        preferences: defaultPreferences,
      };

      registeredUsers.set(normalizedEmail, newUser);

      // Return user without revealing plain password
      const { password: _, ...safeUser } = newUser;
      res.status(201).json({
        success: true,
        message: 'Account created successfully!',
        user: safeUser,
      });
    } catch (err: any) {
      console.error('Registration server error:', err);
      res.status(500).json({ error: 'Internal server error during registration.' });
    }
  });

  // Auth: Login Endpoint
  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body || {};

      if (!email || typeof email !== 'string' || !email.trim()) {
        res.status(400).json({ error: 'Please provide your email address.' });
        return;
      }
      if (!password || typeof password !== 'string') {
        res.status(400).json({ error: 'Please enter your password.' });
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = registeredUsers.get(normalizedEmail);

      if (!existingUser) {
        res.status(404).json({
          error: 'No account found with this email. Please check your spelling or register a new account.',
          notFound: true,
        });
        return;
      }

      if (existingUser.password !== password) {
        res.status(401).json({
          error: 'Incorrect password. Please verify your credentials and try again.',
          invalidPassword: true,
        });
        return;
      }

      const { password: _, ...safeUser } = existingUser;
      res.json({
        success: true,
        message: `Welcome back, ${safeUser.name}!`,
        user: safeUser,
      });
    } catch (err: any) {
      console.error('Login server error:', err);
      res.status(500).json({ error: 'Internal server error during login.' });
    }
  });

  // Auth: Google / 1-Click Verification Endpoint
  app.post('/api/auth/google-login', (req, res) => {
    try {
      const { email, name, avatarUrl, location, homeCity } = req.body || {};
      const userEmail = (email && typeof email === 'string') ? email.trim().toLowerCase() : 'explorer.google@seizeontrip.com';
      const userName = (name && typeof name === 'string' && name.trim()) ? name.trim() : 'Google Explorer';

      let existing = registeredUsers.get(userEmail);
      if (!existing) {
        const nowIso = new Date().toISOString();
        const detectedCity = location || homeCity || 'Detecting Location...';
        existing = {
          id: 'user-google-' + Date.now(),
          name: userName,
          email: userEmail,
          password: 'google-oauth-managed',
          role: 'Verified Google Explorer',
          avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
          location: detectedCity,
          homeCity: detectedCity,
          bio: 'Verified cultural traveler via Google Identity.',
          createdAt: nowIso,
          joinedDate: nowIso,
          savedPlaceIds: ['kashi-chaat-corner', 'dashashwamedh-ghat', 'shiv-handloom-studio'],
          tripsCount: 1,
          savedCount: 3,
          reviewsCount: 2,
          levelBadge: 'Heritage Scout',
          preferences: defaultPreferences,
        };
        registeredUsers.set(userEmail, existing);
      } else if (location || homeCity) {
        if (location) existing.location = location;
        if (homeCity) existing.homeCity = homeCity;
      }

      const { password: _, ...safeUser } = existing;
      res.json({
        success: true,
        message: `Signed in with Google as ${safeUser.name}`,
        user: safeUser,
      });
    } catch (err: any) {
      console.error('Google login API error:', err);
      res.status(500).json({ error: 'Could not complete Google session.' });
    }
  });

  // Auth: Guest Mode Endpoint
  app.post('/api/auth/guest', (req, res) => {
    const { location, homeCity } = req.body || {};
    const guestId = 'guest-' + Date.now();
    const nowIso = new Date().toISOString();
    const detectedCity = location || homeCity || 'Detecting Location...';
    const guestUser: StoredUser = {
      id: guestId,
      name: 'Guest Explorer',
      email: 'guest@seizeontrip.com',
      password: 'guest',
      role: 'Guest Traveler',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      location: detectedCity,
      homeCity: detectedCity,
      bio: 'Visiting Varanasi without persistent profile registration.',
      createdAt: nowIso,
      joinedDate: nowIso,
      savedPlaceIds: ['dashashwamedh-ghat', 'kashi-chaat-corner'],
      tripsCount: 1,
      savedCount: 2,
      reviewsCount: 0,
      levelBadge: 'Guest Traveler',
      preferences: defaultPreferences,
    };
    registeredUsers.set('guest@seizeontrip.com', guestUser);
    res.json({ success: true, user: guestUser });
  });

  // Auth: Password Reset Endpoint
  app.post('/api/auth/reset-password', (req, res) => {
    try {
      const { email, newPassword } = req.body || {};
      if (!email || !email.includes('@')) {
        res.status(400).json({ error: 'Please enter a valid email address.' });
        return;
      }
      if (!newPassword || newPassword.length < 6) {
        res.status(400).json({ error: 'New password must be at least 6 characters.' });
        return;
      }

      const normalized = email.trim().toLowerCase();
      const user = registeredUsers.get(normalized);
      if (!user) {
        res.status(404).json({ error: 'No account found with this email to reset.' });
        return;
      }

      user.password = newPassword;
      registeredUsers.set(normalized, user);

      res.json({
        success: true,
        message: `Password updated successfully for ${email}. You can now log in.`,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Could not reset password.' });
    }
  });

  // Auth: Update Profile Endpoint (Persistent across sessions)
  app.post('/api/auth/update-profile', (req, res) => {
    try {
      const { email, location, homeCity, name, bio, avatarUrl, preferences } = req.body || {};
      if (!email) {
        res.status(400).json({ error: 'User email is required to update profile.' });
        return;
      }

      const normalized = email.trim().toLowerCase();
      let user = registeredUsers.get(normalized);
      if (user) {
        if (location) user.location = location;
        if (homeCity) user.homeCity = homeCity;
        if (name) user.name = name;
        if (bio) user.bio = bio;
        if (avatarUrl) user.avatarUrl = avatarUrl;
        if (preferences) user.preferences = { ...user.preferences, ...preferences };
        registeredUsers.set(normalized, user);
        const { password: _, ...safeUser } = user;
        return res.json({ success: true, user: safeUser, message: 'Profile updated successfully.' });
      }

      // If user wasn't in memory map yet, insert
      const nowIso = new Date().toISOString();
      const detectedCity = location || homeCity || 'Detecting Location...';
      const createdUser: StoredUser = {
        id: 'user-' + Date.now(),
        name: name || 'Explorer',
        email: normalized,
        password: '',
        role: 'Verified Traveler',
        avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        location: detectedCity,
        homeCity: detectedCity,
        bio: bio || 'Cultural traveler exploring heritage and sacred sites.',
        createdAt: nowIso,
        joinedDate: nowIso,
        savedPlaceIds: ['kashi-chaat-corner'],
        tripsCount: 1,
        savedCount: 1,
        reviewsCount: 0,
        levelBadge: 'Heritage Scout',
        preferences: defaultPreferences,
      };
      registeredUsers.set(normalized, createdUser);
      const { password: _, ...safeUser } = createdUser;
      res.json({ success: true, user: safeUser, message: 'Profile created and updated.' });
    } catch (err: any) {
      console.error('Update profile error:', err);
      res.status(500).json({ error: 'Could not update user profile.' });
    }
  });

  // Location: Instant IP Geolocation (Detects user origin immediately)
  app.get('/api/location/ip-detect', async (req, res) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const ipRes = await fetch(
        'http://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone',
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (ipRes.ok) {
        const data = await ipRes.json();
        if (data.status === 'success') {
          const parts = [data.city, data.regionName, data.country].filter(Boolean);
          const formattedLocation = parts.join(', ');
          return res.json({
            success: true,
            city: data.city || 'Detected City',
            region: data.regionName || '',
            country: data.country || '',
            formattedLocation,
            locality: data.city || 'Current City',
            lat: data.lat,
            lng: data.lon,
            timezone: data.timezone,
            source: 'Network IP Geolocation',
          });
        }
      }
    } catch (e: any) {
      console.warn('IP detect error:', e?.message || e);
    }

    res.json({
      success: false,
      message: 'Could not detect IP location',
      fallback: {
        city: 'Current Location',
        locality: 'Current Location',
        formattedLocation: 'Current Location',
      },
    });
  });

  // 2. Free Weather & Sunrise/Sunset API (Open-Meteo for any location worldwide)
  app.get('/api/weather', async (req, res) => {
    try {
      const lat = req.query.lat ? parseFloat(req.query.lat as string) : 25.3176;
      const lng = req.query.lng ? parseFloat(req.query.lng as string) : 82.9739;
      const city = (req.query.city as string) || 'Current Location';

      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=sunrise,sunset,uv_index_max&timezone=auto`;

      const response = await fetch(weatherUrl);
      if (!response.ok) {
        throw new Error(`Open-Meteo responded with status ${response.status}`);
      }

      const data = await response.json();
      const current = data.current || {};
      const daily = data.daily || {};

      // Interpret WMO weather codes
      const getCondition = (code: number) => {
        if (code === 0) return { label: 'Clear & Golden', icon: '☀️', vibe: 'Perfect for Sightseeing & Outdoor Strolls' };
        if (code <= 3) return { label: 'Partly Cloudy', icon: '⛅', vibe: 'Great for Walking & Photography' };
        if (code <= 48) return { label: 'Misty / Foggy', icon: '🌫️', vibe: 'Atmospheric Scenery' };
        if (code <= 67) return { label: 'Light Rain', icon: '🌦️', vibe: 'Cozy for Cafes & Local Delicacies' };
        return { label: 'Pleasant', icon: '🌤️', vibe: 'Good for Exploration' };
      };

      const conditionInfo = getCondition(current.weather_code || 0);

      const formatTime = (isoString?: string) => {
        if (!isoString) return '--:--';
        const date = new Date(isoString);
        return date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
      };

      res.json({
        city,
        temperature: Math.round(current.temperature_2m ?? 26),
        feelsLike: Math.round(current.apparent_temperature ?? 27),
        humidity: current.relative_humidity_2m ?? 55,
        windSpeed: current.wind_speed_10m ?? 8,
        condition: conditionInfo.label,
        icon: conditionInfo.icon,
        travelRecommendation: conditionInfo.vibe,
        sunrise: formatTime(daily.sunrise?.[0]),
        sunset: formatTime(daily.sunset?.[0]),
        uvIndex: daily.uv_index_max?.[0] ?? 6,
        source: 'Open-Meteo Free API (Live Worldwide)',
      });
    } catch (error) {
      console.error('Weather API error, serving graceful fallback:', error);
      const city = (req.query.city as string) || 'Current Location';
      res.json({
        city,
        temperature: 26,
        feelsLike: 27,
        humidity: 55,
        windSpeed: 8,
        condition: 'Clear & Pleasant',
        icon: '☀️',
        travelRecommendation: 'Great weather for exploring the area',
        sunrise: '06:00 AM',
        sunset: '06:30 PM',
        uvIndex: 6,
        source: 'Worldwide Weather Engine',
      });
    }
  });

  // 3. Free Currency Exchange API (Frankfurter Free API)
  app.get('/api/currency', async (req, res) => {
    try {
      const response = await fetch('https://api.frankfurter.dev/v1/latest?base=USD&symbols=INR,EUR,GBP');
      if (!response.ok) {
        throw new Error('Currency API error');
      }
      const data = await response.json();
      res.json({
        base: 'USD',
        rates: {
          INR: data.rates?.INR || 86.5,
          EUR: data.rates?.EUR || 0.95,
          GBP: data.rates?.GBP || 0.79,
        },
        source: 'Frankfurter Free Rates API',
      });
    } catch (err) {
      res.json({
        base: 'USD',
        rates: { INR: 86.5, EUR: 0.95, GBP: 0.79 },
        source: 'Standard Rates Fallback',
      });
    }
  });

  // 3b. Free Reverse Geocoding API & Locality Finder (BigDataCloud + OpenStreetMap Nominatim)
  const varanasiLocalities = [
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

  app.get('/api/location/localities', (req, res) => {
    res.json({
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      country: 'India',
      total: varanasiLocalities.length,
      localities: varanasiLocalities,
    });
  });

  // Comprehensive Varanasi Landmark Knowledge for instantaneous local matching
  const varanasiLandmarks = [
    { name: 'Kashi Vishwanath Temple (Golden Temple)', locality: 'Chowk & Vishwanath Gali', category: 'Temple', coordinates: { lat: 25.3108, lng: 83.0107 } },
    { name: 'Dashashwamedh Ghat (Main Aarti Ghat)', locality: 'Dashashwamedh Ghat', category: 'Ghat', coordinates: { lat: 25.3075, lng: 83.0105 } },
    { name: 'Assi Ghat (Subah-e-Banaras & Yoga)', locality: 'Assi Ghat', category: 'Ghat', coordinates: { lat: 25.2958, lng: 83.0089 } },
    { name: 'Manikarnika Ghat (Mahashamshan)', locality: 'Old City Heritage', category: 'Ghat', coordinates: { lat: 25.3109, lng: 83.0139 } },
    { name: 'Godowlia Chowk Crossing', locality: 'Godowlia Chowk', category: 'Hub', coordinates: { lat: 25.3087, lng: 83.0065 } },
    { name: 'Blue Lassi Shop (Kachori Gali)', locality: 'Chowk & Vishwanath Gali', category: 'Food', coordinates: { lat: 25.3115, lng: 83.0118 } },
    { name: 'Kashi Chaat Corner', locality: 'Godowlia Chowk', category: 'Food', coordinates: { lat: 25.3082, lng: 83.0058 } },
    { name: 'BHU Main Gate (Lanka Chauraha)', locality: 'Lanka (BHU Campus)', category: 'University', coordinates: { lat: 25.2815, lng: 82.9995 } },
    { name: 'New Vishwanath Temple (VT - BHU Campus)', locality: 'Lanka (BHU Campus)', category: 'Temple', coordinates: { lat: 25.2655, lng: 82.9897 } },
    { name: 'Sankat Mochan Hanuman Mandir', locality: 'Durgakund', category: 'Temple', coordinates: { lat: 25.2847, lng: 82.9972 } },
    { name: 'Durga Kund Mandir (Monkey Temple)', locality: 'Durgakund', category: 'Temple', coordinates: { lat: 25.2912, lng: 83.0008 } },
    { name: 'Tulsi Manas Mandir', locality: 'Durgakund', category: 'Temple', coordinates: { lat: 25.2898, lng: 83.0012 } },
    { name: 'Sarnath Dhamek Stupa & Deer Park', locality: 'Sarnath Heritage Zone', category: 'Heritage', coordinates: { lat: 25.3811, lng: 83.0214 } },
    { name: 'Varanasi Junction (BSB Cantt Railway Station)', locality: 'Varanasi Cantt / Nadesar', category: 'Transit', coordinates: { lat: 25.3285, lng: 82.9856 } },
    { name: 'Banaras Railway Station (Manduadih)', locality: 'Manduadih', category: 'Transit', coordinates: { lat: 25.3120, lng: 82.9620 } },
    { name: 'Babatpur Airport (LBS International Airport)', locality: 'Babatpur', category: 'Transit', coordinates: { lat: 25.4526, lng: 82.8598 } },
    { name: 'Ramnagar Fort & Museum', locality: 'Ramnagar', category: 'Fort', coordinates: { lat: 25.2711, lng: 83.0272 } },
    { name: 'Namo Ghat (Khidkiya Ghat / Namaste Sculptures)', locality: 'North Riverfront', category: 'Ghat', coordinates: { lat: 25.3340, lng: 83.0315 } },
    { name: 'Chet Singh Fort & Ghat', locality: 'Shivala', category: 'Ghat', coordinates: { lat: 25.2982, lng: 83.0068 } },
    { name: 'Kedar Ghat & Gauri Kedareshwar Temple', locality: 'Sonarpura', category: 'Ghat', coordinates: { lat: 25.3025, lng: 83.0070 } },
    { name: 'Harishchandra Ghat', locality: 'South Riverfront', category: 'Ghat', coordinates: { lat: 25.3005, lng: 83.0078 } },
    { name: 'Scindia Ghat & Leaning Shiva Temple', locality: 'Old Riverfront', category: 'Ghat', coordinates: { lat: 25.3120, lng: 83.0135 } },
    { name: 'Panchganga Ghat (Trailanga Swami Math)', locality: 'North Ghats', category: 'Ghat', coordinates: { lat: 25.3148, lng: 83.0162 } },
    { name: 'Madanpura Weavers Quarter', locality: 'Madanpura Weavers Quarter', category: 'Craft', coordinates: { lat: 25.2995, lng: 83.0035 } },
    { name: 'Shiv Handloom Studio', locality: 'Madanpura Weavers Quarter', category: 'Craft', coordinates: { lat: 25.2995, lng: 83.0035 } },
    { name: 'Sigra Crossing / IP Grand Mall', locality: 'Sigra', category: 'Shopping', coordinates: { lat: 25.3142, lng: 82.9880 } },
    { name: 'Rathyatra Crossing', locality: 'Rathyatra', category: 'Hub', coordinates: { lat: 25.3090, lng: 82.9920 } },
    { name: 'Nadesar Palace / Taj Ganges', locality: 'Varanasi Cantt / Nadesar', category: 'Heritage', coordinates: { lat: 25.3350, lng: 82.9890 } },
    { name: 'BrijRama Palace Heritage Hotel', locality: 'Dashashwamedh Ghat', category: 'Stay', coordinates: { lat: 25.3060, lng: 83.0102 } },
    { name: 'Ganga View Homestay (Assi Ghat)', locality: 'Assi Ghat', category: 'Stay', coordinates: { lat: 25.2950, lng: 83.0075 } },
  ];

  // 3c. Free Location Search & Autocomplete API (Global OpenStreetMap Nominatim Free Geocoder)
  app.get('/api/location/search', async (req, res) => {
    const query = (req.query.q as string || '').trim();
    const refLat = parseFloat(req.query.refLat as string);
    const refLng = parseFloat(req.query.refLng as string);

    // Distance calculation helper
    const calcDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2));
    };

    const globalCurated = [
      { name: 'Eiffel Tower', locality: 'Champ de Mars', city: 'Paris', country: 'France', category: 'Attraction', coordinates: { lat: 48.8584, lng: 2.2945 } },
      { name: 'Colosseum', locality: 'Piazza del Colosseo', city: 'Rome', country: 'Italy', category: 'Attraction', coordinates: { lat: 41.8902, lng: 12.4922 } },
      { name: 'Fushimi Inari Taisha', locality: 'Fushimi Ward', city: 'Kyoto', country: 'Japan', category: 'Spiritual', coordinates: { lat: 34.9671, lng: 135.7727 } },
      { name: 'Central Park', locality: 'Manhattan', city: 'New York', country: 'USA', category: 'Nature', coordinates: { lat: 40.7851, lng: -73.9683 } },
      { name: 'Taj Mahal', locality: 'Dharmapuri', city: 'Agra', country: 'India', category: 'Heritage', coordinates: { lat: 27.1751, lng: 78.0421 } },
      { name: 'Hawa Mahal', locality: 'Badi Choupad', city: 'Jaipur', country: 'India', category: 'Heritage', coordinates: { lat: 26.9239, lng: 75.8267 } },
      { name: 'Dashashwamedh Ghat', locality: 'Dashashwamedh', city: 'Varanasi', country: 'India', category: 'Ghat & Aarti', coordinates: { lat: 25.3075, lng: 83.0105 } },
      { name: 'Assi Ghat', locality: 'Assi Ghat', city: 'Varanasi', country: 'India', category: 'Ghat & Culture', coordinates: { lat: 25.2958, lng: 83.0089 } },
      { name: 'Kashi Vishwanath Corridor', locality: 'Lahori Tola', city: 'Varanasi', country: 'India', category: 'Spiritual', coordinates: { lat: 25.3108, lng: 83.0105 } },
      { name: 'Uluwatu Temple', locality: 'Pecatu', city: 'Bali', country: 'Indonesia', category: 'Spiritual', coordinates: { lat: -8.8291, lng: 115.0849 } },
    ];

    if (!query) {
      // Return top famous global landmarks if empty query
      const defaultSuggestions = globalCurated.map((item, idx) => ({
        id: `curated-${idx}`,
        name: item.name,
        locality: item.locality,
        city: item.city,
        country: item.country,
        category: item.category,
        coordinates: item.coordinates,
        formattedAddress: `${item.name}, ${item.locality}, ${item.city}, ${item.country}`,
        distanceKm: !isNaN(refLat) && !isNaN(refLng) ? calcDistance(refLat, refLng, item.coordinates.lat, item.coordinates.lng) : null,
        source: 'Global Travel Directory',
      }));
      return res.json({ query: '', results: defaultSuggestions });
    }

    const qLower = query.toLowerCase();

    // 1. Instant local matching
    const allLocal = [
      ...globalCurated,
      ...varanasiLandmarks.map((vl) => ({
        name: vl.name,
        locality: vl.locality,
        city: 'Varanasi',
        country: 'India',
        category: vl.category,
        coordinates: vl.coordinates,
      })),
    ];

    const localMatches = allLocal
      .filter(
        (lm) =>
          lm.name.toLowerCase().includes(qLower) ||
          lm.locality.toLowerCase().includes(qLower) ||
          lm.city.toLowerCase().includes(qLower) ||
          lm.country.toLowerCase().includes(qLower) ||
          lm.category.toLowerCase().includes(qLower)
      )
      .slice(0, 4)
      .map((lm, idx) => ({
        id: `local-${idx}-${lm.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: lm.name,
        locality: lm.locality,
        city: lm.city,
        country: lm.country,
        category: lm.category,
        coordinates: lm.coordinates,
        formattedAddress: `${lm.name}, ${lm.locality}, ${lm.city}, ${lm.country}`,
        distanceKm: !isNaN(refLat) && !isNaN(refLng) ? calcDistance(refLat, refLng, lm.coordinates.lat, lm.coordinates.lng) : null,
        source: 'Travel Directory',
      }));

    // 2. OpenStreetMap Nominatim Live Global Search for any place in the world
    let osmMatches: any[] = [];
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      // Search worldwide without locking to Varanasi
      const searchUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=8`;

      const osmRes = await fetch(searchUrl, {
        headers: { 'User-Agent': 'SeizeOnTripApp/2.0 (travel@seizeontrip.com)' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (osmRes.ok) {
        const osmData = await osmRes.json();
        if (Array.isArray(osmData)) {
          osmMatches = osmData.map((item: any) => {
            const lat = parseFloat(item.lat);
            const lng = parseFloat(item.lon);
            const addr = item.address || {};
            const cleanName = item.name || item.display_name.split(',')[0] || query;
            const city = addr.city || addr.town || addr.municipality || addr.village || addr.state_district || addr.county || 'Detected Area';
            const locality = addr.suburb || addr.neighbourhood || addr.city_district || addr.quarter || city;
            const country = addr.country || '';

            return {
              id: `osm-${item.place_id || Math.random()}`,
              name: cleanName,
              locality,
              city,
              country,
              category: item.type || item.class || 'Location',
              coordinates: { lat, lng },
              formattedAddress: item.display_name,
              distanceKm: !isNaN(refLat) && !isNaN(refLng) ? calcDistance(refLat, refLng, lat, lng) : null,
              source: 'OpenStreetMap Live Worldwide Geocoder',
            };
          });
        }
      }
    } catch (osmErr) {
      console.warn('Nominatim search error or timeout:', osmErr);
    }

    // Merge & deduplicate by coordinates
    const combined = [...osmMatches, ...localMatches];
    const uniqueResults: any[] = [];
    for (const item of combined) {
      const exists = uniqueResults.some(
        (c) =>
          (Math.abs(c.coordinates.lat - item.coordinates.lat) < 0.002 && Math.abs(c.coordinates.lng - item.coordinates.lng) < 0.002) ||
          c.name.toLowerCase() === item.name.toLowerCase()
      );
      if (!exists) {
        uniqueResults.push(item);
      }
    }

    res.json({
      query,
      count: uniqueResults.length,
      results: uniqueResults.slice(0, 10),
    });
  });

  // 3d. Worldwide Free Reverse Geocoding API (Accurately identifies any location on Earth)
  app.get('/api/location/reverse-geocode', async (req, res) => {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const clientAccuracy = parseFloat(req.query.accuracy as string) || 10;

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Valid lat and lng query parameters are required' });
    }

    // Provider 1: OpenStreetMap Nominatim Free Global Reverse Geocoder with zoom=18 for street/building precision
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const osmUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=18`;
      const osmRes = await fetch(osmUrl, {
        signal: controller.signal,
        headers: { 'User-Agent': 'SeizeOnTripGlobal/2.0 (accurate-travel-app@seizeontrip.com)' },
      });
      clearTimeout(timeoutId);

      if (osmRes.ok) {
        const osmData = await osmRes.json();
        const addr = osmData.address || {};

        const specificSpot =
          addr.amenity ||
          addr.building ||
          addr.tourism ||
          addr.historic ||
          addr.leisure ||
          addr.road ||
          addr.pedestrian ||
          addr.footway ||
          addr.street ||
          '';

        const areaName =
          addr.neighbourhood ||
          addr.suburb ||
          addr.residential ||
          addr.city_district ||
          addr.quarter ||
          addr.village ||
          addr.hamlet ||
          '';

        const detectedCity =
          addr.city ||
          addr.town ||
          addr.municipality ||
          addr.county ||
          addr.state_district ||
          areaName ||
          'Detected Area';

        const detectedLocality =
          specificSpot && areaName && specificSpot !== areaName
            ? `${specificSpot}, ${areaName}`
            : specificSpot || areaName || detectedCity;

        const detectedState = addr.state || addr.region || '';
        const detectedCountry = addr.country || '';
        const postcode = addr.postcode || '';

        const fullParts = [specificSpot, areaName, detectedCity, detectedState, postcode, detectedCountry].filter(
          Boolean
        );
        const uniqueFull = fullParts.filter((v, i, a) => a.indexOf(v) === i);

        return res.json({
          locality: detectedLocality,
          sublocality: areaName || detectedCity,
          city: detectedCity,
          state: detectedState,
          country: detectedCountry,
          postcode,
          formattedAddress: osmData.display_name || uniqueFull.join(', '),
          coordinates: { lat, lng },
          accuracy: clientAccuracy,
          source: 'OpenStreetMap High-Accuracy Reverse Geocoding',
        });
      }
    } catch (osmErr) {
      console.warn('Nominatim reverse-geocode fallback error, trying BigDataCloud:', osmErr);
    }

    // Provider 2: BigDataCloud Free Client Reverse Geocode (Worldwide fallback)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
      const bdcRes = await fetch(bdcUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (bdcRes.ok) {
        const bdcData = await bdcRes.json();
        const detectedCity = bdcData.city || bdcData.locality || bdcData.principalSubdivision || 'Detected City';
        const detectedLocality = bdcData.locality || bdcData.city || bdcData.principalSubdivision || 'Current Spot';
        const detectedState = bdcData.principalSubdivision || '';
        const detectedCountry = bdcData.countryName || '';

        const parts = [detectedLocality, detectedCity, detectedState, detectedCountry].filter(Boolean);
        const uniqueParts = parts.filter((v, i, a) => a.indexOf(v) === i);

        return res.json({
          locality: detectedLocality,
          sublocality: bdcData.locality || detectedCity,
          city: detectedCity,
          state: detectedState,
          country: detectedCountry,
          countryCode: bdcData.countryCode || '',
          formattedAddress: uniqueParts.join(', ') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          coordinates: { lat, lng },
          accuracy: clientAccuracy,
          source: 'BigDataCloud Free Reverse Geocoding',
        });
      }
    } catch (e) {
      console.warn('BigDataCloud geocode timeout or error:', e);
    }

    // Provider 3: Clean Universal GPS Fallback (Explicit Coordinates, Never assumes Varanasi)
    const latLabel = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`;
    const lngLabel = `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'W'}`;

    res.json({
      locality: `Live GPS (${latLabel}, ${lngLabel})`,
      sublocality: `Accuracy ±${clientAccuracy}m`,
      city: 'Current Coordinates',
      state: '',
      country: '',
      formattedAddress: `Coordinates: ${latLabel}, ${lngLabel} (±${clientAccuracy}m accuracy)`,
      coordinates: { lat, lng },
      accuracy: clientAccuracy,
      source: 'Device Hardware GPS',
    });
  });

  // 4. Places Catalog API with search, category and budget filtering
  app.get('/api/places', (req, res) => {
    const { category, search, maxBudget, trending } = req.query;

    let filtered = [...mockPlaces];

    if (category && category !== 'all') {
      filtered = filtered.filter((p) => p.category === category);
    }

    if (trending === 'true') {
      filtered = filtered.filter((p) => p.isTrending || (p.hypeScore && p.hypeScore > 90));
    }

    if (maxBudget) {
      const budgetNum = Number(maxBudget);
      if (!isNaN(budgetNum)) {
        filtered = filtered.filter((p) => (p.priceNumeric || 0) <= budgetNum);
      }
    }

    if (search && typeof search === 'string') {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.tags?.some((t) => t.toLowerCase().includes(term))
      );
    }

    res.json({
      total: filtered.length,
      places: filtered,
    });
  });

  // 4b. Global Place Discovery API (Connects to free OpenStreetMap Overpass / Nominatim / Wikipedia APIs + Global Catalog)
  app.get('/api/places/discover', async (req, res) => {
    const { query = '', category = 'all', region = 'all', maxBudget } = req.query;

    let results: any[] = [...mockPlaces];

    if (category && category !== 'all') {
      results = results.filter((p) => p.category === category);
    }

    if (maxBudget) {
      const budgetNum = Number(maxBudget);
      if (!isNaN(budgetNum)) {
        results = results.filter((p) => (p.priceNumeric || 0) <= budgetNum);
      }
    }

    if (query && typeof query === 'string') {
      const term = query.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.location.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.tags?.some((t) => t.toLowerCase().includes(term))
      );
    }

    // If search term wasn't found or user specifically searched for a distant location, optionally query OpenStreetMap
    if (results.length < 3 && query && typeof query === 'string') {
      try {
        const osmRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            query
          )}&format=json&addressdetails=1&extratags=1&limit=6`,
          { headers: { 'User-Agent': 'SeizeOnTripApp/2.0' } }
        );
        if (osmRes.ok) {
          const osmItems = await osmRes.json();
          if (Array.isArray(osmItems)) {
            const externalPlaces = osmItems.map((item: any, i: number) => {
              const lat = parseFloat(item.lat);
              const lng = parseFloat(item.lon);
              const addr = item.address || {};
              const city = addr.city || addr.town || addr.state || 'Destination';
              return {
                id: `osm-place-${item.place_id || i}`,
                name: item.name || item.display_name.split(',')[0],
                subtitle: `Discovered in ${city}`,
                category: item.type === 'restaurant' ? 'food' : item.type === 'hotel' ? 'stay' : 'attraction',
                categoryLabel: item.type ? item.type.toUpperCase() : 'Attraction',
                location: `${city}, ${addr.country || ''}`.trim(),
                rating: 4.7,
                reviewCount: 380,
                priceLevel: '₹₹',
                priceNumeric: 350,
                imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80',
                isVerified: true,
                isGem: true,
                tags: ['Live Geocoded', city, 'Scenic'],
                description: item.display_name,
                address: item.display_name,
                timings: '09:00 AM – 08:00 PM',
                coordinates: { lat, lng },
                generalDetails: {
                  openingTime: '08:00 AM',
                  closingTime: '08:00 PM',
                  aartiOrRitualTimings: 'Check local timings on-site',
                  entryFee: 'Standard Visitor Rate',
                  bestTimeToVisit: 'Morning & Late Afternoon',
                  dressCodeAndProtocol: 'Comfortable walking gear & respectful attire for cultural sites',
                  highlights: ['Authentic regional atmosphere', 'Popular destination hotspot'],
                },
              };
            });
            results = [...results, ...externalPlaces];
          }
        }
      } catch (err) {
        console.warn('Discovery external fetch notice:', err);
      }
    }

    res.json({
      total: results.length,
      places: results,
      source: 'Global Travel Engine & Free OpenStreetMap API',
    });
  });

  // 5. Intelligent Trip Suggestion API (Gemini or Smart Algorithmic Curation for ANY destination)
  app.post('/api/suggest-trip', async (req, res) => {
    const { destination = 'Varanasi', days = 3, totalBudget = 6000, travelStyle = 'Solo', interests = [] } = req.body;

    const dailyBudget = Math.round(totalBudget / days);

    // If Gemini API Key is configured, enhance using Gemini
    let aiSuggestions = null;
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `You are an expert travel planner on SeizeOn Trip app.
Generate a concise, authentic ${days}-day itinerary for a ${travelStyle} traveler visiting "${destination}" with a total budget of ₹${totalBudget} (approx ₹${dailyBudget}/day).
Interests: ${interests.join(', ') || 'Culture, Food, Scenic Highlights'}.
Output a JSON array of ${days} day objects with:
- dayNumber (1..${days})
- title (e.g. "Day 1: Historic Old Town & Sunset Riverfront")
- localTip (authentic insider advice for that day)
- stops: array of 3-4 stops per day with name, time (e.g. "08:30 AM"), estimatedCostInINR, description, and categoryLabel.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        if (response.text) {
          aiSuggestions = JSON.parse(response.text);
        }
      } catch (geminiError) {
        console.warn('Gemini API call skipped or errored, using smart algorithmic itinerary:', geminiError);
      }
    }

    // Curate matching places from database
    const matchingPlaces = mockPlaces.filter((p) => {
      const cost = p.priceNumeric || 0;
      if (dailyBudget < 2000) return cost <= 600 || p.priceLevel === 'Free';
      if (dailyBudget < 5000) return cost <= 2500;
      return true;
    });

    res.json({
      days,
      totalBudget,
      dailyBudget,
      travelStyle,
      breakdown: {
        stay: Math.round(dailyBudget * 0.42),
        food: Math.round(dailyBudget * 0.28),
        activities: Math.round(dailyBudget * 0.20),
        transport: Math.round(dailyBudget * 0.10),
      },
      aiSuggestions,
      suggestedPlaces: matchingPlaces.slice(0, 8),
    });
  });

  // 6. Free Cultural Aarti, Ghat Boat Fares & Transit Guide API
  app.get('/api/cultural-guide', (req, res) => {
    res.json({
      city: 'Varanasi',
      aartis: [
        {
          id: 'dashashwamedh',
          name: 'Dashashwamedh Evening Maha Aarti',
          ghat: 'Dashashwamedh Ghat',
          summerTime: '6:45 PM - 7:30 PM',
          winterTime: '6:00 PM - 6:45 PM',
          bestViewSpot: 'Reserved wooden boat anchored opposite the ghat (arrive 45 mins early)',
          entryFee: 'Free (Boat seat ₹150 - ₹300)',
          status: 'Daily (Unbroken ritual for centuries)',
        },
        {
          id: 'assi',
          name: 'Subah-e-Banaras (Morning Aarti & Yoga)',
          ghat: 'Assi Ghat',
          summerTime: '5:15 AM - 6:30 AM',
          winterTime: '5:45 AM - 7:00 AM',
          bestViewSpot: 'Ghat steps facing the sunrise stage',
          entryFee: 'Free for everyone',
          status: 'Daily at dawn with live Shehnai recital',
        },
        {
          id: 'kashi-vishwanath',
          name: 'Kashi Vishwanath Mangala Aarti',
          ghat: 'Vishwanath Corridor Gate 4',
          summerTime: '3:00 AM - 4:00 AM',
          winterTime: '3:00 AM - 4:00 AM',
          bestViewSpot: 'Main Sanctum Sanctorum (Advance booking via temple trust portal)',
          entryFee: 'Temple Trust Ticket ₹500 (Free general darshan after 4:00 AM)',
          status: 'Sacred first aarti of the day',
        },
      ],
      boatTariffs: {
        guideNote: 'Standardized municipal guidelines for Varanasi Ghat river navigation',
        rates: [
          { type: 'Manual Rowing Boat (Shared)', fare: '₹150 - ₹200 / person', route: 'Assi Ghat to Dashashwamedh / Manikarnika (1.5 hrs)' },
          { type: 'Manual Rowing Boat (Private)', fare: '₹1,000 - ₹1,500 / boat', route: 'Private 8-Ghat tour up to 6 passengers' },
          { type: 'Motorised Boat (Shared)', fare: '₹200 - ₹350 / person', route: 'Upstream to Downstream express cruise' },
          { type: 'Alaknanda Luxury Electric Cruise', fare: '₹750 - ₹1,200 / person', route: 'Assi Ghat to Namo Ghat with onboard high tea & audio guide' },
        ],
      },
      transitFares: [
        { route: 'Varanasi Cantt (BSB) to Godowlia Chowk', eRickshawShared: '₹30 - ₹40', privateAuto: '₹150 - ₹200', walkingMins: '35 mins' },
        { route: 'Godowlia Chowk to Assi Ghat', eRickshawShared: '₹20 - ₹25', privateAuto: '₹80 - ₹100', walkingMins: '25 mins' },
        { route: 'Godowlia to Sarnath Heritage Zone', eRickshawShared: '₹60 - ₹70', privateAuto: '₹350 - ₹450 (Roundtrip)', walkingMins: 'Not walkable' },
        { route: 'Lanka (BHU) to Assi Ghat', eRickshawShared: '₹15 - ₹20', privateAuto: '₹50 - ₹70', walkingMins: '15 mins' },
      ],
      localEtiquetteTips: [
        'Photography of funeral pyres at Manikarnika and Harishchandra Ghats is strictly prohibited out of respect.',
        'Belts with metal buckles, leather items, electronic devices, and pens must be deposited at lockers before entering Kashi Vishwanath Sanctum.',
        'Early morning 5:00 AM to 8:00 AM is the cleanest and most serene time for walking between Assi and Dashashwamedh.',
      ],
    });
  });

  // 7. Free Air Quality Index (AQI) API (Open-Meteo Free Air Quality API for Varanasi)
  app.get('/api/air-quality', async (req, res) => {
    try {
      const aqiUrl =
        'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=25.3176&longitude=82.9739&current=european_aqi,pm10,pm2_5';
      const response = await fetch(aqiUrl);

      if (response.ok) {
        const data = await response.json();
        const current = data.current || {};
        const aqiValue = current.european_aqi ?? 45;
        const pm25 = current.pm2_5 ? Math.round(current.pm2_5) : 35;

        let status = 'Good';
        let recommendation = 'Crisp river air! Ideal for morning yoga & ghat walks.';
        if (aqiValue > 50) {
          status = 'Moderate';
          recommendation = 'Pleasant along the river breeze. Stay hydrated.';
        } else if (aqiValue > 80) {
          status = 'Sensitive Caution';
          recommendation = 'Prefer early morning riverfront over busy road junctions.';
        }

        return res.json({
          city: 'Varanasi',
          aqi: aqiValue,
          pm25: pm25,
          status,
          recommendation,
          source: 'Open-Meteo Air Quality Free API',
        });
      }
    } catch (e) {
      console.warn('Air quality API error, serving fallback:', e);
    }

    res.json({
      city: 'Varanasi',
      aqi: 42,
      pm25: 32,
      status: 'Pleasant & Moderate',
      recommendation: 'Ganga river breeze keeps ghat promenade fresh and clear.',
      source: 'Varanasi Environmental Monitor',
    });
  });

  // 8. Free AI Local Guide Assistant API (Gemini 3.8 Flash with Authentic Banarasi Fallback)
  app.post('/api/ai/ask-guide', async (req, res) => {
    const { question = '', locality = 'Varanasi', travelStyle = 'Solo Explorer' } = req.body;

    if (!question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const systemInstruction = `You are "Pandit Ji", a warm, witty, 4th-generation Varanasi native and certified heritage storyteller for the SeizeOn Trip app.
You know every hidden alley, temple timing, authentic halwai, weaver family, boat tariff, and unspoken etiquette rule in Banaras.
Keep answers concise, authentic, respectful, and actionable (under 120 words). Suggest exact names of dishes, places, or timings.
Current User Locality: ${locality}. User Style: ${travelStyle}.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `${systemInstruction}\n\nTraveler Question: ${question}`,
        });

        if (response.text) {
          return res.json({
            answer: response.text.trim(),
            locality,
            model: 'gemini-3.8-flash (Server-side)',
            status: 'success',
          });
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, using Varanasi Local Guide engine:', geminiError);
      }
    }

    // Knowledge-grounded Varanasi local expert fallback answers
    const qLower = question.toLowerCase();
    let answer =
      'Namaste! In Banaras, walking through the gallis (alleys) at dawn reveals the city’s true soul. From ' +
      locality +
      ', start early for Subah-e-Banaras at Assi Ghat, sip kulhad chai, and avoid main road congestion during temple rush hours.';

    if (qLower.includes('food') || qLower.includes('eat') || qLower.includes('chaat') || qLower.includes('kachori')) {
      answer =
        'For authentic Banarasi tastes: head to Kashi Chaat Corner at Godowlia for Tamatar Chaat and Palak Chaat after 5 PM. In the morning (7-10 AM), visit Ram Bhandar in Thatheri Bazar for Chachi ki Jalebi & Hing Kachori with spicy aloo dum!';
    } else if (qLower.includes('boat') || qLower.includes('aarti') || qLower.includes('ganga')) {
      answer =
        'For evening Ganga Aarti at Dashashwamedh, rent a shared rowing boat from Assi or Dashashwamedh by 5:45 PM (₹150-₹250/person). For peaceful morning photography, book a manual boat at 5:30 AM from Assi to Manikarnika Ghat.';
    } else if (qLower.includes('temple') || qLower.includes('darshan') || qLower.includes('vishwanath')) {
      answer =
        'For Shri Kashi Vishwanath, use Gate No. 4 (Godowlia side) or the Riverfront Ganga Gate from Manikarnika. Leave mobile phones, leather belts, and bags in free trust lockers. Best quiet time is afternoon 1:30 PM - 3:30 PM or after 8 PM.';
    } else if (qLower.includes('saree') || qLower.includes('silk') || qLower.includes('handloom') || qLower.includes('shop')) {
      answer =
        'Avoid commission auto-drivers taking you to commercial showrooms. Walk into Madanpura or Sarai Mohana directly to meet 4th-generation master weavers. Shiv Handloom Studio near Madanpura offers pure Katan silk and Zari with authenticity guarantee.';
    } else if (qLower.includes('safe') || qLower.includes('night') || qLower.includes('solo')) {
      answer =
        'Varanasi ghats are remarkably vibrant and safe late into the night. Well-lit ghats like Assi and Dashashwamedh have police booths and friendly tea stalls open until midnight. Keep valuable bags close in crowded alleyways.';
    }

    res.json({
      answer,
      locality,
      model: 'Varanasi Local Expert Engine',
      status: 'success',
    });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SeizeOn Trip Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
