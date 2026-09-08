import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  subtitle?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = false, subtitle }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-full',
    md: 'w-10 h-10 rounded-full',
    lg: 'w-14 h-14 rounded-full',
  };

  return (
    <div className="flex items-center gap-2.5 select-none shrink-0 group">
      <div
        className={`${sizeClasses[size]} relative overflow-hidden ring-2 ring-cyan-400 dark:ring-cyan-500 shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-transform flex items-center justify-center bg-neutral-950`}
      >
        <img
          src="/logo.jpg"
          alt="1 Social Logo"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback if image fails
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-emerald-400/40 rounded-full pointer-events-none" />
      </div>
      {showText && (
        <div>
          <span className="font-black text-lg tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-1.5">
            1 social
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-300/60">
              Firebase
            </span>
          </span>
          {subtitle && (
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-none">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

