import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Post, Message, AppNotification } from '../types';

// Collections
const USERS_COL = 'users';
const POSTS_COL = 'posts';
const MESSAGES_COL = 'messages';
const NOTIFS_COL = 'notifications';

export const firebaseService = {
  // Check connection status
  async checkConnection(): Promise<{ success: boolean; message: string; timestamp: string }> {
    try {
      const colRef = collection(db, USERS_COL);
      await getDocs(query(colRef, limit(1)));
      return {
        success: true,
        message: 'Connected to Cloud Firestore (social-media1bd)',
        timestamp: new Date().toISOString(),
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      return {
        success: false,
        message: `Connection check failed: ${errorMsg}`,
        timestamp: new Date().toISOString(),
      };
    }
  },

  // Save / Update User
  async saveUser(user: User): Promise<boolean> {
    try {
      const docRef = doc(db, USERS_COL, user.id);
      await setDoc(docRef, user, { merge: true });
      return true;
    } catch (err) {
      console.warn('Firestore saveUser error:', err);
      return false;
    }
  },

  // Fetch Users
  async getUsers(): Promise<User[]> {
    try {
      const colRef = collection(db, USERS_COL);
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map((d) => d.data() as User);
    } catch (err) {
      console.warn('Firestore getUsers error:', err);
      return [];
    }
  },

  // Save Post
  async savePost(post: Post): Promise<boolean> {
    try {
      const docRef = doc(db, POSTS_COL, post.id);
      await setDoc(docRef, post, { merge: true });
      return true;
    } catch (err) {
      console.warn('Firestore savePost error:', err);
      return false;
    }
  },

  // Delete Post
  async deletePost(postId: string): Promise<boolean> {
    try {
      const docRef = doc(db, POSTS_COL, postId);
      await deleteDoc(docRef);
      return true;
    } catch (err) {
      console.warn('Firestore deletePost error:', err);
      return false;
    }
  },

  // Fetch Posts
  async getPosts(): Promise<Post[]> {
    try {
      const colRef = collection(db, POSTS_COL);
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map((d) => d.data() as Post);
    } catch (err) {
      console.warn('Firestore getPosts error:', err);
      return [];
    }
  },

  // Save Message
  async saveMessage(msg: Message): Promise<boolean> {
    try {
      const docRef = doc(db, MESSAGES_COL, msg.id);
      await setDoc(docRef, msg, { merge: true });
      return true;
    } catch (err) {
      console.warn('Firestore saveMessage error:', err);
      return false;
    }
  },

  // Save Notification
  async saveNotification(notif: AppNotification): Promise<boolean> {
    try {
      const docRef = doc(db, NOTIFS_COL, notif.id);
      await setDoc(docRef, notif, { merge: true });
      return true;
    } catch (err) {
      console.warn('Firestore saveNotification error:', err);
      return false;
    }
  },

  // Bulk Seed initial state into Firestore
  async seedInitialData(users: User[], posts: Post[]): Promise<{ usersCount: number; postsCount: number }> {
    let usersCount = 0;
    let postsCount = 0;

    for (const u of users) {
      const docRef = doc(db, USERS_COL, u.id);
      await setDoc(docRef, u, { merge: true });
      usersCount++;
    }

    for (const p of posts) {
      const docRef = doc(db, POSTS_COL, p.id);
      await setDoc(docRef, p, { merge: true });
      postsCount++;
    }

    return { usersCount, postsCount };
  },
};
