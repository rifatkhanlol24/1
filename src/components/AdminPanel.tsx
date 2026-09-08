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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
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
    restorePost,
    deletePost,
    lang,
    showToast,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'firebase' | 'users' | 'moderation' | 'broadcast'>('firebase');
  const [userFilter, setUserFilter] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  // Metrics
  const totalUsers = users.length;
  const totalPosts = posts.length;
  const flaggedPosts = posts.filter((p) => p.isFlagged);
  const totalLikes = posts.reduce((acc, p) => acc + p.likes.length, 0);

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

  return (
    <div id="admin-panel-container" className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Admin Header */}
      <div className="p-6 rounded-3xl bg-neutral-900 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-neutral-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>1 social • Firebase &amp; Admin Control</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {lang === 'bn' ? 'ফায়ারবেস ও সিস্টেম অ্যাডমিন কন্ট্রোল' : 'Firebase & System Admin Console'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            {lang === 'bn'
              ? 'ফায়ারবেস ক্লাউড ফায়ারস্টোর ডাটাবেজ, ব্যবহারকারী পরিচালনা, কন্টেন্ট মডারেশন এবং সিস্টেম নোটিফিকেশন নিয়ন্ত্রণ করুন।'
              : 'Manage Cloud Firestore database, user accounts, content moderation, and live system broadcasts.'}
          </p>
        </div>

        {/* Quick Admin Role Self-Toggle for preview ease */}
        <div className="bg-neutral-800/80 p-3 rounded-2xl border border-neutral-700/60 text-xs shrink-0">
          <p className="text-[11px] text-neutral-400 mb-1">
            {lang === 'bn' ? 'বর্তমান প্রিভিউ রোল:' : 'Current Role:'}
          </p>
          <div className="flex items-center gap-1.5">
            <span
              className={`px-2.5 py-1 rounded-lg font-bold uppercase text-[10px] ${
                isAdmin
                  ? 'bg-amber-600 text-white'
                  : 'bg-neutral-700 text-neutral-300'
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
            <span className="text-xs font-medium">{lang === 'bn' ? 'মোট পোস্ট' : 'Total Posts'}</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-neutral-100">{totalPosts}</p>
          <span className="text-[10px] text-blue-500 font-medium">Real-time Feed</span>
        </div>

        <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">{lang === 'bn' ? 'রিপোর্টকৃত কন্টেন্ট' : 'Flagged Reports'}</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-neutral-100">{flaggedPosts.length}</p>
          <span className="text-[10px] text-amber-500 font-medium">Requires Review</span>
        </div>

        <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">{lang === 'bn' ? 'মোট এনগেজমেন্ট' : 'Engagements'}</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-neutral-100">{totalLikes}</p>
          <span className="text-[10px] text-emerald-500 font-medium">Likes & Reactions</span>
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
          <span>{lang === 'bn' ? 'ফায়ারবেস ক্লাউড কনসোল' : 'Firebase Cloud Console'}</span>
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
          <span>{lang === 'bn' ? `ব্যবহারকারী তালিকা (${totalUsers})` : `Users List (${totalUsers})`}</span>
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
          <span>{lang === 'bn' ? `কন্টেন্ট মডারেশন (${flaggedPosts.length})` : `Moderation Queue (${flaggedPosts.length})`}</span>
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

      {/* Tab 1: User Management Table */}
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
              {filteredUsers.length} {lang === 'bn' ? 'জন ইউজার পাওয়া গেছে' : 'users found'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 font-semibold border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Verification</th>
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
                          <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {u.fullName}
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
                    <td className="p-3.5">
                      <button
                        onClick={() => {
                          const updated = users.map((item) =>
                            item.id === u.id ? { ...item, isVerified: !item.isVerified } : item
                          );
                          localStorage.setItem('vc_users', JSON.stringify(updated));
                          window.location.reload();
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isVerified
                            ? 'bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                        }`}
                      >
                        <CheckCircle className="w-3 h-3" />
                        {u.isVerified ? 'Verified' : 'Unverified'}
                      </button>
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

      {/* Tab 2: Content Moderation Queue */}
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

      {/* Tab 3: System Broadcast Push Notification */}
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
    </div>
  );
};
