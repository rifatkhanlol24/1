import {
  ref,
  get,
  set,
  remove,
  child,
  onValue,
} from 'firebase/database';
import { db } from './firebase';
import { User, Post, Message, AppNotification } from '../types';

function ensureArray<T>(val: any): T[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === 'object') return Object.values(val).filter(Boolean) as T[];
  return [];
}

export function sanitizeUser(u: any): User {
  if (!u || typeof u !== 'object') return u;
  return {
    ...u,
    followers: ensureArray(u.followers),
    following: ensureArray(u.following),
    links: ensureArray(u.links),
  };
}

export function sanitizePost(p: any): Post {
  if (!p || typeof p !== 'object') return p;
  return {
    ...p,
    likes: ensureArray(p.likes),
    savedBy: ensureArray(p.savedBy),
    tags: ensureArray(p.tags),
    comments: ensureArray(p.comments).map((c: any) => ({
      ...c,
      likes: ensureArray(c?.likes),
    })),
  };
}

export const firebaseService = {
  // Check connection status
  async checkConnection(): Promise<{ success: boolean; message: string; timestamp: string }> {
    try {
      const dbRef = ref(db);
      await get(child(dbRef, 'users'));
      return {
        success: true,
        message: 'Connected to Firebase Realtime Database',
        timestamp: new Date().toISOString(),
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      return {
        success: false,
        message: `Realtime Database connection check failed: ${errorMsg}`,
        timestamp: new Date().toISOString(),
      };
    }
  },

  // Save / Update User
  async saveUser(user: User): Promise<boolean> {
    try {
      const sanitized = sanitizeUser(user);
      const userRef = ref(db, `users/${user.id}`);
      await set(userRef, sanitized);
      return true;
    } catch (err) {
      console.warn('Realtime Database saveUser error:', err);
      return false;
    }
  },

  // Fetch Users
  async getUsers(): Promise<User[]> {
    try {
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        const val = snapshot.val();
        let list: any[] = [];
        if (Array.isArray(val)) {
          list = val.filter(Boolean);
        } else if (typeof val === 'object' && val !== null) {
          list = Object.values(val);
        }
        return list.map(sanitizeUser);
      }
      return [];
    } catch (err) {
      console.warn('Realtime Database getUsers error:', err);
      return [];
    }
  },

  // Subscribe to Users in Realtime
  subscribeToUsers(callback: (users: User[]) => void): () => void {
    try {
      const usersRef = ref(db, 'users');
      const unsubscribe = onValue(usersRef, (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          let list: any[] = [];
          if (Array.isArray(val)) {
            list = val.filter(Boolean);
          } else if (typeof val === 'object' && val !== null) {
            list = Object.values(val);
          }
          callback(list.map(sanitizeUser));
        } else {
          callback([]);
        }
      }, (err) => {
        console.warn('Realtime Database subscribeToUsers error:', err);
      });
      return unsubscribe;
    } catch (err) {
      console.warn('subscribeToUsers setup error:', err);
      return () => {};
    }
  },

  // Save Post
  async savePost(post: Post): Promise<boolean> {
    try {
      const sanitized = sanitizePost(post);
      const postRef = ref(db, `posts/${post.id}`);
      await set(postRef, sanitized);
      return true;
    } catch (err) {
      console.warn('Realtime Database savePost error:', err);
      return false;
    }
  },

  // Delete Post
  async deletePost(postId: string): Promise<boolean> {
    try {
      const postRef = ref(db, `posts/${postId}`);
      await remove(postRef);
      return true;
    } catch (err) {
      console.warn('Realtime Database deletePost error:', err);
      return false;
    }
  },

  // Fetch Posts
  async getPosts(): Promise<Post[]> {
    try {
      const postsRef = ref(db, 'posts');
      const snapshot = await get(postsRef);
      if (snapshot.exists()) {
        const val = snapshot.val();
        let list: any[] = [];
        if (Array.isArray(val)) {
          list = val.filter(Boolean);
        } else if (typeof val === 'object' && val !== null) {
          list = Object.values(val);
        }
        return list.map(sanitizePost);
      }
      return [];
    } catch (err) {
      console.warn('Realtime Database getPosts error:', err);
      return [];
    }
  },

  // Save Message
  async saveMessage(msg: Message): Promise<boolean> {
    try {
      const msgRef = ref(db, `messages/${msg.id}`);
      await set(msgRef, msg);
      return true;
    } catch (err) {
      console.warn('Realtime Database saveMessage error:', err);
      return false;
    }
  },

  // Save Notification
  async saveNotification(notif: AppNotification): Promise<boolean> {
    try {
      const notifRef = ref(db, `notifications/${notif.id}`);
      await set(notifRef, notif);
      return true;
    } catch (err) {
      console.warn('Realtime Database saveNotification error:', err);
      return false;
    }
  },

  // Bulk Seed initial state into Realtime Database
  async seedInitialData(users: User[], posts: Post[]): Promise<{ usersCount: number; postsCount: number }> {
    let usersCount = 0;
    let postsCount = 0;

    // Ensure Real Admin is always seeded
    const adminUser: User = {
      id: 'UI28ofvzB7cjNJvCG0DvYgbCu9J3',
      email: 'soheltajbhola@gmail.com',
      password: '',
      username: 'shoheltaj',
      usernameChangeCount: 0,
      fullName: 'Shohel Taj',
      fullNameBn: 'সোহেল তাজ',
      fullNameEn: 'Shohel Taj',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      bio: 'Platform Lead & Creator. Building next-gen web applications and connecting communities across the globe 🚀',
      location: 'Dhaka, Bangladesh',
      website: 'https://techlystb.blogspot.com',
      statusBadge: '🛡️ Platform Admin',
      role: 'admin',
      isVerified: true,
      isVip: true,
      badge: 'VIP',
      isBanned: false,
      followers: [],
      following: [],
      createdAt: '2024-01-15T09:00:00Z',
    };
    await set(ref(db, `users/UI28ofvzB7cjNJvCG0DvYgbCu9J3`), adminUser);
    usersCount++;

    for (const u of users) {
      const userRef = ref(db, `users/${u.id}`);
      await set(userRef, u);
      usersCount++;
    }

    for (const p of posts) {
      const postRef = ref(db, `posts/${p.id}`);
      await set(postRef, p);
      postsCount++;
    }

    return { usersCount, postsCount };
  },
};
