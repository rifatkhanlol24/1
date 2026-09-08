import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Edit2,
  Trash2,
  Flag,
  CheckCircle,
  MapPin,
  Send,
  Sparkles,
  Maximize2,
  Check,
  X,
} from 'lucide-react';
import { Post, PhotoFilter } from '../types';
import { useApp } from '../context/AppContext';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const {
    currentUser,
    toggleLikePost,
    toggleSavePost,
    addComment,
    deletePost,
    editPost,
    flagPost,
    setSharingPost,
    setSelectedUserProfileId,
    setActiveTab,
    setSearchQuery,
    lang,
  } = useApp();

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // In-place edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editFilter, setEditFilter] = useState<PhotoFilter>(post.filter || 'normal');
  const [editTagsString, setEditTagsString] = useState((post.tags || []).join(', '));

  const isAuthor = currentUser?.id === post.authorId;
  const { isFirebaseAdmin } = useApp();
  const isAdmin = isFirebaseAdmin;
  const isLiked = currentUser ? (post.likes || []).includes(currentUser.id) : false;
  const isSaved = currentUser ? (post.savedBy || []).includes(currentUser.id) : false;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post.id, commentText);
    setCommentText('');
    setShowComments(true);
  };

  const handleSaveEdit = () => {
    const tags = editTagsString
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);
    editPost(post.id, editContent, tags, editFilter);
    setIsEditing(false);
  };

  const getFilterClass = (filter?: PhotoFilter): string => {
    switch (filter) {
      case 'vintage':
        return 'sepia-[0.35] contrast-110 brightness-95';
      case 'monochrome':
        return 'grayscale contrast-125';
      case 'vibrant':
        return 'saturate-150 contrast-105';
      case 'warm':
        return 'sepia-[0.15] hue-rotate-[-10deg] saturate-125';
      case 'cyberpunk':
        return 'contrast-125 hue-rotate-15 saturate-125';
      default:
        return '';
    }
  };

  const formattedDate = new Date(post.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <article
      id={`post-card-${post.id}`}
      className={`rounded-2xl border bg-white dark:bg-neutral-900 overflow-hidden transition-all duration-200 shadow-sm ${
        post.isFlagged
          ? 'border-amber-400 dark:border-amber-600 bg-amber-50/20 dark:bg-amber-950/10'
          : 'border-neutral-200 dark:border-neutral-800'
      }`}
    >
      {/* Flagged Banner */}
      {post.isFlagged && (
        <div className="bg-amber-500/10 dark:bg-amber-500/20 border-b border-amber-200 dark:border-amber-800 px-4 py-1.5 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
          <span className="flex items-center gap-1.5 font-medium">
            <Flag className="w-3.5 h-3.5" />
            {lang === 'bn' ? 'এই পোস্টটি পর্যালোচনার জন্য রিপোর্ট করা হয়েছে' : 'Post flagged for review'}
            {post.flagReason && `: ${post.flagReason}`}
          </span>
        </div>
      )}

      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div
          onClick={() => {
            setSelectedUserProfileId(post.authorId);
            setActiveTab('profile');
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img
            src={post.authorAvatar}
            alt={post.authorName}
            className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-700 group-hover:ring-2 group-hover:ring-indigo-500 transition-all"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {post.authorName}
              </span>
              {post.isVerified && (
                <CheckCircle className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span>@{post.authorUsername}</span>
              <span>•</span>
              <time>{formattedDate}</time>
              {post.location && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 text-neutral-500 truncate max-w-[120px]">
                    <MapPin className="w-3 h-3 text-neutral-400" />
                    {post.location}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Options Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-44 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-xl p-1.5 z-30 text-xs text-neutral-800 dark:text-neutral-200 animate-in fade-in zoom-in-95 duration-100">
              {(isAuthor || isAdmin) && (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-left font-medium"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-indigo-500" />
                    {lang === 'bn' ? 'রিয়েল-টাইম এডিট' : 'Edit Post'}
                  </button>
                  <button
                    onClick={() => {
                      deletePost(post.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {lang === 'bn' ? 'পোস্ট ডিলিট' : 'Delete Post'}
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  setSharingPost(post);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-left"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-500" />
                {lang === 'bn' ? 'কন্টেন্ট শেয়ার' : 'Share Content'}
              </button>

              <button
                onClick={() => {
                  const reason = prompt(lang === 'bn' ? 'রিপোর্ট করার কারণ লিখুন:' : 'Reason for reporting:');
                  if (reason) flagPost(post.id, reason);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-left text-neutral-500 hover:text-rose-600"
              >
                <Flag className="w-3.5 h-3.5" />
                {lang === 'bn' ? 'পোস্ট রিপোর্ট করুন' : 'Report Post'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Real-time In-Place Post Editor */}
      {isEditing ? (
        <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800/60 border-y border-neutral-200 dark:border-neutral-700 space-y-3">
          <div>
            <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 block mb-1">
              {lang === 'bn' ? 'পোস্টের বিবরণ সম্পাদনা করুন:' : 'Edit Post Caption:'}
            </label>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              className="w-full p-2.5 text-sm rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block mb-1">
                {lang === 'bn' ? 'হ্যাশট্যাগ (কমা দিয়ে আলাদা করুন):' : 'Tags (comma separated):'}
              </label>
              <input
                type="text"
                value={editTagsString}
                onChange={(e) => setEditTagsString(e.target.value)}
                className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                placeholder="photography, tech, dhaka"
              />
            </div>

            {post.imageUrl && (
              <div>
                <label className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block mb-1">
                  {lang === 'bn' ? 'রিয়েল-টাইম ফটো ফিল্টার:' : 'Photo Filter Effect:'}
                </label>
                <select
                  value={editFilter}
                  onChange={(e) => setEditFilter(e.target.value as PhotoFilter)}
                  className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                >
                  <option value="normal">Normal</option>
                  <option value="vintage">Vintage Sepia</option>
                  <option value="monochrome">Monochrome</option>
                  <option value="vibrant">Vibrant Pop</option>
                  <option value="warm">Warm Golden</option>
                  <option value="cyberpunk">Cyberpunk Hue</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              <X className="w-3.5 h-3.5" />
              {lang === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              onClick={handleSaveEdit}
              className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              {lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : (
        /* Post Content Body */
        <div className="px-4 pb-3">
          <p className="text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-line leading-relaxed">
            {post.content}
          </p>

          {/* Hashtags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchQuery(tag);
                    setActiveTab('explore');
                  }}
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline bg-indigo-50/60 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Post Image with Filter */}
      {post.imageUrl && (
        <div className="relative group bg-neutral-950 overflow-hidden cursor-pointer">
          <img
            src={post.imageUrl}
            alt="Post media"
            onClick={() => setIsLightboxOpen(true)}
            className={`w-full max-h-[520px] object-cover transition-all duration-300 ${getFilterClass(
              isEditing ? editFilter : post.filter
            )}`}
          />
          {post.filter && post.filter !== 'normal' && (
            <span className="absolute bottom-2.5 left-2.5 text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-sm pointer-events-none">
              {post.filter} filter
            </span>
          )}

          <button
            onClick={() => setIsLightboxOpen(true)}
            className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            title="Expand Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Post Metrics & Action Bar */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800/80">
        <div className="flex items-center gap-1 sm:gap-4">
          {/* Like Button */}
          <button
            id={`like-btn-${post.id}`}
            onClick={() => toggleLikePost(post.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              isLiked
                ? 'text-rose-600 dark:text-rose-500 bg-rose-50 dark:bg-rose-950/40 font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform active:scale-125 ${
                isLiked ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
            <span>{(post.likesCount ?? (post.likes || []).length).toLocaleString()}</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              showComments
                ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>{(post.comments || []).length}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={() => setSharingPost(post)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title={lang === 'bn' ? 'পোস্টটি শেয়ার করুন' : 'Share post'}
          >
            <Share2 className="w-4 h-4" />
            <span>{post.sharesCount}</span>
          </button>
        </div>

        {/* Bookmark / Save Button */}
        <button
          onClick={() => toggleSavePost(post.id)}
          className={`p-2 rounded-xl text-xs transition-colors ${
            isSaved
              ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
              : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
          title={isSaved ? 'Saved to bookmarks' : 'Save post'}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
        </button>
      </div>

      {/* Expandable Comments Section */}
      {showComments && (
        <div className="border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/40 p-4 space-y-3">
          {/* New Comment Input */}
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={lang === 'bn' ? 'একটি সুন্দর মন্তব্য লিখুন...' : 'Write a comment...'}
              className="flex-1 text-xs px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500 shadow-inner"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition-opacity"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Comment List */}
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {(post.comments || []).length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-2">
                {lang === 'bn' ? 'প্রথম মন্তব্যকারী হোন!' : 'Be the first to comment!'}
              </p>
            ) : (
              (post.comments || []).map((c) => (
                <div
                  key={c.id}
                  className="flex items-start gap-2.5 text-xs bg-white dark:bg-neutral-800/60 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800"
                >
                  <img
                    src={c.authorAvatar}
                    alt={c.authorName}
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {c.authorName}
                      </span>
                      <time className="text-[10px] text-neutral-400">
                        {new Date(c.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </time>
                    </div>
                    <p className="text-neutral-700 dark:text-neutral-300 mt-0.5 leading-relaxed">
                      {c.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Lightbox Fullscreen Modal */}
      {isLightboxOpen && post.imageUrl && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={post.imageUrl}
              alt=""
              className={`max-h-[85vh] max-w-full rounded-xl object-contain ${getFilterClass(
                post.filter
              )}`}
            />
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-neutral-300 text-lg font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </article>
  );
};
