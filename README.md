# VibeConnect - Modern Social Media & Real-time Chat Platform

A modern, high-speed social media web application built with React 19, TypeScript, and Tailwind CSS. Featuring photo posting with real-time filters, direct messaging/chat, powerful search, profile customization, email authentication, dark mode, web push notifications, real-time in-place editing, content sharing, and a comprehensive Admin management dashboard.

## 🌟 Key Features

1. **Photo Sharing & Creation (`CreatePostModal.tsx`)**:
   - Drag-and-drop or file upload for images.
   - Built-in sample photos for testing.
   - Live photo filter presets: Normal, Vintage, Monochrome, Vibrant, Golden Warm, Cyberpunk.
   - Captions, hashtag chips, and location tagging.
   - Confetti celebration upon publishing.

2. **Real-Time Post Editing & Content Sharing (`PostCard.tsx`, `ShareModal.tsx`)**:
   - In-place real-time editing: edit captions, tags, and photo filter effects on existing posts with immediate state update.
   - Content sharing options: Web Share API, 1-click clipboard link copying, in-app direct messaging, and QR code visualizer.

3. **Real-time Direct Chat (`ChatView.tsx`)**:
   - Direct 1-on-1 messaging between platform users.
   - Interactive messages with timestamps, read receipts, and image attachments.
   - Quick reply suggestions and active online status indicators.

4. **Intelligent Search & Explore (`ExploreSearch.tsx`)**:
   - Multi-filter search across posts, people, and hashtags.
   - Trending hashtags with category breakdown.
   - Recommended creators with follow/unfollow functionality.

5. **Profile Customization (`ProfileView.tsx`)**:
   - Custom avatar and banner cover uploads.
   - Bio, display name, handle, location, website link, and status badge.
   - Follower & Following metrics.
   - Filterable tabs: "Posts", "Liked", "Saved (Bookmarks)".

6. **Email Authentication (`AuthModal.tsx`)**:
   - Email sign-in and sign-up with validation.
   - 1-click Demo Account switches: Platform Admin (`rifatkhanlol24@gmail.com`), Creator (`sarah.lens@creative.io`), and Developer (`tanvir.dev@tech.co`).

7. **Dark Mode & Bengali/English Bilingual Support**:
   - Instant theme toggle persisted in local storage.
   - Language switch between বাংলা (Bengali) and English.

8. **Push Notifications & Web Audio Synthesizer (`NotificationCenter.tsx`)**:
   - In-app notification bell with unread badge counter.
   - Browser Web Push API integration (`Notification.requestPermission()`).
   - Web Audio API subtle chime sound toggle.

9. **Admin & Moderation Panel (`AdminPanel.tsx`)**:
   - Overview metrics: Total Users, Total Posts, Flagged Reports, Engagements.
   - User Management: Ban/Unban users, change roles (User, Moderator, Admin), toggle Verified checkmarks, delete accounts.
   - Content Moderation queue: review and remove flagged posts.
   - System Broadcast: send instant push announcements to all registered users.

10. **Deployment Ready for GitHub & Vercel**:
    - Pre-configured `vercel.json` with SPA routing rewrites.
    - Zero-config deployment on Vercel.

---

## 🚀 How to Deploy to Vercel via GitHub

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your GitHub repository.
   - Vercel automatically detects the Vite framework and uses `dist` as the build output directory.
   - Click **Deploy**.

`vercel.json` handles all client-side URL rewrites automatically.
