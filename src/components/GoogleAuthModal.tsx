import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, User, Mail, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export const GoogleAuthModal: React.FC = () => {
  const {
    isGoogleModalOpen,
    setIsGoogleModalOpen,
    loginWithGoogleAccount,
    lang,
    showToast,
  } = useApp();

  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isGoogleModalOpen) return null;

  const handleSelectAccount = async (email: string, name?: string) => {
    setIsSubmitting(true);
    try {
      await loginWithGoogleAccount(email, name);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) {
      showToast(lang === 'bn' ? 'দয়া করে একটি সঠিক গুগল ইমেইল দিন।' : 'Please enter a valid Google email.');
      return;
    }
    setIsSubmitting(true);
    try {
      await loginWithGoogleAccount(customEmail.trim(), customName.trim() || undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 relative bg-neutral-50/50 dark:bg-neutral-850/50">
          <button
            onClick={() => setIsGoogleModalOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm flex items-center justify-center p-2 shrink-0">
              <svg className="w-full h-full" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-black text-neutral-900 dark:text-neutral-50">
                {lang === 'bn' ? 'গুগল অ্যাকাউন্ট নির্বাচন করুন' : 'Sign in with Google Account'}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {lang === 'bn' ? '১সোশ্যাল-এ সাইন ইন করতে অ্যাকাউন্ট বেছে নিন' : 'Choose an account to continue to 1Social'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Quick Select Accounts */}
          <div className="space-y-2.5">
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
              {lang === 'bn' ? 'তাৎক্ষণিক গুগল প্রবেশ (Instant Account Choice)' : 'Instant Google Accounts'}
            </label>

            {/* Rifat Khan */}
            <button
              onClick={() => handleSelectAccount('rifatkhanlol24@gmail.com', 'Rifat Khan')}
              disabled={isSubmitting}
              className="w-full p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-neutral-200 dark:border-neutral-700/80 hover:border-indigo-300 dark:hover:border-indigo-700 flex items-center justify-between group transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-sm flex items-center justify-center shadow-sm">
                  RK
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      Rifat Khan
                    </span>
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
                  </div>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">
                    rifatkhanlol24@gmail.com
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Shohel Taj (Admin) */}
            <button
              onClick={() => handleSelectAccount('soheltajbhola@gmail.com', 'Shohel Taj')}
              disabled={isSubmitting}
              className="w-full p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-neutral-200 dark:border-neutral-700/80 hover:border-indigo-300 dark:hover:border-indigo-700 flex items-center justify-between group transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-rose-600 text-white font-black text-sm flex items-center justify-center shadow-sm">
                  ST
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      Shohel Taj
                    </span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500 text-white uppercase">
                      Admin
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">
                    soheltajbhola@gmail.com
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-neutral-200 dark:border-neutral-800 w-full" />
            <span className="bg-white dark:bg-neutral-900 px-3 text-[10px] text-neutral-400 font-medium uppercase tracking-wider shrink-0">
              {lang === 'bn' ? 'অন্য কোনো গুগল ইমেইল দিন' : 'Or enter custom Google email'}
            </span>
            <div className="border-t border-neutral-200 dark:border-neutral-800 w-full" />
          </div>

          {/* Form for custom Google Email */}
          <form onSubmit={handleCustomSubmit} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1 block">
                {lang === 'bn' ? 'গুগল ইমেইল ঠিকানা' : 'Google Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1 block">
                {lang === 'bn' ? 'আপনার নাম (ঐচ্ছিক)' : 'Full Name (Optional)'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !customEmail.trim()}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md hover:shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'গুগল দিয়ে প্রবেশ করুন' : 'Continue with Google Account'}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
