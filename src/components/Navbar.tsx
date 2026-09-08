import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Plus,
  ShieldCheck,
  Globe,
  LogOut,
  UserCheck,
  Sparkles,
  Volume2,
  VolumeX,
  Flame,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    users,
    switchUser,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    darkMode,
    toggleDarkMode,
    lang,
    toggleLang,
    unreadNotificationsCount,
    markAllNotificationsRead,
    notifications,
    setIsCreateModalOpen,
    setIsAuthModalOpen,
    setIsVercelModalOpen,
    requestPushPermission,
    pushPermissionStatus,
    soundEnabled,
    setSoundEnabled,
    setSelectedUserProfileId,
    logout,
  } = useApp();

  const isUserAdmin = currentUser?.email === 'soheltajbhola@gmail.com' || currentUser?.role === 'admin';

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveTab('explore');
    }
  };

  const userNotifications = notifications.filter(
    (n) => n.userId === currentUser?.id
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <div
          id="brand-logo-btn"
          onClick={() => {
            setActiveTab('feed');
            setSelectedUserProfileId(null);
          }}
          className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform font-black text-lg">
            1
          </div>
          <div className="hidden sm:block">
            <span className="font-black text-lg tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-1.5">
              1 social
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 font-bold border border-amber-300/60">
                Firebase
              </span>
            </span>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-none">
              {lang === 'bn' ? 'সোশ্যাল ও লাইভ ম্যানেজমেন্ট' : 'Social & Live Management'}
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-md mx-1 sm:mx-4 relative"
        >
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-neutral-400 pointer-events-none" />
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'explore' && e.target.value.length > 0) {
                  setActiveTab('explore');
                }
              }}
              placeholder={
                lang === 'bn'
                  ? 'পোস্ট, হ্যাশট্যাগ (#tech) বা মানুষ খুঁজুন...'
                  : 'Search posts, #hashtags, or people...'
              }
              className="w-full pl-9 pr-8 py-2 text-sm rounded-full bg-neutral-100 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-neutral-800 outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                ✕
              </button>
            )}
          </div>
        </form>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Create Post Button */}
          <button
            id="nav-create-post-btn"
            onClick={() => setIsCreateModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all hover:shadow hover:scale-[1.02]"
            title={lang === 'bn' ? 'নতুন পোস্ট তৈরি করুন' : 'Create new post'}
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'bn' ? 'পোস্ট' : 'Post'}</span>
          </button>

          {/* Firebase Console Quick Nav (Admin Only) */}
          {isUserAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'admin'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60 hover:bg-amber-100'
              }`}
              title="Firebase Console & Admin"
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Firebase</span>
            </button>
          )}

          {/* Language Toggle */}
          <button
            id="lang-toggle-btn"
            onClick={toggleLang}
            className="px-2 py-1.5 text-xs font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border border-neutral-200 dark:border-neutral-700/60"
            title={lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
          >
            {lang === 'bn' ? 'EN' : 'বাং'}
          </button>

          {/* Dark Mode Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleDarkMode}
            className="p-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
          </button>

          {/* Notifications Dropdown Button */}
          <div className="relative">
            <button
              id="notifications-bell-btn"
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsUserMenuOpen(false);
                if (!isNotifOpen) {
                  markAllNotificationsRead();
                }
              }}
              className="p-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg relative transition-colors"
              title={lang === 'bn' ? 'নোটিফিকেশন' : 'Notifications'}
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold bg-rose-500 text-white rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Notification Drawer Popover */}
            {isNotifOpen && (
              <div
                id="notif-dropdown-panel"
                className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-2xl p-3 z-50 text-neutral-900 dark:text-neutral-100 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-700/60 mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm">
                      {lang === 'bn' ? 'নোটিফিকেশন' : 'Notifications'}
                    </h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium">
                      {userNotifications.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="p-1 rounded text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                      title={soundEnabled ? 'Sound Enabled' : 'Sound Muted'}
                    >
                      {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    </button>
                    {pushPermissionStatus !== 'granted' && (
                      <button
                        onClick={requestPushPermission}
                        className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline px-1.5 py-0.5"
                      >
                        {lang === 'bn' ? 'পুশ সক্রিয় করুন' : 'Enable Push'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {userNotifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-neutral-400">
                      {lang === 'bn' ? 'কোনো নতুন নোটিফিকেশন নেই' : 'No notifications yet'}
                    </div>
                  ) : (
                    userNotifications.slice(0, 8).map((n) => (
                      <div
                        key={n.id}
                        className={`flex items-start gap-2.5 p-2 rounded-xl text-xs transition-colors ${
                          n.isRead
                            ? 'bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-700/40'
                            : 'bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100/70 dark:hover:bg-indigo-950/60'
                        }`}
                      >
                        <img
                          src={n.actorAvatar}
                          alt={n.actorName}
                          className="w-8 h-8 rounded-full object-cover shrink-0 border border-neutral-200 dark:border-neutral-700"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="leading-snug">
                            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                              {n.actorName}
                            </span>{' '}
                            <span className="text-neutral-600 dark:text-neutral-300">
                              {n.text}
                            </span>
                          </p>
                          <span className="text-[10px] text-neutral-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-700/60 mt-2 text-center">
                  <button
                    onClick={() => {
                      setIsNotifOpen(false);
                      setActiveTab('notifications');
                    }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                  >
                    {lang === 'bn' ? 'সব নোটিফিকেশন দেখুন' : 'View all notifications'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Vercel Deploy Button */}
          <button
            id="vercel-deploy-info-btn"
            onClick={() => setIsVercelModalOpen(true)}
            className="p-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors hidden sm:block"
            title={lang === 'bn' ? 'Vercel ডেপ্লয়মেন্ট গাইড' : 'Vercel Deployment Guide'}
          >
            <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </button>

          {/* User Profile / Switcher */}
          {currentUser ? (
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => {
                  setIsUserMenuOpen(!isUserMenuOpen);
                  setIsNotifOpen(false);
                }}
                className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-indigo-500 transition-all"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.fullName}
                  className="w-8 h-8 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                />
              </button>

              {/* User Menu Popover */}
              {isUserMenuOpen && (
                <div
                  id="user-profile-dropdown"
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-2xl p-2.5 z-50 text-neutral-900 dark:text-neutral-100 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-700/60 mb-2">
                    <p className="font-semibold text-sm truncate flex items-center gap-1.5">
                      {currentUser.fullName}
                      {currentUser.role === 'admin' && (
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                      )}
                    </p>
                    <p className="text-xs text-neutral-400 truncate">
                      @{currentUser.username}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 font-medium">
                        Role: {currentUser.role}
                      </span>
                    </div>
                  </div>

                  {/* Switch Demo Accounts */}
                  <div className="px-2 py-1">
                    <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1 px-1">
                      {lang === 'bn' ? 'ইউজার স্যুইচ করুন:' : 'Switch User:'}
                    </p>
                    <div className="space-y-1">
                      {users.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u.id);
                            setIsUserMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                            u.id === currentUser.id
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 font-medium text-indigo-600 dark:text-indigo-300'
                              : 'hover:bg-neutral-100 dark:hover:bg-neutral-700/50 text-neutral-700 dark:text-neutral-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <img
                              src={u.avatar}
                              alt={u.fullName}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="truncate">{u.fullName}</span>
                          </div>
                          {u.role === 'admin' && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 font-bold uppercase">
                              Admin
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Links */}
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-700/60 mt-2 space-y-1">
                    <button
                      onClick={() => {
                        setSelectedUserProfileId(currentUser.id);
                        setActiveTab('profile');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-neutral-100 dark:hover:bg-neutral-700/50 text-neutral-700 dark:text-neutral-300"
                    >
                      {lang === 'bn' ? 'আমার প্রোফাইল' : 'View Profile'}
                    </button>
                    {isUserAdmin && (
                      <button
                        onClick={() => {
                          setActiveTab('admin');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-neutral-100 dark:hover:bg-neutral-700/50 text-amber-600 dark:text-amber-400 font-semibold flex items-center justify-between"
                      >
                        <span>{lang === 'bn' ? 'ফায়ারবেস ও এডমিন' : 'Firebase Console'}</span>
                        <Flame className="w-3.5 h-3.5 fill-current" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-neutral-100 dark:hover:bg-neutral-700/50 text-neutral-700 dark:text-neutral-300"
                    >
                      {lang === 'bn' ? 'অ্যাকাউন্ট সেটিংস / তথ্য' : 'Account Details'}
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold flex items-center justify-between transition-colors"
                    >
                      <span>{lang === 'bn' ? 'লগআউট (Log Out)' : 'Log Out'}</span>
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
            >
              {lang === 'bn' ? 'লগইন' : 'Sign In'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
