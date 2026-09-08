import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  User,
  Post,
  PostComment,
  Message,
  Conversation,
  AppNotification,
  PhotoFilter,
  UserRole,
  VerificationRequest,
  ProfileLink,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_POSTS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';
import { generateUniqueBilingualUser, sanitizeUserToBilingual } from '../utils/userGenerator';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../lib/firebase';

export type NavigationTab =
  | 'feed'
  | 'explore'
  | 'messages'
  | 'notifications'
  | 'profile'
  | 'admin'
  | 'settings';

interface AppContextType {
  // Current user & Auth
  currentUser: User | null;
  isFirebaseAdmin: boolean;
  users: User[];
  loggedInUserIds: string[];
  recordLoggedInUser: (uid: string) => void;
  removeLoggedInAccount: (userId: string) => void;
  login: (emailOrUsername: string, password?: string) => boolean;
  register: (email: string, username: string, fullName: string, password?: string) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
  updateProfile: (data: Partial<User>, targetUserId?: string) => void;
  toggleFollow: (targetUserId: string) => void;
  changeEmailAndPassword: (newEmail: string, newPassword?: string) => boolean;
  resetPasswordByUsernameOrEmail: (identifier: string, newPassword: string) => { success: boolean; message: string };

  // Verification
  verificationRequests: VerificationRequest[];
  requestVerification: (type: 'Verify' | 'VIP', reason: string, socialLink?: string) => void;
  adminApproveVerification: (requestId: string) => void;
  adminRejectVerification: (requestId: string) => void;

  // 1M Community Users & Live Network Stats
  totalCommunityUsers: number;
  realtimeActiveUsers: number;
  botPoolTotal: number;
  botPoolSent: number;
  adminSendBotFollowers: (targetUsername: string, count: number) => { success: boolean; addedCount: number; message: string };
  adminSendAutoLikes: (postIdentifier: string, count: number) => { success: boolean; addedCount: number; message: string };
  adminSendAutoComments: (postIdentifier: string, count: number, customCommentText?: string) => { success: boolean; addedCount: number; message: string };

  // Posts
  posts: Post[];
  createPost: (content: string, imageUrl?: string, filter?: PhotoFilter, tags?: string[], location?: string) => void;
  editPost: (postId: string, content: string, tags?: string[], filter?: PhotoFilter) => void;
  deletePost: (postId: string) => void;
  toggleLikePost: (postId: string) => void;
  toggleSavePost: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  sharePost: (postId: string, recipientUserId?: string) => void;
  flagPost: (postId: string, reason: string) => void;
  restorePost: (postId: string) => void;

