import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  LogIn,
  UserPlus,
  Sparkles,
  ShieldCheck,
  Camera,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    login,
    register,
    lang,
    showToast,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      login(email.trim(), password.trim() || undefined);
    } else {
      const trimmedFullName = fullName.trim();
      const trimmedUsername = username.trim();
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();

      if (!trimmedFullName || !trimmedUsername || !trimmedEmail) {
        showToast(lang === 'bn' ? 'সবগুলো ফিল্ড পূরণ করা আবশ্যক।' : 'Please fill all fields.');
        return;
      }

      // Name English-only validation (A-Z, a-z and spaces only - no numbers or special chars)
      const englishNameRegex = /^[a-zA-Z ]+$/;
      const hasBengaliChars = /[\u0980-\u09FF]/;

      if (hasBengaliChars.test(trimmedFullName) || !englishNameRegex.test(trimmedFullName) || trimmedFullName.length < 2) {
        showToast(
          lang === 'bn'
            ? 'নাম শুধুমাত্র ইংরেজি অক্ষর (A-Z, a-z) এবং স্পেস হতে পারবে (সংখ্যা, প্রতীক বা বাংলা গ্রহণযোগ্য নয়)।'
            : 'Name must contain only English letters (A-Z, a-z) and spaces.'
        );
        return;
      }

      // Username English-only validation
      const englishUsernameRegex = /^[a-zA-Z0-9_.-]+$/;
      if (hasBengaliChars.test(trimmedUsername) || !englishUsernameRegex.test(trimmedUsername)) {
        showToast(
          lang === 'bn'
            ? 'ইউজারনেম শুধুমাত্র ইংরেজি অক্ষরে (a-z, 0-9, _, ., -) হতে হবে।'
            : 'Username must contain English characters only (a-z, 0-9, _, ., -).'
        );
        return;
      }

      if (trimmedUsername.length < 3) {
        showToast(lang === 'bn' ? 'ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে।' : 'Username must be at least 3 characters.');
        return;
      }

      register(trimmedEmail, trimmedUsername, trimmedFullName, trimmedPassword || undefined);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                {mode === 'login'
                  ? lang === 'bn' ? 'ইমেইল দিয়ে লগইন করুন' : 'Login with Email'
                  : lang === 'bn' ? 'নতুন অ্যাকাউন্ট খুলুন' : 'Create an Account'}
              </h3>
              <p className="text-[11px] text-neutral-400">
                {lang === 'bn' ? 'কমিউনিটির সাথে যুক্ত থাকুন' : 'Join the social network'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2 rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-neutral-500 dark:text-neutral-400'
            }`}
          >
            {lang === 'bn' ? 'লগইন' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`py-2 rounded-xl transition-all ${
              mode === 'register'
                ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-neutral-500 dark:text-neutral-400'
            }`}
          >
            {lang === 'bn' ? 'রেজিস্ট্রেশন' : 'Sign Up'}
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  {lang === 'bn' ? 'আপনার পুরো নাম:' : 'Full Name:'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rifat Khan"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  {lang === 'bn' ? 'ইউজারনেম:' : 'Username:'}
                </label>
                <div className="relative">
                  <span className="text-xs font-mono absolute left-3 top-2 text-neutral-400">@</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="rifat_khan"
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
              {lang === 'bn' ? 'ইমেইল এড্রেস:' : 'Email Address:'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your email address"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
              {lang === 'bn' ? 'পাসওয়ার্ড:' : 'Password:'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all mt-2"
          >
            {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>
              {mode === 'login'
                ? lang === 'bn' ? 'লগইন করুন' : 'Sign In with Email'
                : lang === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
