import React, { useState, useRef } from 'react';
import {
  X,
  Image as ImageIcon,
  Camera,
  MapPin,
  Sparkles,
  Smile,
  Hash,
  UploadCloud,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PhotoFilter } from '../types';
import { SAMPLE_POST_IMAGES } from '../data/mockData';

export const CreatePostModal: React.FC = () => {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    createPost,
    currentUser,
    lang,
    showToast,
  } = useApp();

  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<PhotoFilter>('normal');
  const [location, setLocation] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['photography', 'moments']);
  const [isUploading, setIsUploading] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isCreateModalOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast(lang === 'bn' ? 'অনুগ্রহ করে শুধুমাত্র ছবি ফাইল আপলোড করুন' : 'Please upload an image file');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target?.result as string);
      setIsUploading(false);
    };
    reader.onerror = () => {
      setIsUploading(false);
      showToast('Error reading file');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = (tagToAdd?: string) => {
    const raw = tagToAdd || tagInput;
    const cleaned = raw.trim().replace(/^#/, '').toLowerCase();
    if (cleaned && !tags.includes(cleaned)) {
      setTags([...tags, cleaned]);
      if (!tagToAdd) setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl) {
      showToast(lang === 'bn' ? 'অনুগ্রহ করে কিছু লিখুন অথবা ছবি যোগ করুন' : 'Please write something or add an image');
      return;
    }

    createPost(content.trim(), imageUrl || undefined, selectedFilter, tags, location || undefined);
    // Reset fields
    setContent('');
    setImageUrl('');
    setSelectedFilter('normal');
    setLocation('');
    setTags(['photography', 'moments']);
  };

  const filterPresets: { id: PhotoFilter; label: string; previewClass: string }[] = [
    { id: 'normal', label: 'Normal', previewClass: '' },
    { id: 'vintage', label: 'Vintage', previewClass: 'sepia-[0.4] contrast-110' },
    { id: 'monochrome', label: 'B&W', previewClass: 'grayscale contrast-125' },
    { id: 'vibrant', label: 'Vibrant', previewClass: 'saturate-150' },
    { id: 'warm', label: 'Golden', previewClass: 'sepia-[0.2] hue-rotate-[-10deg]' },
    { id: 'cyberpunk', label: 'Cyber', previewClass: 'contrast-125 hue-rotate-15' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="create-post-modal-container"
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Camera className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
              {lang === 'bn' ? 'নতুন পোস্ট তৈরি করুন' : 'Create New Post'}
            </h3>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* User Info mini */}
          {currentUser && (
            <div className="flex items-center gap-2.5">
              <img
                src={currentUser.avatar}
                alt={currentUser.fullName}
                className="w-9 h-9 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
              />
              <div>
                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 block">
                  {currentUser.fullName}
                </span>
                <span className="text-[11px] text-neutral-400">
                  @{currentUser.username} • Public Feed
                </span>
              </div>
            </div>
          )}

          {/* Caption Textarea */}
          <div>
            <textarea
              id="post-caption-textarea"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                lang === 'bn'
                  ? 'আপনার আজকের মুহূর্ত বা ভাবনা শেয়ার করুন...'
                  : "What's on your mind today? Share a moment..."
              }
              className="w-full text-sm p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Image Upload Area / Drag & Drop */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                {lang === 'bn' ? 'ছবি নির্বাচন বা আপলোড:' : 'Attach Image:'}
              </span>
              <button
                type="button"
                onClick={() => setShowPresets(!showPresets)}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                {showPresets
                  ? lang === 'bn' ? 'প্রিসেট বন্ধ করুন' : 'Hide Presets'
                  : lang === 'bn' ? 'স্যাম্পল ছবি ব্যবহার করুন' : 'Choose Sample Photo'}
              </button>
            </div>

            {/* Presets Grid */}
            {showPresets && (
              <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                {SAMPLE_POST_IMAGES.map((sample, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setImageUrl(sample.url);
                      setShowPresets(false);
                    }}
                    className="relative rounded-lg overflow-hidden h-16 cursor-pointer group border border-neutral-300 dark:border-neutral-600"
                  >
                    <img
                      src={sample.url}
                      alt={sample.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity p-1 text-center">
                      Select
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Image with Live Filter Preview */}
            {imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-300 dark:border-neutral-700">
                <img
                  src={imageUrl}
                  alt="Post preview"
                  className={`w-full max-h-56 object-cover ${
                    filterPresets.find((f) => f.id === selectedFilter)?.previewClass || ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-neutral-50/50 dark:bg-neutral-800/30"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <UploadCloud className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
                <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {lang === 'bn'
                    ? 'ছবি এখানে টেনে আনুন বা ক্লিক করে ফাইল নির্বাচন করুন'
                    : 'Drag and drop an image, or click to browse'}
                </p>
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  PNG, JPG, WEBP (Instant preview)
                </span>
              </div>
            )}
          </div>

          {/* Photo Filters Selector (Available when image is present) */}
          {imageUrl && (
            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                {lang === 'bn' ? 'রিয়েল-টাইম ফটো ফিল্টার:' : 'Select Photo Filter:'}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {filterPresets.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFilter(f.id)}
                    className={`px-2 py-1.5 rounded-xl text-xs font-medium border text-center transition-all ${
                      selectedFilter === f.id
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Tags manager */}
            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-indigo-500" />
                {lang === 'bn' ? 'হ্যাশট্যাগ:' : 'Hashtags:'}
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="tech, nature, dhaka"
                  className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
                <button
                  type="button"
                  onClick={() => handleAddTag()}
                  className="px-2.5 py-1.5 text-xs bg-neutral-200 dark:bg-neutral-700 rounded-lg hover:bg-neutral-300"
                >
                  +
                </button>
              </div>

              {/* Tag Pills */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 text-[11px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Location Input */}
            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                {lang === 'bn' ? 'লোকেশন (ঐচ্ছিক):' : 'Location (Optional):'}
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Dhaka, Bangladesh"
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          {/* Quick Suggestions */}
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 overflow-x-auto pb-1">
            <span>{lang === 'bn' ? 'পরামর্শ:' : 'Suggestions:'}</span>
            {['bangladesh', 'sunset', 'tech', 'coding', 'travel'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleAddTag(s)}
                className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-600 dark:text-neutral-300"
              >
                +{s}
              </button>
            ))}
          </div>

          {/* Footer Submit Button */}
          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setContent((prev) => prev + ' 🌟')}
                className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                title="Add star emoji"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                id="submit-post-btn"
                type="submit"
                disabled={isUploading || (!content.trim() && !imageUrl)}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{lang === 'bn' ? 'পোস্ট করুন' : 'Publish Post'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
