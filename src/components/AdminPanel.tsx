import React, { useState, useEffect } from 'react';
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
  ShieldAlert,
  Flame,
  Database,
  Crown,
  UserPlus,
  Heart,
  MessageSquare,
  Sparkles,
  Edit3,
  X,
  Clock,
  UserCheck,
  Link2,
  Copy,
  Lock,
  LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole, User, Post } from '../types';
import { FirebaseConsole } from './FirebaseConsole';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { app } from '../lib/firebase';

export const AdminPanel: React.FC = () => {
  const {
    currentUser,
    users,
    posts,
    totalCommunityUsers,
    realtimeActiveUsers,
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
    setActiveTab,
    setIsAuthModalOpen,
    lang,
    showToast,
  } = useApp();

  const [isAdminVerified, setIsAdminVerified] = useState<boolean | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<
    'firebase' | 'users' | 'verification' | 'automation' | 'moderation' | 'broadcast'
  >('firebase');
  const [userFilter, setUserFilter] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [botSearchInput, setBotSearchInput] = useState(users[0]?.username || '');
  const [botFollowersCount, setBotFollowersCount] = useState<number>(1000);
  const [autoLikeSearchInput, setAutoLikeSearchInput] = useState(posts[0]?.id || '');
  const [autoLikeCount, setAutoLikeCount] = useState<number>(500);
  const [autoCommentSearchInput, setAutoCommentSearchInput] = useState(posts[0]?.id || '');
  const [autoCommentCount, setAutoCommentCount] = useState<number>(10);
  const [autoCommentCustomText, setAutoCommentCustomText] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserFullName, setEditUserFullName] = useState('');
  const [editUserUsername, setEditUserUsername] = useState('');
  const [editUserBio, setEditUserBio] = useState('');
  const [editUserChangeCount, setEditUserChangeCount] = useState<number>(0);
  const [editUserIsVip, setEditUserIsVip] = useState(false);
  const [editUserIsVerified, setEditUserIsVerified] = useState(false);

  useEffect(() => {
    const auth = getAuth(app);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Authoritative Single Admin check: UID must strictly match UI28ofvzB7cjNJvCG0DvYgbCu9J3
      if (user && user.uid === 'UI28ofvzB7cjNJvCG0DvYgbCu9J3') {
        setIsAdminVerified(true);
      } else {
        setIsAdminVerified(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAdminLogout = async () => {
    try {
      const auth = getAuth(app);
      await signOut(auth);
      showToast('Admin logged out securely.');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (isAdminVerified === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-neutral-500">
          {lang === 'bn'
            ? 'ফায়ারবেস অথেন্টিকেশন দিয়ে অ্যাডমিন যাচাই করা হচ্ছে...'
            : 'Verifying Admin Access via Firebase Auth...'}
        </p>
      </div>
    );
  }

  if (isAdminVerified === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <div className="w-full max-w-md p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-xl space-y-5 text-center">
          <div className="w-14 h-14 bg-rose-100 dark:bg-rose-950/40 rounded-2xl flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {lang === 'bn' ? 'অ্যাডমিন এক্সেস সংরক্ষিত' : 'Admin Access Restricted'}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {lang === 'bn'
                ? 'এই প্যানেলটি শুধুমাত্র অনুমোদিত মেইন অ্যাডমিন (UID: UI28ofvzB7cjNJvCG0DvYgbCu9J3) এর জন্য Firebase Authentication দ্বারা সুরক্ষিত।'
                : 'This panel is strictly restricted to the authorized Main Admin (UID: UI28ofvzB7cjNJvCG0DvYgbCu9J3) via Firebase Authentication.'}
            </p>
          </div>

          <div className="pt-2 space-y-2">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              {lang === 'bn' ? 'মেইন অ্যাডমিন অ্যাকাউন্টে লগইন করুন' : 'Sign In via Main Login'}
            </button>
            <button
              onClick={() => setActiveTab('feed')}
              className="w-full py-2 text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
            >
              {lang === 'bn' ? 'হোম ফিডে ফিরে যান' : 'Return to Feed'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Resolvers for Profile Link / Username Search (supports ShohelTaj, @shoheltaj, soheltajbhola, etc.)
  const resolveTargetUser = (input: string): User | null => {
    if (!input || !input.trim()) return null;
    let term = input.trim();
    // Support full links e.g. https://domain.com/?u=sarah or /?u=sarah
    if (term.includes('u=')) {
      const match = term.match(/[?&]u=([a-zA-Z0-9_.-]+)/);
      if (match) term = match[1];
    } else if (term.includes('/profile/')) {
      const parts = term.split('/profile/');
      if (parts[1]) term = parts[1].split(/[?#]/)[0];
    } else if (term.includes('/u/')) {
      const parts = term.split('/u/');
      if (parts[1]) term = parts[1].split(/[?#]/)[0];
    }

    const cleanTerm = term.toLowerCase().replace(/^@/, '').trim();
    if (!cleanTerm) return null;

    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/sh/g, 's');
    const termNorm = norm(cleanTerm);

    // 1. Direct username match
    let found = users.find((u) => u.username.toLowerCase() === cleanTerm);
    if (found) return found;

    // 2. Direct fullName match
    found = users.find((u) => u.fullName.toLowerCase() === cleanTerm);
    if (found) return found;

    // 3. Email match or email username part (e.g. soheltajbhola)
    found = users.find(
      (u) =>
        u.email.toLowerCase() === cleanTerm ||
        u.email.toLowerCase().split('@')[0] === cleanTerm
    );
    if (found) return found;

    // 4. Normalized phonetic & spaceless match (ShohelTaj <-> Sohel Taj <-> shoheltaj)
    found = users.find((u) => {
      const uUserNorm = norm(u.username);
      const uNameNorm = norm(u.fullName);
      const uEmailNorm = norm(u.email.split('@')[0]);

      return (
        uUserNorm === termNorm ||
        uNameNorm === termNorm ||
        uEmailNorm === termNorm ||
        uUserNorm.includes(termNorm) ||
        termNorm.includes(uUserNorm) ||
        uNameNorm.includes(termNorm) ||
        termNorm.includes(uNameNorm) ||
        uEmailNorm.includes(termNorm) ||
        termNorm.includes(uEmailNorm)
      );
    });
    if (found) return found;

    // 5. General substring match
    return (
      users.find(
        (u) =>
          u.username.toLowerCase().includes(cleanTerm) ||
          u.fullName.toLowerCase().includes(cleanTerm) ||
          u.id.toLowerCase() === cleanTerm
      ) || null
    );
  };

  // Resolvers for Post Link / Post ID Search
  const resolveTargetPost = (input: string): Post | null => {
    if (!input || !input.trim()) return null;
    let term = input.trim();
    // Support full links e.g. https://domain.com/?post=post-1 or /post/post-1
    if (term.includes('post=')) {
      const match = term.match(/[?&]post=([a-zA-Z0-9_.-]+)/);
      if (match) term = match[1];
    } else if (term.includes('/post/')) {
      const parts = term.split('/post/');
      if (parts[1]) term = parts[1].split(/[?#]/)[0];
    }
    term = term.trim().toLowerCase();
    return posts.find((p) => p.id.toLowerCase() === term) || null;
  };

  // Resolved targets for instant UI preview
  const previewedBotUser = resolveTargetUser(botSearchInput);
  const previewedLikePost = resolveTargetPost(autoLikeSearchInput);
  const previewedCommentPost = resolveTargetPost(autoCommentSearchInput);





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
    const target = previewedBotUser || resolveTargetUser(botSearchInput);
    if (!target) {
      showToast(lang === 'bn' ? 'টার্গেট প্রোফাইল পাওয়া যায়নি! সঠিক প্রোফাইল লিঙ্ক পেস্ট করুন বা ইউজারনেম দিন।' : 'Target user not found! Paste valid profile link or username.');
      return;
    }
    const res = adminSendBotFollowers(target.username, botFollowersCount);
    showToast(res.message);
  };

  const handleSendAutoLikes = (e: React.FormEvent) => {
    e.preventDefault();
    const target = previewedLikePost || resolveTargetPost(autoLikeSearchInput);
    if (!target) {
      showToast(lang === 'bn' ? 'টার্গেট পোস্ট পাওয়া যায়নি! সঠিক পোস্ট লিঙ্ক বা পোস্ট আইডি দিন।' : 'Target post not found! Paste valid post link or ID.');
      return;
    }
    const res = adminSendAutoLikes(target.id, autoLikeCount);
    showToast(res.message);
  };

  const handleSendAutoComments = (e: React.FormEvent) => {
    e.preventDefault();
    const target = previewedCommentPost || resolveTargetPost(autoCommentSearchInput);
    if (!target) {
      showToast(lang === 'bn' ? 'টার্গেট পোস্ট পাওয়া যায়নি! সঠিক পোস্ট লিঙ্ক বা পোস্ট আইডি দিন।' : 'Target post not found! Paste valid post link or ID.');
      return;
    }
    const res = adminSendAutoComments(
      target.id,
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
              ? '১ মিলিয়ন গ্লোবাল ইউজার পুল, অটো-লাইক, অটো-কমেন্ট, ভেরিফিকেশন ও ভিআইপি আবেদন অনুমোদন এবং সম্পূর্ণ ডাটাবেজ কন্ট্রোল।'
              : 'Manage 1M Community Users Pool, auto-likes, auto-comments, VIP & verification requests, and complete database.'}
          </p>
        </div>

        {/* Verified Admin Info Badge */}
        <div className="bg-neutral-800/90 p-3.5 rounded-2xl border border-neutral-700/80 text-xs shrink-0 shadow-sm space-y-2">
          <p className="text-[10px] uppercase font-bold text-neutral-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'bn' ? 'লগইনকৃত অ্যাডমিন:' : 'Active Administrator:'}</span>
            </span>
            <button
              onClick={handleAdminLogout}
              className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 font-bold ml-4 bg-red-500/10 hover:bg-red-500/20 px-2 py-0.5 rounded-md transition-colors"
            >
              <LogOut className="w-3 h-3" />
              Sign Out
            </button>
          </p>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md font-black uppercase text-[10px] bg-amber-500 text-neutral-950 shadow-xs">
              Admin
            </span>
            <span className="font-mono text-xs text-neutral-200">
              {currentUser?.email}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Cards: 1M Users & Real-time Active System */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Card 1: Total 1M Users */}
        <div className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 dark:from-neutral-900 dark:to-indigo-950/30 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">
              {lang === 'bn' ? 'টোটাল ইউজার (১ মিলিয়ন)' : 'Total 1M Users'}
            </span>
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
            {totalCommunityUsers.toLocaleString()}
          </p>
          <span className="text-[10px] text-indigo-500 font-semibold flex items-center gap-1 mt-0.5">
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            <span>{lang === 'bn' ? 'ওয়ান মিলিয়ন ইউজার কনভার্টেড' : '1M Users Active Pool'}</span>
          </span>
        </div>

        {/* Card 2: Real-time Active Users */}
        <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30 dark:from-neutral-900 dark:to-emerald-950/30 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              {lang === 'bn' ? 'রিয়েল টাইম এক্টিভ' : 'Real-Time Active'}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {realtimeActiveUsers.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            <span>{lang === 'bn' ? 'লাইভ সক্রিয় ব্যবহারকারী' : 'Live Online Now'}</span>
          </span>
        </div>

        {/* Card 3: VIP / Verify Queue */}
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

        {/* Card 4: Total Likes & Reactions */}
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
          <Users className="w-3.5 h-3.5 text-purple-500" />
          <span>{lang === 'bn' ? '১ মিলিয়ন ইউজার ও গ্রোথ' : '1M Users & Growth'}</span>
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
                        value={u.role === 'admin' ? 'user' : u.role}
                        onChange={(e) => adminChangeRole(u.id, e.target.value as UserRole)}
                        disabled={false}
                        className="text-[11px] font-semibold bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-1 text-neutral-800 dark:text-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Change user role"
                      >
                        <option value="user">USER</option>
                        <option value="moderator">MODERATOR</option>
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

      {/* Tab 3: 1 Million Users & Auto-Engagement Automation */}
      {activeSubTab === 'automation' && (
        <div className="space-y-6">
          {/* User Pool Summary Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-950 to-neutral-900 text-white shadow-xl border border-purple-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-bold mb-2">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>1 Million Users • USER-0000000001 to USER-1000000000</span>
              </div>
              <h3 className="text-xl font-black flex items-center gap-2">
                <span>{lang === 'bn' ? '১ মিলিয়ন ইউজার ডেলিভারি ও এনগেজমেন্ট' : '1 Million Users Growth Hub'}</span>
                <Sparkles className="w-5 h-5 text-amber-400" />
              </h3>
              <p className="text-xs text-purple-200/90 mt-1 max-w-xl">
                {lang === 'bn'
                  ? 'প্রোফাইল লিঙ্ক পেস্ট করে বা ইউজারনেম দিয়ে সার্চ করে যেকোনো অ্যাকাউন্টে ইনস্ট্যান্ট ওয়ান মিলিয়ন কমিউনিটি ইউজার যুক্ত করুন। অথবা পোস্ট লিঙ্ক দিয়ে লাইক ও কমেন্ট যুক্ত করুন।'
                  : 'Search by profile link or username to deliver verified community users, or paste post links to boost with auto-likes and realistic comments.'}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center shrink-0 w-full sm:w-auto">
              <span className="text-[10px] text-purple-200 uppercase font-bold tracking-wider block">Available User Pool</span>
              <span className="text-2xl font-black text-white font-mono">{(botPoolTotal - botPoolSent).toLocaleString()}</span>
              <span className="text-[10px] text-purple-300 block mt-0.5">Series: USER-0000000001 to USER-1000000000</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Tool 1: Community Users Sender */}
            <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                        {lang === 'bn' ? 'ওয়ান মিলিয়ন ইউজার ডেলিভারি' : '1M Community Users Delivery'}
                      </h4>
                      <p className="text-[10px] text-neutral-400">Target custom profile link / username</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                    USER-0000000001
                  </span>
                </div>

                <form onSubmit={handleSendBots} className="space-y-3.5">
                  {/* Custom Link / Username Input */}
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1 flex items-center justify-between">
                      <span>{lang === 'bn' ? 'প্রোফাইল লিঙ্ক বা ইউজারনেম:' : 'Profile Link or Username:'}</span>
                      <span className="text-[10px] text-indigo-500 font-normal">Link or @username</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-400">
                        <Link2 className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={botSearchInput}
                        onChange={(e) => setBotSearchInput(e.target.value)}
                        placeholder="যেমন: ShohelTaj বা @shoheltaj অথবা প্রোফাইল লিঙ্ক"
                        className="w-full text-xs pl-8 pr-2.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                    {/* Quick Pick Chips */}
                    <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto pb-1 text-[10px] text-neutral-500">
                      <span className="shrink-0 text-neutral-400">Quick:</span>
                      {['shoheltaj', 'sarah_visuals', 'tanvir_codes'].map((uname) => (
                        <button
                          key={uname}
                          type="button"
                          onClick={() => setBotSearchInput(`@${uname}`)}
                          className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 shrink-0 font-mono font-medium border border-purple-200 dark:border-purple-800"
                        >
                          @{uname}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Profile Preview Card */}
                  <div className="rounded-2xl border border-dashed border-purple-200 dark:border-purple-900/80 bg-purple-50/40 dark:bg-purple-950/20 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2 flex items-center justify-between">
                      <span>{lang === 'bn' ? 'টার্গেট প্রোফাইল প্রিভিউ' : 'Profile Preview'}</span>
                      {previewedBotUser && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {lang === 'bn' ? 'পাওয়া গেছে' : 'Verified'}
                        </span>
                      )}
                    </p>

                    {previewedBotUser ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={previewedBotUser.avatar}
                          alt=""
                          className="w-11 h-11 rounded-full object-cover border-2 border-purple-300 dark:border-purple-700 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100 truncate">
                              {previewedBotUser.fullName}
                            </span>
                            {previewedBotUser.isVip && <Crown className="w-3 h-3 text-amber-500 shrink-0" />}
                            {previewedBotUser.isVerified && <CheckCircle className="w-3 h-3 text-sky-500 shrink-0" />}
                          </div>
                          <p className="text-[11px] text-purple-700 dark:text-purple-300 font-mono truncate">
                            @{previewedBotUser.username}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-500 dark:text-neutral-400">
                            <span>
                              Followers: <strong>{(previewedBotUser.followerCount ?? previewedBotUser.followers.length).toLocaleString()}</strong>
                            </span>
                            <span>•</span>
                            <span>
                              Following: <strong>{previewedBotUser.following.length}</strong>
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-3 text-neutral-400 text-xs">
                        <Search className="w-5 h-5 mx-auto mb-1 opacity-50" />
                        <span>{lang === 'bn' ? 'সঠিক লিঙ্ক বা ইউজারনেম পেস্ট করুন' : 'Paste profile link or username to preview'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                      {lang === 'bn' ? 'ইউজার সংখ্যা:' : 'User Count:'}
                    </label>
                    <select
                      value={botFollowersCount}
                      onChange={(e) => setBotFollowersCount(Number(e.target.value))}
                      className="w-full text-xs p-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    >
                      <option value={100}>100 Community Users (USER-0000000001...)</option>
                      <option value={500}>500 Community Users</option>
                      <option value={1000}>1,000 Community Users</option>
                      <option value={5000}>5,000 Community Users</option>
                      <option value={10000}>10,000 Community Users</option>
                      <option value={50000}>50,000 Community Users</option>
                      <option value={100000}>100,000 Community Users</option>
                      <option value={1000000}>1,000,000 Users (Full 1 Million Pool)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={!previewedBotUser}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {previewedBotUser
                        ? lang === 'bn'
                          ? `@${previewedBotUser.username} কে ${botFollowersCount.toLocaleString()} জন ইউজার পাঠান`
                          : `Send ${botFollowersCount.toLocaleString()} Users to @${previewedBotUser.username}`
                        : lang === 'bn'
                        ? 'ইউজার ফলোয়ার সেন্ড করুন'
                        : 'Deliver Community Users'}
                    </span>
                  </button>
                </form>
              </div>
            </div>

            {/* Tool 2: Auto Likes Sender */}
            <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                      <Heart className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                        {lang === 'bn' ? 'অটো-লাইক বুস্ট' : 'Auto Likes Boost'}
                      </h4>
                      <p className="text-[10px] text-neutral-400">Target custom post link or ID</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                    Instant Likes
                  </span>
                </div>

                <form onSubmit={handleSendAutoLikes} className="space-y-3.5">
                  {/* Custom Post Link / ID Input */}
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1 flex items-center justify-between">
                      <span>{lang === 'bn' ? 'পোস্ট লিঙ্ক বা পোস্ট আইডি:' : 'Post Link or Post ID:'}</span>
                      <span className="text-[10px] text-rose-500 font-normal">Link or post-ID</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-400">
                        <Link2 className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={autoLikeSearchInput}
                        onChange={(e) => setAutoLikeSearchInput(e.target.value)}
                        placeholder="https://.../?post=post-1 অথবা post-1"
                        className="w-full text-xs pl-8 pr-2.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-rose-500 focus:outline-none font-mono"
                      />
                    </div>
                    {/* Quick Pick Post Chips */}
                    <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto pb-1 text-[10px] text-neutral-500">
                      <span className="shrink-0 text-neutral-400">Quick:</span>
                      {posts.slice(0, 3).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setAutoLikeSearchInput(p.id)}
                          className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 shrink-0 font-mono"
                        >
                          {p.id} ({p.authorName.split(' ')[0]})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Post Preview Card */}
                  <div className="rounded-2xl border border-dashed border-rose-200 dark:border-rose-900/80 bg-rose-50/40 dark:bg-rose-950/20 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-2 flex items-center justify-between">
                      <span>{lang === 'bn' ? 'টার্গেট পোস্ট প্রিভিউ' : 'Post Preview'}</span>
                      {previewedLikePost && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {lang === 'bn' ? 'পাওয়া গেছে' : 'Verified'}
                        </span>
                      )}
                    </p>

                    {previewedLikePost ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={previewedLikePost.authorAvatar}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100 block truncate">
                              {previewedLikePost.authorName}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono">ID: {previewedLikePost.id}</span>
                          </div>
                          {previewedLikePost.imageUrl && (
                            <img
                              src={previewedLikePost.imageUrl}
                              alt=""
                              className="w-9 h-9 rounded-lg object-cover shrink-0 border border-neutral-200 dark:border-neutral-700"
                            />
                          )}
                        </div>
                        <p className="text-xs text-neutral-700 dark:text-neutral-300 line-clamp-2 italic">
                          "{previewedLikePost.content}"
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-neutral-500 dark:text-neutral-400 pt-1 border-t border-rose-100 dark:border-rose-900/50">
                          <span className="text-rose-600 dark:text-rose-400 font-bold">
                            ❤️ {(previewedLikePost.likesCount ?? previewedLikePost.likes.length).toLocaleString()} Likes
                          </span>
                          <span>💬 {previewedLikePost.comments.length} Comments</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-3 text-neutral-400 text-xs">
                        <Search className="w-5 h-5 mx-auto mb-1 opacity-50" />
                        <span>{lang === 'bn' ? 'সঠিক পোস্ট লিঙ্ক বা আইডি পেস্ট করুন' : 'Paste post link or ID to preview'}</span>
                      </div>
                    )}
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
                    disabled={!previewedLikePost}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-rose-500/20 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span>
                      {previewedLikePost
                        ? lang === 'bn'
                          ? `পোস্টে +${autoLikeCount.toLocaleString()} লাইক সেন্ড করুন`
                          : `Inject +${autoLikeCount.toLocaleString()} Likes to Post`
                        : lang === 'bn'
                        ? 'অটো লাইক সেন্ড করুন'
                        : 'Inject Auto Likes'}
                    </span>
                  </button>
                </form>
              </div>
            </div>

            {/* Tool 3: Auto Comments Generator */}
            <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                        {lang === 'bn' ? 'অটো-কমেন্ট জেনারেটর' : 'Auto Comments Generator'}
                      </h4>
                      <p className="text-[10px] text-neutral-400">Realistic comments from community users</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                    USER-series
                  </span>
                </div>

                <form onSubmit={handleSendAutoComments} className="space-y-3.5">
                  {/* Custom Post Link / ID Input */}
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1 flex items-center justify-between">
                      <span>{lang === 'bn' ? 'পোস্ট লিঙ্ক বা পোস্ট আইডি:' : 'Post Link or Post ID:'}</span>
                      <span className="text-[10px] text-indigo-500 font-normal">Link or post-ID</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-400">
                        <Link2 className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={autoCommentSearchInput}
                        onChange={(e) => setAutoCommentSearchInput(e.target.value)}
                        placeholder="https://.../?post=post-1 অথবা post-1"
                        className="w-full text-xs pl-8 pr-2.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                      />
                    </div>
                    {/* Quick Pick Post Chips */}
                    <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto pb-1 text-[10px] text-neutral-500">
                      <span className="shrink-0 text-neutral-400">Quick:</span>
                      {posts.slice(0, 3).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setAutoCommentSearchInput(p.id)}
                          className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 shrink-0 font-mono"
                        >
                          {p.id} ({p.authorName.split(' ')[0]})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Post Preview Card */}
                  <div className="rounded-2xl border border-dashed border-indigo-200 dark:border-indigo-900/80 bg-indigo-50/40 dark:bg-indigo-950/20 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 flex items-center justify-between">
                      <span>{lang === 'bn' ? 'টার্গেট পোস্ট প্রিভিউ' : 'Post Preview'}</span>
                      {previewedCommentPost && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {lang === 'bn' ? 'পাওয়া গেছে' : 'Verified'}
                        </span>
                      )}
                    </p>

                    {previewedCommentPost ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={previewedCommentPost.authorAvatar}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100 block truncate">
                              {previewedCommentPost.authorName}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono">ID: {previewedCommentPost.id}</span>
                          </div>
                        </div>
                        <p className="text-xs text-neutral-700 dark:text-neutral-300 line-clamp-2 italic">
                          "{previewedCommentPost.content}"
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-neutral-500 dark:text-neutral-400 pt-1 border-t border-indigo-100 dark:border-indigo-900/50">
                          <span>❤️ {previewedCommentPost.likes.length} Likes</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                            💬 {previewedCommentPost.comments.length} Comments
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-3 text-neutral-400 text-xs">
                        <Search className="w-5 h-5 mx-auto mb-1 opacity-50" />
                        <span>{lang === 'bn' ? 'সঠিক পোস্ট লিঙ্ক বা আইডি পেস্ট করুন' : 'Paste post link or ID to preview'}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                        {lang === 'bn' ? 'কমেন্ট সংখ্যা:' : 'Count:'}
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
                        {lang === 'bn' ? 'কাস্টম টেক্সট:' : 'Custom Text:'}
                      </label>
                      <input
                        type="text"
                        value={autoCommentCustomText}
                        onChange={(e) => setAutoCommentCustomText(e.target.value)}
                        placeholder="অসাধারণ পোস্ট! 🔥"
                        className="w-full text-xs p-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!previewedCommentPost}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>
                      {previewedCommentPost
                        ? lang === 'bn'
                          ? `পোস্টে +${autoCommentCount} কমেন্ট সেন্ড করুন`
                          : `Send +${autoCommentCount} Comments to Post`
                        : lang === 'bn'
                        ? 'অটো কমেন্ট তৈরি করুন'
                        : 'Generate Comments'}
                    </span>
                  </button>
                </form>
              </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
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

            <form onSubmit={handleSaveUserOverride} className="flex flex-col flex-1 min-h-0">
              <div className="p-5 space-y-3.5 overflow-y-auto flex-1">
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
              </div>

              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/80 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
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

