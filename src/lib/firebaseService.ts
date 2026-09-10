import {
  ref,
  get,
  set,
  update,
  remove,
  onValue,
  query,
  limitToFirst,
  limitToLast,
  push,
  onDisconnect,
  Unsubscribe,
} from 'firebase/database';
import { rtdb } from './firebase';
import { User, Post, Message, Conversation, AppNotification } from '../types';
import { MAIN_ADMIN_UID, SECOND_ADMIN_UID, isAuthorizedAdminUid } from './adminAuth';

// Realtime Database Paths
const USERS_PATH = 'users';
const POSTS_PATH = 'posts';
const MESSAGES_PATH = 'messages';
const CHATS_PATH = 'chats';
const NOTIFS_PATH = 'notifications';
const PRESENCE_PATH = 'presence';
const TYPING_PATH = 'typing';
const BLOCKS_PATH = 'blocks';
const ADMINS_PATH = 'admins';

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

  // Save/Update Conversation in RTDB (chats/{chatId})
  async saveConversation(conv: Conversation): Promise<boolean> {
    try {
      const convRef = ref(rtdb, `${CHATS_PATH}/${conv.id}`);
      const payload: Record<string, any> = {
        id: conv.id,
        participantIds: conv.participantIds,
        updatedAt: conv.updatedAt || new Date().toISOString(),
      };

      if (conv.participantIds && conv.participantIds.length >= 2) {
        payload.participant1 = conv.participantIds[0];
        payload.participant2 = conv.participantIds[1];
        payload.participants = {
          [conv.participantIds[0]]: true,
          [conv.participantIds[1]]: true,
        };
      }

      if (conv.lastMessage) {
        payload.lastMessage = conv.lastMessage;
        payload.lastMessageAt = conv.lastMessage.createdAt || new Date().toISOString();
        payload.lastSenderId = conv.lastMessage.senderId;
      }
      if (conv.unreadCounts) {
        payload.unreadCounts = conv.unreadCounts;
      }
      if (conv.deletedBy) {
        payload.deletedBy = conv.deletedBy;
      }

      await update(convRef, sanitizeObject(payload));
      return true;
    } catch (err) {
      console.warn('RTDB saveConversation error:', err);
      return false;
    }
  },

  // Subscribe to user's Conversations
  subscribeConversations(
    currentUid: string,
    callback: (conversations: Conversation[]) => void
  ): Unsubscribe {
    const chatsRef = ref(rtdb, CHATS_PATH);
    return onValue(
      chatsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list: Conversation[] = Object.keys(data)
            .map((key) => {
              const c = data[key];
              const pIds: string[] =
                c.participantIds ||
                (c.participants ? Object.keys(c.participants) : [c.participant1, c.participant2].filter(Boolean));
              return {
                id: key,
                participantIds: pIds,
                participants: c.participants,
                participant1: c.participant1,
                participant2: c.participant2,
                lastMessage: c.lastMessage,
                lastMessageAt: c.lastMessageAt,
                lastSenderId: c.lastSenderId,
                unreadCounts: c.unreadCounts || {},
                deletedBy: c.deletedBy || {},
                updatedAt: c.updatedAt || c.lastMessageAt || new Date().toISOString(),
              } as Conversation;
            })
            .filter((c) => {
              // Filter only conversations for current user that aren't deleted for this user
              const isParticipant =
                c.participantIds?.includes(currentUid) ||
                c.participant1 === currentUid ||
                c.participant2 === currentUid ||
                c.participants?.[currentUid] === true;
              const isDeleted = c.deletedBy && c.deletedBy[currentUid] === true;
              return isParticipant && !isDeleted;
            });

          list.sort(
            (a, b) =>
              new Date(b.updatedAt || b.lastMessageAt || 0).getTime() -
              new Date(a.updatedAt || a.lastMessageAt || 0).getTime()
          );
          callback(list);
        } else {
          callback([]);
        }
      },
      (err) => {
        console.warn('RTDB subscribeConversations error:', err);
      }
    );
  },

  // Subscribe to real-time messages in a specific chat
  subscribeMessages(
    chatId: string,
    callback: (messages: Message[]) => void
  ): Unsubscribe {
    const messagesQuery = query(ref(rtdb, `${MESSAGES_PATH}/${chatId}`), limitToLast(150));
    return onValue(
      messagesQuery,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list: Message[] = Object.keys(data).map((key) => {
            const m = data[key];
            return {
              id: key,
              conversationId: chatId,
              chatId,
              senderId: m.senderId || m.senderUid,
              senderUid: m.senderUid || m.senderId,
              receiverId: m.receiverId || m.receiverUid,
              receiverUid: m.receiverUid || m.receiverId,
              text: m.text || '',
              imageUrl: m.imageUrl,
              createdAt: m.createdAt,
              isRead: m.isRead || m.seen || false,
              seen: m.seen || m.isRead || false,
              delivered: m.delivered ?? true,
              type: m.type || (m.imageUrl ? 'image' : 'text'),
              deletedFor: m.deletedFor || {},
            } as Message;
          });
          list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          callback(list);
        } else {
          callback([]);
        }
      },
      (err) => {
        console.warn('RTDB subscribeMessages error:', err);
      }
    );
  },

  // Send real-time Chat Message and update conversation lastMessage & unread count
  async sendChatMessage(
    chatId: string,
    msg: Message,
    senderUser?: User,
    receiverUser?: User
  ): Promise<boolean> {
    try {
      const msgRef = ref(rtdb, `${MESSAGES_PATH}/${chatId}/${msg.id}`);
      const payload = {
        id: msg.id,
        conversationId: chatId,
        chatId,
        senderId: msg.senderId,
        senderUid: msg.senderId,
        receiverId: msg.receiverId,
        receiverUid: msg.receiverId,
        text: msg.text || '',
        imageUrl: msg.imageUrl || '',
        createdAt: msg.createdAt || new Date().toISOString(),
        isRead: false,
        seen: false,
        delivered: true,
        type: msg.type || (msg.imageUrl ? 'image' : 'text'),
      };
      await set(msgRef, sanitizeObject(payload));

      // Update the chat node
      const chatRef = ref(rtdb, `${CHATS_PATH}/${chatId}`);
      const chatSnap = await get(chatRef);
      let currentUnread = 0;
      let existingDeletedBy: Record<string, boolean> = {};

      if (chatSnap.exists()) {
        const val = chatSnap.val();
        currentUnread = (val.unreadCounts && val.unreadCounts[msg.receiverId]) || 0;
        existingDeletedBy = val.deletedBy || {};
      }

      // If receiver had deleted the conversation, revive it upon new message
      delete existingDeletedBy[msg.receiverId];
      delete existingDeletedBy[msg.senderId];

      const chatUpdate: Record<string, any> = {
        id: chatId,
        participantIds: [msg.senderId, msg.receiverId],
        participant1: msg.senderId,
        participant2: msg.receiverId,
        participants: {
          [msg.senderId]: true,
          [msg.receiverId]: true,
        },
        lastMessage: payload,
        lastMessageAt: payload.createdAt,
        lastSenderId: msg.senderId,
        updatedAt: payload.createdAt,
        [`unreadCounts/${msg.receiverId}`]: currentUnread + 1,
        [`unreadCounts/${msg.senderId}`]: 0,
        deletedBy: existingDeletedBy,
      };

      await update(chatRef, sanitizeObject(chatUpdate));

      // Also trigger a notification for the recipient
      if (senderUser) {
        const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        firebaseService.saveNotification({
          id: notifId,
          userId: msg.receiverId,
          actorId: senderUser.id,
          actorName: senderUser.fullName || senderUser.name || 'Friend',
          actorUsername: senderUser.username || '',
          actorAvatar: senderUser.avatar || senderUser.profileImage || '',
          type: 'message',
          text: msg.text ? `Sent you a message: "${msg.text.slice(0, 45)}"` : 'Sent you a photo',
          isRead: false,
          createdAt: payload.createdAt,
        }).catch(() => {});
      }

      return true;
    } catch (err) {
      console.warn('RTDB sendChatMessage error:', err);
      return false;
    }
  },

  // Mark all incoming messages in a chat as seen
  async markMessagesSeen(chatId: string, currentUid: string): Promise<boolean> {
    try {
      const messagesRef = ref(rtdb, `${MESSAGES_PATH}/${chatId}`);
      const snapshot = await get(messagesRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const updates: Record<string, any> = {};

        Object.keys(data).forEach((key) => {
          const m = data[key];
          if ((m.receiverId === currentUid || m.receiverUid === currentUid) && (!m.seen || !m.isRead)) {
            updates[`${key}/seen`] = true;
            updates[`${key}/isRead`] = true;
          }
        });

        if (Object.keys(updates).length > 0) {
          await update(messagesRef, updates);
        }
      }

      // Reset unread count for current user
      const unreadRef = ref(rtdb, `${CHATS_PATH}/${chatId}/unreadCounts/${currentUid}`);
      await set(unreadRef, 0).catch(() => {});

      return true;
    } catch (err) {
      console.warn('RTDB markMessagesSeen error:', err);
      return false;
    }
  },

  // Delete message (either for self or for everyone)
  async deleteMessage(
    chatId: string,
    messageId: string,
    forUid: string,
    deleteForEveryone: boolean = false
  ): Promise<boolean> {
    try {
      const msgRef = ref(rtdb, `${MESSAGES_PATH}/${chatId}/${messageId}`);
      if (deleteForEveryone) {
        await update(msgRef, {
          text: 'This message was deleted',
          imageUrl: null,
          isDeletedForEveryone: true,
        });
      } else {
        await update(msgRef, {
          [`deletedFor/${forUid}`]: true,
        });
      }
      return true;
    } catch (err) {
      console.warn('RTDB deleteMessage error:', err);
      return false;
    }
  },

  // Delete conversation for a user
  async deleteConversation(chatId: string, forUid: string): Promise<boolean> {
    try {
      const chatRef = ref(rtdb, `${CHATS_PATH}/${chatId}/deletedBy/${forUid}`);
      await set(chatRef, true);
      return true;
    } catch (err) {
      console.warn('RTDB deleteConversation error:', err);
      return false;
    }
  },

  // Typing status management
  async setTypingStatus(chatId: string, uid: string, isTyping: boolean): Promise<void> {
    try {
      const typingRef = ref(rtdb, `${TYPING_PATH}/${chatId}/${uid}`);
      if (isTyping) {
        await set(typingRef, true);
      } else {
        await remove(typingRef);
      }
    } catch (err) {
      // Non-blocking typing update
    }
  },

  // Subscribe to typing indicators in a chat
  subscribeTyping(
    chatId: string,
    callback: (typingUsers: Record<string, boolean>) => void
  ): Unsubscribe {
    const typingRef = ref(rtdb, `${TYPING_PATH}/${chatId}`);
    return onValue(
      typingRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.val() || {});
        } else {
          callback({});
        }
      },
      (err) => {
        console.warn('RTDB subscribeTyping error:', err);
      }
    );
  },

  // Presence Tracking with Firebase Realtime Database .info/connected
  setupPresenceTracking(uid: string): () => void {
    try {
      const connectedRef = ref(rtdb, '.info/connected');
      const userPresenceRef = ref(rtdb, `${PRESENCE_PATH}/${uid}`);

      const unsub = onValue(connectedRef, (snap) => {
        if (snap.val() === true) {
          // When this client disconnects, set online to false and record timestamp
          onDisconnect(userPresenceRef)
            .set({
              online: false,
              lastSeen: new Date().toISOString(),
            })
            .catch(() => {});

          // Mark current user as online
          set(userPresenceRef, {
            online: true,
            lastSeen: new Date().toISOString(),
          }).catch(() => {});
        }
      });

      return () => {
        unsub();
        set(userPresenceRef, {
          online: false,
          lastSeen: new Date().toISOString(),
        }).catch(() => {});
      };
    } catch (err) {
      console.warn('RTDB setupPresenceTracking error:', err);
      return () => {};
    }
  },

  // Subscribe to presence for all users
  subscribeAllPresence(
    callback: (presenceMap: Record<string, { online: boolean; lastSeen?: string }>) => void
  ): Unsubscribe {
    const presenceRef = ref(rtdb, PRESENCE_PATH);
    return onValue(
      presenceRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.val() || {});
        } else {
          callback({});
        }
      },
      (err) => {
        console.warn('RTDB subscribeAllPresence error:', err);
      }
    );
  },

  // Block User
  async blockUser(currentUid: string, targetUid: string): Promise<boolean> {
    try {
      const blockRef = ref(rtdb, `${BLOCKS_PATH}/${currentUid}/${targetUid}`);
      await set(blockRef, true);
      return true;
    } catch (err) {
      console.warn('RTDB blockUser error:', err);
      return false;
    }
  },

  // Unblock User
  async unblockUser(currentUid: string, targetUid: string): Promise<boolean> {
    try {
      const blockRef = ref(rtdb, `${BLOCKS_PATH}/${currentUid}/${targetUid}`);
      await remove(blockRef);
      return true;
    } catch (err) {
      console.warn('RTDB unblockUser error:', err);
      return false;
    }
  },

  // Subscribe to list of blocked users
  subscribeBlockedUsers(
    currentUid: string,
    callback: (blockedIds: string[]) => void
  ): Unsubscribe {
    const blocksRef = ref(rtdb, `${BLOCKS_PATH}/${currentUid}`);
    return onValue(
      blocksRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback(Object.keys(snapshot.val() || {}));
        } else {
          callback([]);
        }
      },
      (err) => {
        console.warn('RTDB subscribeBlockedUsers error:', err);
      }
    );
  },

  // Legacy Save Message
  async saveMessage(msg: Message): Promise<boolean> {
    try {
      const msgRef = ref(rtdb, `${MESSAGES_PATH}/${msg.conversationId || 'default'}/${msg.id}`);
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

  // Authoritative Admin Sync & Node Update for Authorized Admins
  async syncAdminRecord(uid: string): Promise<boolean> {
    if (!isAuthorizedAdminUid(uid)) {
      console.warn('[Admin Auth] Rejected non-authorized UID sync:', uid);
      return false;
    }
    try {
      const adminNodeRef = ref(rtdb, `${ADMINS_PATH}/${uid}`);
      await set(adminNodeRef, {
        role: 'admin',
        uid,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (err) {
      console.warn('[Firebase RTDB] Error syncing admin node for', uid, err);
      return false;
    }
  },

  async ensureAdminRoleInUserNode(uid: string): Promise<boolean> {
    if (!isAuthorizedAdminUid(uid)) {
      console.warn('[Admin Auth] Rejected non-authorized UID role promotion:', uid);
      return false;
    }
    try {
      const userRef = ref(rtdb, `${USERS_PATH}/${uid}`);
      const snap = await get(userRef);
      if (snap.exists()) {
        await update(userRef, {
          role: 'admin',
          verified: true,
          isVerified: true,
          status: 'active',
          isBanned: false,
          isVip: true,
        });
      } else {
        // Create initial admin user profile if not present
        const isMain = uid === MAIN_ADMIN_UID;
        await set(userRef, sanitizeObject({
          id: uid,
          email: isMain ? 'soheltajbhola@gmail.com' : `${uid}@1social.com`,
          name: isMain ? 'Shohel Taj' : 'Authorized Admin',
          fullName: isMain ? 'Shohel Taj' : 'Authorized Admin',
          username: isMain ? 'shoheltaj' : `admin_${uid.slice(0, 8)}`,
          bio: isMain ? 'Platform Lead & Creator 🚀' : 'Platform Administrator 🛡️',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
          profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
          coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
          role: 'admin',
          status: 'active',
          verified: true,
          isVerified: true,
          isVip: true,
          isBanned: false,
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          usernameChangeCount: 0,
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        }));
      }
      return true;
    } catch (err) {
      console.warn('[Firebase RTDB] Error ensuring admin role in user node for', uid, err);
      return false;
    }
  },

  async initializeAuthorizedAdmins(): Promise<void> {
    try {
      await Promise.all([
        this.ensureAdminRoleInUserNode(MAIN_ADMIN_UID),
        this.ensureAdminRoleInUserNode(SECOND_ADMIN_UID),
        this.syncAdminRecord(MAIN_ADMIN_UID),
        this.syncAdminRecord(SECOND_ADMIN_UID),
      ]);
    } catch (err) {
      console.warn('[Admin Init] Error initializing authorized admins:', err);
    }
  },
};
