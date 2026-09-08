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
  Plus,
  Trash2,
  Crown,
  ExternalLink,
  ShieldCheck,
  Clock,
  Key,
  Mail,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PostCard } from './PostCard';
import { ProfileLink } from '../types';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    users,
    posts,
    selectedUserProfileId,
    updateProfile,
    toggleFollow,
    startOrOpenChatWithUser,
    changeEmailAndPassword,
    requestVerification,
    verificationRequests,
    setSelectedUserProfileId,
    lang,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'posts' | 'liked' | 'saved'>('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  // Modals for Followers, Following, and Likes lists
  const [activeListModal, setActiveListModal] = useState<'followers' | 'following' | 'likes' | null>(null);

  // Edit form state
  const [editUsername, setEditUsername] = useState(currentUser?.username || '');
  const [editName, setEditName] = useState(currentUser?.fullName || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editLocation, setEditLocation] = useState(currentUser?.location || '');
  const [editWebsite, setEditWebsite] = useState(currentUser?.website || '');
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar || '');
  const [editCover, setEditCover] = useState(currentUser?.coverImage || '');
  const [editStatus, setEditStatus] = useState(currentUser?.statusBadge || '');
  const [editLinks, setEditLinks] = useState<ProfileLink[]>(currentUser?.links || []);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  // Security Credentials state
  const [editEmail, setEditEmail] = useState(currentUser?.email || '');
  const [editPassword, setEditPassword] = useState(currentUser?.password || '');

  // Verification application form
  const [verifyType, setVerifyType] = useState<'Verify' | 'VIP'>('VIP');
  const [verifyReason, setVerifyReason] = useState('');
  const [verifySocial, setVerifySocial] = useState('');

  // Determine which user profile to show
  const profileUserId = selectedUserProfileId || currentUser?.id;
  const profileUser = users.find((u) => u.id === profileUserId) || currentUser;

  if (!profileUser) return null;

  const { isFirebaseAdmin } = useApp();
  const isAdmin = isFirebaseAdmin;
  const isMe = currentUser?.id === profileUser.id;
  const canEdit = isMe || isAdmin;
  const isFollowing = currentUser ? currentUser.following.includes(profileUser.id) : false;

  // Filter posts
  const userPosts = posts.filter((p) => p.authorId === profileUser.id);
  const likedPosts = posts.filter((p) => p.likes.includes(profileUser.id));
  const savedPosts = posts.filter((p) => p.savedBy.includes(profileUser.id));

  // Calculate total likes received on this user's posts
  const totalLikesReceived = userPosts.reduce((acc, p) => acc + (p.likesCount ?? p.likes.length), 0);

  // Users who liked this user's posts
  const likerUserIds = Array.from(new Set(userPosts.flatMap((p) => p.likes))).slice(0, 50);
  const likerUsers = users.filter((u) => likerUserIds.includes(u.id));

  // Followers & Following users objects (fast lookup)
  const followerUserIds = new Set(profileUser.followers);
  const followerUsers = users.filter((u) => followerUserIds.has(u.id)).slice(0, 50);
  const followingUsers = users.filter((u) => profileUser.following.includes(u.id));

  // Pending verification request for this user
  const pendingVerification = verificationRequests.find(
    (r) => r.userId === profileUser.id && r.status === 'pending'
  );

  const handleOpenEdit = () => {
    setEditUsername(profileUser.username || '');
    setEditName(profileUser.fullName || '');
    setEditBio(profileUser.bio || '');
    setEditLocation(profileUser.location || '');
    setEditWebsite(profileUser.website || '');
    setEditAvatar(profileUser.avatar || '');
    setEditCover(profileUser.coverImage || '');
    setEditStatus(profileUser.statusBadge || '');
    setEditLinks(profileUser.links || []);
    setEditEmail(profileUser.email || '');
    setEditPassword(profileUser.password || '');
    setIsEditModalOpen(true);
  };

  const handleAddLink = () => {
    if (!newLinkUrl.trim()) return;
    if (editLinks.length >= 10) {
      showToast(lang === 'bn' ? 'সর্বোচ্চ ১০ টি লিঙ্ক যুক্ত করা সম্ভব।' : 'Maximum 10 links allowed.');
      return;
    }
    let formattedUrl = newLinkUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    const newLink: ProfileLink = {
      id: `link-${Date.now()}`,
      title: newLinkTitle.trim() || new URL(formattedUrl).hostname,
      url: formattedUrl,
    };
    setEditLinks([...editLinks, newLink]);
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  const handleRemoveLink = (id: string) => {
    setEditLinks(editLinks.filter((l) => l.id !== id));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      username: editUsername.trim(),
      fullName: editName.trim(),
      bio: editBio.trim(),
      location: editLocation.trim(),
      website: editWebsite.trim(),
      avatar: editAvatar.trim() || profileUser.avatar,
      coverImage: editCover.trim() || profileUser.coverImage,
      statusBadge: editStatus.trim(),
      links: editLinks.slice(0, 10),
    }, profileUser.id);

    if (isMe && (editEmail !== currentUser?.email || editPassword !== currentUser?.password)) {
      changeEmailAndPassword(editEmail, editPassword);
    }

    setIsEditModalOpen(false);
  };

  const handleApplyVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyReason.trim()) return;
    requestVerification(verifyType, verifyReason, verifySocial);
    setIsVerificationModalOpen(false);
    setVerifyReason('');
    setVerifySocial('');
  };

  const handleShareProfile = () => {
    const shareUrl = `${window.location.origin}/?u=${profileUser.username}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      showToast(
        lang === 'bn'
          ? `ইউজারনেম সহ প্রোফাইল লিঙ্ক কপি করা হয়েছে: ${shareUrl}`
          : `Profile link with username copied: ${shareUrl}`
      );
    }
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
          {canEdit && (
            <button
              onClick={handleOpenEdit}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs font-medium backdrop-blur-sm flex items-center gap-1.5 transition-all"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'কভার পরিবর্তন' : 'Change Cover'}</span>
            </button>
          )}
        </div>

        {/* Profile Details Container */}
        <div className="px-5 sm:px-8 pb-6 relative">
          {/* Avatar & Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 mb-4 gap-4">
            <div className="relative inline-block">
              <img
                src={profileUser.avatar}
                alt={profileUser.fullName}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 border-white dark:border-neutral-900 shadow-xl bg-neutral-200"
              />
              {canEdit && (
                <button
                  onClick={handleOpenEdit}
                  className="absolute bottom-1 right-1 p-2 rounded-xl bg-indigo-600 text-white shadow-md hover:bg-indigo-700"
                  title="Update avatar"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {canEdit && (
                <>
                  <button
                    id="edit-profile-btn"
                    onClick={handleOpenEdit}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{lang === 'bn' ? 'প্রোফাইল কাস্টমাইজ' : 'Edit Profile'}</span>
                  </button>

                  {isMe && !profileUser.isVip && !profileUser.isVerified && (
                    <button
                      onClick={() => setIsVerificationModalOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition-colors shadow-sm"
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                      <span>{lang === 'bn' ? 'Verify / VIP আবেদন' : 'Apply Verify/VIP'}</span>
                    </button>
                  )}
                </>
              )}
              {!isMe && (
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

              {/* Share Profile Button with Username */}
              <button
                id="share-profile-btn"
                onClick={handleShareProfile}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-xs font-medium"
                title="Share Profile with Username"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">
                  {lang === 'bn' ? 'শেয়ার লিঙ্ক' : 'Share Link'}
                </span>
              </button>
            </div>
          </div>

          {/* User Bio & Meta info */}
          <div className="space-y-3.5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-100">
                  {profileUser.fullName}
                </h2>

                {/* VIP Gold Badge */}
                {profileUser.isVip && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-white font-black text-xs shadow-sm">
                    <Crown className="w-3 h-3" />
                    VIP
                  </span>
                )}

                {/* Verified Blue Checkmark */}
                {profileUser.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 font-bold text-xs">
                    <CheckCircle className="w-3 h-3 text-sky-500" />
                    Verified
                  </span>
                )}

                {pendingVerification && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 text-xs font-medium">
                    <Clock className="w-3 h-3" />
                    {lang === 'bn' ? 'ভেরিফিকেশন অপেক্ষমান' : 'Verification Pending'}
                  </span>
                )}

                {profileUser.statusBadge && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium">
                    {profileUser.statusBadge}
                  </span>
                )}
              </div>

              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-1">
                @{profileUser.username} • {profileUser.role.toUpperCase()}
                {isMe && (
                  <span className="ml-2 text-neutral-400">
                    ({lang === 'bn' ? 'ইউজারনেম পরিবর্তন: ' : 'Username changed: '}
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {profileUser.usernameChangeCount || 0}/10
                    </span>{' '}
                    {lang === 'bn' ? 'বার' : 'times'})
                  </span>
                )}
              </p>
            </div>

            <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-2xl">
              {profileUser.bio}
            </p>

            {/* Location, Website, Created At */}
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

            {/* Up to 10 Profile Custom Links Section */}
            {profileUser.links && profileUser.links.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>
                    {lang === 'bn' ? 'প্রোফাইল লিঙ্কসমূহ (সর্বোচ্চ ১০ টি):' : 'Profile Links (Max 10):'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold">
                    {profileUser.links.length}/10
                  </span>
                </p>

                <div className="flex flex-wrap gap-2">
                  {profileUser.links.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 hover:border-indigo-400 text-xs font-medium text-neutral-700 dark:text-neutral-200 transition-all shadow-xs group"
                    >
                      <ExternalLink className="w-3 h-3 text-indigo-500 group-hover:scale-110 transition-transform" />
                      <span>{link.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Clickable 4-Stats Row: Posts 0, Likes 0, Followers 0, Following 0 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              {/* Posts Metric */}
              <button
                onClick={() => setActiveTab('posts')}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-center border border-neutral-100 dark:border-neutral-800/80"
              >
                <span className="text-lg sm:text-xl font-black text-neutral-900 dark:text-neutral-100">
                  {userPosts.length}
                </span>
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {lang === 'bn' ? 'Posts (পোস্ট)' : 'Posts'}
                </span>
              </button>

              {/* Likes Metric with clickable viewer */}
              <button
                onClick={() => setActiveListModal('likes')}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:border-rose-200 transition-all text-center border border-neutral-100 dark:border-neutral-800/80 group"
              >
                <span className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform">
                  {totalLikesReceived}
                </span>
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                  <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                  {lang === 'bn' ? 'Likes (লাইক)' : 'Likes'}
                </span>
              </button>

              {/* Followers Metric with clickable viewer */}
              <button
                onClick={() => setActiveListModal('followers')}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:border-indigo-200 transition-all text-center border border-neutral-100 dark:border-neutral-800/80 group"
              >
                <span className="text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                  {(profileUser.followerCount ?? profileUser.followers.length).toLocaleString()}
                </span>
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {lang === 'bn' ? 'Followers (ফলোয়ার)' : 'Followers'}
                </span>
              </button>

              {/* Following Metric with clickable viewer */}
              <button
                onClick={() => setActiveListModal('following')}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-sky-50 dark:hover:bg-sky-950/20 hover:border-sky-200 transition-all text-center border border-neutral-100 dark:border-neutral-800/80 group"
              >
                <span className="text-lg sm:text-xl font-black text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform">
                  {profileUser.following.length}
                </span>
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {lang === 'bn' ? 'Following (ফলোয়িং)' : 'Following'}
                </span>
              </button>
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
        {activeTab === 'posts' &&
          (userPosts.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 text-xs">
              {lang === 'bn' ? 'এখনো কোনো পোস্ট করা হয়নি।' : 'No posts published yet.'}
            </div>
          ) : (
            userPosts.map((post) => <PostCard key={post.id} post={post} />)
          ))}

        {activeTab === 'liked' &&
          (likedPosts.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 text-xs">
              {lang === 'bn' ? 'কোনো লাইককৃত পোস্ট নেই।' : 'No liked posts yet.'}
            </div>
          ) : (
            likedPosts.map((post) => <PostCard key={post.id} post={post} />)
          ))}

        {activeTab === 'saved' &&
          (savedPosts.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 text-xs">
              {lang === 'bn' ? 'কোনো বুকমার্ক পোস্ট নেই।' : 'No saved bookmarks.'}
            </div>
          ) : (
            savedPosts.map((post) => <PostCard key={post.id} post={post} />)
          ))}
      </div>

      {/* MODAL: Followers / Following / Likes Viewer */}
      {activeListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-5 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                {activeListModal === 'followers' && (
                  <>
                    <UserCheck className="w-4 h-4 text-indigo-500" />
                    <span>
                      {lang === 'bn'
                        ? `ফলোয়ার তালিকা (${(profileUser.followerCount ?? profileUser.followers.length).toLocaleString()})`
                        : `Followers (${(profileUser.followerCount ?? profileUser.followers.length).toLocaleString()})`}
                    </span>
                  </>
                )}
                {activeListModal === 'following' && (
                  <>
                    <UserCheck className="w-4 h-4 text-sky-500" />
                    <span>{lang === 'bn' ? `অনুসরণ করছেন (${profileUser.following.length})` : `Following (${profileUser.following.length})`}</span>
                  </>
                )}
                {activeListModal === 'likes' && (
                  <>
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <span>{lang === 'bn' ? `যাঁরা লাইক করেছেন (${totalLikesReceived})` : `People who liked posts (${totalLikesReceived})`}</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => setActiveListModal(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-3 space-y-2.5 flex-1 pr-1">
              {activeListModal === 'followers' &&
                (followerUsers.length === 0 ? (
                  <p className="text-xs text-neutral-400 text-center py-8">
                    {lang === 'bn' ? 'এখনো কোনো ফলোয়ার নেই।' : 'No followers yet.'}
                  </p>
                ) : (
                  followerUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 transition-colors"
                    >
                      <button
                        onClick={() => {
                          setSelectedUserProfileId(u.id);
                          setActiveListModal(null);
                        }}
                        className="flex items-center gap-3 text-left"
                      >
                        <img
                          src={u.avatar}
                          alt={u.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
                            {u.fullName}
                            {u.isVip && <Crown className="w-3 h-3 text-amber-500" />}
                            {u.isVerified && <CheckCircle className="w-3 h-3 text-sky-500" />}
                          </p>
                          <p className="text-[11px] text-neutral-400">@{u.username}</p>
                        </div>
                      </button>

                      {currentUser && currentUser.id !== u.id && (
                        <button
                          onClick={() => toggleFollow(u.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                            currentUser.following.includes(u.id)
                              ? 'border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          {currentUser.following.includes(u.id)
                            ? lang === 'bn' ? 'অনুসরণ করছেন' : 'Following'
                            : lang === 'bn' ? 'ফলো করুন' : 'Follow'}
                        </button>
                      )}
                    </div>
                  ))
                ))}

              {activeListModal === 'following' &&
                (followingUsers.length === 0 ? (
                  <p className="text-xs text-neutral-400 text-center py-8">
                    {lang === 'bn' ? 'কাউকে অনুসরণ করা হয়নি।' : 'Not following anyone yet.'}
                  </p>
                ) : (
                  followingUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 transition-colors"
                    >
                      <button
                        onClick={() => {
                          setSelectedUserProfileId(u.id);
                          setActiveListModal(null);
                        }}
                        className="flex items-center gap-3 text-left"
                      >
                        <img
                          src={u.avatar}
                          alt={u.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
                            {u.fullName}
                            {u.isVip && <Crown className="w-3 h-3 text-amber-500" />}
                            {u.isVerified && <CheckCircle className="w-3 h-3 text-sky-500" />}
                          </p>
                          <p className="text-[11px] text-neutral-400">@{u.username}</p>
                        </div>
                      </button>

                      {currentUser && currentUser.id !== u.id && (
                        <button
                          onClick={() => toggleFollow(u.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                            currentUser.following.includes(u.id)
                              ? 'border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          {currentUser.following.includes(u.id)
                            ? lang === 'bn' ? 'অনুসরণ করছেন' : 'Following'
                            : lang === 'bn' ? 'ফলো করুন' : 'Follow'}
                        </button>
                      )}
                    </div>
                  ))
                ))}

              {activeListModal === 'likes' &&
                (likerUsers.length === 0 ? (
                  <p className="text-xs text-neutral-400 text-center py-8">
                    {lang === 'bn' ? 'এখনো কোনো লাইক জমা হয়নি।' : 'No likes recorded yet.'}
                  </p>
                ) : (
                  likerUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 transition-colors"
                    >
                      <button
                        onClick={() => {
                          setSelectedUserProfileId(u.id);
                          setActiveListModal(null);
                        }}
                        className="flex items-center gap-3 text-left"
                      >
                        <img
                          src={u.avatar}
                          alt={u.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
                            {u.fullName}
                            {u.isVip && <Crown className="w-3 h-3 text-amber-500" />}
                            {u.isVerified && <CheckCircle className="w-3 h-3 text-sky-500" />}
                          </p>
                          <p className="text-[11px] text-neutral-400">@{u.username}</p>
                        </div>
                      </button>

                      {currentUser && currentUser.id !== u.id && (
                        <button
                          onClick={() => toggleFollow(u.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                            currentUser.following.includes(u.id)
                              ? 'border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          {currentUser.following.includes(u.id)
                            ? lang === 'bn' ? 'অনুসরণ করছেন' : 'Following'
                            : lang === 'bn' ? 'ফলো করুন' : 'Follow'}
                        </button>
                      )}
                    </div>
                  ))
                ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Verify & VIP Application */}
      {isVerificationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl sm:rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <span>{lang === 'bn' ? 'ভেরিফিকেশন / VIP আবেদন' : 'Apply for Verify or VIP'}</span>
              </h3>
              <button
                onClick={() => setIsVerificationModalOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyVerification} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                  {lang === 'bn' ? 'আবেদনের ধরন নির্বাচন করুন:' : 'Select Badge Type:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVerifyType('VIP')}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                      verifyType === 'VIP'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20'
                        : 'border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-bold text-xs">
                      <Crown className="w-4 h-4 text-amber-500" />
                      👑 VIP Badge
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {lang === 'bn' ? 'গোল্ড ক্রাউন ও ভিআইপি স্ট্যাটাস' : 'Gold Crown VIP status'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVerifyType('Verify')}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                      verifyType === 'Verify'
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 ring-2 ring-sky-500/20'
                        : 'border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-bold text-xs">
                      <CheckCircle className="w-4 h-4 text-sky-500" />
                      🔵 Blue Verify
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {lang === 'bn' ? 'অফিসিয়াল ব্লু ভেরিফিকেশন' : 'Official Blue checkmark'}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  {lang === 'bn' ? 'আবেদনের কারণ ও পরিচয়:' : 'Reason & Background:'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={verifyReason}
                  onChange={(e) => setVerifyReason(e.target.value)}
                  placeholder={
                    lang === 'bn'
                      ? 'আপনি কেন এই ব্যাজের দাবিদার? আপনার কাজ ও প্ল্যাটফর্ম সংক্রান্ত বিস্তারিত লিখুন...'
                      : 'Why should you receive this badge? Explain your creator/work background...'
                  }
                  className="w-full text-xs p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  {lang === 'bn' ? 'সোশ্যাল মিডিয়া বা পোর্টফোলিও লিঙ্ক:' : 'Portfolio / Social Profile Link:'}
                </label>
                <input
                  type="url"
                  value={verifySocial}
                  onChange={(e) => setVerifySocial(e.target.value)}
                  placeholder="https://facebook.com/..., https://github.com/..."
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsVerificationModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'এডমিনের কাছে জমা দিন' : 'Submit Application'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal (Includes Username Limit, 10 Links, and Email/Password) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md sm:max-w-lg rounded-2xl sm:rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-4 sm:p-5 flex flex-col max-h-[82vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
              <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-neutral-100">
                {lang === 'bn' ? 'প্রোফাইল কাস্টমাইজেশন' : 'Customize Profile'}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col flex-1 min-h-0 overflow-hidden pt-2">
              <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-4">
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

              {/* Username with 10-time Change Limit */}
              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    {lang === 'bn' ? 'ইউজারনেম (Username):' : 'Username:'}
                  </label>
                  <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                    {lang === 'bn'
                      ? `পরিবর্তন হয়েছে: ${profileUser.usernameChangeCount || 0} / ১০ বার`
                      : `Changed: ${profileUser.usernameChangeCount || 0} / 10 times`}
                  </span>
                </div>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  disabled={(profileUser.usernameChangeCount || 0) >= 10 && !isAdmin}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 disabled:opacity-60 disabled:cursor-not-allowed"
                  required
                />
                {(profileUser.usernameChangeCount || 0) >= 10 && !isAdmin ? (
                  <p className="text-[11px] text-rose-500 font-medium">
                    ⚠️ {lang === 'bn' ? '১০ বার ইউজারনেম পরিবর্তনের সর্বোচ্চ সীমা অতিক্রম করেছেন।' : 'Maximum 10 username change limit reached.'}
                  </p>
                ) : (
                  <p className="text-[10px] text-neutral-400">
                    {lang === 'bn'
                      ? `বাকি আছে: ${10 - (profileUser.usernameChangeCount || 0)} বার পরিবর্তন করা যাবে।`
                      : `Remaining: ${10 - (profileUser.usernameChangeCount || 0)} changes remaining.`}
                  </p>
                )}
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

              {/* Category / Status Badge */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  {lang === 'bn' ? 'ক্যাটাগরি (Blogger, Creator ইত্যাদি):' : 'Category (Blogger, Creator etc):'}
                </label>
                <input
                  type="text"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  placeholder={lang === 'bn' ? 'Blogger, Developer, Creator...' : 'Blogger, Developer, Creator...'}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  {lang === 'bn' ? 'বায়ো / পরিচয়:' : 'Bio:'}
                </label>
                <textarea
                  rows={2}
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
                    {lang === 'bn' ? 'ওয়েবসাইট:' : 'Website Link:'}
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

              {/* Up to 10 Links Manager */}
              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
                    <LinkIcon className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{lang === 'bn' ? 'প্রোফাইল লিঙ্কস (সর্বোচ্চ ১০ টি):' : 'Profile Links (Max 10):'}</span>
                  </label>
                  <span className="text-[11px] font-semibold text-neutral-500">
                    {editLinks.length} / 10
                  </span>
                </div>

                {/* Existing links */}
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {editLinks.map((l) => (
                    <div
                      key={l.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs"
                    >
                      <div className="truncate flex-1 mr-2">
                        <p className="font-bold text-neutral-800 dark:text-neutral-200">{l.title}</p>
                        <p className="text-[11px] text-neutral-400 truncate">{l.url}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(l.id)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new link input if < 10 */}
                {editLinks.length < 10 && (
                  <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newLinkTitle}
                        onChange={(e) => setNewLinkTitle(e.target.value)}
                        placeholder={lang === 'bn' ? 'লিঙ্কের নাম (যেমন: ফেসবুক/পোর্টফোলিও)' : 'Title (e.g. Portfolio)'}
                        className="text-xs p-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                      />
                      <input
                        type="text"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        placeholder="https://..."
                        className="text-xs p-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddLink}
                      className="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'নতুন লিঙ্ক যুক্ত করুন' : 'Add Link'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Email & Password Security Settings */}
              {isMe && (
                <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-2.5">
                  <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{lang === 'bn' ? 'অ্যাকাউন্ট ইমেইল ও পাসওয়ার্ড পরিবর্তন:' : 'Email & Password Settings:'}</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-semibold text-neutral-500 block mb-1">
                        {lang === 'bn' ? 'লগইন ইমেইল:' : 'Login Email:'}
                      </label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-neutral-500 block mb-1">
                        {lang === 'bn' ? 'পাসওয়ার্ড:' : 'Password:'}
                      </label>
                      <input
                        type="text"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full text-xs p-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons - Pinned at bottom and always visible */}
            <div className="flex items-center justify-end gap-2 pt-3 mt-2 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Check className="w-4 h-4" />
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

