import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/navigation/Navbar';
import { MobileBottomNav } from './components/navigation/MobileBottomNav';
import { Toast } from './components/common/Feedback';

// Pages
import { OnboardingPage } from './pages/OnboardingPage';
import { LoginPage, SignUpPage } from './pages/AuthPages';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { PlanWithAIPage } from './pages/PlanWithAIPage';
import { ItineraryDetailPage } from './pages/ItineraryDetailPage';
import { MapViewPage } from './pages/MapViewPage';
import { BusinessDetailPage } from './pages/BusinessDetailPage';
import { GenericPlaceDetailPage } from './pages/GenericPlaceDetailPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage, SavedPlacesPage } from './pages/ProfileAndSavedPages';

const AppRouter: React.FC = () => {
  const { currentRoute, isAuthenticated, deviceViewMode, setDeviceViewMode } = useApp();

  // Determine active view component based on current route
  const renderRouteContent = () => {
    // 1. Onboarding
    if (currentRoute === '/onboarding') {
      return <OnboardingPage />;
    }

    // 2. Auth
    if (currentRoute === '/login') {
      return <LoginPage />;
    }
    if (currentRoute === '/signup') {
      return <SignUpPage />;
    }

    // 3. Map View (Full screen experience matching 12.png)
    if (currentRoute.includes('/map')) {
      return <MapViewPage />;
    }

    // 4. Explore Local
    if (currentRoute.startsWith('/explore')) {
      return <ExplorePage />;
    }

    // 5. Plan with AI
    if (currentRoute === '/plan') {
      return <PlanWithAIPage />;
    }

    // 6. Itinerary View (matching 10.png)
    if (currentRoute.startsWith('/trip')) {
      return <ItineraryDetailPage />;
    }

    // 7. Business Detail (matching 5.png - Shiv Handloom Studio)
    if (currentRoute.startsWith('/business/')) {
      const placeId = currentRoute.replace('/business/', '');
      return <BusinessDetailPage placeId={placeId} />;
    }

    // 8. Place Detail (generic card click)
    if (currentRoute.startsWith('/place/')) {
      const placeId = currentRoute.replace('/place/', '');
      return <GenericPlaceDetailPage placeId={placeId} />;
    }

    // 9. Reviews & Ratings (matching 13.png)
    if (currentRoute.startsWith('/reviews/')) {
      const placeId = currentRoute.replace('/reviews/', '');
      return <ReviewsPage placeId={placeId} />;
    }

    // 10. Notifications (matching 14.png)
    if (currentRoute === '/notifications') {
      return <NotificationsPage />;
    }

    // 11. Profile
    if (currentRoute === '/profile') {
      return <ProfilePage />;
    }

    // 12. Saved
    if (currentRoute === '/saved') {
      return <SavedPlacesPage />;
    }

    // Default: Home Dashboard (matching 8.png)
    return <HomePage />;
  };

  // Check if we should hide standard navbar / bottom nav (e.g. on onboarding, login, map)
  const isFullScreenRoute =
    currentRoute === '/onboarding' ||
    currentRoute === '/login' ||
    currentRoute === '/signup' ||
    currentRoute.includes('/map');

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-gray-900 font-sans selection:bg-[#005B49] selection:text-white">
      {/* If deviceViewMode is 'mobile-frame' on large desktop screens, wrap in phone mockup frame for design fidelity comparison */}
      {deviceViewMode === 'mobile-frame' ? (
        <div className="min-h-screen bg-slate-900 py-6 px-4 flex flex-col items-center justify-center">
          {/* Top Frame Controller bar */}
          <div className="flex items-center justify-between w-full max-w-md mb-3 text-slate-300 text-xs font-semibold px-2">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Mobile App Preview (390 x 844)
            </span>
            <button
              onClick={() => setDeviceViewMode('responsive')}
              className="hover:text-white underline cursor-pointer"
            >
              Switch to Full Responsive Desktop →
            </button>
          </div>

          {/* Smartphone Hardware Casing */}
          <div className="w-full max-w-[400px] h-[850px] bg-white rounded-[44px] shadow-2xl overflow-hidden border-8 border-slate-800 flex flex-col relative">
            {/* Camera speaker notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-800 rounded-full z-50 flex items-center justify-center pointer-events-none">
              <div className="w-3 h-3 rounded-full bg-black mr-2"></div>
              <div className="w-10 h-1.5 rounded-full bg-slate-900"></div>
            </div>

            {/* Viewport content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden pt-4 relative bg-white">
              {renderRouteContent()}
            </div>

            {/* Mobile bottom nav inside frame */}
            {!isFullScreenRoute && <MobileBottomNav />}
          </div>
        </div>
      ) : (
        /* Standard Responsive Website Layout (Desktop, Tablet, Mobile) */
        <div className="min-h-screen flex flex-col">
          {/* Desktop/Tablet Top Navbar */}
          {!isFullScreenRoute && <Navbar />}

          {/* Main content view */}
          <main className="flex-1">{renderRouteContent()}</main>

          {/* Mobile persistent bottom navigation bar */}
          {!isFullScreenRoute && <MobileBottomNav />}
        </div>
      )}

      {/* Global Toast notifications */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
