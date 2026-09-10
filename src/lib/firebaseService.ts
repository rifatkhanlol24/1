import {
  ref,
  get,
  set,
  update,
  remove,
  onValue,
  query,
  limitToFirst,
  Unsubscribe,
} from 'firebase/database';
import { rtdb } from './firebase';
import { User, Post, Message, AppNotification } from '../types';

// Realtime Database Paths
const USERS_PATH = 'users';
const POSTS_PATH = 'posts';
const MESSAGES_PATH = 'messages';
const NOTIFS_PATH = 'notifications';

// Helper to remove undefined properties which RTDB rejects
function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        clean[key] = sanitizeObject(value);
      } else {
        clean[key] = value;
      }
    }
  }
  return clean as T;
}

export const firebaseService = {
  // Check connection status to Firebase Realtime Database
  async checkConnection(): Promise<{ success: boolean; message: string; timestamp: string }> {
    try {
      const usersRef = query(ref(rtdb, USERS_PATH), limitToFirst(1));
      await get(usersRef);
      return {
        success: true,
        message: 'Connected to Firebase Realtime Database (social-media1bd)',
        timestamp: new Date().toISOString(),
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      return {
        success: false,
        message: `RTDB Connection check: ${errorMsg}`,
        timestamp: new Date().toISOString(),
      };
    }
  },

  // Save / Update User in RTDB at users/{uid}
  async saveUser(user: Partial<User> & { id: string }): Promise<boolean> {
    try {
      const name = (user.fullName || user.name || 'User').trim();
      const avatar =
        user.avatar ||
        user.profileImage ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80';

      const payload: Record<string, any> = {
        ...user,
        id: user.id,
        name,
        fullName: name,
        username: user.username || 'user',
        email: user.email || '',
        bio: user.bio || '',
        avatar,
        profileImage: avatar,
        coverImage:
          user.coverImage ||
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
        role: user.role || 'user',
        status: user.status || 'active',
        verified: user.verified ?? user.isVerified ?? false,
        isVerified: user.isVerified ?? user.verified ?? false,
        isVip: user.isVip ?? false,
        isBanned: user.isBanned ?? false,
        usernameChangeCount: user.usernameChangeCount ?? 0,
        followersCount: user.followersCount ?? (Array.isArray(user.followers) ? user.followers.length : 0),
        followingCount: user.followingCount ?? (Array.isArray(user.following) ? user.following.length : 0),
        postsCount: user.postsCount ?? 0,
        createdAt: user.createdAt || new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };

      const userNodeRef = ref(rtdb, `${USERS_PATH}/${user.id}`);
      await update(userNodeRef, sanitizeObject(payload));
      return true;
    } catch (err) {
      console.warn('RTDB saveUser error:', err);
      return false;
    }
  },

  // Fetch Single User by UID from RTDB
  async getUser(uid: string): Promise<User | null> {
    try {
      const userRef = ref(rtdb, `${USERS_PATH}/${uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const val = snapshot.val();
        return {
          ...val,
          id: uid,
          fullName: val.fullName || val.name || 'User',
          name: val.name || val.fullName || 'User',
          avatar: val.avatar || val.profileImage || '',
          profileImage: val.profileImage || val.avatar || '',
          followers: val.followers || [],
          following: val.following || [],
        } as User;
      }
      return null;
    } catch (err) {
      console.warn('RTDB getUser error:', err);
      return null;
    }
  },

  // Fetch All Users from RTDB
  async getUsers(): Promise<User[]> {
    try {
      const usersRef = ref(rtdb, USERS_PATH);
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map((key) => {
          const u = data[key];
          return {
            ...u,
            id: key,
            fullName: u.fullName || u.name || 'User',
            name: u.name || u.fullName || 'User',
            avatar: u.avatar || u.profileImage || '',
            profileImage: u.profileImage || u.avatar || '',
            followers: Array.isArray(u.followers) ? u.followers : [],
            following: Array.isArray(u.following) ? u.following : [],
          } as User;
        });
      }
      return [];
    } catch (err) {
      console.warn('RTDB getUsers error:', err);
      return [];
    }
  },

  // Subscribe to Realtime Users updates
  subscribeUsers(callback: (users: User[]) => void): Unsubscribe {
    const usersRef = ref(rtdb, USERS_PATH);
    return onValue(
      usersRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list: User[] = Object.keys(data).map((key) => {
            const u = data[key];
            return {
              ...u,
              id: key,
              fullName: u.fullName || u.name || 'User',
              name: u.name || u.fullName || 'User',
              avatar: u.avatar || u.profileImage || '',
              profileImage: u.profileImage || u.avatar || '',
              followers: Array.isArray(u.followers) ? u.followers : [],
              following: Array.isArray(u.following) ? u.following : [],
            } as User;
          });
          callback(list);
        } else {
          callback([]);
        }
      },
      (err) => {
        console.warn('RTDB users subscription error:', err);
      }
    );
  },

  // Save / Update Post
  async savePost(post: Post): Promise<boolean> {
    try {
      const payload: Record<string, any> = {
        ...post,
        id: post.id,
        authorId: post.authorId,
        authorName: post.authorName,
        authorUsername: post.authorUsername,
        authorAvatar: post.authorAvatar,
        content: post.content,
        imageUrl: post.imageUrl || '',
        image: post.imageUrl || '',
        createdAt: post.createdAt || new Date().toISOString(),
        likes: Array.isArray(post.likes) ? post.likes : [],
        commentsCount: Array.isArray(post.comments) ? post.comments.length : 0,
        sharesCount: post.sharesCount || 0,
        isFlagged: post.isFlagged || false,
      };
      const postRef = ref(rtdb, `${POSTS_PATH}/${post.id}`);
      await update(postRef, sanitizeObject(payload));
      return true;
    } catch (err) {
      console.warn('RTDB savePost error:', err);
      return false;
    }
  },

  // Update Post Likes
  async updatePostLikes(postId: string, likes: string[]): Promise<boolean> {
    try {
      const likesRef = ref(rtdb, `${POSTS_PATH}/${postId}/likes`);
      await set(likesRef, likes);
      return true;
    } catch (err) {
      console.warn('RTDB updatePostLikes error:', err);
      return false;
    }
  },

  // Add Comment to Post in RTDB
  async addPostComment(postId: string, comment: any, allComments: any[]): Promise<boolean> {
    try {
      const postRef = ref(rtdb, `${POSTS_PATH}/${postId}`);
      await update(postRef, {
        comments: sanitizeObject(allComments),
        commentsCount: allComments.length,
      });
      return true;
    } catch (err) {
      console.warn('RTDB addPostComment error:', err);
      return false;
    }
  },

  // Delete Post
  async deletePost(postId: string): Promise<boolean> {
    try {
      const postRef = ref(rtdb, `${POSTS_PATH}/${postId}`);
      await remove(postRef);
      return true;
    } catch (err) {
      console.warn('RTDB deletePost error:', err);
      return false;
    }
  },

  // Fetch Posts from RTDB
  async getPosts(): Promise<Post[]> {
    try {
      const postsRef = ref(rtdb, POSTS_PATH);
      const snapshot = await get(postsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map((key) => ({
          ...data[key],
          id: key,
          likes: Array.isArray(data[key].likes) ? data[key].likes : [],
          comments: Array.isArray(data[key].comments) ? data[key].comments : [],
        })) as Post[];
      }
      return [];
    } catch (err) {
      console.warn('RTDB getPosts error:', err);
      return [];
    }
  },

  // Subscribe to Realtime Posts updates
  subscribePosts(callback: (posts: Post[]) => void): Unsubscribe {
    const postsRef = ref(rtdb, POSTS_PATH);
    return onValue(
      postsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list: Post[] = Object.keys(data).map((key) => {
            const p = data[key];
            return {
              ...p,
              id: key,
              likes: Array.isArray(p.likes) ? p.likes : [],
              comments: Array.isArray(p.comments) ? p.comments : [],
            } as Post;
          });
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          callback(list);
        } else {
          callback([]);
        }
      },
      (err) => {
        console.warn('RTDB posts subscription error:', err);
      }
    );
  },

  // Save Message
  async saveMessage(msg: Message): Promise<boolean> {
    try {
      const msgRef = ref(rtdb, `${MESSAGES_PATH}/${msg.id}`);
      await update(msgRef, sanitizeObject(msg));
      return true;
    } catch (err) {
      console.warn('RTDB saveMessage error:', err);
      return false;
    }
  },

  // Save Notification in RTDB at notifications/{userId}/{notificationId}
  async saveNotification(notif: AppNotification): Promise<boolean> {
    try {
      const payload = {
        id: notif.id,
        userId: notif.userId,
        type: notif.type,
        text: notif.text,
        title: notif.text,
        sourceUserId: notif.actorId || '',
        sourceUserName: notif.actorName || '',
        sourceUserAvatar: notif.actorAvatar || '',
        createdAt: notif.createdAt || new Date().toISOString(),
        isRead: notif.isRead || false,
        postId: notif.postId || '',
      };
      const notifRef = ref(rtdb, `${NOTIFS_PATH}/${notif.userId}/${notif.id}`);
      await update(notifRef, sanitizeObject(payload));
      return true;
    } catch (err) {
      console.warn('RTDB saveNotification error:', err);
      return false;
    }
  },

  // Subscribe to user notifications in RTDB
  subscribeUserNotifications(userId: string, callback: (notifs: AppNotification[]) => void): Unsubscribe {
    const notifsRef = ref(rtdb, `${NOTIFS_PATH}/${userId}`);
    return onValue(
      notifsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list: AppNotification[] = Object.keys(data).map((key) => {
            const n = data[key];
            return {
              id: key,
              userId: n.userId,
              actorId: n.sourceUserId || n.actorId,
              actorName: n.sourceUserName || n.actorName,
              actorAvatar: n.sourceUserAvatar || n.actorAvatar,
              type: n.type,
              text: n.text || n.title,
              createdAt: n.createdAt,
              isRead: n.isRead,
              postId: n.postId,
            } as AppNotification;
          });
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          callback(list);
        } else {
          callback([]);
        }
      },
      (err) => {
        console.warn('RTDB notifications subscription error:', err);
      }
    );
  },

  // Bulk Seed initial state into Realtime Database
  async seedInitialData(users: User[], posts: Post[]): Promise<{ usersCount: number; postsCount: number }> {
    let usersCount = 0;
    let postsCount = 0;

    for (const u of users) {
      const userRef = ref(rtdb, `${USERS_PATH}/${u.id}`);
      await set(userRef, sanitizeObject(u));
      usersCount++;
    }

    for (const p of posts) {
      const postRef = ref(rtdb, `${POSTS_PATH}/${p.id}`);
      await set(postRef, sanitizeObject(p));
      postsCount++;
    }

    return { usersCount, postsCount };
  },
};
