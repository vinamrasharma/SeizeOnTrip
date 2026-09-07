import React from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../common/Logo';
import { LiveLocationBar } from '../common/LiveLocationBar';
import { Bell, Heart, Smartphone, Monitor, ChevronDown, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentRoute,
    navigate,
    user,
    isAuthenticated,
    logoutUser,
    unreadNotificationsCount,
    deviceViewMode,
    setDeviceViewMode,
  } = useApp();

  const navLinks = [
    { label: 'Home', path: '/home' },
    { label: 'Explore', path: '/explore' },
    { label: 'Plan with AI', path: '/plan' },
    { label: 'My Trips', path: '/trip/trip-varanasi-3day' },
    { label: 'Saved', path: '/saved' },
  ];

  const isActive = (path: string) => {
    if (path === '/home' && (currentRoute === '/home' || currentRoute === '/')) return true;
    if (path === '/plan' && currentRoute.startsWith('/plan')) return true;
    if (path.startsWith('/trip') && currentRoute.startsWith('/trip')) return true;
    return currentRoute === path;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo & Location */}
        <div className="flex items-center gap-6">
          <Logo size="md" onClick={() => navigate('/home')} />

          {/* Desktop Destination Selector with Live Location */}
          <div className="hidden lg:block">
            <LiveLocationBar compact={true} />
          </div>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  active
                    ? 'text-[#005B49] bg-[#005B49]/8 font-bold'
                    : 'text-gray-600 hover:text-gray-950 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Notifications, Saved, View Mode, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Frame / Responsive view toggle on desktop */}
          <button
            onClick={() =>
              setDeviceViewMode(
                deviceViewMode === 'responsive' ? 'mobile-frame' : 'responsive'
              )
            }
            title={
              deviceViewMode === 'responsive'
                ? 'Switch to Mobile App Preview (Screenshots Fidelity)'
                : 'Switch to Full Responsive Desktop View'
            }
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
          >
            {deviceViewMode === 'responsive' ? (
              <>
                <Smartphone size={15} className="text-[#005B49]" />
                <span>Mobile App View</span>
              </>
            ) : (
              <>
                <Monitor size={15} className="text-[#005B49]" />
                <span>Responsive View</span>
              </>
            )}
          </button>

          {/* Saved places quick access */}
          <button
            onClick={() => navigate('/saved')}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors relative cursor-pointer"
            aria-label="Saved Places"
          >
            <Heart size={20} />
          </button>

          {/* Notifications bell with badge */}
          <button
            onClick={() => navigate('/notifications')}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Auth State Button: Sign In if logged out; Profile + Logout if logged in */}
          {!isAuthenticated ? (
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:inline-flex px-3.5 py-1.5 rounded-xl bg-[#005B49] hover:bg-[#00483a] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Sign In
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {/* Profile pill button */}
              <div
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 pl-1.5 pr-2 sm:pr-3 py-1 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer transition-all"
                title="View Profile"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-gray-100"
                />
                <div className="hidden sm:flex flex-col text-left leading-none">
                  <span className="text-xs font-bold text-gray-900 truncate max-w-[100px]">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-gray-500 mt-0.5">
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={logoutUser}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
