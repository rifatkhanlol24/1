import React from 'react';
import {
  Home,
  Compass,
  MessageCircle,
  Bell,
  User,
  Shield,
  PlusSquare,
  Globe,
  CheckCircle,
  Flame,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    unreadNotificationsCount,
    messages,
    setIsCreateModalOpen,
    setIsVercelModalOpen,
    setSelectedUserProfileId,
    lang,
  } = useApp();

  // Count unread messages for current user
  const unreadMessagesCount = messages.filter(
    (m) => m.receiverId === currentUser?.id && !m.isRead
  ).length;

  const navItems = [
    {
      id: 'feed' as const,
      label: lang === 'bn' ? 'হোম ফিড' : 'Home Feed',
      icon: Home,
    },
    {
      id: 'explore' as const,
      label: lang === 'bn' ? 'এক্সপ্লোর ও ট্রেন্ডিং' : 'Explore & Trends',
      icon: Compass,
    },
    {
      id: 'messages' as const,
      label: lang === 'bn' ? 'মেসেঞ্জার চ্যাট' : 'Direct Chat',
      icon: MessageCircle,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
    {
      id: 'notifications' as const,
      label: lang === 'bn' ? 'নোটিফিকেশন' : 'Notifications',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
    },
    {
      id: 'profile' as const,
      label: lang === 'bn' ? 'আমার প্রোফাইল' : 'Profile',
      icon: User,
      onClick: () => {
        if (currentUser) {
          setSelectedUserProfileId(currentUser.id);
        }
      },
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16 border-r border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 p-4 justify-between transition-colors">
      <div className="space-y-6">
        {/* Navigation list */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  setActiveTab(item.id);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-neutral-500 dark:text-neutral-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-white text-indigo-600'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Firebase & Admin Console button */}
          <button
            id="sidebar-nav-admin"
            onClick={() => setActiveTab('admin')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'admin'
                ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/20'
                : 'text-amber-700 dark:text-amber-400 bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/60 border border-amber-200/60 dark:border-amber-900/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <Flame className="w-5 h-5 fill-current text-amber-500" />
              <span>{lang === 'bn' ? 'ফায়ারবেস ও এডমিন' : 'Firebase & Admin'}</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 font-black">
              LIVE
            </span>
          </button>
        </nav>

        {/* Primary Action Button */}
        <button
          id="sidebar-create-post-btn"
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02]"
        >
          <PlusSquare className="w-4 h-4" />
          <span>{lang === 'bn' ? 'ছবি পোস্ট করুন' : 'Create Post'}</span>
        </button>

        {/* Vercel Deploy Helper pill */}
        <button
          onClick={() => setIsVercelModalOpen(true)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-800 transition-colors"
        >
          <Globe className="w-4 h-4 text-emerald-500" />
          <div className="text-left flex-1 truncate">
            <span className="font-semibold block text-neutral-800 dark:text-neutral-200">
              Vercel Deployment
            </span>
            <span className="text-[10px] text-neutral-400">
              {lang === 'bn' ? '১-ক্লিকে ডেপ্লয় নির্দেশিকা' : 'Ready vercel.json included'}
            </span>
          </div>
        </button>
      </div>

      {/* User profile footer card */}
      {currentUser && (
        <div
          id="sidebar-user-card"
          onClick={() => {
            setSelectedUserProfileId(currentUser.id);
            setActiveTab('profile');
          }}
          className="p-2.5 rounded-2xl bg-neutral-100/80 dark:bg-neutral-800/80 hover:bg-neutral-200/80 dark:hover:bg-neutral-700/60 cursor-pointer transition-colors flex items-center gap-3 border border-neutral-200/60 dark:border-neutral-700/60"
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.fullName}
            className="w-10 h-10 rounded-full object-cover shrink-0 border border-neutral-300 dark:border-neutral-600"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate flex items-center gap-1">
              {currentUser.fullName}
              {currentUser.isVerified && (
                <CheckCircle className="w-3 h-3 text-sky-500 shrink-0" />
              )}
            </p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
              @{currentUser.username}
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};
