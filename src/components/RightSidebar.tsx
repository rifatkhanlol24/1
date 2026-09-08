import React from 'react';
import {
  TrendingUp,
  Users,
  CheckCircle,
  Zap,
  ShieldCheck,
  Globe,
  BellRing,
  Flame,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TRENDING_TAGS } from '../data/mockData';

export const RightSidebar: React.FC = () => {
  const {
    users,
    currentUser,
    totalCommunityUsers,
    realtimeActiveUsers,
    toggleFollow,
    setSelectedUserProfileId,
    setActiveTab,
    setSearchQuery,
    pushPermissionStatus,
    requestPushPermission,
    lang,
  } = useApp();

  const suggestedUsers = users
    .filter((u) => u.id !== currentUser?.id)
    .slice(0, 4);

  return (
    <aside className="hidden lg:flex flex-col w-80 shrink-0 h-[calc(100vh-4rem)] sticky top-16 p-4 space-y-4 overflow-y-auto">
      {/* 1M Users & Real-Time Active Users Live Counter */}
      <div className="p-4 rounded-3xl border border-indigo-200/70 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/40 dark:from-neutral-900 dark:via-neutral-900 dark:to-indigo-950/40 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            <span>{lang === 'bn' ? 'নেটওয়ার্ক পরিসংখ্যান' : 'Live Network'}</span>
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Online</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Total 1M Users */}
          <div className="p-2.5 rounded-2xl bg-white dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/60">
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium truncate">
              {lang === 'bn' ? 'টোটাল ইউজার' : 'Total Users'}
            </p>
            <p className="text-base font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
              {totalCommunityUsers.toLocaleString()}
            </p>
            <p className="text-[9px] text-neutral-400 font-bold truncate">
              {lang === 'bn' ? '১ মিলিয়ন ইউজার' : '1M Users Pool'}
            </p>
          </div>

          {/* Real-Time Active Users */}
          <div className="p-2.5 rounded-2xl bg-white dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/60">
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate">{lang === 'bn' ? 'রিয়েল টাইম' : 'Active Now'}</span>
            </div>
            <p className="text-base font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {realtimeActiveUsers.toLocaleString()}
            </p>
            <p className="text-[9px] text-emerald-500 font-bold truncate">
              {lang === 'bn' ? 'লাইভ এক্টিভ' : 'Real-time Live'}
            </p>
          </div>
        </div>
      </div>

      {/* Firebase Cloud Status Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-indigo-500/10 dark:from-amber-950/30 dark:to-neutral-900 border border-amber-300/40 dark:border-amber-800/40 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>Firebase Connected</span>
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed font-mono">
          social-media1bd • Firestore DB
        </p>
        <button
          onClick={() => setActiveTab('admin')}
          className="w-full text-left text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center justify-between pt-1 border-t border-amber-200/50 dark:border-amber-800/50"
        >
          <span>{lang === 'bn' ? 'এডমিন কনসোল খুলুন →' : 'Open Admin Console →'}</span>
        </button>
      </div>

      {/* Suggested Creators */}
      <div className="p-4 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            <span>{lang === 'bn' ? 'কাদের অনুসরণ করবেন' : 'Who to Follow'}</span>
          </h3>
          <button
            onClick={() => setActiveTab('explore')}
            className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
          >
            {lang === 'bn' ? 'সব দেখুন' : 'View all'}
          </button>
        </div>

        <div className="space-y-2.5">
          {suggestedUsers.map((u) => {
            const isFollowing = currentUser?.following.includes(u.id);
            return (
              <div
                key={u.id}
                className="flex items-center justify-between gap-2 text-xs"
              >
                <div
                  onClick={() => {
                    setSelectedUserProfileId(u.id);
                    setActiveTab('profile');
                  }}
                  className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
                >
                  <img
                    src={u.avatar}
                    alt={u.fullName}
                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-neutral-200 dark:border-neutral-700"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1">
                      {u.fullName}
                      {u.isVerified && (
                        <CheckCircle className="w-3 h-3 text-sky-500 shrink-0" />
                      )}
                    </p>
                    <p className="text-[10px] text-neutral-400 truncate">
                      @{u.username}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleFollow(u.id)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold shrink-0 transition-colors ${
                    isFollowing
                      ? 'border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                  }`}
                >
                  {isFollowing ? (lang === 'bn' ? 'ফলোয়িং' : 'Following') : (lang === 'bn' ? 'ফলো' : 'Follow')}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trending Topics */}
      <div className="p-4 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-3">
        <h3 className="font-bold text-xs text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
          <span>{lang === 'bn' ? 'আজকের ট্রেন্ডস' : 'Trending For You'}</span>
        </h3>

        <div className="space-y-2">
          {TRENDING_TAGS.slice(0, 5).map((trend) => (
            <div
              key={trend.tag}
              onClick={() => {
                setSearchQuery(trend.tag);
                setActiveTab('explore');
              }}
              className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 cursor-pointer transition-colors"
            >
              <span className="text-[10px] text-neutral-400 font-mono uppercase">
                {trend.category}
              </span>
              <p className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                #{trend.tag}
              </p>
              <span className="text-[10px] text-neutral-400">
                {trend.postsCount.toLocaleString()} {lang === 'bn' ? 'পোস্ট' : 'posts'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Push Notification prompt pill */}
      {pushPermissionStatus !== 'granted' && (
        <div
          onClick={requestPushPermission}
          className="p-3 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 cursor-pointer hover:bg-indigo-100/60 transition-colors flex items-center gap-2.5 text-xs text-indigo-900 dark:text-indigo-200"
        >
          <BellRing className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <div className="text-left flex-1">
            <span className="font-bold block text-[11px]">
              {lang === 'bn' ? 'পুশ অ্যালার্ট অন করুন' : 'Enable Web Push Alerts'}
            </span>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
              {lang === 'bn' ? 'লাইভ মেসেজ মিস করবেন না' : 'Never miss an instant message'}
            </span>
          </div>
        </div>
      )}

      {/* Footer credits */}
      <div className="px-2 text-[11px] text-neutral-400 space-y-1">
        <p>© 2026 1 social • Firebase Integrated</p>
        <p>Google Cloud Firestore • React 19 • Tailwind CSS</p>
      </div>
    </aside>
  );
};
