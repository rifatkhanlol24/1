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
    users,
    switchUser,
    lang,
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
      login(email.trim());
    } else {
      register(email.trim(), username.trim(), fullName.trim());
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
                placeholder="name@example.com"
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

        {/* 1-Click Demo Accounts Quick Switch */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
            {lang === 'bn' ? '১-ক্লিক ডেমো অ্যাকাউন্ট দিয়ে তাৎক্ষণিক পরীক্ষা:' : '1-Click Instant Demo Login:'}
          </p>
          <div className="grid grid-cols-1 gap-1.5">
            <button
              onClick={() => {
                login('rifatkhanlol24@gmail.com');
              }}
              className="flex items-center justify-between p-2 rounded-xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/50 dark:bg-purple-950/30 text-xs hover:bg-purple-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Rifat Khan (Admin)
                </span>
              </div>
              <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400">
                rifatkhanlol24@gmail.com
              </span>
            </button>

            <button
              onClick={() => {
                login('sarah.lens@creative.io');
              }}
              className="flex items-center justify-between p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-500" />
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Sarah Rahman (Photographer)
                </span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">
                sarah.lens@creative.io
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
