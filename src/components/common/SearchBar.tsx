import React from 'react';
import { Search, ChevronRight, X } from 'lucide-react';

interface SearchBarProps {
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  onClick?: () => void;
  readOnly?: boolean;
  showArrow?: boolean;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value = '',
  onChange,
  placeholder = 'Where do you want to go?',
  onClick,
  readOnly = false,
  showArrow = false,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative flex items-center w-full bg-white border border-gray-200/90 rounded-2xl px-4 py-3 shadow-xs hover:border-gray-300 transition-all ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <Search size={18} className="text-gray-400 shrink-0 mr-3" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className="w-full bg-transparent text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-hidden font-normal"
      />
      {value && onChange && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChange('');
          }}
          className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
        >
          <X size={14} />
        </button>
      )}
      {showArrow && (
        <ChevronRight size={18} className="text-gray-400 shrink-0 ml-2" />
      )}
    </div>
  );
};