  // Messaging / Chat
  conversations: Conversation[];
  messages: Message[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (receiverId: string, text: string, imageUrl?: string) => void;
  startOrOpenChatWithUser: (targetUserId: string) => void;

  // Notifications & Push
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  markAllNotificationsRead: () => void;
  requestPushPermission: () => Promise<boolean>;
  pushPermissionStatus: NotificationPermission;
  sendInAppNotification: (notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;

  // Admin Controls
  adminBanUser: (userId: string, banStatus: boolean) => void;
  adminChangeRole: (userId: string, role: UserRole) => void;
  adminDeleteUser: (userId: string) => void;
  adminBroadcastNotification: (title: string, message: string) => void;
  adminSendNotification: (target: 'all' | string, title: string, message: string) => void;
  adminUpdateAnyUser: (userId: string, updates: Partial<User>) => void;

  // Search & Navigation
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedUserProfileId: string | null;
  setSelectedUserProfileId: (userId: string | null) => void;

  // Theme & Language
  darkMode: boolean;
  toggleDarkMode: () => void;
  lang: 'bn' | 'en';
  toggleLang: () => void;

  // UI Modals
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isVercelModalOpen: boolean;
  setIsVercelModalOpen: (open: boolean) => void;
  isEditProfileModalOpen: boolean;
  setIsEditProfileModalOpen: (open: boolean) => void;
  editingPost: Post | null;
  setEditingPost: (post: Post | null) => void;
  sharingPost: Post | null;
  setSharingPost: (post: Post | null) => void;

  // Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Web Audio subtle chime for notifications
function playChime() {
  try {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.36);
  } catch {
    // AudioContext may be blocked before interaction
  }
}

// Safe LocalStorage setter preventing QuotaExceededError or crashes
function safeLocalStorageSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`[LocalStorage] Failed to save key "${key}":`, err);
  }
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Persistence Helpers
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('vc_users');
      let list: User[] = saved ? JSON.parse(saved) : INITIAL_USERS;
      // Purge any stale fake bot / AI Booster accounts that were previously saved in user's browser localStorage
      list = list.filter(
        (u) =>
          !u.isBot &&
          !u.fullName?.includes('AI Booster') &&
          !u.username?.startsWith('bot_')
      );
      // Remove hardcoded admin modifications
      // Upgrade and sanitize every user to unique bilingual Bengali & English names
      const sanitized = list.map(sanitizeUserToBilingual);
      // Strict deduplication by email and username so no duplicated user accounts exist
      const seen = new Set<string>();
      const deduped: User[] = [];
      for (const u of sanitized) {
        const emailKey = (u.email || '').trim().toLowerCase();
        const usernameKey = (u.username || '').trim().toLowerCase();
        const idKey = u.id || '';
        if (emailKey && seen.has(`e:${emailKey}`)) continue;
        if (usernameKey && seen.has(`u:${usernameKey}`)) continue;
        if (idKey && seen.has(`id:${idKey}`)) continue;
        if (emailKey) seen.add(`e:${emailKey}`);
        if (usernameKey) seen.add(`u:${usernameKey}`);
        if (idKey) seen.add(`id:${idKey}`);
        deduped.push(u);
      }
      return deduped;
    } catch {
      return INITIAL_USERS.map(sanitizeUserToBilingual);
    }
  });

  // Track accounts that have actually been logged into on this device/session
  const [loggedInUserIds, setLoggedInUserIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('vc_logged_in_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  const recordLoggedInUser = (uid: string) => {
    setLoggedInUserIds((prev) => {
      const next = Array.from(new Set([...prev, uid]));
      safeLocalStorageSet('vc_logged_in_users', JSON.stringify(next));
      return next;
    });
  };

  const removeLoggedInAccount = (uid: string) => {
    setLoggedInUserIds((prev) => {
      const next = prev.filter((id) => id !== uid);
      safeLocalStorageSet('vc_logged_in_users', JSON.stringify(next));
      return next;
    });
    if (currentUserId === uid) {
      logout();
    }
  };

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    const saved = localStorage.getItem('vc_current_user_id');
    return saved || null;
  });

  const [isFirebaseAdmin, setIsFirebaseAdmin] = useState<boolean>(false);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Authoritative Single Admin check: UID must strictly match UI28ofvzB7cjNJvCG0DvYgbCu9J3
      if (user && user.uid === 'UI28ofvzB7cjNJvCG0DvYgbCu9J3') {
        setIsFirebaseAdmin(true);
      } else {
        setIsFirebaseAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('vc_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('vc_conversations');
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('vc_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('vc_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('vc_dark_mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [lang, setLang] = useState<'bn' | 'en'>(() => {
    const saved = localStorage.getItem('vc_lang');
    return saved === 'en' ? 'en' : 'bn'; // default Bengali as prompt requested in Bengali
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [pushPermissionStatus, setPushPermissionStatus] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const [activeTabState, setActiveTabState] = useState<NavigationTab>('feed');
  const setActiveTab = (tab: NavigationTab) => {
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const activeTab = activeTabState;

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [selectedUserProfileId, setSelectedUserProfileId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Total 1M Users Platform & Real-Time Active Users
  const totalCommunityUsers = 1000000;
  const botPoolTotal = 1000000;
  const [botPoolSent, setBotPoolSent] = useState<number>(() => {
    const saved = localStorage.getItem('vc_bot_sent');
    return saved ? parseInt(saved, 10) : 1000000;
  });

  const [realtimeActiveUsers, setRealtimeActiveUsers] = useState<number>(() => {
    return 84320 + Math.floor(Math.random() * 180);
  });

  // Real-time active user count fluctuation (emulates live active network traffic)
  useEffect(() => {
    const timer = setInterval(() => {
      setRealtimeActiveUsers((prev) => {
        const delta = Math.floor(Math.random() * 25) - 12;
        const next = prev + delta;
        return next < 82000 ? 83500 : next > 94000 ? 91200 : next;
      });
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  // Verification Requests state
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(() => {
    const saved = localStorage.getItem('vc_verification_reqs');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'vr-1',
        userId: 'user-4',
        username: 'maya_nomad',
        fullName: 'Maya Chowdhury',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
        type: 'VIP',
        reason: 'Travel documentarian with 50K+ readers. Requesting VIP gold creator badge.',
        socialLink: 'https://nomadmaya.blog',
        status: 'pending',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: 'vr-2',
        userId: 'user-5',
        username: 'arman_artisan',
        fullName: 'Arman Hossain',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
        type: 'Verify',
        reason: 'Verified digital creator & UI designer. Requesting blue checkmark verification.',
        socialLink: 'https://dribbble.com/arman',
        status: 'pending',
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      },
    ];
  });

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isVercelModalOpen, setIsVercelModalOpen] = useState<boolean>(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState<boolean>(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [sharingPost, setSharingPost] = useState<Post | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Sync to LocalStorage safely
  useEffect(() => {
    safeLocalStorageSet('vc_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUserId) {
      safeLocalStorageSet('vc_current_user_id', currentUserId);
    } else {
      try {
        localStorage.removeItem('vc_current_user_id');
      } catch {}
    }
  }, [currentUserId]);

  useEffect(() => {
    safeLocalStorageSet('vc_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    safeLocalStorageSet('vc_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    safeLocalStorageSet('vc_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    safeLocalStorageSet('vc_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    safeLocalStorageSet('vc_verification_reqs', JSON.stringify(verificationRequests));
  }, [verificationRequests]);

  useEffect(() => {
    safeLocalStorageSet('vc_bot_sent', String(botPoolSent));
  }, [botPoolSent]);

  useEffect(() => {
    safeLocalStorageSet('vc_dark_mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    safeLocalStorageSet('vc_lang', lang);
  }, [lang]);

  // Handle URL query parameter ?u=username to view shared user profile directly
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const userParam = urlParams.get('u') || urlParams.get('user');
      if (userParam) {
        const found = users.find(
          (u) => u.username.toLowerCase() === userParam.toLowerCase().replace(/^@/, '')
        );
        if (found) {
          setSelectedUserProfileId(found.id);
          setActiveTab('profile');
        }
      }
      const postParam = urlParams.get('post') || urlParams.get('p');
      if (postParam) {
        const foundPost = posts.find((p) => p.id === postParam);
        if (foundPost) {
          setSearchQuery(foundPost.id);
          setActiveTab('explore');
        }
      }
    } catch {
      // URL parsing fallback
    }
  }, [users, posts]);

  const currentUser = currentUserId ? users.find((u) => u.id === currentUserId) || null : null;

  // Toggle Theme
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Toggle Language
  const toggleLang = () => {
    setLang((prev) => (prev === 'bn' ? 'en' : 'bn'));
  };

  // Auth Operations
  const login = (emailOrUsername: string, password?: string): boolean => {
    const clean = emailOrUsername.trim().toLowerCase();
    const found = users.find(
      (u) => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean
    );
    if (found) {
      if (found.isBanned) {
        showToast(lang === 'bn' ? 'আপনার অ্যাকাউন্টটি স্থগিত (Banned) করা হয়েছে।' : 'Your account has been banned.');
        return false;
      }
      if (password && found.password && found.password !== password) {
        showToast(lang === 'bn' ? 'ভুল পাসওয়ার্ড! দয়া করে সঠিক পাসওয়ার্ড দিন।' : 'Incorrect password! Please try again.');
        return false;
      }
      setCurrentUserId(found.id);
      recordLoggedInUser(found.id);
      showToast(lang === 'bn' ? `স্বাগতম, ${found.fullName}!` : `Welcome back, ${found.fullName}!`);
      setIsAuthModalOpen(false);
      return true;
    }
    // Auto register demo if unknown email
    const newUsername = clean.includes('@')
      ? clean.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_') + Math.floor(Math.random() * 90 + 10)
      : clean.replace(/[^a-zA-Z0-9_]/g, '_');
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: clean.includes('@') ? clean : `${clean}@example.com`,
      password: password || 'password123',
      username: newUsername,
      usernameChangeCount: 0,
      fullName: newUsername.replace(/_/g, ' ').toUpperCase(),
      avatar: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 100)}?w=400&auto=format&fit=crop&q=80`,
      coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
      bio: 'New explorer on the platform! Hello world ✨',
      role: 'user',
      isVerified: false,
      isBanned: false,
      followers: [],
      following: ['user-admin'],
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUserId(newUser.id);
    recordLoggedInUser(newUser.id);
    showToast(lang === 'bn' ? 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!' : 'Account created successfully!');
    setIsAuthModalOpen(false);
    return true;
  };

  const register = (email: string, username: string, fullName: string, password?: string): boolean => {
    const trimmedFullName = fullName.trim();
    const cleanUsername = username.trim();

    // English-only Full Name validation
    const englishNameRegex = /^[a-zA-Z\s.'-]+$/;
    const hasBengaliChars = /[\u0980-\u09FF]/;

    if (hasBengaliChars.test(trimmedFullName) || !englishNameRegex.test(trimmedFullName)) {
      showToast(
        lang === 'bn'
          ? 'নাম শুধুমাত্র ইংরেজি অক্ষরে হতে হবে (বাংলা অক্ষর গ্রহণযোগ্য নয়)।'
          : 'Name must be in English characters only (Bengali characters not allowed).'
      );
      return false;
    }

    // English-only Username validation
    const englishUsernameRegex = /^[a-zA-Z0-9_.-]+$/;
    if (hasBengaliChars.test(cleanUsername) || !englishUsernameRegex.test(cleanUsername)) {
      showToast(
        lang === 'bn'
          ? 'ইউজারনেম শুধুমাত্র ইংরেজি অক্ষরে (a-z, 0-9, _, ., -) হতে হবে।'
          : 'Username must contain English characters only (a-z, 0-9, _, ., -).'
      );
      return false;
    }

    if (cleanUsername.length < 3) {
      showToast(lang === 'bn' ? 'ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে।' : 'Username must be at least 3 characters.');
      return false;
    }

    const exists = users.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() ||
        u.username.toLowerCase() === cleanUsername.toLowerCase()
    );
    if (exists) {
      showToast(lang === 'bn' ? 'এই ইমেইল অথবা ইউজারনেম ইতোমধ্যে ব্যবহৃত হচ্ছে।' : 'Email or username already in use.');
      return false;
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      password: password || 'password123',
      username: cleanUsername,
      usernameChangeCount: 0,
      fullName: trimmedFullName,
      fullNameBn: trimmedFullName,
      fullNameEn: trimmedFullName,
      avatar: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 100)}?w=400&auto=format&fit=crop&q=80`,
      coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
      bio: 'Excited to connect and share moments here! 🌟',
      role: 'user',
      isVerified: false,
      isBanned: false,
      followers: [],
      following: ['user-admin'],
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUserId(newUser.id);
    recordLoggedInUser(newUser.id);
    showToast(lang === 'bn' ? `স্বাগতম ${trimmedFullName}! অ্যাকাউন্ট তৈরি সম্পন্ন।` : `Welcome ${trimmedFullName}! Account created.`);
    setIsAuthModalOpen(false);
    return true;
  };

  const logout = () => {
    setCurrentUserId(null);
    localStorage.removeItem('vc_current_user_id');
    setActiveTab('feed');
    setSelectedUserProfileId(null);
    showToast(lang === 'bn' ? 'লগআউট সফল হয়েছে।' : 'Logged out successfully.');
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUserId(target.id);
      recordLoggedInUser(target.id);
      showToast(lang === 'bn' ? `ইউজার পরিবর্তন: ${target.fullName}` : `Switched user to: ${target.fullName}`);
    }
  };

  // Change Email & Password for logged in user
  const changeEmailAndPassword = (newEmail: string, newPassword?: string): boolean => {
    if (!currentUser) return false;
    const cleanEmail = newEmail.trim().toLowerCase();
    const emailConflict = users.find(
      (u) => u.id !== currentUser.id && u.email.toLowerCase() === cleanEmail
    );
    if (emailConflict) {
      showToast(lang === 'bn' ? 'এই ইমেইল ঠিকানাটি অন্য একটি অ্যাকাউন্টে ব্যবহৃত হচ্ছে।' : 'This email address is already in use.');
      return false;
    }
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          return {
            ...u,
            email: cleanEmail,
            password: newPassword && newPassword.trim() ? newPassword.trim() : u.password,
          };
        }
        return u;
      })
    );
    showToast(lang === 'bn' ? 'ইমেইল ও পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!' : 'Email & password updated successfully!');
    return true;
  };

  // Reset Password via Username OR Email
  const resetPasswordByUsernameOrEmail = (identifier: string, newPassword: string): { success: boolean; message: string } => {
    const clean = identifier.trim().toLowerCase().replace(/^@/, '');
    const target = users.find(
      (u) => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean
    );
    if (!target) {
      return {
        success: false,
        message: lang === 'bn' ? 'এই ইউজারনেম বা ইমেইল দিয়ে কোনো অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।' : 'No account found with this username or email.',
      };
    }
    if (!newPassword || newPassword.length < 4) {
      return {
        success: false,
        message: lang === 'bn' ? 'নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' : 'Password must be at least 4 characters long.',
      };
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === target.id ? { ...u, password: newPassword } : u))
    );
    return {
      success: true,
      message: lang === 'bn'
        ? `@${target.username} এর পাসওয়ার্ড সফলভাবে রিসেট হয়েছে! এখন নতুন পাসওয়ার্ড দিয়ে লগইন করুন।`
        : `Password reset successfully for @${target.username}! You can now login with your new password.`,
    };
  };

  // Profile Update with 10-time Username Change limit & Max 10 Links
  const updateProfile = (data: Partial<User>, targetUserId?: string) => {
    if (!currentUser) return;

    const targetId = targetUserId || currentUser.id;
    const targetUser = users.find(u => u.id === targetId);
    if (!targetUser) return;

    // Check if the current user has permission to edit this profile
    if (targetId !== currentUser.id && !isFirebaseAdmin) {
      showToast(lang === 'bn' ? 'আপনার এই প্রোফাইলটি আপডেট করার অনুমতি নেই।' : 'You do not have permission to update this profile.');
      return;
    }

    let finalData = { ...data };

    // Strip security-critical fields to prevent tampering
    if (!isFirebaseAdmin || targetId !== currentUser.id) {
      delete (finalData as any).id;
      delete (finalData as any).role;
      delete (finalData as any).isVerified;
      delete (finalData as any).isVip;
      delete (finalData as any).isBanned;
      delete (finalData as any).createdAt;
    }

    // English-only Full Name validation
    if (finalData.fullName !== undefined) {
      const trimmedName = finalData.fullName.trim();
      const englishNameRegex = /^[a-zA-Z\s.'-]+$/;
      const hasBengaliChars = /[\u0980-\u09FF]/;

      if (hasBengaliChars.test(trimmedName) || !englishNameRegex.test(trimmedName)) {
        showToast(
          lang === 'bn'
            ? 'নাম শুধুমাত্র ইংরেজি অক্ষরে হতে হবে (বাংলা অক্ষর গ্রহণযোগ্য নয়)।'
            : 'Name must be in English characters only (Bengali characters not allowed).'
        );
        return;
      }
      finalData.fullName = trimmedName;
      finalData.fullNameBn = trimmedName;
      finalData.fullNameEn = trimmedName;
    }

    // Check if username is being changed
    if (
      finalData.username &&
      finalData.username.toLowerCase() !== targetUser.username.toLowerCase()
    ) {
      const currentCount = targetUser.usernameChangeCount || 0;
      if (currentCount >= 10 && !isFirebaseAdmin) {
        showToast(
          lang === 'bn'
            ? 'ইতিমধ্যে ১০ বার ইউজারনেম পরিবর্তন করা হয়েছে। আর পরিবর্তন করা সম্ভব নয়!'
            : 'Username has already been changed 10 times. Maximum limit reached!'
        );
        return;
      }
      const cleanUsername = finalData.username.trim();
      const englishUsernameRegex = /^[a-zA-Z0-9_.-]+$/;
      const hasBengaliChars = /[\u0980-\u09FF]/;

      if (hasBengaliChars.test(cleanUsername) || !englishUsernameRegex.test(cleanUsername)) {
        showToast(
          lang === 'bn'
            ? 'ইউজারনেম শুধুমাত্র ইংরেজি অক্ষরে (a-z, 0-9, _, ., -) হতে হবে।'
            : 'Username must contain English characters only (a-z, 0-9, _, ., -).'
        );
        return;
      }

      if (cleanUsername.length < 3) {
        showToast(
          lang === 'bn' ? 'ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে।' : 'Username must be at least 3 characters.'
        );
        return;
      }
      const isTaken = users.some(
        (u) => u.id !== targetId && u.username.toLowerCase() === cleanUsername.toLowerCase()
      );
      if (isTaken) {
        showToast(
          lang === 'bn' ? 'এই ইউজারনেমটি ইতিমধ্যে অন্য কেউ ব্যবহার করছেন।' : 'This username is already taken.'
        );
        return;
      }

      finalData.username = cleanUsername;
      if (!isFirebaseAdmin) {
        finalData.usernameChangeCount = currentCount + 1;
      }
    }

    // Limit links to 10 max
    if (finalData.links && finalData.links.length > 10) {
      finalData.links = finalData.links.slice(0, 10);
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === targetId ? { ...u, ...finalData } : u))
    );
    showToast(lang === 'bn' ? 'প্রোফাইল সফলভাবে আপডেট হয়েছে!' : 'Profile updated successfully!');
  };

  // Verification requests by users
  const requestVerification = (type: 'Verify' | 'VIP', reason: string, socialLink?: string) => {
    if (!currentUser) return;
    const existingPending = verificationRequests.find(
      (r) => r.userId === currentUser.id && r.status === 'pending'
    );
    if (existingPending) {
      showToast(
        lang === 'bn'
          ? 'আপনার একটি আবেদন ইতোমধ্যে অ্যাডমিনের পর্যালোচনায় পেন্ডিং রয়েছে।'
          : 'You already have a pending verification request.'
      );
      return;
    }

    const newReq: VerificationRequest = {
      id: `vr-${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      fullName: currentUser.fullName,
      avatar: currentUser.avatar,
      type,
      reason: reason.trim(),
      socialLink: socialLink?.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setVerificationRequests((prev) => [newReq, ...prev]);
    showToast(
      lang === 'bn'
        ? `${type === 'VIP' ? 'VIP ব্যাজ' : 'Verify ব্লু ব্যাজ'} এর আবেদন সফলভাবে অ্যাডমিনের কাছে পাঠানো হয়েছে!`
        : `${type} badge request submitted for admin review!`
    );
  };

  const adminApproveVerification = (requestId: string) => {
    const req = verificationRequests.find((r) => r.id === requestId);
    if (!req) return;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === req.userId) {
          if (req.type === 'VIP') {
            return {
              ...u,
              isVip: true,
              badge: 'VIP',
              isVerified: true,
            };
          } else {
            return {
              ...u,
              isVerified: true,
              badge: 'Verified',
            };
          }
        }
        return u;
      })
    );

    setVerificationRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'approved' } : r))
    );

    sendInAppNotification({
      userId: req.userId,
      actorId: 'admin',
      actorName: '🛡️ 1 social Official Admin',
      actorUsername: 'admin_team',
      actorAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
      type: 'system',
      text:
        lang === 'bn'
          ? `অভিনন্দন! আপনার ${req.type === 'VIP' ? '👑 VIP ব্যাজ' : '🔵 ব্লু ভেরিফিকেশন'} আবেদন অনুমোদিত হয়েছে!`
          : `Congratulations! Your ${req.type} badge verification request has been approved!`,
    });

    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    showToast(lang === 'bn' ? 'ভেরিফিকেশন আবেদন অনুমোদিত হয়েছে!' : 'Verification request approved!');
  };

  const adminRejectVerification = (requestId: string) => {
    const req = verificationRequests.find((r) => r.id === requestId);
    if (!req) return;

    setVerificationRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'rejected' } : r))
    );

    sendInAppNotification({
      userId: req.userId,
      actorId: 'admin',
      actorName: '🛡️ 1 social Official Admin',
      actorUsername: 'admin_team',
      actorAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
      type: 'system',
      text:
        lang === 'bn'
          ? `আপনার ${req.type} ব্যাজ আবেদনটি পর্যালোচনা শেষে নামঞ্জুর করা হয়েছে। বিস্তারিত তথ্যের জন্য যোগাযোগ করুন।`
          : `Your ${req.type} badge verification request has been declined after review.`,
    });

    showToast(lang === 'bn' ? 'আবেদন প্রত্যাখ্যান করা হয়েছে।' : 'Request rejected.');
  };

  const toggleFollow = (targetUserId: string) => {
    if (!currentUser || currentUser.id === targetUserId) return;
    const isFollowing = currentUser.following.includes(targetUserId);

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          return {
            ...u,
            following: isFollowing
              ? u.following.filter((id) => id !== targetUserId)
              : [...u.following, targetUserId],
          };
        }
        if (u.id === targetUserId) {
          return {
            ...u,
            followers: isFollowing
              ? u.followers.filter((id) => id !== currentUser.id)
              : [...u.followers, currentUser.id],
          };
        }
        return u;
      })
    );

    if (!isFollowing) {
      sendInAppNotification({
        userId: targetUserId,
        actorId: currentUser.id,
        actorName: currentUser.fullName,
        actorUsername: currentUser.username,
        actorAvatar: currentUser.avatar,
        type: 'follow',
        text: lang === 'bn' ? 'আপনাকে অনুসরণ করতে শুরু করেছে' : 'started following you',
      });
      showToast(lang === 'bn' ? 'ফলো করা হয়েছে!' : 'Following!');
    } else {
      showToast(lang === 'bn' ? 'আনফলো করা হয়েছে!' : 'Unfollowed!');
    }
  };

  // Posts operations
  const createPost = (
    content: string,
    imageUrl?: string,
    filter: PhotoFilter = 'normal',
    tags: string[] = [],
    location?: string
  ) => {
    if (!currentUser) return;

    const newPost: Post = {
      id: `post-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatar,
      isVerified: currentUser.isVerified,
      content,
      imageUrl,
      filter,
      tags,
      location,
      createdAt: new Date().toISOString(),
      likes: [],
      savedBy: [],
      comments: [],
      sharesCount: 0,
    };

    setPosts((prev) => [newPost, ...prev]);
    setIsCreateModalOpen(false);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
    });

    showToast(lang === 'bn' ? 'আপনার পোস্ট সফলভাবে প্রকাশিত হয়েছে! 🎉' : 'Post published successfully! 🎉');
  };

  const editPost = (postId: string, content: string, tags?: string[], filter?: PhotoFilter) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              content,
              tags: tags || p.tags,
              filter: filter || p.filter,
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
    setEditingPost(null);
    showToast(lang === 'bn' ? 'পোস্ট রিয়েল-টাইমে আপডেট করা হয়েছে!' : 'Post updated in real-time!');
  };

  const deletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    showToast(lang === 'bn' ? 'পোস্টটি মুছে ফেলা হয়েছে।' : 'Post deleted.');
  };

  const toggleLikePost = (postId: string) => {
    if (!currentUser) return;
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const isLiked = post.likes.includes(currentUser.id);
    const updatedLikes = isLiked
      ? post.likes.filter((id) => id !== currentUser.id)
      : [...post.likes, currentUser.id];

    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: updatedLikes } : p))
    );

    if (!isLiked && post.authorId !== currentUser.id) {
      sendInAppNotification({
        userId: post.authorId,
        actorId: currentUser.id,
        actorName: currentUser.fullName,
        actorUsername: currentUser.username,
        actorAvatar: currentUser.avatar,
        type: 'like',
        text: lang === 'bn' ? 'আপনার পোস্টে লাইক দিয়েছে' : 'liked your post',
        postId: post.id,
      });
    }
  };

  const toggleSavePost = (postId: string) => {
    if (!currentUser) return;
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const isSaved = post.savedBy.includes(currentUser.id);
    const updatedSaved = isSaved
      ? post.savedBy.filter((id) => id !== currentUser.id)
      : [...post.savedBy, currentUser.id];

    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, savedBy: updatedSaved } : p))
    );

    showToast(
      isSaved
        ? lang === 'bn' ? 'বুকমার্ক থেকে সরানো হয়েছে' : 'Removed from bookmarks'
        : lang === 'bn' ? 'বুকমার্কে সংরক্ষণ করা হয়েছে' : 'Saved to bookmarks'
    );
  };

  const addComment = (postId: string, content: string) => {
    if (!currentUser || !content.trim()) return;
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const newComment = {
      id: `comment-${Date.now()}`,
      postId,
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatar,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      likes: [],
    };

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p
      )
    );

    if (post.authorId !== currentUser.id) {
      sendInAppNotification({
        userId: post.authorId,
        actorId: currentUser.id,
        actorName: currentUser.fullName,
        actorUsername: currentUser.username,
        actorAvatar: currentUser.avatar,
        type: 'comment',
        text: lang === 'bn' ? `আপনার পোস্টে মন্তব্য করেছে: "${content.slice(0, 30)}..."` : `commented: "${content.slice(0, 30)}..."`,
        postId: post.id,
      });
    }

    showToast(lang === 'bn' ? 'মন্তব্য যোগ করা হয়েছে!' : 'Comment added!');
  };

  const sharePost = (postId: string, recipientUserId?: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, sharesCount: p.sharesCount + 1 } : p))
    );

    if (recipientUserId && currentUser) {
      // Send as Direct Message
      sendMessage(recipientUserId, `Check out this post: ${window.location.origin}/post/${postId}`);
      showToast(lang === 'bn' ? 'সরাসরি মেসেজে শেয়ার করা হয়েছে!' : 'Shared directly to message!');
    } else {
      // Native or link share
      showToast(lang === 'bn' ? 'পোস্টের লিঙ্ক কপি করা হয়েছে!' : 'Post link copied to clipboard!');
    }
  };

  const flagPost = (postId: string, reason: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isFlagged: true, flagReason: reason } : p))
    );
    showToast(lang === 'bn' ? 'পোস্টটি অ্যাডমিন পর্যালোচনার জন্য রিপোর্ট করা হয়েছে।' : 'Post reported for admin review.');
  };

  const restorePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isFlagged: false, flagReason: undefined } : p))
    );
    showToast(lang === 'bn' ? 'পোস্টটি পুনরায় স্বাভাবিক করা হয়েছে।' : 'Post restored.');
  };

  // Messaging / Chat
  const sendMessage = (receiverId: string, text: string, imageUrl?: string) => {
    if (!currentUser || (!text.trim() && !imageUrl)) return;

    // Find or create conversation
    let conv = conversations.find(
      (c) =>
        c.participantIds.includes(currentUser.id) &&
        c.participantIds.includes(receiverId)
    );

    const now = new Date().toISOString();
    const convId = conv ? conv.id : `conv-${Date.now()}`;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId: convId,
      senderId: currentUser.id,
      receiverId,
      text: text.trim(),
      imageUrl,
      createdAt: now,
      isRead: false,
    };

    if (!conv) {
      conv = {
        id: convId,
        participantIds: [currentUser.id, receiverId],
        lastMessage: newMsg,
        updatedAt: now,
      };
      setConversations((prev) => [conv!, ...prev]);
      setActiveConversationId(convId);
    } else {
      setActiveConversationId(convId);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId ? { ...c, lastMessage: newMsg, updatedAt: now } : c
        )
      );
    }

    setMessages((prev) => [...prev, newMsg]);

    // Send push notification to recipient
    sendInAppNotification({
      userId: receiverId,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorUsername: currentUser.username,
      actorAvatar: currentUser.avatar,
      type: 'message',
      text: text.slice(0, 45) || 'Sent an image attachment',
    });

    // Simulate smart interactive reply after 2.5s if talking with other demo accounts
    const recipient = users.find((u) => u.id === receiverId);
    if (recipient && receiverId !== currentUser.id) {
      setTimeout(() => {
        const replies = [
          lang === 'bn'
            ? 'ধন্যবাদ মেসেজের জন্য! পোস্টটি আমি এখনই দেখছি 😊'
            : 'Thanks for reaching out! Really appreciate your message 😊',
          lang === 'bn'
            ? 'দারুণ আইডিয়া! আমি এই বিষয়ে পুরোপুরি একমত 🚀'
            : 'Awesome idea! I completely agree with you on this 🚀',
          lang === 'bn'
            ? 'হ্যাঁ, অ্যাপের রিয়েল-টাইম এডিটিং এবং স্পিড সত্যিই চমকপ্রদ!'
            : 'Yeah, the real-time editing and speed on this platform is truly amazing!',
        ];
        const replyText = replies[Math.floor(Math.random() * replies.length)];
        const replyTime = new Date().toISOString();

        const replyMsg: Message = {
          id: `msg-reply-${Date.now()}`,
          conversationId: convId,
          senderId: receiverId,
          receiverId: currentUser.id,
          text: replyText,
          createdAt: replyTime,
          isRead: false,
        };

        setMessages((prev) => [...prev, replyMsg]);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId ? { ...c, lastMessage: replyMsg, updatedAt: replyTime } : c
          )
        );

        sendInAppNotification({
          userId: currentUser.id,
          actorId: recipient.id,
          actorName: recipient.fullName,
          actorUsername: recipient.username,
          actorAvatar: recipient.avatar,
          type: 'message',
          text: replyText,
        });
      }, 2500);
    }
  };

  const startOrOpenChatWithUser = (targetUserId: string) => {
    if (!currentUser) return;
    const isSelf = targetUserId === currentUser.id;
    const existing = conversations.find(
      (c) =>
        c.participantIds.includes(currentUser.id) &&
        (isSelf
          ? c.participantIds.length === 1 || (c.participantIds[0] === currentUser.id && c.participantIds[1] === currentUser.id)
          : c.participantIds.includes(targetUserId))
    );
    if (existing) {
      setActiveConversationId(existing.id);
    } else {
      const newConvId = `conv-${Date.now()}`;
      const newConv: Conversation = {
        id: newConvId,
        participantIds: isSelf ? [currentUser.id] : [currentUser.id, targetUserId],
        updatedAt: new Date().toISOString(),
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConvId);
    }
    setActiveTab('messages');
  };

  // Push Notifications
  const unreadNotificationsCount = notifications.filter(
    (n) => n.userId === currentUserId && !n.isRead
  ).length;

  const markAllNotificationsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => (n.userId === currentUserId ? { ...n, isRead: true } : n))
    );
  };

  const requestPushPermission = async (): Promise<boolean> => {
    if (typeof Notification === 'undefined') {
      showToast(lang === 'bn' ? 'ব্রাউজার নোটিফিকেশন সাপোর্ট করে না।' : 'Browser does not support notifications.');
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      setPushPermissionStatus(permission);
      if (permission === 'granted') {
        showToast(lang === 'bn' ? 'পুশ নোটিফিকেশন সফলভাবে সক্রিয় হয়েছে! 🔔' : 'Push notifications enabled! 🔔');
        new Notification('Social Media App', {
          body: lang === 'bn' ? 'আপনি নতুন নোটিফিকেশন ও চ্যাট মেসেজ পাওয়ার জন্য প্রস্তুত।' : 'You are now ready to receive live updates & messages!',
          icon: '/favicon.ico',
        });
        return true;
      } else {
        showToast(lang === 'bn' ? 'পুশ নোটিফিকেশন অনুমতি দেওয়া হয়নি।' : 'Push notification permission denied.');
        return false;
      }
    } catch {
      return false;
    }
  };

  const sendInAppNotification = (notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    setNotifications((prev) => [newNotif, ...prev]);

    // Play subtle audio chime if enabled and recipient is active user
    if (soundEnabled && notif.userId === currentUserId) {
      playChime();
    }

    // Trigger browser Web Push if recipient is logged in user and permission granted
    if (
      notif.userId === currentUserId &&
      typeof Notification !== 'undefined' &&
      Notification.permission === 'granted'
    ) {
      try {
        new Notification(`${notif.actorName}`, {
          body: notif.text,
          icon: notif.actorAvatar,
        });
      } catch {
        // notification error catch
      }
    }
  };

  // Admin Actions
  const adminBanUser = (userId: string, banStatus: boolean) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isBanned: banStatus } : u))
    );
    showToast(
      banStatus
        ? lang === 'bn' ? 'ব্যবহারকারীকে ব্যান (Ban) করা হয়েছে।' : 'User has been banned.'
        : lang === 'bn' ? 'ব্যবহারকারীকে আনব্যান (Unban) করা হয়েছে।' : 'User unbanned.'
    );
  };

  const adminChangeRole = (userId: string, role: UserRole) => {
    // Single Admin Model: Never delegate admin role to any other account
    if (role === 'admin') {
      showToast(
        lang === 'bn'
          ? 'একক অ্যাডমিন মডেলের অধীনে অন্য কাউকে অ্যাডমিন রোল প্রদান করা নিষিদ্ধ।'
          : 'Under the Single Admin Model, admin role cannot be delegated.'
      );
      return;
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role } : u))
    );
    showToast(lang === 'bn' ? `ব্যবহারকারীর রোল পরিবর্তন করে ${role.toUpperCase()} করা হয়েছে।` : `Role updated to ${role.toUpperCase()}.`);
  };

  const adminDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setPosts((prev) => prev.filter((p) => p.authorId !== userId));
    showToast(lang === 'bn' ? 'ব্যবহারকারী এবং তার পোস্টসমূহ সফলভাবে ডিলিট করা হয়েছে।' : 'User and associated posts deleted.');
  };

  const adminBroadcastNotification = (title: string, messageText: string) => {
    adminSendNotification('all', title, messageText);
  };

  // Admin Notification: send to all OR targeted username
  const adminSendNotification = (target: 'all' | string, title: string, messageText: string) => {
    if (target === 'all') {
      users.forEach((u) => {
        sendInAppNotification({
          userId: u.id,
          actorId: currentUser?.id || 'admin',
          actorName: '📢 Platform Admin',
          actorUsername: 'admin_broadcast',
          actorAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
          type: 'system',
          text: `${title}: ${messageText}`,
        });
      });
      showToast(lang === 'bn' ? 'সকল ব্যবহারকারীর কাছে নোটিফিকেশন পাঠানো হয়েছে!' : 'Broadcast sent to all users!');
    } else {
      const clean = target.trim().toLowerCase().replace(/^@/, '');
      const targetUser = users.find((u) => u.username.toLowerCase() === clean);
      if (!targetUser) {
        showToast(lang === 'bn' ? `ইউজারনেম @${clean} পাওয়া যায়নি!` : `User @${clean} not found!`);
        return;
      }
      sendInAppNotification({
        userId: targetUser.id,
        actorId: currentUser?.id || 'admin',
        actorName: '📢 Platform Admin (Direct Notice)',
        actorUsername: 'admin_notice',
        actorAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
        type: 'system',
        text: `${title}: ${messageText}`,
      });
      showToast(lang === 'bn' ? `@${targetUser.username} এর কাছে নোটিশ পাঠানো হয়েছে!` : `Notice sent to @${targetUser.username}!`);
    }
  };

  // Admin Master Override: update ANY user data directly
  const adminUpdateAnyUser = (userId: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
    );
    showToast(lang === 'bn' ? 'ইউজারের সমস্ত তথ্য সফলভাবে অ্যাডমিন কর্তৃক পরিবর্তিত হয়েছে!' : 'User details successfully updated by Admin!');
  };

  // 1 Million Community Users Engine: High-performance, crash-free delivery with USER-0000000001 up to USER-1000000000 series
  const adminSendBotFollowers = (
    targetUsername: string,
    count: number
  ): { success: boolean; addedCount: number; message: string } => {
    const clean = targetUsername.trim().toLowerCase().replace(/^@/, '');
    const targetUser = users.find((u) => u.username.toLowerCase() === clean);
    if (!targetUser) {
      return {
        success: false,
        addedCount: 0,
        message: lang === 'bn' ? 'টার্গেট ইউজারনেম খুঁজে পাওয়া যায়নি।' : 'Target username not found.',
      };
    }

    const safeCount = Math.min(Math.max(1, count), 1000000);
    const newCommunityUsers: User[] = [];
    const newFollowerIds: string[] = [];

    // Realistic community profile pictures
    const userPhotos = [
      '1534528741775-53994a69daeb',
      '1507003211169-0a1dd7228f2d',
      '1494790108377-be9c29b29330',
      '1500648767791-00dcc994a43e',
      '1517841905240-472988babdf9',
      '1539571696357-5a69c17a67c6',
      '1524504388940-b1c1722653e1',
      '1506794778202-cad84cf45f1d',
      '1519085360753-af0119f7cbe7',
      '1492562080023-ab3db95bfbce',
      '1544005313-94ddf0286df2',
      '1522075469751-3a6694fb2f61',
    ];

    const communityBios = [
      'Digital creator & community enthusiast ✨ Exploring 1 social network.',
      'Passionate 1 social member 🌟 Sharing inspiration, lifestyle and ideas.',
      'Connecting with awesome creators worldwide 🌍 Let\'s grow together!',
      'Photography & minimalist aesthetics lover 📸 Welcome to my profile!',
      'Living life with curiosity & spreading positivity everyday ✨',
      'Tech explorer, visual storyteller & 1 social verified member 🚀',
      'Always learning, building networks, and creating memorable moments 💡',
      'Content creator & lifestyle blogger ✨ Proud to be on 1 social.',
    ];

    // Generate up to 20 representative sample accounts to avoid memory bloat and keep UI instant
    const sampleCount = Math.min(safeCount, 20);
    const baseUserIndex = botPoolSent;
    for (let i = 0; i < sampleCount; i++) {
      const userNum = ((baseUserIndex + i) % 1000000) + 1;
      const communityUser = generateUniqueBilingualUser(userNum, targetUser.id);
      newCommunityUsers.push(communityUser);
      newFollowerIds.push(communityUser.id);
    }

    const currentTotal = targetUser.followerCount ?? targetUser.followers.length;
    const newTotal = currentTotal + safeCount;

    setUsers((prev) => {
      const updated = prev.map((u) => {
        if (u.id === targetUser.id) {
          // Keep a bounded sample of follower IDs (up to 50) for fast avatar rendering
          const combined = Array.from(new Set([...u.followers, ...newFollowerIds])).slice(-50);
          return {
            ...u,
            followerCount: newTotal,
            followers: combined,
          };
        }
        return u;
      });
      // Append sample users without exceeding sensible array lengths
      const existingIds = new Set(updated.map((u) => u.id));
      const freshUsers = newCommunityUsers.filter((u) => !existingIds.has(u.id));
      return [...updated, ...freshUsers];
    });

    setBotPoolSent((prev) => prev + safeCount);

    sendInAppNotification({
      userId: targetUser.id,
      actorId: 'admin',
      actorName: '🚀 1 social Community Network',
      actorUsername: 'community_network',
      actorAvatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80',
      type: 'system',
      text:
        lang === 'bn'
          ? `অভিনন্দন! আপনার প্রোফাইলে +${safeCount.toLocaleString()} জন নতুন ইউজার ফলোয়ার যুক্ত হয়েছে!`
          : `Congratulations! +${safeCount.toLocaleString()} new community users followed your profile!`,
    });

    return {
      success: true,
      addedCount: safeCount,
      message:
        lang === 'bn'
          ? `@${targetUser.username} এর অ্যাকাউন্টে ${safeCount.toLocaleString()} জন ইউজার ফলোয়ার (USER-0000000001 সিরিজ) সফলভাবে যোগ করা হয়েছে!`
          : `Successfully sent ${safeCount.toLocaleString()} community users to @${targetUser.username}!`,
    };
  };

  // Admin Auto Likes with Post URL or ID (High-performance, crash-free)
  const adminSendAutoLikes = (
    postIdentifier: string,
    count: number
  ): { success: boolean; addedCount: number; message: string } => {
    let postId = postIdentifier.trim();
    if (postId.includes('post=')) {
      const match = postId.match(/post=([a-zA-Z0-9_-]+)/);
      if (match) postId = match[1];
    } else if (postId.includes('/post/')) {
      const parts = postId.split('/post/');
      if (parts[1]) postId = parts[1].split(/[?#]/)[0];
    }

    const targetPost = posts.find(
      (p) => p.id === postId || p.id.toLowerCase() === postId.toLowerCase()
    );
    if (!targetPost) {
      return {
        success: false,
        addedCount: 0,
        message: lang === 'bn' ? 'পোস্ট খুঁজে পাওয়া যায়নি! সঠিক পোস্ট লিঙ্ক বা আইডি দিন।' : 'Post not found! Check post link or ID.',
      };
    }

    const safeCount = Math.min(Math.max(1, count), 100000);
    const sampleLikes = Array.from({ length: Math.min(safeCount, 20) }, (_, i) => `user-like-${Date.now()}-${i}`);
    const currentLikes = targetPost.likesCount ?? targetPost.likes.length;
    const newTotalLikes = currentLikes + safeCount;

    setPosts((prev) =>
      prev.map((p) =>
        p.id === targetPost.id
          ? {
              ...p,
              likesCount: newTotalLikes,
              likes: Array.from(new Set([...p.likes, ...sampleLikes])).slice(-50),
            }
          : p
      )
    );

    return {
      success: true,
      addedCount: safeCount,
      message:
        lang === 'bn'
          ? `পোস্টে সফলভাবে ${safeCount.toLocaleString()} টি লাইক যুক্ত করা হয়েছে!`
          : `Successfully added ${safeCount.toLocaleString()} likes to post!`,
    };
  };

  // Admin Auto Comments with Post URL or ID
  const adminSendAutoComments = (
    postIdentifier: string,
    count: number,
    customCommentText?: string
  ): { success: boolean; addedCount: number; message: string } => {
    let postId = postIdentifier.trim();
    if (postId.includes('post=')) {
      const match = postId.match(/post=([a-zA-Z0-9_-]+)/);
      if (match) postId = match[1];
    } else if (postId.includes('/post/')) {
      const parts = postId.split('/post/');
      if (parts[1]) postId = parts[1].split(/[?#]/)[0];
    }

    const targetPost = posts.find(
      (p) => p.id === postId || p.id.toLowerCase() === postId.toLowerCase()
    );
    if (!targetPost) {
      return {
        success: false,
        addedCount: 0,
        message: lang === 'bn' ? 'পোস্ট খুঁজে পাওয়া যায়নি! সঠিক পোস্ট লিঙ্ক বা আইডি দিন।' : 'Post not found! Check post link or ID.',
      };
    }

    const templates = [
      'Amazing post! Really insightful 🔥',
      'অসাধারণ কাজ! আপনার কনটেন্ট সবসময় সেরা 👏',
      'Quality & aesthetics are top-tier ✨',
      'Love the presentation! Keep rocking 🚀',
      'দারুণ পোস্ট! অনেক ভালো লাগলো 🙌',
      'Clean interface and inspiring message! 💯',
    ];

    const safeCount = Math.min(Math.max(1, count), 100);
    const newComments: PostComment[] = [];

    for (let i = 0; i < safeCount; i++) {
      const userNum = ((botPoolSent + i) % 1000000) + 1;
      const commenter = generateUniqueBilingualUser(userNum);
      const text =
        customCommentText && customCommentText.trim()
          ? customCommentText.trim()
          : templates[i % templates.length];

      newComments.push({
        id: `cm-user-${Date.now()}-${i}-${userNum}`,
        postId: targetPost.id,
        authorId: commenter.id,
        authorName: commenter.fullName,
        authorUsername: commenter.username,
        authorAvatar: commenter.avatar,
        content: text,
        createdAt: new Date().toISOString(),
        likes: [],
      });
    }

    setPosts((prev) =>
      prev.map((p) =>
        p.id === targetPost.id
          ? { ...p, comments: [...p.comments, ...newComments] }
          : p
      )
    );

    return {
      success: true,
      addedCount: safeCount,
      message:
        lang === 'bn'
          ? `পোস্টে সফলভাবে ${safeCount} টি কমেন্ট পোস্ট করা হয়েছে!`
          : `Successfully added ${safeCount} comments to post!`,
    };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isFirebaseAdmin,
        users,
        loggedInUserIds,
        recordLoggedInUser,
        removeLoggedInAccount,
        login,
        register,
        logout,
        switchUser,
        updateProfile,
        toggleFollow,
        changeEmailAndPassword,
        resetPasswordByUsernameOrEmail,
        verificationRequests,
        requestVerification,
        adminApproveVerification,
        adminRejectVerification,
        totalCommunityUsers,
        realtimeActiveUsers,
        botPoolTotal,
        botPoolSent,
        adminSendBotFollowers,
        adminSendAutoLikes,
        adminSendAutoComments,
        posts,
        createPost,
        editPost,
        deletePost,
        toggleLikePost,
        toggleSavePost,
        addComment,
        sharePost,
        flagPost,
        restorePost,
        conversations,
        messages,
        activeConversationId,
        setActiveConversationId,
        sendMessage,
        startOrOpenChatWithUser,
        notifications,
        unreadNotificationsCount,
        markAllNotificationsRead,
        requestPushPermission,
        pushPermissionStatus,
        sendInAppNotification,
        soundEnabled,
        setSoundEnabled,
        adminBanUser,
        adminChangeRole,
        adminDeleteUser,
        adminBroadcastNotification,
        adminSendNotification,
        adminUpdateAnyUser,
        searchQuery,
        setSearchQuery,
        activeTab,
        setActiveTab,
        selectedUserProfileId,
        setSelectedUserProfileId,
        darkMode,
        toggleDarkMode,
        lang,
        toggleLang,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isVercelModalOpen,
        setIsVercelModalOpen,
        isEditProfileModalOpen,
        setIsEditProfileModalOpen,
        editingPost,
        setEditingPost,
        sharingPost,
        setSharingPost,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
