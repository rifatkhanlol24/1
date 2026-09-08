import React, { useState } from 'react';
import {
  Shield,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  Ban,
  Trash2,
  Send,
  Search,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Flame,
  Database,
  Crown,
  Bot,
  Heart,
  MessageSquare,
  Sparkles,
  Edit3,
  X,
  Clock,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole, User } from '../types';
import { FirebaseConsole } from './FirebaseConsole';

export const AdminPanel: React.FC = () => {
  const {
    currentUser,
    users,
    posts,
    adminBanUser,
    adminChangeRole,
    adminDeleteUser,
    adminBroadcastNotification,
    adminUpdateAnyUser,
    verificationRequests,
    adminApproveVerification,
    adminRejectVerification,
    botPoolTotal,
    botPoolSent,
    adminSendBotFollowers,
    adminSendAutoLikes,
    adminSendAutoComments,
    restorePost,
    deletePost,
    lang,
    showToast,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<
    'firebase' | 'users' | 'verification' | 'automation' | 'moderation' | 'broadcast'
  >('firebase');
  const [userFilter, setUserFilter] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');

  // Bot follower state
  const [botTargetUser, setBotTargetUser] = useState(users[0]?.username || '');
  const [botFollowersCount, setBotFollowersCount] = useState<number>(1000);

  // Auto like state
  const [autoLikePostId, setAutoLikePostId] = useState(posts[0]?.id || '');
  const [autoLikeCount, setAutoLikeCount] = useState<number>(500);

  // Auto comment state
  const [autoCommentPostId, setAutoCommentPostId] = useState(posts[0]?.id || '');
  const [autoCommentCount, setAutoCommentCount] = useState<number>(10);
  const [autoCommentCustomText, setAutoCommentCustomText] = useState('');

  // Admin User Edit Override Modal state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserFullName, setEditUserFullName] = useState('');
  const [editUserUsername, setEditUserUsername] = useState('');
  const [editUserBio, setEditUserBio] = useState('');
  const [editUserChangeCount, setEditUserChangeCount] = useState<number>(0);
  const [editUserIsVip, setEditUserIsVip] = useState(false);
  const [editUserIsVerified, setEditUserIsVerified] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  // Metrics
  const totalUsers = users.length;
  const totalPosts = posts.length;
  const flaggedPosts = posts.filter((p) => p.isFlagged);
  const totalLikes = posts.reduce((acc, p) => acc + p.likes.length, 0);
  const pendingVerifications = verificationRequests.filter((v) => v.status === 'pending');

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(userFilter.toLowerCase()) ||
      u.username.toLowerCase().includes(userFilter.toLowerCase()) ||
      u.email.toLowerCase().includes(userFilter.toLowerCase())
  );

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMsg.trim()) {
      showToast(lang === 'bn' ? 'শিরোনাম ও মেসেজ লিখুন' : 'Enter title and message');
      return;
    }
    adminBroadcastNotification(broadcastTitle.trim(), broadcastMsg.trim());
    setBroadcastTitle('');
    setBroadcastMsg('');
  };

  const handleSendBots = (e: React.FormEvent) => {
    e.preventDefault();
    if (!botTargetUser) {
      showToast(lang === 'bn' ? 'টার্গেট ইউজার নির্বাচন করুন' : 'Select target user');
      return;
    }
    const res = adminSendBotFollowers(botTargetUser, botFollowersCount);
    showToast(res.message);
  };

  const handleSendAutoLikes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!autoLikePostId) {
      showToast(lang === 'bn' ? 'পোস্ট নির্বাচন করুন' : 'Select target post');
      return;
    }
    const res = adminSendAutoLikes(autoLikePostId, autoLikeCount);
    showToast(res.message);
  };

  const handleSendAutoComments = (e: React.FormEvent) => {
    e.preventDefault();
    if (!autoCommentPostId) {
      showToast(lang === 'bn' ? 'পোস্ট নির্বাচন করুন' : 'Select target post');
      return;
    }
    const res = adminSendAutoComments(
      autoCommentPostId,
      autoCommentCount,
      autoCommentCustomText.trim() || undefined
    );
    showToast(res.message);
    setAutoCommentCustomText('');
  };

  const handleOpenEditUser = (u: User) => {
    setEditingUser(u);
    setEditUserFullName(u.fullName);
    setEditUserUsername(u.username);
    setEditUserBio(u.bio);
    setEditUserChangeCount(u.usernameChangeCount || 0);
    setEditUserIsVip(!!u.isVip);
    setEditUserIsVerified(!!u.isVerified);
  };

  const handleSaveUserOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    adminUpdateAnyUser(editingUser.id, {
      fullName: editUserFullName.trim(),
      username: editUserUsername.trim().toLowerCase().replace(/\s+/g, '_'),
      bio: editUserBio.trim(),
      usernameChangeCount: Number(editUserChangeCount) || 0,
      isVip: editUserIsVip,
      isVerified: editUserIsVerified,
    });
    showToast(lang === 'bn' ? 'ইউজারের তথ্য সফলভাবে আপডেট হয়েছে!' : 'User updated successfully!');
    setEditingUser(null);
  };

  return (
    <div id="admin-panel-container" className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Admin Header */}
      <div className="p-6 rounded-3xl bg-neutral-900 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-neutral-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>1 social • Full Firebase &amp; Admin Suite</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {lang === 'bn' ? 'ফায়ারবেস ও সিস্টেম অ্যাডমিন কন্ট্রোল' : 'Firebase & System Admin Console'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            {lang === 'bn'
              ? '১ মিলিয়ন বট পুল, অটো-লাইক, অটো-কমেন্ট, ভেরিফিকেশন ও ভিআইপি আবেদন অনুমোদন এবং সম্পূর্ণ ডাটাবেজ কন্ট্রোল।'
              : 'Manage 1M Bot Pool, auto-likes, auto-comments, VIP & verification requests, and complete database.'}
          </p>
        </div>

        {/* Quick Admin Role Self-Toggle */}
        <div className="bg-neutral-800/80 p-3 rounded-2xl border border-neutral-700/60 text-xs shrink-0">
          <p className="text-[11px] text-neutral-400 mb-1">
            {lang === 'bn' ? 'বর্তমান প্রিভিউ রোল:' : 'Current Role:'}
          </p>
          <div className="flex items-center gap-1.5">
            <span
              className={`px-2.5 py-1 rounded-lg font-bold uppercase text-[10px] ${
                isAdmin ? 'bg-amber-600 text-white' : 'bg-neutral-700 text-neutral-300'
              }`}
            >
              {currentUser?.role || 'user'}
            </span>
            {!isAdmin && (
              <button
                onClick={() => {
                  if (currentUser) adminChangeRole(currentUser.id, 'admin');
                }}
                className="text-[11px] text-amber-400 font-semibold hover:underline"
              >
                {lang === 'bn' ? 'এডমিন করুন' : 'Make Admin'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">{lang === 'bn' ? 'মোট ব্যবহারকারী' : 'Total Users'}</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-neutral-100">{totalUsers}</p>
          <span className="text-[10px] text-emerald-500 font-medium">Firestore Synced</span>
        </div>

        <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">{lang === 'bn' ? 'বট পুল সাইজ' : 'Bot Engine Pool'}</span>
            <Bot className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {(botPoolTotal - botPoolSent).toLocaleString()}
          </p>
          <span className="text-[10px] text-neutral-400">1 Million Capacity</span>
        </div>

        <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">{lang === 'bn' ? 'ভেরিফাই আবেদন' : 'VIP/Verify Queue'}</span>
            <Crown className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {pendingVerifications.length}
          </p>
          <span className="text-[10px] text-amber-500 font-medium">Awaiting Review</span>
        </div>

        <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">{lang === 'bn' ? 'মোট লাইক ও রিঅ্যাকশন' : 'Engagements'}</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-neutral-100">{totalLikes}</p>
          <span className="text-[10px] text-emerald-500 font-medium">Auto & Real-time</span>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('firebase')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeSubTab === 'firebase'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Flame className="w-3.5 h-3.5 fill-current" />
          <span>{lang === 'bn' ? 'ফায়ারবেস কনসোল' : 'Firebase Cloud'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeSubTab === 'users'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? `ইউজার ব্যবস্থাপনা (${totalUsers})` : `Users & Edit (${totalUsers})`}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('verification')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeSubTab === 'verification'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Crown className="w-3.5 h-3.5 text-amber-500" />
          <span>{lang === 'bn' ? `Verify / VIP আবেদন (${pendingVerifications.length})` : `Verify/VIP Requests (${pendingVerifications.length})`}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('automation')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeSubTab === 'automation'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-purple-500" />
          <span>{lang === 'bn' ? 'বট ও অটো-এনগেজমেন্ট' : 'Bots & Auto Likes'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('moderation')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeSubTab === 'moderation'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>{lang === 'bn' ? `কন্টেন্ট মডারেশন (${flaggedPosts.length})` : `Moderation (${flaggedPosts.length})`}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('broadcast')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeSubTab === 'broadcast'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'পুশ ব্রডকাস্ট বার্তা' : 'Broadcast Alert'}</span>
        </button>
      </div>

      {/* Tab 0: Integrated Firebase Console */}
      {activeSubTab === 'firebase' && <FirebaseConsole />}

      {/* Tab 1: User Management Table with Admin Profile Override */}
      {activeSubTab === 'users' && (
        <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                placeholder={lang === 'bn' ? 'ব্যবহারকারী বা ইমেইল খুঁজুন...' : 'Search user or email...'}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none"
              />
            </div>
            <span className="text-xs text-neutral-400">
              {filteredUsers.length} {lang === 'bn' ? 'জন ইউজার' : 'users'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 font-semibold border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Badges</th>
                  <th className="p-3.5">Username Limit</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatar}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
                            {u.fullName}
                            {u.isVip && <Crown className="w-3 h-3 text-amber-500" />}
                            {u.isVerified && <CheckCircle className="w-3 h-3 text-sky-500" />}
                          </p>
                          <p className="text-[11px] text-neutral-400">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-neutral-600 dark:text-neutral-300 font-mono text-[11px]">
                      {u.email}
                    </td>
                    <td className="p-3.5">
                      <select
                        value={u.role}
                        onChange={(e) => adminChangeRole(u.id, e.target.value as UserRole)}
                        className="text-[11px] font-semibold bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-1 text-neutral-800 dark:text-neutral-200"
                      >
                        <option value="user">USER</option>
                        <option value="moderator">MODERATOR</option>
                        <option value="admin">ADMIN</option>
                      </select>
                    </td>
                    <td className="p-3.5 space-x-1">
                      {u.isVip && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-600">
                          VIP
                        </span>
                      )}
                      {u.isVerified && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-600">
                          Verified
                        </span>
                      )}
                      {!u.isVip && !u.isVerified && (
                        <span className="text-[11px] text-neutral-400">Regular</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                        {u.usernameChangeCount || 0} / 10
                      </span>
                    </td>
                    <td className="p-3.5">
                      {u.isBanned ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                          Banned
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      {/* Admin Override Edit Button */}
                      <button
                        onClick={() => handleOpenEditUser(u)}
                        className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                        title="Admin Override Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5 inline" />
                      </button>

                      <button
                        onClick={() => adminBanUser(u.id, !u.isBanned)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                          u.isBanned
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-neutral-700 dark:text-neutral-300 hover:text-rose-600'
                        }`}
                        title={u.isBanned ? 'Unban User' : 'Ban User'}
                      >
                        {u.isBanned ? 'Unban' : 'Ban'}
                      </button>

                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete ${u.fullName} permanently?`)) {
                              adminDeleteUser(u.id);
                            }
                          }}
                          className="p-1 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Verification & VIP Requests Review */}
      {activeSubTab === 'verification' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                {lang === 'bn' ? 'ভেরিফিকেশন ও ভিআইপি আবেদন পর্যালোচনা' : 'Verification & VIP Applications'}
              </h3>
              <p className="text-xs text-neutral-400">
                {lang === 'bn'
                  ? 'ইউজারদের পাঠানো ব্লু টিক ও গোল্ড ভিআইপি ব্যাজ আবেদন এক ক্লিকে অনুমোদন বা বাতিল করুন।'
                  : 'Review creator submissions, proof of identity, and grant official Blue or VIP badges.'}
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600 border border-amber-200">
              {pendingVerifications.length} {lang === 'bn' ? 'অপেক্ষমান' : 'Pending'}
            </span>
          </div>

          {verificationRequests.length === 0 ? (
            <div className="text-center py-12 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-400">
              <CheckCircle className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                {lang === 'bn' ? 'কোনো নতুন আবেদন নেই!' : 'No verification requests submitted yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {verificationRequests.map((req) => {
                const reqUser = users.find((u) => u.id === req.userId);
                return (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={reqUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                              {reqUser?.fullName || 'User'}
                            </h4>
                            <span className="text-[11px] text-neutral-400">@{req.username}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                req.type === 'VIP'
                                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-700'
                                  : 'bg-sky-100 dark:bg-sky-950 text-sky-700'
                              }`}
                            >
                              {req.type === 'VIP' ? '👑 VIP Request' : '🔵 Blue Verify'}
                            </span>
                          </div>
                          <span className="text-[10px] text-neutral-400">
                            Submitted: {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Status and Action Buttons */}
                      <div className="flex items-center gap-2">
                        {req.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => {
                                adminApproveVerification(req.id);
                                showToast(lang === 'bn' ? 'আবেদন অনুমোদন করা হয়েছে!' : 'Application Approved!');
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{lang === 'bn' ? 'অনুমোদন (Approve)' : 'Approve'}</span>
                            </button>
                            <button
                              onClick={() => {
                                adminRejectVerification(req.id);
                                showToast(lang === 'bn' ? 'আবেদন বাতিল করা হয়েছে।' : 'Application Rejected.');
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 text-xs font-bold hover:bg-rose-100"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>{lang === 'bn' ? 'বাতিল (Reject)' : 'Reject'}</span>
                            </button>
                          </>
                        ) : (
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              req.status === 'approved'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-600'
                            }`}
                          >
                            {req.status.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 text-xs text-neutral-800 dark:text-neutral-200 border border-neutral-100 dark:border-neutral-800">
                      <p className="font-semibold text-[11px] text-neutral-400 mb-1">Reason / Statement:</p>
                      <p>{req.reason}</p>
                      {req.socialLink && (
                        <p className="mt-2 text-[11px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          <a href={req.socialLink} target="_blank" rel="noreferrer" className="hover:underline">
                            {req.socialLink}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Bot Engine & Auto-Engagement Automation */}
      {activeSubTab === 'automation' && (
        <div className="space-y-6">
          {/* Bot Pool Summary Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-900 to-indigo-900 text-white shadow-md border border-purple-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2">
                <Bot className="w-3.5 h-3.5" />
                <span>1 Million Bot Engine • Default Link: https://techlystb.blogspot.com</span>
              </div>
              <h3 className="text-xl font-black">
                {lang === 'bn' ? 'অটোমেশন ও বট গ্রোথ কন্ট্রোল সেন্টার' : 'Bot & Auto-Engagement Control'}
              </h3>
              <p className="text-xs text-purple-200 mt-1 max-w-xl">
                {lang === 'bn'
                  ? 'বট পুল থেকে যেকোনো ইউজারের একাউন্টে নির্দিষ্ট পরিমাণ অনুসারী পাঠান অথবা যেকোনো পোস্টে লাইক ও কমেন্ট ইনজেক্ট করুন।'
                  : 'Inject real bot followers into any profile or boost posts with auto-likes and realistic comments.'}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 text-center shrink-0">
              <span className="text-[10px] text-purple-200 uppercase font-bold tracking-wider block">Available Bots</span>
              <span className="text-2xl font-black text-white">{(botPoolTotal - botPoolSent).toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Tool 1: Bot Followers Sender */}
            <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                    {lang === 'bn' ? 'বট ফলোয়ার পাঠান' : 'Send Bot Followers'}
                  </h4>
                  <p className="text-[10px] text-neutral-400">Target profile follower injection</p>
                </div>
              </div>

              <form onSubmit={handleSendBots} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    {lang === 'bn' ? 'টার্গেট ইউজার:' : 'Target User:'}
                  </label>
                  <select
                    value={botTargetUser}
                    onChange={(e) => setBotTargetUser(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.username}>
                        {u.fullName} (@{u.username})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    {lang === 'bn' ? 'বট সংখ্যা:' : 'Bot Count:'}
                  </label>
                  <select
                    value={botFollowersCount}
                    onChange={(e) => setBotFollowersCount(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  >
                    <option value={100}>100 Followers</option>
                    <option value={500}>500 Followers</option>
                    <option value={1000}>1,000 Followers</option>
                    <option value={5000}>5,000 Followers</option>
                    <option value={10000}>10,000 Followers</option>
                    <option value={50000}>50,000 Followers</option>
                    <option value={100000}>100,000 Followers</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'বট ফলোয়ার সেন্ড করুন' : 'Inject Bot Followers'}</span>
                </button>
              </form>
            </div>

            {/* Tool 2: Auto Likes Sender */}
            <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                    {lang === 'bn' ? 'অটো-লাইক ইনজেক্ট' : 'Auto Likes Boost'}
                  </h4>
                  <p className="text-[10px] text-neutral-400">Inject instant likes to post</p>
                </div>
              </div>

              <form onSubmit={handleSendAutoLikes} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    {lang === 'bn' ? 'টার্গেট পোস্ট:' : 'Target Post:'}
                  </label>
                  <select
                    value={autoLikePostId}
                    onChange={(e) => setAutoLikePostId(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  >
                    {posts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.authorName}: "{p.content.slice(0, 25)}..."
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    {lang === 'bn' ? 'লাইক সংখ্যা:' : 'Likes Quantity:'}
                  </label>
                  <select
                    value={autoLikeCount}
                    onChange={(e) => setAutoLikeCount(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  >
                    <option value={50}>50 Likes</option>
                    <option value={100}>100 Likes</option>
                    <option value={500}>500 Likes</option>
                    <option value={1000}>1,000 Likes</option>
                    <option value={2500}>2,500 Likes</option>
                    <option value={10000}>10,000 Likes</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>{lang === 'bn' ? 'অটো লাইক সেন্ড করুন' : 'Inject Auto Likes'}</span>
                </button>
              </form>
            </div>

            {/* Tool 3: Auto Comments Generator */}
            <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                    {lang === 'bn' ? 'অটো-কমেন্ট জেনারেটর' : 'Auto Comments Generator'}
                  </h4>
                  <p className="text-[10px] text-neutral-400">Generate realistic engagement</p>
                </div>
              </div>

              <form onSubmit={handleSendAutoComments} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    {lang === 'bn' ? 'টার্গেট পোস্ট:' : 'Target Post:'}
                  </label>
                  <select
                    value={autoCommentPostId}
                    onChange={(e) => setAutoCommentPostId(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  >
                    {posts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.authorName}: "{p.content.slice(0, 25)}..."
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    {lang === 'bn' ? 'কমেন্ট সংখ্যা:' : 'Comments Quantity:'}
                  </label>
                  <select
                    value={autoCommentCount}
                    onChange={(e) => setAutoCommentCount(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  >
                    <option value={5}>5 Comments</option>
                    <option value={10}>10 Comments</option>
                    <option value={25}>25 Comments</option>
                    <option value={50}>50 Comments</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    {lang === 'bn' ? 'কাস্টম কমেন্ট (ঐচ্ছিক):' : 'Custom Comment Text (Optional):'}
                  </label>
                  <input
                    type="text"
                    value={autoCommentCustomText}
                    onChange={(e) => setAutoCommentCustomText(e.target.value)}
                    placeholder="e.g. অসাধারণ পোস্ট! 🔥"
                    className="w-full text-xs p-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'অটো কমেন্ট তৈরি করুন' : 'Generate Comments'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Content Moderation Queue */}
      {activeSubTab === 'moderation' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
              {lang === 'bn' ? 'রিপোর্টকৃত পোস্টসমূহ' : 'Flagged Content Review'}
            </h3>
            <span className="text-xs text-neutral-400">
              {flaggedPosts.length} {lang === 'bn' ? 'টি পোস্ট পর্যালোচনার অপেক্ষায়' : 'items pending'}
            </span>
          </div>

          {flaggedPosts.length === 0 ? (
            <div className="text-center py-12 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-400">
              <CheckCircle className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                {lang === 'bn' ? 'কোনো রিপোর্টকৃত পোস্ট নেই!' : 'All clear! No flagged content.'}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                {lang === 'bn' ? 'সকল পোস্ট কমিউনিটি গাইডলাইন মেনে চলছে।' : 'The community feed is healthy and clean.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {flaggedPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 rounded-2xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/30 dark:bg-amber-950/20 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={post.authorAvatar}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                          {post.authorName} (@{post.authorUsername})
                        </p>
                        <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                          Reason: {post.flagReason || 'Violating content reported by user'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => restorePost(post.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'অনুমোদন দিন' : 'Approve & Dismiss'}</span>
                      </button>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'পোস্ট ডিলিট করুন' : 'Remove Post'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-neutral-900 p-3 rounded-xl text-xs text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800">
                    <p>{post.content}</p>
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt=""
                        className="w-32 h-24 object-cover rounded-lg mt-2"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: System Broadcast Push Notification */}
      {activeSubTab === 'broadcast' && (
        <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm max-w-xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                {lang === 'bn' ? 'সিস্টেম ওয়াইড পুশ নোটিফিকেশন' : 'System Broadcast Announcement'}
              </h3>
              <p className="text-xs text-neutral-400">
                {lang === 'bn'
                  ? 'এই মেসেজটি প্ল্যাটফর্মের সকল ব্যবহারকারীর নোটিফিকেশনে যাবে।'
                  : 'Sends real-time push and in-app alerts to all registered users.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                {lang === 'bn' ? 'ঘোষণার শিরোনাম:' : 'Announcement Title:'}
              </label>
              <input
                type="text"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. 1 social Platform Update Live!"
                className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                {lang === 'bn' ? 'বার্তার বিবরণ:' : 'Message Body:'}
              </label>
              <textarea
                rows={4}
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                placeholder="Write your announcement details..."
                className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{lang === 'bn' ? 'সবার কাছে ব্রডকাস্ট করুন' : 'Broadcast to All Users'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Admin User Profile Override Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                <span>Admin Override: {editingUser.fullName}</span>
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUserOverride} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Full Name:
                </label>
                <input
                  type="text"
                  value={editUserFullName}
                  onChange={(e) => setEditUserFullName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Username:
                </label>
                <input
                  type="text"
                  value={editUserUsername}
                  onChange={(e) => setEditUserUsername(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Username Change Count (0-10):
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={editUserChangeCount}
                  onChange={(e) => setEditUserChangeCount(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
                <span className="text-[10px] text-neutral-400">Admin can reset count to 0 so user can change again</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Bio:
                </label>
                <textarea
                  rows={2}
                  value={editUserBio}
                  onChange={(e) => setEditUserBio(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 resize-none"
                />
              </div>

              {/* VIP & Verified Direct Toggles */}
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editUserIsVip}
                    onChange={(e) => setEditUserIsVip(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>👑 VIP Status</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editUserIsVerified}
                    onChange={(e) => setEditUserIsVerified(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span>🔵 Verified Badge</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                  Save Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

