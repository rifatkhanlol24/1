import React, { useState } from 'react';
import {
  Search,
  TrendingUp,
  Hash,
  Users,
  Image as ImageIcon,
  CheckCircle,
  ArrowUpRight,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TRENDING_TAGS } from '../data/mockData';
import { PostCard } from './PostCard';

export const ExploreSearch: React.FC = () => {
  const {
    posts,
    users,
    currentUser,
    searchQuery,
    setSearchQuery,
    toggleFollow,
    setSelectedUserProfileId,
    setActiveTab,
    lang,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'posts' | 'people' | 'tags'>('all');

  const query = searchQuery.toLowerCase().trim();

  // Search Results filtering
  const matchingPosts = posts.filter((p) => {
    if (!query) return true;
    const inContent = p.content.toLowerCase().includes(query);
    const inTags = p.tags.some((t) => t.toLowerCase().includes(query.replace(/^#/, '')));
    const inAuthor = p.authorName.toLowerCase().includes(query) || p.authorUsername.toLowerCase().includes(query);
    const inLocation = p.location?.toLowerCase().includes(query);
    return inContent || inTags || inAuthor || inLocation;
  });

  const matchingUsers = users.filter((u) => {
    if (!query) return true;
    return (
      u.fullName.toLowerCase().includes(query) ||
      u.username.toLowerCase().includes(query) ||
      u.bio.toLowerCase().includes(query) ||
      u.location?.toLowerCase().includes(query)
    );
  });

  const matchingTags = TRENDING_TAGS.filter((t) => {
    if (!query) return true;
    return t.tag.toLowerCase().includes(query.replace(/^#/, ''));
  });

  return (
    <div id="explore-search-container" className="space-y-6">
      {/* Search Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-neutral-900 to-neutral-900 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-medium mb-3 backdrop-blur-sm">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'শক্তিশালী সার্চ ও এক্সপ্লোরার' : 'Intelligent Search & Discover'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-2">
            {lang === 'bn'
              ? 'নতুন পোস্ট, ট্রেন্ডিং হ্যাশট্যাগ ও ক্রিয়েটর আবিষ্কার করুন'
              : 'Discover trending stories, visuals & creators'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            {lang === 'bn'
              ? 'কীওয়ার্ড, হ্যাশট্যাগ বা নাম লিখে তাৎক্ষণিক রিয়েল-টাইম ফলাফল দেখুন।'
              : 'Type any keyword, hashtag or username to explore live community content.'}
          </p>

          {/* Quick Search Input inside Explore */}
          <div className="mt-4 relative max-w-lg">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                lang === 'bn'
                  ? 'যেমন: #photography, nature, Rifat...'
                  : 'Search by keyword, #hashtag, or name...'
              }
              className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white placeholder-neutral-300 outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-2.5 text-xs text-neutral-300 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'all' as const, label: lang === 'bn' ? 'সব ফলাফল' : 'All Results', icon: SlidersHorizontal },
            { id: 'posts' as const, label: lang === 'bn' ? `পোস্ট (${matchingPosts.length})` : `Posts (${matchingPosts.length})`, icon: ImageIcon },
            { id: 'people' as const, label: lang === 'bn' ? `মানুষ (${matchingUsers.length})` : `People (${matchingUsers.length})`, icon: Users },
            { id: 'tags' as const, label: lang === 'bn' ? `হ্যাশট্যাগ (${matchingTags.length})` : `Hashtags (${matchingTags.length})`, icon: Hash },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeFilter === tab.id
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trending Hashtags Section (When in all or tags tab) */}
      {(activeFilter === 'all' || activeFilter === 'tags') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <span>{lang === 'bn' ? 'ট্রেন্ডিং হ্যাশট্যাগ' : 'Trending Hashtags'}</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {matchingTags.map((trend) => (
              <div
                key={trend.tag}
                onClick={() => setSearchQuery(trend.tag)}
                className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-indigo-500/50 hover:shadow-md cursor-pointer transition-all group"
              >
                <span className="text-[10px] text-neutral-400 uppercase font-mono tracking-wider">
                  {trend.category}
                </span>
                <p className="font-bold text-sm text-neutral-900 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                  <span>#{trend.tag}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {trend.postsCount.toLocaleString()} {lang === 'bn' ? 'পোস্ট' : 'posts'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* People / Creators Section (When in all or people tab) */}
      {(activeFilter === 'all' || activeFilter === 'people') && matchingUsers.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-500" />
            <span>{lang === 'bn' ? 'প্রস্তাবিত ক্রিয়েটর ও ব্যবহারকারী' : 'Suggested Creators'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {matchingUsers.map((u) => {
              const isFollowing = currentUser ? (currentUser.following || []).includes(u.id) : false;
              const isMe = currentUser?.id === u.id;

              return (
                <div
                  key={u.id}
                  className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    onClick={() => {
                      setSelectedUserProfileId(u.id);
                      setActiveTab('profile');
                    }}
                    className="flex items-center gap-3 cursor-pointer min-w-0"
                  >
                    <img
                      src={u.avatar}
                      alt={u.fullName}
                      className="w-12 h-12 rounded-full object-cover shrink-0 border border-neutral-200 dark:border-neutral-700"
                    />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 truncate flex items-center gap-1">
                        {u.fullName}
                        {u.isVerified && (
                          <CheckCircle className="w-3 h-3 text-sky-500 shrink-0" />
                        )}
                      </h4>
                      <p className="text-[11px] text-neutral-400 truncate">
                        @{u.username}
                      </p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate max-w-[200px] mt-0.5">
                        {u.bio}
                      </p>
                    </div>
                  </div>

                  {!isMe && (
                    <button
                      onClick={() => toggleFollow(u.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                        isFollowing
                          ? 'border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                      }`}
                    >
                      {isFollowing
                        ? lang === 'bn' ? 'অনুসরণ করছেন' : 'Following'
                        : lang === 'bn' ? 'অনুসরণ করুন' : 'Follow'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Posts Grid / Feed (When in all or posts tab) */}
      {(activeFilter === 'all' || activeFilter === 'posts') && (
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-indigo-500" />
            <span>
              {lang === 'bn' ? 'সম্প্রদায়ের পোস্টসমূহ' : 'Community Posts'}
              {query && ` ("${query}")`}
            </span>
          </h3>

          {matchingPosts.length === 0 ? (
            <div className="text-center py-12 rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-neutral-400">
              <Search className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                {lang === 'bn' ? 'কোনো ফলাফল পাওয়া যায়নি' : 'No posts matching your search'}
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                {lang === 'bn' ? 'সার্চ ক্লিয়ার করুন' : 'Clear search query'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
              {matchingPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
