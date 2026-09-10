import { User, Post, Message, Conversation, AppNotification, TrendingTag } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'UI28ofvzB7cjNJvCG0DvYgbCu9J3',
    email: 'soheltajbhola@gmail.com',
    username: 'shoheltaj',
    usernameChangeCount: 0,
    fullName: 'Shohel Taj',
    fullNameBn: 'সোহেল তাজ',
    fullNameEn: 'Shohel Taj',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    bio: 'Platform Lead & Creator. Building next-gen web applications and connecting communities across the globe 🚀',
    bioBn: 'প্ল্যাটফর্ম ক্রিয়েটর ও লিড ইঞ্জিনিয়ার। বিশ্বজুড়ে ১ সোশ্যাল কমিউনিটিকে সংযুক্ত করছি 🚀',
    location: 'Dhaka, Bangladesh',
    website: 'https://techlystb.blogspot.com',
    links: [
      { id: 'l-1', title: 'Tech Blog', url: 'https://techlystb.blogspot.com' },
      { id: 'l-2', title: 'Portfolio', url: 'https://techlystb.blogspot.com' },
    ],
    statusBadge: '🛡️ Platform Admin',
    role: 'admin',
    isVerified: true,
    verified: true,
    isVip: true,
    badge: 'VIP',
    isBanned: false,
    followers: ['wPLUJFA9M8QBCvPL11Q1CZvhL7G3'],
    following: ['wPLUJFA9M8QBCvPL11Q1CZvhL7G3'],
    followersCount: 1,
    followingCount: 1,
    postsCount: 1,
    createdAt: '2024-01-15T09:00:00Z',
    lastActive: new Date().toISOString(),
  },
  {
    id: 'wPLUJFA9M8QBCvPL11Q1CZvhL7G3',
    email: 'admin2@1social.com',
    username: 'admin_wplu',
    usernameChangeCount: 0,
    fullName: 'Admin Partner',
    fullNameBn: 'অ্যাডমিন',
    fullNameEn: 'Admin Partner',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    bio: 'Platform Co-Admin & Security Supervisor 🛡️',
    bioBn: 'প্ল্যাটফর্ম কো-অ্যাডমিন ও সিকিউরিটি সুপারভাইজার 🛡️',
    location: 'Dhaka, Bangladesh',
    website: 'https://techlystb.blogspot.com',
    links: [
      { id: 'l-adm-1', title: 'Portal', url: 'https://techlystb.blogspot.com' },
    ],
    statusBadge: '🛡️ Platform Admin',
    role: 'admin',
    isVerified: true,
    verified: true,
    isVip: true,
    badge: 'VIP',
    isBanned: false,
    followers: ['UI28ofvzB7cjNJvCG0DvYgbCu9J3'],
    following: ['UI28ofvzB7cjNJvCG0DvYgbCu9J3'],
    followersCount: 1,
    followingCount: 1,
    postsCount: 0,
    createdAt: '2024-02-01T10:00:00Z',
    lastActive: new Date().toISOString(),
  },
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-launch-1',
    authorId: 'UI28ofvzB7cjNJvCG0DvYgbCu9J3',
    authorName: 'Shohel Taj',
    authorUsername: 'shoheltaj',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    isVerified: true,
    content: '🎉 Welcome to 1Social! Authentic community platform connecting registered real creators and verified members. Real-time chat, cloud storage and audio/video calling enabled 💬🔥',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80',
    filter: 'vibrant',
    tags: ['community', 'launch', 'tech', 'innovation', 'bangladesh'],
    location: 'Dhaka, Bangladesh',
    createdAt: '2026-09-07T08:00:00Z',
    likes: ['wPLUJFA9M8QBCvPL11Q1CZvhL7G3'],
    savedBy: ['wPLUJFA9M8QBCvPL11Q1CZvhL7G3'],
    comments: [
      {
        id: 'c-admin-1',
        postId: 'post-launch-1',
        authorId: 'wPLUJFA9M8QBCvPL11Q1CZvhL7G3',
        authorName: 'Admin Partner',
        authorUsername: 'admin_wplu',
        authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
        content: 'System security and Real User database rules verified. Ready for authentic users!',
        createdAt: '2026-09-07T08:30:00Z',
        likes: ['UI28ofvzB7cjNJvCG0DvYgbCu9J3'],
      },
    ],
    sharesCount: 5,
  },
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-admins',
    participantIds: ['UI28ofvzB7cjNJvCG0DvYgbCu9J3', 'wPLUJFA9M8QBCvPL11Q1CZvhL7G3'],
    lastMessage: {
      id: 'm-adm-1',
      conversationId: 'conv-admins',
      senderId: 'wPLUJFA9M8QBCvPL11Q1CZvhL7G3',
      receiverId: 'UI28ofvzB7cjNJvCG0DvYgbCu9J3',
      text: 'Security rules and real user database structure fully deployed.',
      createdAt: '2026-09-07T18:15:00Z',
      isRead: true,
    },
    updatedAt: '2026-09-07T18:15:00Z',
  },
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm-adm-1',
    conversationId: 'conv-admins',
    senderId: 'wPLUJFA9M8QBCvPL11Q1CZvhL7G3',
    receiverId: 'UI28ofvzB7cjNJvCG0DvYgbCu9J3',
    text: 'Security rules and real user database structure fully deployed.',
    createdAt: '2026-09-07T18:15:00Z',
    isRead: true,
  },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-sys-admin',
    userId: 'UI28ofvzB7cjNJvCG0DvYgbCu9J3',
    actorId: 'system',
    actorName: 'System Security',
    actorUsername: 'system',
    actorAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
    type: 'system',
    text: 'Real User Only security policy is active. Zero bot / fake accounts allowed.',
    isRead: true,
    createdAt: '2026-09-07T09:00:00Z',
  },
];

export const TRENDING_TAGS: TrendingTag[] = [
  { tag: 'photography', postsCount: 1420, category: 'Visual Arts' },
  { tag: 'bangladesh', postsCount: 980, category: 'Community' },
  { tag: 'tech', postsCount: 840, category: 'Technology' },
  { tag: 'sunset', postsCount: 650, category: 'Nature' },
  { tag: 'coding', postsCount: 520, category: 'Software' },
  { tag: 'travel', postsCount: 470, category: 'Lifestyle' },
  { tag: 'sajek', postsCount: 310, category: 'Tourism' },
];

export const SAMPLE_POST_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1516245834210-c4c142787335?w=1000&auto=format&fit=crop&q=80',
    label: 'Cryptocurrency & Tech',
  },
  {
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop&q=80',
    label: 'Mountain Reflections',
  },
  {
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&auto=format&fit=crop&q=80',
    label: 'Modern Architecture',
  },
  {
    url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1000&auto=format&fit=crop&q=80',
    label: 'Gourmet Cuisine',
  },
  {
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80',
    label: 'AI & Circuitry',
  },
  {
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1000&auto=format&fit=crop&q=80',
    label: 'Galaxy & Stars',
  },
];
