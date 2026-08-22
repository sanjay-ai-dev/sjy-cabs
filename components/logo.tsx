'use client';

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
  animate?: boolean;
}

export const DailyCabLogo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  animate = true
}) => {
  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const subSizes = {
    sm: 'text-micro',
    md: 'text-micro',
    lg: 'text-xs'
  };

  return (
    <div className={`flex flex-col select-none ${className}`}>
      {/* Plain Text-Only Logo with Green & Orange Accents + Motion */}
      <div className={`flex items-baseline font-black font-display tracking-tight ${textSizes[size]} ${animate ? 'animate-fadeIn' : ''}`}>
        <span className="text-success hover:text-success transition-colors drop-shadow-sm">
          Daily
        </span>
        <span className="text-warning hover:text-warning transition-colors drop-shadow-sm">
          Cab
        </span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 ml-1 inline-block motion-safe:animate-pulse" />
      </div>

      {/* Speed Line Accent */}
      <div className="w-full h-0.5 bg-gradient-to-r from-emerald-500 via-orange-500 to-transparent rounded-full my-0.5 opacity-80" />

      {/* Subtitle */}
      {showSubtitle && (
        <span className={`font-extrabold uppercase tracking-widest text-content-muted ${subSizes[size]}`}>
          Premium Daily Cab Service
        </span>
      )}
    </div>
  );
};

// Export backward compatible alias
export const SjyCabsLogo = DailyCabLogo;
