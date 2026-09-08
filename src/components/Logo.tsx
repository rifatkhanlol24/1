import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  subtitle?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, subtitle }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm rounded-xl',
    md: 'w-10 h-10 text-lg rounded-2xl',
    lg: 'w-14 h-14 text-2xl rounded-3xl',
  };

  return (
    <div className="flex items-center gap-2.5 select-none shrink-0 group">
      <div
        className={`${sizeClasses[size]} bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform font-black`}
      >
        1
      </div>
      {showText && (
        <div>
          <span className="font-black text-lg tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-1.5">
            1 social
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-bold border border-amber-300/60">
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
