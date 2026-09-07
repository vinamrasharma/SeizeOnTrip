import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center gap-2.5 px-4 py-3 bg-[#111827] text-white text-sm font-medium rounded-full shadow-xl border border-white/10 max-w-[90vw]">
        <CheckCircle size={16} className="text-[#10B981] shrink-0" />
        <span className="truncate">{toastMessage}</span>
      </div>
    </div>
  );
};

export const SectionHeader: React.FC<{
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}> = ({ title, subtitle, actionText, onAction, className = '' }) => {
  return (
    <div className={`flex items-baseline justify-between mb-3.5 ${className}`}>
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {actionText && (
        <button
          onClick={onAction}
          className="text-xs sm:text-sm font-semibold text-[#F59E0B] hover:text-[#D97706] transition-colors cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
