import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  LogIn,
  UserPlus,
  ShieldCheck,
  Camera,
  Moon,
  Sun,
  Languages,
  CheckCircle2,
  KeyRound,
  ShieldAlert,
  Flame,
  Globe,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PwaInstallSystem } from './PwaInstallSystem';

export const AuthGateScreen: React.FC = () => {
  const {
    login,
    register,
    users,
    loggedInUserIds,
    resetPasswordByUsernameOrEmail,
    darkMode,
    toggleDarkMode,
    lang,
    toggleLang,
    showToast,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Form Fields
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // Forgot password fields
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUsername.trim()) {
      showToast(lang === 'bn' ? 'দয়া করে ইমেইল বা ইউজারনেম দিন।' : 'Please enter email or username.');
      return;
    }
    setIsLoading(true);
    try {
      await login(emailOrUsername.trim(), password.trim() || undefined);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedFullName = fullName.trim();
    const trimmedUsername = registerUsername.trim();
    const trimmedEmail = registerEmail.trim();
    const trimmedPassword = registerPassword.trim();

    if (!trimmedFullName || !trimmedUsername || !trimmedEmail || !trimmedPassword) {
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

    // Username English-only validation (A-Z, a-z, 0-9, _, ., -)
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

    setIsLoading(true);
    setTimeout(() => {
      register(
        trimmedEmail,
        trimmedUsername,
        trimmedFullName,
        trimmedPassword
      );
      setIsLoading(false);
    }, 400);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetIdentifier.trim() || !newPassword.trim()) {
      showToast(lang === 'bn' ? 'ইউজারনেম/ইমেইল এবং নতুন পাসওয়ার্ড দিন।' : 'Please provide username/email and new password.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const res = resetPasswordByUsernameOrEmail(resetIdentifier.trim(), newPassword.trim());
      setIsLoading(false);
      showToast(res.message);
      if (res.success) {
        setEmailOrUsername(resetIdentifier.trim());
        setPassword(newPassword.trim());
        setMode('login');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-100 via-neutral-50 to-indigo-50/40 dark:from-neutral-950 dark:via-neutral-900 dark:to-indigo-950/20 text-neutral-900 dark:text-neutral-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white transition-colors">
      {/* Top Bar Controls */}
      <header className="w-full max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 font-black text-lg">
            1
          </div>
          <div>
            <span className="font-black text-lg tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-1.5">
              1 social
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-bold border border-amber-300/60">
                Firebase
              </span>
            </span>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-none">
              {lang === 'bn' ? 'সোশ্যাল নেটওয়ার্ক ও লাইভ প্ল্যাটফর্ম' : 'Next-Gen Social Network'}
            </p>
          </div>
        </div>

        {/* Theme & Language Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold shadow-xs transition-colors"
          >
            <Languages className="w-3.5 h-3.5 text-indigo-500" />
            <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 shadow-xs transition-colors"
            title="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>
      </header>

      {/* Center Auth Container */}
      <main className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-10 flex-1 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero Pitch (Hidden on small mobile if needed, or shown stacked) */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>{lang === 'bn' ? 'প্রবেশ করতে প্রথমে লগইন বা রেজিস্ট্রেশন করুন' : 'Sign in or register to enter'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              {lang === 'bn' ? (
                <>
                  যুক্ত হোন <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-rose-500 to-amber-500">1 social</span> এর সাথে
                </>
              ) : (
                <>
                  Connect on <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-rose-500 to-amber-500">1 social</span>
                </>
              )}
            </h1>

            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-md mx-auto lg:mx-0">
              {lang === 'bn'
                ? 'ছবি পোস্ট, রিয়েল-টাইম মেসেঞ্জার, ভেরিফাইড ব্যাজ, ভিআইপি ক্রিয়েটর নেটওয়ার্ক এবং সম্পূর্ণ সুরক্ষিত ফায়ারবেস ও অ্যাডমিন সিস্টেম।'
                : 'Share photo moments, live direct chat, get verified, VIP badges, and modern administrative controls.'}
            </p>

            {/* Feature Badges */}
            <div className="grid grid-cols-2 gap-3 pt-2 max-w-md mx-auto lg:mx-0 text-left">
              <div className="p-3 rounded-2xl bg-white/70 dark:bg-neutral-900/70 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  <Camera className="w-4 h-4 text-rose-500" />
                  <span>{lang === 'bn' ? 'ফটো ও ফিল্টার' : 'Photo Filters'}</span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                  {lang === 'bn' ? 'ভিন্টেজ, ভাইব্র্যান্ট, সাইবারপাঙ্ক' : 'Vintage, Vibrant, Cyberpunk'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/70 dark:bg-neutral-900/70 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  <ShieldCheck className="w-4 h-4 text-sky-500" />
                  <span>{lang === 'bn' ? 'ভেরিফাইড ও ভিআইপি' : 'Verify & VIP'}</span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                  {lang === 'bn' ? 'অ্যাডমিন অনুমোদিত ব্যাজ' : 'Admin certified badges'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/70 dark:bg-neutral-900/70 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>{lang === 'bn' ? '১ মিলিয়ন ইউজার নেটওয়ার্ক' : '1M Users Network'}</span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 font-mono">
                  {lang === 'bn' ? 'USER-0000000001 থেকে USER-1000000000' : 'USER-0000000001 to USER-1000000000'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/70 dark:bg-neutral-900/70 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  <Lock className="w-4 h-4 text-indigo-500" />
                  <span>{lang === 'bn' ? 'সুরক্ষিত অ্যাডমিন' : 'Admin Protected'}</span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                  {lang === 'bn' ? 'অ্যাডমিন সিকিউরড' : 'Admin Protected'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Auth Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 sm:p-8 space-y-5">
              
              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    mode === 'login'
                      ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'লগইন' : 'Sign In'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    mode === 'register'
                      ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'রেজিস্ট্রেশন' : 'Register'}</span>
                </button>
              </div>

              {/* Title Description */}
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {mode === 'login' && (lang === 'bn' ? 'আপনার অ্যাকাউন্টে প্রবেশ করুন' : 'Sign in to your account')}
                  {mode === 'register' && (lang === 'bn' ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'Create a new account')}
                  {mode === 'forgot' && (lang === 'bn' ? 'পাসওয়ার্ড রিসেট করুন' : 'Reset your password')}
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {mode === 'login' && (lang === 'bn' ? 'ফিড ও চ্যাট দেখতে লগইন সম্পন্ন করুন।' : 'Login to access your feed, profile, and messages.')}
                  {mode === 'register' && (lang === 'bn' ? '১ মিনিটে রেজিস্ট্রেশন সম্পন্ন করুন।' : 'Complete your quick 1-minute registration.')}
                  {mode === 'forgot' && (lang === 'bn' ? 'ইউজারনেম বা ইমেইল দিয়ে নতুন পাসওয়ার্ড সেট করুন।' : 'Set a new password using your username or email.')}
                </p>
              </div>

              {/* Mode: LOGIN */}
              {mode === 'login' && (
                <form onSubmit={handleLogin} className="space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                      {lang === 'bn' ? 'ইমেইল অথবা ইউজারনেম:' : 'Email or Username:'}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
                      <input
                        type="text"
                        required
                        value={emailOrUsername}
                        onChange={(e) => setEmailOrUsername(e.target.value)}
                        placeholder="your email address"
                        className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        {lang === 'bn' ? 'পাসওয়ার্ড:' : 'Password:'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        {lang === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-60"
                  >
                    {isLoading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>{lang === 'bn' ? 'লগইন করে প্রবেশ করুন' : 'Sign In & Enter'}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Mode: REGISTER */}
              {mode === 'register' && (
                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                      {lang === 'bn' ? 'আপনার পুরো নাম:' : 'Full Name:'}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Sohel Taj"
                        className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                      {lang === 'bn' ? 'ইউজারনেম (Username):' : 'Username:'}
                    </label>
                    <div className="relative">
                      <span className="text-xs font-mono absolute left-3.5 top-2.5 text-neutral-400">@</span>
                      <input
                        type="text"
                        required
                        value={registerUsername}
                        onChange={(e) => setRegisterUsername(e.target.value)}
                        placeholder="my_username"
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                      {lang === 'bn' ? 'ইমেইল এড্রেস:' : 'Email Address:'}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
                      <input
                        type="email"
                        required
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        placeholder="myemail@example.com"
                        className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                      {lang === 'bn' ? 'পাসওয়ার্ড:' : 'Password:'}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
                      <input
                        type="password"
                        required
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-60"
                  >
                    {isLoading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>{lang === 'bn' ? 'রেজিস্ট্রেশন সম্পন্ন করে প্রবেশ করুন' : 'Create Account & Enter'}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Mode: FORGOT PASSWORD */}
              {mode === 'forgot' && (
                <form onSubmit={handleResetPassword} className="space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                      {lang === 'bn' ? 'ইউজারনেম অথবা ইমেইল এড্রেস:' : 'Username or Email:'}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
                      <input
                        type="text"
                        required
                        value={resetIdentifier}
                        onChange={(e) => setResetIdentifier(e.target.value)}
                        placeholder="your email address"
                        className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                      {lang === 'bn' ? 'নতুন পাসওয়ার্ড (New Password):' : 'New Password:'}
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 4 characters"
                        className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                    >
                      {lang === 'bn' ? '← লগইনে ফিরে যান' : '← Back to Login'}
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20"
                    >
                      {lang === 'bn' ? 'পাসওয়ার্ড রিসেট' : 'Reset Password'}
                    </button>
                  </div>
                </form>
              )}

              {/* Security Policy Reminder */}
              <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-neutral-600 dark:text-neutral-400 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <p className="leading-tight">
                  {lang === 'bn'
                    ? '🔒 শুধুমাত্র অনুমোদিত অ্যাডমিনরাই অ্যাডমিন প্যানেল অ্যাক্সেস করতে পারেন।'
                    : '🔒 Only authorized administrators can access the Admin Panel.'}
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Global PWA Install System - Before Login */}
      <div className="w-full max-w-6xl mx-auto px-4 py-3">
        <PwaInstallSystem variant="card" />
      </div>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-4 py-4 border-t border-neutral-200/60 dark:border-neutral-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <p>© 2026 1 social. All rights reserved.</p>
        <p className="flex items-center gap-2">
          <span>Firebase Database Rules Active</span>
          <span>•</span>
          <span>Role Based Access Control</span>
        </p>
      </footer>
    </div>
  );
};
