import React from 'react';
import { Home, Compass, Plus, MessageCircle, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MobileNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsCreateModalOpen,
    currentUser,
    setSelectedUserProfileId,
    messages,
  } = useApp();

  const unreadMessagesCount = messages.filter(
    (m) => m.receiverId === currentUser?.id && !m.isRead
  ).length;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 px-2 py-1.5 flex items-center justify-around">
      <button
        id="mobile-nav-feed"
        onClick={() => setActiveTab('feed')}
        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
          activeTab === 'feed'
            ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
            : 'text-neutral-500 dark:text-neutral-400'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px]">Feed</span>
      </button>

      <button
        id="mobile-nav-explore"
        onClick={() => setActiveTab('explore')}
        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
          activeTab === 'explore'
            ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
            : 'text-neutral-500 dark:text-neutral-400'
        }`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px]">Explore</span>
      </button>

      {/* Floating Create Button */}
      <button
        id="mobile-nav-create"
        onClick={() => setIsCreateModalOpen(true)}
        className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center -mt-5 shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 active:scale-95 transition-all"
        aria-label="Create post"
      >
        <Plus className="w-6 h-6" />
      </button>

      <button
        id="mobile-nav-messages"
        onClick={() => setActiveTab('messages')}
        className={`flex flex-col items-center gap-1 p-2 rounded-xl relative transition-colors ${
          activeTab === 'messages'
            ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
            : 'text-neutral-500 dark:text-neutral-400'
        }`}
      >
        <MessageCircle className="w-5 h-5" />
        {unreadMessagesCount > 0 && (
          <span className="absolute top-1 right-2 w-4 h-4 text-[9px] bg-rose-500 text-white rounded-full flex items-center justify-center font-bold">
            {unreadMessagesCount}
          </span>
        )}
        <span className="text-[10px]">Chat</span>
      </button>

      <button
        id="mobile-nav-profile"
        onClick={() => {
          if (currentUser) {
            setSelectedUserProfileId(currentUser.id);
          }
          setActiveTab('profile');
        }}
        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
          activeTab === 'profile'
            ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
            : 'text-neutral-500 dark:text-neutral-400'
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[10px]">Profile</span>
      </button>
    </nav>
  );
};
