import React, { useState } from 'react';
import {
  MapPin,
  Link as LinkIcon,
  Calendar,
  Edit3,
  CheckCircle,
  MessageCircle,
  Share2,
  Grid,
  Heart,
  Bookmark,
  Camera,
  X,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PostCard } from './PostCard';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    users,
    posts,
    selectedUserProfileId,
    updateProfile,
    toggleFollow,
    startOrOpenChatWithUser,
    setSharingPost,
    lang,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'posts' | 'liked' | 'saved'>('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(currentUser?.fullName || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editLocation, setEditLocation] = useState(currentUser?.location || '');
  const [editWebsite, setEditWebsite] = useState(currentUser?.website || '');
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar || '');
  const [editCover, setEditCover] = useState(currentUser?.coverImage || '');
  const [editStatus, setEditStatus] = useState(currentUser?.statusBadge || '');

  // Determine which user profile to show
  const profileUserId = selectedUserProfileId || currentUser?.id;
  const profileUser = users.find((u) => u.id === profileUserId) || currentUser;

  if (!profileUser) return null;

  const isMe = currentUser?.id === profileUser.id;
  const isFollowing = currentUser ? currentUser.following.includes(profileUser.id) : false;

  // Filter posts
  const userPosts = posts.filter((p) => p.authorId === profileUser.id);
  const likedPosts = posts.filter((p) => p.likes.includes(profileUser.id));
  const savedPosts = posts.filter((p) => p.savedBy.includes(profileUser.id));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName: editName.trim(),
      bio: editBio.trim(),
      location: editLocation.trim(),
      website: editWebsite.trim(),
      avatar: editAvatar.trim() || profileUser.avatar,
      coverImage: editCover.trim() || profileUser.coverImage,
      statusBadge: editStatus.trim(),
    });
    setIsEditModalOpen(false);
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setEditAvatar(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setEditCover(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div id="profile-view-container" className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Profile Header Card */}
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
        {/* Cover Photo */}
        <div className="h-44 sm:h-64 w-full bg-neutral-800 relative overflow-hidden group">
          <img
            src={profileUser.coverImage}
            alt="Cover banner"
            className="w-full h-full object-cover"
          />
          {isMe && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs font-medium backdrop-blur-sm flex items-center gap-1.5 transition-all"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'কভার পরিবর্তন' : 'Change Cover'}</span>
            </button>
          )}
        </div>

        {/* Profile Details Container */}
        <div className="px-5 sm:px-8 pb-6 relative">
          {/* Avatar floating */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 mb-4 gap-4">
            <div className="relative inline-block">
              <img
                src={profileUser.avatar}
                alt={profileUser.fullName}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 border-white dark:border-neutral-900 shadow-xl bg-neutral-200"
              />
              {isMe && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute bottom-1 right-1 p-2 rounded-xl bg-indigo-600 text-white shadow-md hover:bg-indigo-700"
                  title="Update avatar"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {isMe ? (
                <button
                  id="edit-profile-btn"
                  onClick={() => {
                    setEditName(currentUser?.fullName || '');
                    setEditBio(currentUser?.bio || '');
                    setEditLocation(currentUser?.location || '');
                    setEditWebsite(currentUser?.website || '');
                    setEditAvatar(currentUser?.avatar || '');
                    setEditCover(currentUser?.coverImage || '');
                    setEditStatus(currentUser?.statusBadge || '');
                    setIsEditModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{lang === 'bn' ? 'প্রোফাইল কাস্টমাইজ করুন' : 'Edit Profile'}</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => toggleFollow(profileUser.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      isFollowing
                        ? 'border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                    }`}
                  >
                    {isFollowing
                      ? lang === 'bn' ? 'অনুসরণ করছেন' : 'Following'
                      : lang === 'bn' ? 'অনুসরণ করুন' : 'Follow'}
                  </button>

                  <button
                    onClick={() => startOrOpenChatWithUser(profileUser.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{lang === 'bn' ? 'মেসেজ পাঠান' : 'Message'}</span>
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    showToast(lang === 'bn' ? 'প্রোফাইল লিঙ্ক কপি করা হয়েছে!' : 'Profile link copied!');
                  }
                }}
                className="p-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Share Profile"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* User Bio & Meta info */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-100">
                  {profileUser.fullName}
                </h2>
                {profileUser.isVerified && (
                  <CheckCircle className="w-5 h-5 text-sky-500 shrink-0" />
                )}
                {profileUser.statusBadge && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium">
                    {profileUser.statusBadge}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 font-medium mt-0.5">
                @{profileUser.username} • {profileUser.role.toUpperCase()}
              </p>
            </div>

            <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-2xl">
              {profileUser.bio}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
              {profileUser.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {profileUser.location}
                </span>
              )}
              {profileUser.website && (
                <a
                  href={profileUser.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  {profileUser.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {lang === 'bn' ? 'যুক্ত হয়েছেন: ' : 'Joined: '}
                {new Date(profileUser.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                })}
              </span>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-6 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  {userPosts.length}
                </span>
                <span className="text-xs text-neutral-500">
                  {lang === 'bn' ? 'পোস্ট' : 'Posts'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  {profileUser.followers.length}
                </span>
                <span className="text-xs text-neutral-500">
                  {lang === 'bn' ? 'অনুসারী (Followers)' : 'Followers'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  {profileUser.following.length}
                </span>
                <span className="text-xs text-neutral-500">
                  {lang === 'bn' ? 'অনুসরণ করছেন (Following)' : 'Following'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'posts'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? `পোস্টসমূহ (${userPosts.length})` : `Posts (${userPosts.length})`}</span>
        </button>

        <button
          onClick={() => setActiveTab('liked')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'liked'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? `লাইককৃত (${likedPosts.length})` : `Liked (${likedPosts.length})`}</span>
        </button>

        {isMe && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'saved'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? `বুকমার্ক (${savedPosts.length})` : `Saved (${savedPosts.length})`}</span>
          </button>
        )}
      </div>

      {/* Tab Feed Content */}
      <div className="space-y-6 max-w-2xl mx-auto">
        {activeTab === 'posts' && (
          userPosts.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 text-xs">
              {lang === 'bn' ? 'এখনো কোনো পোস্ট করা হয়নি।' : 'No posts published yet.'}
            </div>
          ) : (
            userPosts.map((post) => <PostCard key={post.id} post={post} />)
          )
        )}

        {activeTab === 'liked' && (
          likedPosts.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 text-xs">
              {lang === 'bn' ? 'কোনো লাইককৃত পোস্ট নেই।' : 'No liked posts yet.'}
            </div>
          ) : (
            likedPosts.map((post) => <PostCard key={post.id} post={post} />)
          )
        )}

        {activeTab === 'saved' && (
          savedPosts.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 text-xs">
              {lang === 'bn' ? 'কোনো বুকমার্ক পোস্ট নেই।' : 'No saved bookmarks.'}
            </div>
          ) : (
            savedPosts.map((post) => <PostCard key={post.id} post={post} />)
          )
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-5 overflow-y-auto max-h-[90vh] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                {lang === 'bn' ? 'প্রোফাইল কাস্টমাইজ করুন' : 'Edit Profile'}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              {/* Avatar and Cover previews */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    {lang === 'bn' ? 'প্রোফাইল ছবি (Avatar):' : 'Avatar Photo:'}
                  </label>
                  <div className="flex items-center gap-2">
                    <img
                      src={editAvatar || profileUser.avatar}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <label className="text-xs text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer hover:underline">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFile}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    {lang === 'bn' ? 'কভার ছবি (Banner):' : 'Cover Banner:'}
                  </label>
                  <div className="flex items-center gap-2">
                    <img
                      src={editCover || profileUser.coverImage}
                      alt=""
                      className="w-16 h-12 rounded-xl object-cover"
                    />
                    <label className="text-xs text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer hover:underline">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverFile}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  {lang === 'bn' ? 'পুরো নাম:' : 'Full Name:'}
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  required
                />
              </div>

              {/* Bio */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  {lang === 'bn' ? 'বায়ো / পরিচয়:' : 'Bio:'}
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 resize-none"
                />
              </div>

              {/* Location & Website */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    {lang === 'bn' ? 'অবস্থান (Location):' : 'Location:'}
                  </label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="Dhaka, Bangladesh"
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    {lang === 'bn' ? 'ওয়েবসাইট / লিঙ্ক:' : 'Website Link:'}
                  </label>
                  <input
                    type="text"
                    value={editWebsite}
                    onChange={(e) => setEditWebsite(e.target.value)}
                    placeholder="https://mywebsite.com"
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              {/* Status Badge */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  {lang === 'bn' ? 'স্ট্যাটাস ব্যাজ:' : 'Status Badge:'}
                </label>
                <input
                  type="text"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  placeholder="🚀 Exploring | 📸 Photographer | 💻 Developer"
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
