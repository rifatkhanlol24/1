import React, { useState } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Flame,
  Users,
  Compass,
  RefreshCw,
  Camera,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PostCard } from './PostCard';

export const FeedView: React.FC = () => {
  const {
    posts,
    users,
    currentUser,
    setIsCreateModalOpen,
    setSelectedUserProfileId,
    setActiveTab,
    lang,
    showToast,
  } = useApp();

  const [feedMode, setFeedMode] = useState<'all' | 'following'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast(lang === 'bn' ? 'ফিড রিফ্রেশ হয়েছে!' : 'Feed refreshed!');
    }, 600);
  };

  const filteredPosts = posts.filter((post) => {
    if (feedMode === 'following' && currentUser) {
      return (
        currentUser.following.includes(post.authorId) ||
        post.authorId === currentUser.id
      );
    }
    return true;
  });

  return (
    <div id="feed-view-container" className="max-w-2xl mx-auto space-y-5 pb-16">
      {/* Stories / Active Creators Horizontal Strip */}
      <div className="p-3.5 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-3.5 min-w-max">
          {/* User's own add story item */}
          <div
            onClick={() => setIsCreateModalOpen(true)}
            className="flex flex-col items-center gap-1.5 cursor-pointer group"
          >
            <div className="relative">
              <img
                src={currentUser?.avatar}
                alt="My story"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-dashed border-indigo-500 p-0.5 group-hover:scale-105 transition-transform"
              />
              <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center absolute -bottom-1 -right-1 border-2 border-white dark:border-neutral-900 shadow-xs">
                <Plus className="w-3 h-3" />
              </div>
            </div>
            <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
              {lang === 'bn' ? 'আমার স্টোরি' : 'Your Story'}
            </span>
          </div>

          {/* Active Contacts/Creators */}
          {users.map((u) => {
            if (u.id === currentUser?.id) return null;
            return (
              <div
                key={u.id}
                onClick={() => {
                  setSelectedUserProfileId(u.id);
                  setActiveTab('profile');
                }}
                className="flex flex-col items-center gap-1.5 cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-2xl p-0.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 group-hover:scale-105 transition-transform shadow-xs">
                  <img
                    src={u.avatar}
                    alt={u.fullName}
                    className="w-full h-full rounded-2xl object-cover border border-white dark:border-neutral-900"
                  />
                </div>
                <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 truncate max-w-[64px] text-center">
                  {u.fullName.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Post Prompt Card */}
      <div className="p-4 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs flex items-center gap-3">
        <img
          src={currentUser?.avatar}
          alt=""
          className="w-10 h-10 rounded-full object-cover shrink-0 border border-neutral-200 dark:border-neutral-700"
        />
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex-1 text-left px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 transition-colors"
        >
          {lang === 'bn'
            ? 'ছবি বা চিন্তা শেয়ার করতে এখানে ক্লিক করুন...'
            : "What's happening? Share a photo or thoughts..."}
        </button>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
          title="Upload photo"
        >
          <Camera className="w-5 h-5" />
        </button>
      </div>

      {/* Feed Filter Switcher */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold">
          <button
            onClick={() => setFeedMode('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              feedMode === 'all'
                ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'সকল পোস্ট' : 'For You'}</span>
          </button>

          <button
            onClick={() => setFeedMode('following')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              feedMode === 'following'
                ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'ফলোয়িং ফিড' : 'Following'}</span>
          </button>
        </div>

        <button
          onClick={handleRefresh}
          className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title="Refresh Feed"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
        </button>
      </div>

      {/* Posts Stream */}
      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-neutral-400">
            <Sparkles className="w-10 h-10 mx-auto text-neutral-400 mb-2" />
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              {lang === 'bn'
                ? 'আপনার ফিডে এখনো কোনো পোস্ট নেই'
                : 'No posts in this feed yet'}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              {lang === 'bn'
                ? 'নতুন ক্রিয়েটরদের অনুসরণ করুন অথবা প্রথম ছবিটি পোস্ট করুন!'
                : 'Follow more creators or publish your very first photo post!'}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
            >
              {lang === 'bn' ? 'প্রথম পোস্ট করুন' : 'Create First Post'}
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
};
