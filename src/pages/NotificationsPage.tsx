import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
  Sparkles,
  MapPin,
  Heart,
  Clock,
  CheckCheck,
  Bell,
  Trash2,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const {
    goBack,
    navigate,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    showToast,
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'unread' | 'gems'>('all');

  const getIcon = (type: string) => {
    switch (type) {
      case 'gem':
        return <Sparkles size={18} className="text-amber-600" />;
      case 'itinerary':
        return <Clock size={18} className="text-[#005B49]" />;
      case 'review':
        return <Heart size={18} className="text-rose-600" />;
      default:
        return <Bell size={18} className="text-blue-600" />;
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return n.isUnread;
    if (filter === 'gems') return n.type === 'gem';
    return true;
  });

  return (
    <div className="min-h-screen bg-white pb-24 max-w-2xl mx-auto px-4 pt-4">
      {/* Top Header (matches 14.png) */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md py-2 flex items-center justify-between border-b border-gray-100">
        <button
          onClick={goBack}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft size={24} />
        </button>

        <span className="text-xs sm:text-sm font-bold tracking-wider text-gray-900 uppercase">
          08. NOTIFICATIONS
        </span>

        <button
          onClick={markAllNotificationsAsRead}
          className="text-xs font-semibold text-[#005B49] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <CheckCheck size={14} />
          <span>Read all</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 mt-4 mb-6">
        {[
          { id: 'all', label: 'All' },
          { id: 'unread', label: 'Unread' },
          { id: 'gems', label: 'Local Gems' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              filter === tab.id
                ? 'bg-[#005B49] text-white border-[#005B49]'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List (matches 14.png) */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Bell size={36} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-medium">No notifications in this filter</p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                markNotificationAsRead(item.id);
                if (item.link) navigate(item.link);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                item.isUnread
                  ? 'bg-emerald-50/40 border-emerald-200/80 shadow-2xs'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              {/* Category Icon */}
              <div className="w-10 h-10 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-2xs">
                {getIcon(item.type)}
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-gray-900 truncate">
                    {item.title}
                  </h3>
                  <span className="text-[11px] text-gray-400 shrink-0 font-medium">
                    {item.timestamp}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-snug">
                  {item.message}
                </p>
              </div>

              {/* Unread dot */}
              {item.isUnread && (
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 mt-1.5 ring-2 ring-white" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
