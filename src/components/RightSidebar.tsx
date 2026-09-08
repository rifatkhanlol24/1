import React from 'react';
import {
  TrendingUp,
  Users,
  CheckCircle,
  Zap,
  ShieldCheck,
  Globe,
  BellRing,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TRENDING_TAGS } from '../data/mockData';

export const RightSidebar: React.FC = () => {
  const {
    users,
    currentUser,
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
      {/* Platform Health & Fast Server Badge */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-neutral-900 border border-indigo-100 dark:border-indigo-900/60 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            {lang === 'bn' ? 'হাই-স্পিড সার্ভার সক্রিয়' : 'High-Speed Edge Active'}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        </div>
        <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {lang === 'bn'
            ? 'রিয়েল-টাইম স্টেট ও ইমেজ প্রসেসিং সহ দ্রুত গতি সম্পন্ন আর্কিটেকচার।'
            : 'Fast response times with instant state sync & Vercel edge deployment ready.'}
        </p>
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

      {/* Footer credits & Vercel info */}
      <div className="px-2 text-[11px] text-neutral-400 space-y-1">
        <p>© 2026 VibeConnect • Built for Speed</p>
        <p>Vercel &amp; GitHub Ready • React 19 • Tailwind CSS</p>
      </div>
    </aside>
  );
};
