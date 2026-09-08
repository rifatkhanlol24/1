import React, { useState, useEffect } from 'react';
import {
  Download,
  Smartphone,
  CheckCircle2,
  Share2,
  PlusSquare,
  X,
  Sparkles,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PwaInstallSystemProps {
  variant?: 'card' | 'button' | 'compact' | 'footer';
  className?: string;
}

export const PwaInstallSystem: React.FC<PwaInstallSystemProps> = ({
  variant = 'card',
  className = '',
}) => {
  const { lang, showToast } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if running as standalone PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // Listen for beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Listen for appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      showToast(lang === 'bn' ? '🎉 ১ সোশ্যাল অ্যাপ সফলভাবে ইনস্টল হয়েছে!' : '🎉 1 social App installed successfully!');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [lang, showToast]);

  const handleInstallClick = async () => {
    if (isInstalled) {
      showToast(lang === 'bn' ? 'অ্যাপটি ইতিমধ্যেই ইনস্টল করা আছে!' : 'App is already installed!');
      return;
    }

    if (deferredPrompt) {
      setIsInstalling(true);
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          showToast(lang === 'bn' ? 'ইনস্টলেশন শুরু হয়েছে...' : 'Installation started...');
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('Install prompt error:', err);
      } finally {
        setIsInstalling(false);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // Non-iOS browser without deferredPrompt (e.g. desktop Chrome already promptable or in preview)
      setShowIOSModal(true);
    }
  };

  if (isInstalled) {
    if (variant === 'button' || variant === 'compact') {
      return (
        <button
          id="pwa-installed-badge-btn"
          disabled
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800/60 ${className}`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{lang === 'bn' ? 'অ্যাপ ইনস্টল করা আছে' : 'PWA App Installed'}</span>
        </button>
      );
    }

    return (
      <div
        id="pwa-installed-card"
        className={`w-full p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between gap-3 text-xs text-emerald-800 dark:text-emerald-300 ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-xs">
              {lang === 'bn' ? '১ সোশ্যাল PWA অ্যাপ ইনস্টল করা রয়েছে' : '1 social PWA App Installed'}
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 opacity-90">
              {lang === 'bn' ? 'অফলাইন ও দ্রুত অ্যাক্সেস প্রস্তুত' : 'Offline ready & fast home access'}
            </p>
          </div>
        </div>
        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 shrink-0">
          Installed
        </span>
      </div>
    );
  }

  // Card Variant: Perfect for bottom of screen ("সবকিছুর নিচে PWA install system বাটন")
  return (
    <>
      {variant === 'button' || variant === 'compact' ? (
        <button
          id="pwa-install-compact-btn"
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition-all ${className}`}
        >
          <Smartphone className="w-4 h-4" />
          <span>{lang === 'bn' ? 'PWA ইনস্টল করুন' : 'Install PWA'}</span>
        </button>
      ) : (
        <div
          id="pwa-install-system-container"
          className={`w-full rounded-2xl bg-gradient-to-r from-neutral-900 via-indigo-950 to-purple-950 text-white p-4 sm:p-5 border border-indigo-800/50 shadow-xl shadow-indigo-950/20 relative overflow-hidden ${className}`}
        >
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="p-3 rounded-2xl bg-white/10 border border-white/20 text-indigo-300 shrink-0 shadow-inner">
                <Smartphone className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200">
                    PWA System
                  </span>
                  <span className="text-[11px] text-amber-300 font-semibold flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    {lang === 'bn' ? 'সুপার ফাস্ট ও অফলাইন' : 'Fast & Offline Ready'}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-1.5">
                  <span>{lang === 'bn' ? '1 social মোবাইল অ্যাপ ইনস্টল করুন' : 'Install 1 social PWA Mobile App'}</span>
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                </h4>
                <p className="text-xs text-neutral-300 mt-0.5 max-w-xl">
                  {lang === 'bn'
                    ? 'হোম স্ক্রিনে অ্যাড করুন, ব্রাউজারের চেয়ে দ্রুত লোড হবে এবং অডিও/ভিডিও কল ও মেসেজের রিয়েল-টাইম নোটিফিকেশন পাবেন।'
                    : 'Add to home screen for instant full-screen experience, fast offline caching, and real-time social alerts.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
              <button
                id="pwa-main-install-btn"
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:to-pink-400 text-white font-black text-xs sm:text-sm shadow-lg shadow-purple-600/30 active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isInstalling
                    ? (lang === 'bn' ? 'ইনস্টল হচ্ছে...' : 'Installing...')
                    : (lang === 'bn' ? '📲 অ্যাপ ইনস্টল করুন' : '📲 Install App')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guide Modal for iOS or manual install */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-neutral-900 dark:text-neutral-100">
                    {lang === 'bn' ? 'PWA অ্যাপ ইনস্টল করার নিয়ম' : 'How to Install PWA App'}
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    {lang === 'bn' ? 'হোম স্ক্রিনে ১ ক্লিকে যুক্ত করুন' : 'Add to home screen in seconds'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-700 dark:text-neutral-300">
              {isIOS ? (
                <>
                  <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900 dark:text-neutral-100">
                        {lang === 'bn' ? '১. শেয়ার বাটনে চাপ দিন' : '1. Tap the Share button'}
                      </p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        {lang === 'bn' ? 'সাফারি ব্রাউজারের নিচের শেয়ার (Share) আইকনে চাপুন।' : 'Tap the Safari share icon at the bottom of the screen.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <PlusSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900 dark:text-neutral-100">
                        {lang === 'bn' ? '২. "Add to Home Screen" নির্বাচন করুন' : '2. Select "Add to Home Screen"'}
                      </p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        {lang === 'bn' ? 'তালিকায় স্ক্রল করে "Add to Home Screen" এ ক্লিক করে Add চাপুন।' : 'Scroll down and tap "Add to Home Screen", then tap "Add".'}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900 dark:text-neutral-100">
                        {lang === 'bn' ? 'ব্রাউজার মেনু থেকে ইনস্টল' : 'Install via Browser Menu'}
                      </p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        {lang === 'bn'
                          ? 'ব্রাউজারের ৩ ডট (⋮) মেনু থেকে "Install 1 social" বা "Add to Home Screen" সিলেক্ট করুন।'
                          : 'Open browser (⋮) menu and click "Install 1 social" or "Add to Home Screen".'}
                      </p>
                    </div>
                  </div>
                </>
              )}

              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span className="text-[11px] font-medium">
                  {lang === 'bn'
                    ? 'কোনো অতিরিক্ত মেমোরি ছাড়াই অ্যাপের মতো দ্রুত কাজ করবে।'
                    : 'Works like a native application with minimal storage usage.'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all"
            >
              {lang === 'bn' ? 'বুঝেছি' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
