export type UserRole = 'admin' | 'moderator' | 'user';

export interface ProfileLink {
  id: string;
  title: string;
  url: string;
}

export interface User {
  id: string;
  email: string;
  password?: string;
  username: string;
  usernameChangeCount?: number; // Maximum 10 times for regular users
  fullName: string;
  avatar: string;
  coverImage: string;
  bio: string;
  location?: string;
  website?: string;
  links?: ProfileLink[]; // Up to 10 links
  statusBadge?: string;
  role: UserRole;
  isVerified: boolean;
  isVip?: boolean;
  badge?: 'VIP' | 'Verified' | 'None';
  isBanned: boolean;
  isBot?: boolean;
  followers: string[]; // user IDs
  following: string[]; // user IDs
  createdAt: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  avatar: string;
  type: 'Verify' | 'VIP';
  reason: string;
  socialLink?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export type PhotoFilter = 'normal' | 'vintage' | 'monochrome' | 'vibrant' | 'warm' | 'cyberpunk';

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes: string[];
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  isVerified?: boolean;
  content: string;
  imageUrl?: string;
  filter?: PhotoFilter;
  tags: string[];
  location?: string;
  createdAt: string;
  updatedAt?: string;
  likes: string[]; // user IDs
  savedBy: string[]; // user IDs
  comments: PostComment[];
  sharesCount: number;
  isFlagged?: boolean;
  flagReason?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  imageUrl?: string;
  createdAt: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage?: Message;
  updatedAt: string;
}

export type NotificationType = 'like' | 'comment' | 'follow' | 'message' | 'system' | 'share';

export interface AppNotification {
  id: string;
  userId: string;
  actorId: string;
  actorName: string;
  actorUsername: string;
  actorAvatar: string;
  type: NotificationType;
  text: string;
  postId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface TrendingTag {
  tag: string;
  postsCount: number;
  category: string;
}
