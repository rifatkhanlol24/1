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
  name?: string;
  fullName: string;
  fullNameBn?: string;
  fullNameEn?: string;
  avatar: string;
  profileImage?: string;
  coverImage: string;
  bio: string;
  bioBn?: string;
  location?: string;
  website?: string;
  links?: ProfileLink[]; // Up to 10 links
  statusBadge?: string;
  role: UserRole;
  status?: string;
  verified?: boolean;
  isVerified: boolean;
  isVip?: boolean;
  badge?: 'VIP' | 'Verified' | 'None';
  isBanned: boolean;
  isBot?: boolean;
  followerCount?: number;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  followers: string[]; // user IDs
  following: string[]; // user IDs
  createdAt: string;
  lastActive?: string;
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
  image?: string;
  filter?: PhotoFilter;
  tags: string[];
  location?: string;
  createdAt: string;
  updatedAt?: string;
  likes: string[]; // user IDs
  likesCount?: number;
  savedBy: string[]; // user IDs
  comments: PostComment[];
  commentsCount?: number;
  sharesCount: number;
  isFlagged?: boolean;
  flagReason?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  chatId?: string;
  senderId: string;
  senderUid?: string;
  receiverId: string;
  receiverUid?: string;
  text: string;
  imageUrl?: string;
  createdAt: string;
  isRead: boolean;
  seen?: boolean;
  delivered?: boolean;
  type?: 'text' | 'image';
  deletedFor?: Record<string, boolean>;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participants?: Record<string, boolean>;
  participant1?: string;
  participant2?: string;
  lastMessage?: Message;
  lastMessageAt?: string;
  lastSenderId?: string;
  unreadCounts?: Record<string, number>;
  deletedBy?: Record<string, boolean>;
  updatedAt: string;
}

export type CallType = 'audio' | 'video';
export type CallStatus = 'ringing' | 'accepted' | 'rejected' | 'ended' | 'missed';

export interface CallSession {
  callId: string;
  callerUid: string;
  receiverUid: string;
  callerName: string;
  callerAvatar: string;
  receiverName: string;
  receiverAvatar: string;
  callType: CallType;
  status: CallStatus;
  offer?: any;
  answer?: any;
  createdAt: string;
  acceptedAt?: string;
  endedAt?: string;
  duration?: number;
}

export interface CallHistoryItem {
  id?: string;
  callId: string;
  callerUid: string;
  callerName: string;
  callerAvatar: string;
  receiverUid: string;
  receiverName: string;
  receiverAvatar: string;
  callType: CallType;
  status: CallStatus;
  duration: number;
  createdAt: string;
}

export interface UserPresence {
  online: boolean;
  lastSeen?: string;
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
