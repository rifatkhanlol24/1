import React, { useState, useEffect } from 'react';
import {
  Database,
  Flame,
  ExternalLink,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  CheckCircle,
  AlertCircle,
  Users,
  FileText,
  MessageSquare,
  Bell,
  Shield,
  Trash2,
  Send,
  Copy,
  Check,
  Search,
  Key,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { firebaseConfig } from '../lib/firebase';
import { firebaseService } from '../lib/firebaseService';
import { UserRole } from '../types';

export const FirebaseConsole: React.FC = () => {
  const {
    currentUser,
    users,
    posts,
    messages,
    notifications,
    adminBanUser,
    adminChangeRole,
    adminDeleteUser,
    adminBroadcastNotification,
    deletePost,
    restorePost,
    lang,
    showToast,
  } = useApp();

  const [activeCollection, setActiveCollection] = useState<'users' | 'posts' | 'messages' | 'notifications'>('users');
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [statusDetails, setStatusDetails] = useState<string>('Verifying Cloud Firestore connection...');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [copiedConfig, setCopiedConfig] = useState<boolean>(false);

  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  // Check connection on mount
  useEffect(() => {
    let isMounted = true;
    firebaseService.checkConnection().then((res) => {
      if (!isMounted) return;
      if (res.success) {
        setConnectionStatus('connected');
        setStatusDetails('Successfully linked to Google Cloud Firestore (social-media1bd)');
      } else {
        setConnectionStatus('error');
        setStatusDetails(res.message);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSyncToFirestore = async () => {
    setIsSyncing(true);
    try {
      const result = await firebaseService.seedInitialData(users, posts);
      showToast(
        lang === 'bn'
          ? `ফায়ারস্টোরে সিঙ্ক সম্পন্ন! ${result.usersCount} ইউজার এবং ${result.postsCount} পোস্ট আপলোড হয়েছে।`
          : `Synced to Firestore! ${result.usersCount} users and ${result.postsCount} posts pushed.`
      );
      setConnectionStatus('connected');
      setStatusDetails('Synced with live Cloud Firestore collection');
    } catch (err) {
      showToast(lang === 'bn' ? 'সিঙ্ক করতে সমস্যা হয়েছে।' : 'Failed to sync with Firestore.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(JSON.stringify(firebaseConfig, null, 2));
    setCopiedConfig(true);
    showToast(lang === 'bn' ? 'ফায়ারবেস কনফিগারেশন কপি করা হয়েছে!' : 'Firebase config copied to clipboard!');
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;
    adminBroadcastNotification(broadcastTitle.trim(), broadcastMessage.trim());
    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      u.email.toLowerCase().includes(searchFilter.toLowerCase()) ||
      u.username.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredPosts = posts.filter(
    (p) =>
      p.content.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.authorName.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div id="firebase-console-container" className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Firebase Header & Live Health Status */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 text-white shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Flame className="w-6 h-6 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  Firebase Console &amp; Live Control
                </h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  social-media1bd
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {lang === 'bn'
                  ? '1 social অ্যাপ্লিকেশনের ক্লাউড ফায়ারস্টোর ও এডমিন ম্যানেজমেন্ট হাব'
                  : 'Cloud Firestore & Administrative Management Hub for 1 social'}
              </p>
            </div>
          </div>

          {/* Quick External Links to Google Firebase Console */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://console.firebase.google.com/project/social-media1bd/overview"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 border border-neutral-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>Google Firebase Console</span>
            </a>

            <a
              href="https://console.firebase.google.com/project/social-media1bd/firestore"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 border border-neutral-700 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Firestore Database</span>
            </a>

            <button
              onClick={handleSyncToFirestore}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-xs font-bold text-white shadow-md shadow-amber-600/20 transition-all disabled:opacity-50"
            >
              <UploadCloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce' : ''}`} />
              <span>{isSyncing ? (lang === 'bn' ? 'সিঙ্ক হচ্ছে...' : 'Syncing...') : (lang === 'bn' ? 'ফায়ারস্টোরে পুশ করুন' : 'Push to Firestore')}</span>
            </button>
          </div>
        </div>

        {/* Live Diagnostics Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs relative z-10">
          <div className="p-3 rounded-2xl bg-neutral-800/80 border border-neutral-700/60">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span>Database Connection</span>
              <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            </div>
            <p className="font-semibold text-neutral-100 flex items-center gap-1.5">
              {connectionStatus === 'connected' ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
              )}
              <span className="truncate">{statusDetails}</span>
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-800/80 border border-neutral-700/60">
            <span className="text-neutral-400 block mb-1">Database ID</span>
            <p className="font-mono font-semibold text-emerald-400 truncate">
              {firebaseConfig.firestoreDatabaseId || '(default)'}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-between">
            <div>
              <span className="text-neutral-400 block mb-1">Auth Domain</span>
              <p className="font-mono text-neutral-200 truncate">{firebaseConfig.authDomain}</p>
            </div>
            <button
              onClick={handleCopyConfig}
              className="p-1.5 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-neutral-300"
              title="Copy Firebase Config"
            >
              {copiedConfig ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Background glow decoration */}
        <div className="absolute -right-16 -top-16 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Collection Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'users' as const, label: `Users (${users.length})`, icon: Users },
            { id: 'posts' as const, label: `Posts (${posts.length})`, icon: FileText },
            { id: 'messages' as const, label: `Messages (${messages.length})`, icon: MessageSquare },
            { id: 'notifications' as const, label: `Notifications (${notifications.length})`, icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCollection(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeCollection === tab.id
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-48 sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search records..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100"
          />
        </div>
      </div>

      {/* Collection: Users Management */}
      {activeCollection === 'users' && (
        <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <h3 className="font-bold text-xs text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-500" />
              <span>Cloud Firestore Collection: <code>users</code></span>
            </h3>
            <span className="text-[11px] text-neutral-400">{filteredUsers.length} documents</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 font-semibold border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="p-3.5">User Profile</th>
                  <th className="p-3.5">Email Address</th>
                  <th className="p-3.5">Firestore Role</th>
                  <th className="p-3.5">Verified</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/30">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="font-bold text-neutral-900 dark:text-neutral-100">{u.fullName}</p>
                          <p className="text-[11px] text-neutral-400">@{u.username} • UID: {u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-neutral-600 dark:text-neutral-300">{u.email}</td>
                    <td className="p-3.5">
                      <select
                        value={u.role === 'admin' ? 'user' : u.role}
                        onChange={(e) => adminChangeRole(u.id, e.target.value as UserRole)}
                        className="text-[11px] font-semibold bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-1 text-neutral-900 dark:text-neutral-100"
                      >
                        <option value="user">USER</option>
                        <option value="moderator">MODERATOR</option>
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
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isVerified
                            ? 'bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border border-sky-300 dark:border-sky-800'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        <CheckCircle className="w-3 h-3" />
                        {u.isVerified ? 'Verified' : 'Unverified'}
                      </button>
                    </td>
                    <td className="p-3.5">
                      {u.isBanned ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-600">
                          Banned
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      <button
                        onClick={() => adminBanUser(u.id, !u.isBanned)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                          u.isBanned
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-rose-100 text-neutral-700 dark:text-neutral-300 hover:text-rose-600'
                        }`}
                      >
                        {u.isBanned ? 'Unban' : 'Ban'}
                      </button>

                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => {
                            if (confirm(`Permanently delete user ${u.fullName}?`)) {
                              adminDeleteUser(u.id);
                            }
                          }}
                          className="p-1 text-neutral-400 hover:text-rose-600 rounded-lg"
                          title="Delete user"
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

      {/* Collection: Posts & Moderation */}
      {activeCollection === 'posts' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm flex items-center justify-between">
            <h3 className="font-bold text-xs text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>Cloud Firestore Collection: <code>posts</code></span>
            </h3>
            <span className="text-[11px] text-neutral-400">{filteredPosts.length} posts total</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredPosts.map((p) => (
              <div
                key={p.id}
                className={`p-4 rounded-2xl border bg-white dark:bg-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  p.isFlagged
                    ? 'border-amber-400 dark:border-amber-700 bg-amber-50/20'
                    : 'border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  {p.imageUrl && (
                    <img src={p.imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-xs text-neutral-900 dark:text-neutral-100">{p.authorName}</p>
                      <span className="text-[10px] text-neutral-400 font-mono">ID: {p.id}</span>
                      {p.isFlagged && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
                          Flagged: {p.flagReason}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-1 line-clamp-2">{p.content}</p>
                    <p className="text-[10px] text-neutral-400 mt-1">
                      Likes: {p.likes.length} • Comments: {p.comments.length} • Shares: {p.sharesCount}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {p.isFlagged && (
                    <button
                      onClick={() => restorePost(p.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                    >
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm('Delete this post from Firestore?')) {
                        deletePost(p.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-rose-100 hover:text-rose-600 text-neutral-500 transition-colors"
                    title="Delete post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collection: Messages */}
      {activeCollection === 'messages' && (
        <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm space-y-3">
          <h3 className="font-bold text-xs text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-amber-500" />
            <span>Cloud Firestore Collection: <code>messages</code> ({messages.length} messages)</span>
          </h3>
          <div className="space-y-2">
            {messages.slice(-10).map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-mono text-[10px] text-neutral-400 block">From {m.senderId} → To {m.receiverId}</span>
                  <p className="text-neutral-800 dark:text-neutral-200 mt-0.5">{m.text}</p>
                </div>
                <time className="text-[10px] text-neutral-400">
                  {new Date(m.createdAt).toLocaleTimeString()}
                </time>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collection: Notifications & System Broadcast */}
      {activeCollection === 'notifications' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-xs text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-amber-500" />
              <span>Recent Activity Notifications ({notifications.length})</span>
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notifications.slice(0, 15).map((n) => (
                <div
                  key={n.id}
                  className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 text-xs"
                >
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">{n.actorName} {n.text}</p>
                  <span className="text-[10px] text-neutral-400 font-mono">User: {n.userId}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Broadcast Form */}
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-xs text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
              <Send className="w-4 h-4 text-indigo-500" />
              <span>Send Admin Push Notification</span>
            </h3>

            <form onSubmit={handleSendBroadcast} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Title:
                </label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. 1 social System Announcement"
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Message:
                </label>
                <textarea
                  rows={3}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Type message to broadcast to all users..."
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Broadcast to All Users</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
