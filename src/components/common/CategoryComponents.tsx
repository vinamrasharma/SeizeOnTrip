import React from 'react';
import { Utensils, Bed, ShoppingBag, Award, Car, Landmark } from 'lucide-react';
import { CategoryType } from '../../types';

interface CategoryItem {
  id: CategoryType;
  label: string;
  icon: React.ReactNode;
  bgLight: string;
  iconColor: string;
}

export const CATEGORIES: CategoryItem[] = [
  {
    id: 'food',
    label: 'Food',
    icon: <Utensils size={20} />,
    bgLight: 'bg-[#FFF3E6]',
    iconColor: 'text-[#E85D04]',
  },
  {
    id: 'stay',
    label: 'Stay',
    icon: <Bed size={20} />,
    bgLight: 'bg-[#EBF3FE]',
    iconColor: 'text-[#2563EB]',
  },
  {
    id: 'shopping',
    label: 'Shopping',
    icon: <ShoppingBag size={20} />,
    bgLight: 'bg-[#FEF6E6]',
    iconColor: 'text-[#D97706]',
  },
  {
    id: 'experience',
    label: 'Experience',
    icon: <Award size={20} />,
    bgLight: 'bg-[#FEECEC]',
    iconColor: 'text-[#DC2626]',
  },
  {
    id: 'transport',
    label: 'Transport',
    icon: <Car size={20} />,
    bgLight: 'bg-[#E6F7EF]',
    iconColor: 'text-[#059669]',
  },
];

export const CategoryCircleCard: React.FC<{
  category: CategoryItem;
  onClick: (id: CategoryType) => void;
  isActive?: boolean;
}> = ({ category, onClick, isActive }) => {
  return (
    <button
      onClick={() => onClick(category.id)}
      className="flex flex-col items-center gap-2 group cursor-pointer active:scale-95 transition-transform"
    >
      <div
        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-200 ${category.bgLight} ${
          isActive ? 'ring-2 ring-[#005B49] shadow-sm' : 'hover:scale-105'
        }`}
      >
        <span className={category.iconColor}>{category.icon}</span>
      </div>
      <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-gray-950">
        {category.label}
      </span>
    </button>
  );
};

// Filter tabs as seen in Explore (11.png)
export const ExploreFilterTabs: React.FC<{
  selected: string;
  onSelect: (id: string) => void;
}> = ({ selected, onSelect }) => {
  const tabs = [
    { id: 'all', label: 'All', icon: null },
    { id: 'food', label: 'Food', icon: <Utensils size={15} /> },
    { id: 'attractions', label: 'Attractions', icon: <Landmark size={15} /> },
    { id: 'shopping', label: 'Shopping', icon: <ShoppingBag size={15} /> },
    { id: 'experiences', label: 'Experiences', icon: <Award size={15} /> },
    { id: 'stay', label: 'Stay', icon: <Bed size={15} /> },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
      {tabs.map((tab) => {
        const isSelected = selected === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              isSelected
                ? 'bg-[#005B49] text-white shadow-xs'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
