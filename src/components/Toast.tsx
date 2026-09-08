import React from 'react';
import { Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div
      id="app-toast-container"
      className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200 pointer-events-none"
    >
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-neutral-900/95 dark:bg-white/95 text-white dark:text-neutral-900 text-xs font-semibold shadow-2xl backdrop-blur-md border border-neutral-700/50 dark:border-neutral-200">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
