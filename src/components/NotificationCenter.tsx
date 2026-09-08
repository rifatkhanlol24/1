import React from 'react';
import {
  Bell,
  CheckCircle,
  Heart,
  MessageCircle,
  UserPlus,
  Share2,
  Shield,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NotificationCenter: React.FC = () => {
  const {
    currentUser,
    notifications,
    markAllNotificationsRead,
    requestPushPermission,
    pushPermissionStatus,
    soundEnabled,
    setSoundEnabled,
    lang,
  } = useApp();

  const userNotifications = notifications.filter(
    (n) => n.userId === currentUser?.id
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-indigo-500" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-emerald-500" />;
      case 'message':
        return <MessageCircle className="w-4 h-4 text-sky-500" />;
      case 'share':
        return <Share2 className="w-4 h-4 text-amber-500" />;
      default:
        return <Shield className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div id="notification-center-container" className="max-w-2xl mx-auto space-y-4 pb-12">
      {/* Header */}
      <div className="p-4 sm:p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-black text-neutral-900 dark:text-neutral-100">
              {lang === 'bn' ? 'নোটিফিকেশন সেন্টার' : 'Notification Center'}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold">
              {userNotifications.length}
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            {lang === 'bn'
              ? 'লাইক, কমেন্ট, ফলোয়ার এবং পুশ আপডেট পর্যবেক্ষণ করুন'
              : 'Keep track of all interactions, likes, and messages in real-time'}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              soundEnabled
                ? 'border-indigo-200 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                : 'border-neutral-200 dark:border-neutral-800 text-neutral-400'
            }`}
            title={soundEnabled ? 'Chime sound on' : 'Chime sound muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="text-[11px] hidden sm:inline">
              {soundEnabled ? 'Sound On' : 'Muted'}
            </span>
          </button>

          <button
            onClick={markAllNotificationsRead}
            className="px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            {lang === 'bn' ? 'সব পঠিত হিসেবে চিহ্নিত করুন' : 'Mark all read'}
          </button>
        </div>
      </div>

      {/* Push Notification Banner */}
      {pushPermissionStatus !== 'granted' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                {lang === 'bn' ? 'ব্রাউজার পুশ নোটিফিকেশন সক্রিয় করুন' : 'Enable Web Push Notifications'}
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {lang === 'bn'
                  ? 'নতুন চ্যাট মেসেজ ও লাইক আসলে সাথে সাথে ব্রাউজারে নোটিফিকেশন পাবেন।'
                  : 'Receive instant desktop and mobile notifications for messages & likes.'}
              </p>
            </div>
          </div>
          <button
            onClick={requestPushPermission}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 shadow-sm"
          >
            {lang === 'bn' ? 'সক্রিয় করুন' : 'Enable'}
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-2">
        {userNotifications.length === 0 ? (
          <div className="text-center py-12 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-400">
            <Bell className="w-10 h-10 mx-auto text-neutral-300 dark:text-neutral-600 mb-2" />
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              {lang === 'bn' ? 'কোনো নোটিফিকেশন নেই' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          userNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3.5 rounded-2xl border flex items-center gap-3.5 transition-all ${
                notif.isRead
                  ? 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800/80 text-neutral-800 dark:text-neutral-200'
                  : 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
              }`}
            >
              {/* Actor avatar & icon badge */}
              <div className="relative shrink-0">
                <img
                  src={notif.actorAvatar}
                  alt={notif.actorName}
                  className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                />
                <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white dark:bg-neutral-900 shadow-sm">
                  {getIcon(notif.type)}
                </div>
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0 text-xs">
                <p className="leading-snug">
                  <span className="font-bold">{notif.actorName}</span>{' '}
                  <span className="text-neutral-600 dark:text-neutral-300">
                    {notif.text}
                  </span>
                </p>
                <time className="text-[10px] text-neutral-400 mt-1 block">
                  {new Date(notif.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </time>
              </div>

              {!notif.isRead && (
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
