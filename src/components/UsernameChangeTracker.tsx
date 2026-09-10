import React from 'react';
import { History, ShieldCheck, AlertTriangle, Lock, Info, CheckCircle2 } from 'lucide-react';

export interface UsernameChangeTrackerProps {
  changeCount: number;
  maxLimit?: number;
  isAdmin?: boolean;
  lang?: 'en' | 'bn';
  isPendingChange?: boolean;
  className?: string;
}

export const UsernameChangeTracker: React.FC<UsernameChangeTrackerProps> = ({
  changeCount = 0,
  maxLimit = 10,
  isAdmin = false,
  lang = 'en',
  isPendingChange = false,
  className = '',
}) => {
  const safeCount = Math.max(0, changeCount || 0);
  const remaining = Math.max(0, maxLimit - safeCount);
  const percentUsed = Math.min(100, Math.round((safeCount / maxLimit) * 100));
  const isLocked = remaining <= 0 && !isAdmin;
  const isLow = remaining > 0 && remaining <= 3 && !isAdmin;

  return (
    <div
      id="username-change-tracker"
      className={`rounded-2xl p-4 border transition-all duration-200 ${
        isLocked
          ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60'
          : isLow
          ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'
          : 'bg-neutral-50 dark:bg-neutral-850/80 border-neutral-200 dark:border-neutral-700/80'
      } ${className}`}
    >
      {/* Header with Title and Dynamic Badge */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
              isLocked
                ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/60 dark:text-rose-300'
                : isLow
                ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/60 dark:text-amber-300'
                : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300'
            }`}
          >
            {isLocked ? (
              <Lock className="w-3.5 h-3.5" />
            ) : isAdmin ? (
              <ShieldCheck className="w-3.5 h-3.5" />
            ) : isLow ? (
              <AlertTriangle className="w-3.5 h-3.5" />
            ) : (
              <History className="w-3.5 h-3.5" />
            )}
          </div>
          <div>
            <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
              {lang === 'bn' ? 'ইউজারনেম পরিবর্তনের সীমা' : 'Username Change Limit'}
            </h4>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {isAdmin
                ? lang === 'bn'
                  ? 'অ্যাডমিন অধিকার: আনলিমিটেড পরিবর্তন'
                  : 'Admin Privilege: Unlimited changes'
                : lang === 'bn'
                ? `সর্বোচ্চ সীমা: ${maxLimit} বার`
                : `Maximum quota: ${maxLimit} changes`}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div id="username-remaining-badge" className="shrink-0">
          {isAdmin ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
              <ShieldCheck className="w-3 h-3" />
              {lang === 'bn' ? 'অ্যাডমিন' : 'Unlimited'}
            </span>
          ) : isLocked ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              <Lock className="w-3 h-3" />
              {lang === 'bn' ? 'সীমা শেষ (০ বাকি)' : '0 Remaining (Locked)'}
            </span>
          ) : isLow ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="w-3 h-3" />
              {lang === 'bn' ? `${remaining} বার বাকি` : `${remaining} Remaining`}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3 h-3" />
              {lang === 'bn' ? `${remaining} বার বাকি` : `${remaining} Remaining`}
            </span>
          )}
        </div>
      </div>

      {/* 10-Step Visual Segmented Progress Bar */}
      <div className="space-y-1.5 my-2.5">
        <div
          id="username-progress-meter"
          role="progressbar"
          aria-valuenow={safeCount}
          aria-valuemin={0}
          aria-valuemax={maxLimit}
          aria-label={lang === 'bn' ? 'ইউজারনেম পরিবর্তন ট্র্যাকার' : 'Username change tracker'}
          className="grid grid-cols-10 gap-1"
        >
          {Array.from({ length: maxLimit }).map((_, idx) => {
            const stepNumber = idx + 1;
            const isUsed = stepNumber <= safeCount;
            const isPendingThis = isPendingChange && !isUsed && stepNumber === safeCount + 1 && !isAdmin;

            return (
              <div
                key={stepNumber}
                title={
                  isUsed
                    ? lang === 'bn'
                      ? `ধাপ ${stepNumber}: ইতিমধ্যে ব্যবহৃত`
                      : `Step ${stepNumber}: Already used`
                    : isPendingThis
                    ? lang === 'bn'
                      ? `ধাপ ${stepNumber}: এই পরিবর্তনের সাথে ব্যবহৃত হবে`
                      : `Step ${stepNumber}: Will be used upon saving`
                    : lang === 'bn'
                    ? `ধাপ ${stepNumber}: উপলব্ধ`
                    : `Step ${stepNumber}: Available`
                }
                className={`h-2 rounded-full transition-all duration-300 ${
                  isUsed
                    ? isLocked
                      ? 'bg-rose-500 dark:bg-rose-600 shadow-sm'
                      : 'bg-indigo-600 dark:bg-indigo-500 shadow-sm'
                    : isPendingThis
                    ? 'bg-amber-400 dark:bg-amber-500 animate-pulse ring-2 ring-amber-400/40 ring-offset-1 dark:ring-offset-neutral-900'
                    : 'bg-neutral-200 dark:bg-neutral-700/80'
                }`}
              />
            );
          })}
        </div>

        {/* Counter Summary */}
        <div className="flex items-center justify-between text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
          <span>
            {lang === 'bn'
              ? `ব্যবহৃত: ${safeCount} / ${maxLimit} বার`
              : `Used: ${safeCount} / ${maxLimit} times`}
          </span>
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
            {isAdmin
              ? lang === 'bn'
                ? 'সীমাহীন'
                : 'Unlimited'
              : lang === 'bn'
              ? `${remaining} বার বাকি রয়েছে`
              : `${remaining} of ${maxLimit} changes left`}
          </span>
        </div>
      </div>

      {/* Contextual Advisory Banners */}
      {isLocked ? (
        <div
          id="username-locked-alert"
          className="mt-2.5 p-2.5 rounded-xl bg-rose-100/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2 text-rose-800 dark:text-rose-200"
        >
          <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" />
          <p className="text-[11px] leading-relaxed">
            {lang === 'bn'
              ? 'আপনি ইউজারনেম পরিবর্তনের সর্বোচ্চ সীমা (১০ বার) অতিক্রম করেছেন। নিরাপত্তা ও অপব্যবহার রোধে আপনার ইউজারনেম স্থায়ীভাবে লক করা হয়েছে।'
              : 'You have reached the maximum allowed limit of 10 username changes. For platform integrity and security, your username is now permanently locked.'}
          </p>
        </div>
      ) : isPendingChange ? (
        <div
          id="username-pending-alert"
          className="mt-2.5 p-2 rounded-xl bg-amber-100/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center gap-2 text-amber-900 dark:text-amber-200"
        >
          <Info className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-[11px]">
            {lang === 'bn'
              ? `সতর্কতা: প্রোফাইল সংরক্ষণ করলে ১টি কোটা ব্যয় হবে (অবশিষ্ট থাকবে ${Math.max(
                  0,
                  remaining - 1
                )} বার)।`
              : `Notice: Saving this new username will use 1 change quota (${Math.max(
                  0,
                  remaining - 1
                )} will remain).`}
          </p>
        </div>
      ) : isLow ? (
        <div
          id="username-low-alert"
          className="mt-2.5 p-2 rounded-xl bg-amber-100/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 flex items-center gap-2 text-amber-800 dark:text-amber-300"
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
          <p className="text-[11px]">
            {lang === 'bn'
              ? `মনোযোগ দিন: আপনার আর মাত্র ${remaining} বার ইউজারনেম পরিবর্তন করার সুযোগ আছে।`
              : `Caution: You only have ${remaining} username change${remaining === 1 ? '' : 's'} remaining.`}
          </p>
        </div>
      ) : null}
    </div>
  );
};
