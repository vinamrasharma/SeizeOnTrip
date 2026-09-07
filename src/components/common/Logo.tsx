import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'horizontal';
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'horizontal',
  className = '',
  onClick,
}) => {
  // Dimensions
  const iconSizes = {
    sm: { w: 32, h: 32 },
    md: { w: 42, h: 42 },
    lg: { w: 68, h: 68 },
    xl: { w: 92, h: 92 },
  };

  const currentSize = iconSizes[size];

  // Mountain & S-Curved Road Logo Icon
  const LogoMark = (
    <svg
      width={currentSize.w}
      height={currentSize.h}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {/* Mountain silhouettes in background */}
      <path
        d="M20 78L36 56L44 65L52 54L66 78H20Z"
        fill="#005B49"
        fillOpacity="0.85"
      />
      
      {/* Stylized 'S' road ribbon with layered depth */}
      <path
        d="M48 22C38 22 28 29 28 40C28 50 38 56 46 61C54 66 58 71 58 76C58 84 48 88 38 86C32 85 28 82 25 78"
        stroke="#F59E0B"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M50 20C38 20 25 28 25 41C25 53 37 59 47 64C56 69 61 74 61 80C61 88 50 91 40 89C33 87 28 83 24 78"
        stroke="#005B49"
        strokeWidth="7.5"
        strokeLinecap="round"
      />
      
      {/* Road centerline dashes */}
      <path
        d="M33 34C31 37 32 41 36 44M45 57C49 60 52 64 53 68"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeDasharray="2.5 2.5"
        strokeLinecap="round"
      />

      {/* Top Destination Map Pin */}
      <g transform="translate(43, 10)">
        <circle cx="9" cy="9" r="8" fill="#F59E0B" />
        <circle cx="9" cy="9" r="3.2" fill="#FFFFFF" />
        <path d="M4 14L9 21L14 14Z" fill="#F59E0B" />
      </g>

      {/* Subtle Birds flying */}
      <path
        d="M32 14C33.5 12 35 13 36.5 14C38 13 39.5 12 41 14"
        stroke="#005B49"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M40 9C41.2 7.5 42.5 8.2 43.8 9C45 8.2 46.2 7.5 47.5 9"
        stroke="#005B49"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center justify-center cursor-pointer ${className}`}
      >
        {LogoMark}
      </div>
    );
  }

  if (variant === 'full') {
    // Stacked large logo for auth & landing
    return (
      <div
        onClick={onClick}
        className={`flex flex-col items-center justify-center text-center cursor-pointer select-none ${className}`}
      >
        <div className="mb-2 transition-transform hover:scale-105 duration-200">
          {LogoMark}
        </div>
        <div className="flex items-baseline justify-center">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#005B49]">
            Seize
          </span>
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F59E0B]">
            On
          </span>
        </div>
        <div className="flex items-center justify-center w-36 gap-2 mt-1">
          <div className="h-[1.5px] flex-1 bg-[#F59E0B]/60"></div>
          <span className="text-xs sm:text-sm font-extrabold tracking-[0.28em] text-[#F59E0B] uppercase">
            TRIP
          </span>
          <div className="h-[1.5px] flex-1 bg-[#F59E0B]/60"></div>
        </div>
      </div>
    );
  }

  // Horizontal variant for Navbar & Header
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group ${className}`}
    >
      <div className="transition-transform group-hover:scale-105 duration-200">
        {LogoMark}
      </div>
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline">
          <span className="text-xl font-bold tracking-tight text-[#005B49]">
            Seize
          </span>
          <span className="text-xl font-bold tracking-tight text-[#F59E0B]">
            On
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 w-full">
          <div className="h-[1px] flex-1 bg-[#F59E0B]/50"></div>
          <span className="text-[9px] font-black tracking-[0.24em] text-[#F59E0B] uppercase">
            TRIP
          </span>
          <div className="h-[1px] flex-1 bg-[#F59E0B]/50"></div>
        </div>
      </div>
    </div>
  );
};
