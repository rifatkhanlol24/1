import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { RightSidebar } from './components/RightSidebar';
import { FeedView } from './components/FeedView';
import { ExploreSearch } from './components/ExploreSearch';
import { ChatView } from './components/ChatView';
import { ProfileView } from './components/ProfileView';
import { NotificationCenter } from './components/NotificationCenter';
import { AdminPanel } from './components/AdminPanel';
import { CreatePostModal } from './components/CreatePostModal';
import { AuthModal } from './components/AuthModal';
import { AuthGateScreen } from './components/AuthGateScreen';
import { ShareModal } from './components/ShareModal';
import { VercelModal } from './components/VercelModal';
import { PwaInstallSystem } from './components/PwaInstallSystem';
import { Toast } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';

const MainLayout: React.FC = () => {
  const { activeTab, currentUser } = useApp();

  // If not logged in, enforce the Registration / Login Gate Screen
  if (!currentUser) {
    return (
      <>
        <AuthGateScreen />
        <Toast />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 transition-colors selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Navbar />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto flex justify-center w-full px-2 sm:px-4">
        {/* Left Sidebar (Desktop) */}
        <Sidebar />

        {/* Center Main Stage */}
        <main className="flex-1 min-w-0 py-4 sm:py-6 px-1 sm:px-4 md:px-6">
          {activeTab === 'feed' && <FeedView />}
          {activeTab === 'explore' && <ExploreSearch />}
          {activeTab === 'messages' && <ChatView />}
          {activeTab === 'notifications' && <NotificationCenter />}
          {activeTab === 'profile' && <ProfileView />}
          {activeTab === 'admin' && <AdminPanel />}
        </main>

        {/* Right Sidebar (Desktop - on Feed & Explore) */}
        {(activeTab === 'feed' || activeTab === 'explore' || activeTab === 'profile') && (
          <RightSidebar />
        )}
      </div>

      {/* Global PWA Install System - After Login (At the very bottom of everything) */}
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 mb-20 md:mb-6">
        <PwaInstallSystem variant="card" />
      </div>

      {/* Bottom Navigation (Mobile) */}
      <MobileNav />

      {/* Interactive Global Modals */}
      <CreatePostModal />
      <AuthModal />
      <ShareModal />
      <VercelModal />

      {/* Global Toast Banner */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </ErrorBoundary>
  );
}
