import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, Search, Calendar, Briefcase, User } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { currentRoute, navigate } = useApp();

  const navItems = [
    { id: 'home', label: 'Home', path: '/home', icon: Home },
    { id: 'explore', label: 'Explore', path: '/explore', icon: Search },
    { id: 'plan', label: 'Plan', path: '/plan', icon: Calendar },
    { id: 'trips', label: 'Trips', path: '/trip/trip-varanasi-3day', icon: Briefcase },
    { id: 'profile', label: 'Profile', path: '/profile', icon: User },
  ];

  const isCurrentActive = (path: string) => {
    if (path === '/home' && (currentRoute === '/home' || currentRoute === '/')) return true;
    if (path === '/explore' && currentRoute.startsWith('/explore')) return true;
    if (path === '/plan' && currentRoute.startsWith('/plan')) return true;
    if (path.startsWith('/trip') && currentRoute.startsWith('/trip')) return true;
    if (path === '/profile' && (currentRoute === '/profile' || currentRoute === '/settings')) return true;
    return currentRoute === path;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 px-2 py-2 safe-area-pb">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const active = isCurrentActive(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center flex-1 py-1 group cursor-pointer transition-all duration-150"
            >
              <div className="relative">
                <Icon
                  size={22}
                  className={`transition-colors duration-150 ${
                    active
                      ? 'text-[#005B49] stroke-[2.4]'
                      : 'text-gray-400 group-hover:text-gray-600 stroke-[1.8]'
                  }`}
                />
              </div>
              <span
                className={`text-[11px] mt-1 font-semibold transition-colors duration-150 ${
                  active ? 'text-[#005B49]' : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
