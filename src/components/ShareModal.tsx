import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Send,
  Share2,
  QrCode,
  MessageCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ShareModal: React.FC = () => {
  const {
    sharingPost,
    setSharingPost,
    sharePost,
    users,
    currentUser,
    lang,
    showToast,
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');
  const [showQr, setShowQr] = useState(false);

  if (!sharingPost) return null;

  const postUrl = `${window.location.origin}/#post-${sharingPost.id}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(postUrl);
      setCopied(true);
      showToast(lang === 'bn' ? 'পোস্টের লিঙ্ক কপি করা হয়েছে!' : 'Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${sharingPost.authorName}`,
          text: sharingPost.content.slice(0, 100),
          url: postUrl,
        });
        sharePost(sharingPost.id);
        setSharingPost(null);
      } catch {
        // user cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSendDm = () => {
    if (!selectedRecipient) {
      showToast(lang === 'bn' ? 'অনুগ্রহ করে প্রাপক নির্বাচন করুন' : 'Select a recipient');
      return;
    }
    sharePost(sharingPost.id, selectedRecipient);
    setSharingPost(null);
  };

  const otherUsers = users.filter((u) => u.id !== currentUser?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Share2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
              {lang === 'bn' ? 'কন্টেন্ট শেয়ার করুন' : 'Share Content'}
            </h3>
          </div>
          <button
            onClick={() => setSharingPost(null)}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post Preview Snippet */}
        <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
          {sharingPost.imageUrl && (
            <img
              src={sharingPost.imageUrl}
              alt=""
              className="w-12 h-12 rounded-xl object-cover shrink-0"
            />
          )}
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 block truncate">
              {sharingPost.authorName}
            </span>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
              {sharingPost.content}
            </p>
          </div>
        </div>

        {/* Copy Link Input Bar */}
        <div>
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
            {lang === 'bn' ? 'পোস্ট লিঙ্ক:' : 'Post Link:'}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={postUrl}
              className="flex-1 text-xs px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 truncate"
            />
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : (lang === 'bn' ? 'কপি' : 'Copy')}</span>
            </button>
          </div>
        </div>

        {/* In-app Direct Message Share */}
        <div>
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5 flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5 text-indigo-500" />
            <span>{lang === 'bn' ? 'অ্যাপের ভেতরে মেসেজে পাঠান:' : 'Send as Direct Message:'}</span>
          </label>
          <div className="flex items-center gap-2">
            <select
              value={selectedRecipient}
              onChange={(e) => setSelectedRecipient(e.target.value)}
              className="flex-1 text-xs px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
            >
              <option value="">
                {lang === 'bn' ? '-- বন্ধু নির্বাচন করুন --' : '-- Choose a contact --'}
              </option>
              {otherUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName} (@{u.username})
                </option>
              ))}
            </select>
            <button
              onClick={handleSendDm}
              disabled={!selectedRecipient}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold disabled:opacity-50 flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'পাঠান' : 'Send'}</span>
            </button>
          </div>
        </div>

        {/* External Social Quick Links */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
            {lang === 'bn' ? 'অন্যান্য মাধ্যমে শেয়ার করুন:' : 'Share externally:'}
          </label>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <button
              onClick={handleNativeShare}
              className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex flex-col items-center gap-1"
            >
              <Share2 className="w-4 h-4 text-indigo-500" />
              <span className="text-[10px] font-medium">Device</span>
            </button>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(postUrl)}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => sharePost(sharingPost.id)}
              className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex flex-col items-center gap-1"
            >
              <span className="text-emerald-500 font-bold text-sm">WA</span>
              <span className="text-[10px] font-medium">WhatsApp</span>
            </a>

            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(sharingPost.content.slice(0, 80))}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => sharePost(sharingPost.id)}
              className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex flex-col items-center gap-1"
            >
              <span className="text-sky-500 font-bold text-sm">X</span>
              <span className="text-[10px] font-medium">Twitter/X</span>
            </a>

            <button
              onClick={() => setShowQr(!showQr)}
              className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex flex-col items-center gap-1"
            >
              <QrCode className="w-4 h-4 text-purple-500" />
              <span className="text-[10px] font-medium">QR Code</span>
            </button>
          </div>
        </div>

        {/* QR Code Display popup */}
        {showQr && (
          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-center space-y-2">
            <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Scan to view this post on mobile:
            </p>
            <div className="inline-block p-3 bg-white rounded-xl shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(postUrl)}`}
                alt="QR Code"
                className="w-28 h-28 mx-auto"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
