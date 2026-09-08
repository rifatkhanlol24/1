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
  users: User[];
  login: (emailOrUsername: string, password?: string) => boolean;
  register: (email: string, username: string, fullName: string, password?: string) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
  updateProfile: (data: Partial<User>) => void;
  toggleFollow: (targetUserId: string) => void;
  changeEmailAndPassword: (newEmail: string, newPassword?: string) => boolean;
  resetPasswordByUsernameOrEmail: (identifier: string, newPassword: string) => { success: boolean; message: string };

  // Verification
  verificationRequests: VerificationRequest[];
  requestVerification: (type: 'Verify' | 'VIP', reason: string, socialLink?: string) => void;
  adminApproveVerification: (requestId: string) => void;
  adminRejectVerification: (requestId: string) => void;

  // Bot Engine & Growth Automation
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

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Persistence Helpers
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('vc_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem('vc_current_user_id');
    return saved || 'user-admin';
  });

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

  const [activeTab, setActiveTab] = useState<NavigationTab>('feed');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [selectedUserProfileId, setSelectedUserProfileId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1 Million Bot Pool Stats
  const botPoolTotal = 1000000;
  const [botPoolSent, setBotPoolSent] = useState<number>(() => {
    const saved = localStorage.getItem('vc_bot_sent');
    return saved ? parseInt(saved, 10) : 48500;
  });

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

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('vc_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('vc_current_user_id', currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('vc_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('vc_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('vc_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('vc_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('vc_verification_reqs', JSON.stringify(verificationRequests));
  }, [verificationRequests]);

  useEffect(() => {
    localStorage.setItem('vc_bot_sent', String(botPoolSent));
  }, [botPoolSent]);

  useEffect(() => {
    localStorage.setItem('vc_dark_mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('vc_lang', lang);
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

  const currentUser = users.find((u) => u.id === currentUserId) || users[0] || null;

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
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80`,
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
    showToast(lang === 'bn' ? 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!' : 'Account created successfully!');
    setIsAuthModalOpen(false);
    return true;
  };

  const register = (email: string, username: string, fullName: string, password?: string): boolean => {
    const exists = users.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() ||
        u.username.toLowerCase() === username.toLowerCase()
    );
    if (exists) {
      showToast(lang === 'bn' ? 'এই ইমেইল অথবা ইউজারনেম ইতোমধ্যে ব্যবহৃত হচ্ছে।' : 'Email or username already in use.');
      return false;
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      password: password || 'password123',
      username: username.toLowerCase().replace(/[^a-zA-Z0-9_]/g, ''),
      usernameChangeCount: 0,
      fullName: fullName.trim(),
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80`,
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
    showToast(lang === 'bn' ? `স্বাগতম ${fullName}! অ্যাকাউন্ট তৈরি সম্পন্ন।` : `Welcome ${fullName}! Account created.`);
    setIsAuthModalOpen(false);
    return true;
  };

  const logout = () => {
    showToast(lang === 'bn' ? 'লগআউট সফল হয়েছে।' : 'Logged out successfully.');
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUserId(target.id);
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
  const updateProfile = (data: Partial<User>) => {
    if (!currentUser) return;

    let finalData = { ...data };

    // Check if username is being changed
    if (
      finalData.username &&
      finalData.username.toLowerCase() !== currentUser.username.toLowerCase()
    ) {
      const currentCount = currentUser.usernameChangeCount || 0;
      if (currentCount >= 10 && currentUser.role !== 'admin') {
        showToast(
          lang === 'bn'
            ? 'আপনি ইতিমধ্যে ১০ বার ইউজারনেম পরিবর্তন করেছেন। আর পরিবর্তন করা সম্ভব নয়!'
            : 'You have already changed your username 10 times. Maximum limit reached!'
        );
        return;
      }
      const cleanUsername = finalData.username
        .toLowerCase()
        .replace(/[^a-zA-Z0-9_]/g, '');
      if (cleanUsername.length < 3) {
        showToast(
          lang === 'bn' ? 'ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে।' : 'Username must be at least 3 characters.'
        );
        return;
      }
      const isTaken = users.some(
        (u) => u.id !== currentUser.id && u.username.toLowerCase() === cleanUsername
      );
      if (isTaken) {
        showToast(
          lang === 'bn' ? 'এই ইউজারনেমটি ইতিমধ্যে অন্য কেউ ব্যবহার করছেন।' : 'This username is already taken.'
        );
        return;
      }

      finalData.username = cleanUsername;
      if (currentUser.role !== 'admin') {
        finalData.usernameChangeCount = currentCount + 1;
      }
    }

    // Limit links to 10 max
    if (finalData.links && finalData.links.length > 10) {
      finalData.links = finalData.links.slice(0, 10);
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, ...finalData } : u))
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
    } else {
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
    if (!currentUser || targetUserId === currentUser.id) return;
    const existing = conversations.find(
      (c) =>
        c.participantIds.includes(currentUser.id) &&
        c.participantIds.includes(targetUserId)
    );
    if (existing) {
      setActiveConversationId(existing.id);
    } else {
      const newConvId = `conv-${Date.now()}`;
      const newConv: Conversation = {
        id: newConvId,
        participantIds: [currentUser.id, targetUserId],
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
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role } : u))
    );
    showToast(lang === 'bn' ? `ব্যবহারকারীর রোল পরিবর্তন করে ${role} করা হয়েছে।` : `Role updated to ${role}.`);
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

  // 1 Million Bot Engine: Send followers with default blogspot link
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

    const safeCount = Math.min(Math.max(1, count), 100000);
    const newBots: User[] = [];
    const newFollowerIds: string[] = [];

    // Bot avatars pool
    const botPhotos = [
      '1534528741775-53994a69daeb',
      '1507003211169-0a1dd7228f2d',
      '1494790108377-be9c29b29330',
      '1500648767791-00dcc994a43e',
      '1517841905240-472988babdf9',
      '1539571696357-5a69c17a67c6',
    ];

    for (let i = 0; i < Math.min(safeCount, 25); i++) {
      const rand = Math.floor(10000 + Math.random() * 90000);
      const photoId = botPhotos[i % botPhotos.length];
      const botId = `bot-${Date.now()}-${i}-${rand}`;
      newBots.push({
        id: botId,
        email: `bot_${rand}@techlystb.com`,
        username: `bot_tech_${rand}`,
        fullName: `AI Booster #${rand % 1000}`,
        avatar: `https://images.unsplash.com/photo-${photoId}?w=200&auto=format&fit=crop&q=80`,
        coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        bio: 'Official bot booster account 🤖 Powered by TechLystB & 1 social',
        website: 'https://techlystb.blogspot.com',
        links: [{ id: `b-l-${i}-1`, title: 'Tech Lyst B', url: 'https://techlystb.blogspot.com' }],
        role: 'user',
        isVerified: false,
        isBanned: false,
        isBot: true,
        followers: [],
        following: [targetUser.id],
        createdAt: new Date().toISOString(),
      });
      newFollowerIds.push(botId);
    }

    // For any remaining up to safeCount, generate mock follower IDs
    for (let i = newFollowerIds.length; i < safeCount; i++) {
      newFollowerIds.push(`bot-id-${Date.now()}-${i}`);
    }

    setUsers((prev) => {
      const updated = prev.map((u) => {
        if (u.id === targetUser.id) {
          return {
            ...u,
            followers: [...new Set([...u.followers, ...newFollowerIds])],
          };
        }
        return u;
      });
      return [...updated, ...newBots];
    });

    setBotPoolSent((prev) => prev + safeCount);

    sendInAppNotification({
      userId: targetUser.id,
      actorId: 'admin',
      actorName: '🚀 1 social Growth Booster',
      actorUsername: 'bot_booster',
      actorAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
      type: 'system',
      text:
        lang === 'bn'
          ? `অভিনন্দন! আপনার প্রোফাইলে +${safeCount.toLocaleString()} টি নতুন ফলোয়ার যুক্ত হয়েছে!`
          : `Congratulations! +${safeCount.toLocaleString()} new followers added to your profile!`,
    });

    return {
      success: true,
      addedCount: safeCount,
      message:
        lang === 'bn'
          ? `@${targetUser.username} এর অ্যাকাউন্টে ${safeCount.toLocaleString()} টি বট ফলোয়ার সফলভাবে যোগ করা হয়েছে!`
          : `Successfully sent ${safeCount.toLocaleString()} bot followers to @${targetUser.username}!`,
    };
  };

  // Admin Auto Likes with Post URL or ID
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

    const safeCount = Math.min(Math.max(1, count), 25000);
    const botLikes: string[] = [];
    for (let i = 0; i < safeCount; i++) {
      botLikes.push(`bot-liker-${Date.now()}-${i}`);
    }

    setPosts((prev) =>
      prev.map((p) =>
        p.id === targetPost.id
          ? { ...p, likes: [...new Set([...p.likes, ...botLikes])] }
          : p
      )
    );

    return {
      success: true,
      addedCount: safeCount,
      message:
        lang === 'bn'
          ? `পোস্টে সফলভাবে ${safeCount.toLocaleString()} টি অটো লাইক যুক্ত করা হয়েছে!`
          : `Successfully added ${safeCount.toLocaleString()} auto likes to post!`,
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
      const rand = Math.floor(1000 + Math.random() * 9000);
      const text =
        customCommentText && customCommentText.trim()
          ? customCommentText.trim()
          : templates[i % templates.length];

      newComments.push({
        id: `bot-cm-${Date.now()}-${i}-${rand}`,
        postId: targetPost.id,
        authorId: `bot-user-${rand}`,
        authorName: `Bot Member #${rand % 400}`,
        authorUsername: `bot_vibes_${rand}`,
        authorAvatar: `https://images.unsplash.com/photo-${1534528741775 + (rand % 10000)}?w=200&auto=format&fit=crop&q=80`,
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
          ? `পোস্টে সফলভাবে ${safeCount} টি অটো কমেন্ট পোস্ট করা হয়েছে!`
          : `Successfully added ${safeCount} auto comments to post!`,
    };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
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
