import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  User,
  Post,
  Message,
  Conversation,
  AppNotification,
  PhotoFilter,
  UserRole,
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
  login: (email: string) => boolean;
  register: (email: string, username: string, fullName: string) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
  updateProfile: (data: Partial<User>) => void;
  toggleFollow: (targetUserId: string) => void;

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
  const login = (email: string): boolean => {
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      if (found.isBanned) {
        showToast(lang === 'bn' ? 'আপনার অ্যাকাউন্টটি স্থগিত (Banned) করা হয়েছে।' : 'Your account has been banned.');
        return false;
      }
      setCurrentUserId(found.id);
      showToast(lang === 'bn' ? `স্বাগতম, ${found.fullName}!` : `Welcome back, ${found.fullName}!`);
      setIsAuthModalOpen(false);
      return true;
    }
    // Auto register demo if unknown email
    const newUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_') + Math.floor(Math.random() * 90 + 10);
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      username: newUsername,
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

  const register = (email: string, username: string, fullName: string): boolean => {
    const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === username.toLowerCase());
    if (exists) {
      showToast(lang === 'bn' ? 'এই ইমেইল অথবা ইউজারনেম ইতোমধ্যে ব্যবহৃত হচ্ছে।' : 'Email or username already in use.');
      return false;
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      username: username.toLowerCase().replace(/[^a-zA-Z0-9_]/g, ''),
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
    // switch to first available user or keep current session
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUserId(target.id);
      showToast(lang === 'bn' ? `ইউজার পরিবর্তন: ${target.fullName}` : `Switched user to: ${target.fullName}`);
    }
  };

  const updateProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, ...data } : u))
    );
    showToast(lang === 'bn' ? 'প্রোফাইল সফলভাবে আপডেট হয়েছে!' : 'Profile updated successfully!');
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
    showToast(lang === 'bn' ? 'সকল ব্যবহারকারীর কাছে নোটিফিকেশন ব্রডকাস্ট করা হয়েছে!' : 'Broadcast notification sent to all users!');
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
