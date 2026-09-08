import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Image as ImageIcon,
  Smile,
  Search,
  CheckCheck,
  Circle,
  ArrowLeft,
  Sparkles,
  Phone,
  Video,
  UserPlus,
  MessageSquare,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User } from '../types';
import { CallModal } from './CallModal';

export const ChatView: React.FC = () => {
  const {
    currentUser,
    users,
    conversations,
    messages,
    activeConversationId,
    setActiveConversationId,
    startOrOpenChatWithUser,
    sendMessage,
    lang,
    showToast,
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const [chatImage, setChatImage] = useState<string | null>(null);
  const [isMobileListOpen, setIsMobileListOpen] = useState(!activeConversationId);
  const [activeCall, setActiveCall] = useState<{ type: 'audio' | 'video'; user: User } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync mobile view when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      setIsMobileListOpen(false);
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 150);
    }
  }, [activeConversationId]);

  // Filter conversations for the current user
  const userConversations = conversations.filter((c) =>
    currentUser ? c.participantIds.includes(currentUser.id) : false
  );

  // Active conversation resolution
  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const otherParticipantId =
    activeConv?.participantIds.find((id) => id !== currentUser?.id) || currentUser?.id;
  const otherUser = users.find((u) => u.id === otherParticipantId);

  // Conversation messages
  const convMessages = messages.filter(
    (m) => m.conversationId === activeConversationId
  );

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convMessages.length, activeConversationId]);

  // Handle Send
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = otherParticipantId || currentUser?.id;
    if (!targetId || (!inputMessage.trim() && !chatImage)) return;

    sendMessage(targetId, inputMessage.trim(), chatImage || undefined);
    setInputMessage('');
    setChatImage(null);
    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 50);
  };

  const handleAttachImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setChatImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Smart search matcher supporting ShohelTaj, @shoheltaj, Sohel Taj, soheltajbhola, etc.
  const cleanSearch = chatSearch.trim().toLowerCase().replace(/^@/, '');
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/sh/g, 's');
  const searchNorm = norm(cleanSearch);

  const isUserMatch = (u: User) => {
    if (!cleanSearch) return false;
    const uUser = u.username.toLowerCase();
    const uName = u.fullName.toLowerCase();
    const uNameBn = (u.fullNameBn || '').toLowerCase();
    const uNameEn = (u.fullNameEn || '').toLowerCase();
    const uEmail = u.email.toLowerCase();

    // 1. Direct contains check across English, Bengali, username and email
    if (
      uUser.includes(cleanSearch) ||
      uName.includes(cleanSearch) ||
      uNameBn.includes(cleanSearch) ||
      uNameEn.includes(cleanSearch) ||
      uEmail.includes(cleanSearch)
    ) {
      return true;
    }

    // 2. Email prefix check (e.g. soheltajbhola)
    if (uEmail.split('@')[0].includes(cleanSearch)) return true;

    // 3. Normalized phonetic & spaceless check (ShohelTaj <-> Sohel Taj <-> shoheltaj)
    const uUserNorm = norm(uUser);
    const uNameNorm = norm(uName);
    const uNameEnNorm = norm(uNameEn);
    const uEmailNorm = norm(uEmail.split('@')[0]);

    if (
      uUserNorm === searchNorm ||
      uNameNorm === searchNorm ||
      uNameEnNorm === searchNorm ||
      uEmailNorm === searchNorm ||
      uUserNorm.includes(searchNorm) ||
      searchNorm.includes(uUserNorm) ||
      uNameNorm.includes(searchNorm) ||
      searchNorm.includes(uNameNorm) ||
      uNameEnNorm.includes(searchNorm) ||
      searchNorm.includes(uNameEnNorm) ||
      uEmailNorm.includes(searchNorm) ||
      searchNorm.includes(uEmailNorm)
    ) {
      return true;
    }

    return false;
  };

  // Searched community users (excluding bots / booster placeholders)
  const searchResults: User[] = cleanSearch
    ? users.filter(
        (u) =>
          !u.isBot &&
          !u.fullName.includes('AI Booster') &&
          !u.username.startsWith('USER-') &&
          !u.username.startsWith('bot_') &&
          isUserMatch(u)
      )
    : [];

  // Default suggested contacts for conversations list
  const suggestedContacts = users.filter(
    (u) =>
      u.id !== currentUser?.id &&
      !u.isBot &&
      !u.fullName.includes('AI Booster') &&
      !u.username.startsWith('USER-') &&
      !u.username.startsWith('bot_') &&
      (currentUser?.following.includes(u.id) || ['user-admin', 'user-2', 'user-3', 'user-4', 'user-5'].includes(u.id))
  );

  const handleStartChatWithUser = (targetUserId: string) => {
    startOrOpenChatWithUser(targetUserId);
    setIsMobileListOpen(false);
    setChatSearch('');
    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 150);
  };

  return (
    <div
      id="chat-view-container"
      className="rounded-2xl sm:rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden h-[calc(100dvh-8rem)] md:h-[calc(100vh-6.5rem)] flex mb-14 md:mb-0 relative"
    >
      {/* Left Sidebar: Conversations & Contacts List */}
      <div
        className={`w-full md:w-80 border-r border-neutral-200 dark:border-neutral-800 flex flex-col bg-neutral-50/60 dark:bg-neutral-900/60 shrink-0 ${
          activeConversationId && !isMobileListOpen ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Contact List Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>{lang === 'bn' ? 'মেসেঞ্জার চ্যাট' : 'Direct Messages'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>

            {/* Quick Compose Button */}
            <button
              onClick={() => {
                searchInputRef.current?.focus();
                setChatSearch('ShohelTaj');
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-semibold transition-colors"
              title="Compose Message"
            >
              <Send className="w-3 h-3" />
              <span>{lang === 'bn' ? 'মেসেজ' : 'Compose'}</span>
            </button>
          </div>

          {/* Search Contacts / Users by Name or Username */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              placeholder={
                lang === 'bn'
                  ? 'যেমন ShohelTaj বা @shoheltaj লিখুন...'
                  : 'Search by name or @username...'
              }
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
            />
            {chatSearch && (
              <button
                onClick={() => setChatSearch('')}
                className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Active Conversation Quick Switch (Mobile Banner) */}
          {activeConv && otherUser && (
            <button
              onClick={() => setIsMobileListOpen(false)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={otherUser.avatar}
                  alt={otherUser.fullName}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="truncate">{otherUser.fullName}</span>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-600">
                <span>{lang === 'bn' ? 'বর্তমান চ্যাটে যান' : 'Go to Chat'}</span>
                <Send className="w-3 h-3" />
              </span>
            </button>
          )}
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {/* SEARCH RESULTS SECTION */}
          {cleanSearch ? (
            <div>
              <div className="px-2 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center justify-between">
                <span>{lang === 'bn' ? 'ইউজার সার্চ ফলাফল' : 'User Search Results'}</span>
                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/60 px-1.5 py-0.5 rounded-full">
                  {searchResults.length}
                </span>
              </div>

              {searchResults.length > 0 ? (
                <div className="space-y-1.5 mt-1.5">
                  {searchResults.map((u) => {
                    const isSelf = u.id === currentUser?.id;
                    return (
                      <div
                        key={u.id}
                        className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-white dark:bg-neutral-800 border border-indigo-100 dark:border-neutral-700 shadow-xs hover:border-indigo-300 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={u.avatar}
                            alt={u.fullName}
                            className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100 truncate">
                                {u.fullName}
                              </span>
                              {isSelf && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-semibold shrink-0">
                                  {lang === 'bn' ? 'আপনি' : 'You'}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono truncate block">
                              @{u.username}
                            </span>
                          </div>
                        </div>

                        {/* Direct "Message Send" Button */}
                        <button
                          id={`msg-btn-${u.username}`}
                          onClick={() => handleStartChatWithUser(u.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-500/20 active:scale-95 transition-all shrink-0"
                          title="Send Message"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{lang === 'bn' ? 'মেসেজ পাঠান' : 'Message'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 px-4 text-neutral-400 text-xs">
                  <Search className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
                  <p className="font-semibold text-neutral-600 dark:text-neutral-300">
                    {lang === 'bn'
                      ? `"${chatSearch}" নামের কোনো ইউজার পাওয়া যায়নি`
                      : `No user found for "${chatSearch}"`}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    {lang === 'bn'
                      ? 'ShohelTaj, @shoheltaj, অথবা Sarah Rahman লিখে চেষ্টা করুন।'
                      : 'Try searching ShohelTaj, @shoheltaj, or Sarah Rahman.'}
                  </p>
                </div>
              )}
            </div>
          ) : null}

          {/* ACTIVE CONVERSATIONS SECTION */}
          {(!cleanSearch || searchResults.length === 0) && (
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                {lang === 'bn' ? 'সক্রিয় বার্তালাপ' : 'Conversations'}
              </div>

              {userConversations.length > 0 ? (
                <div className="space-y-1">
                  {userConversations.map((conv) => {
                    const contactId =
                      conv.participantIds.find((id) => id !== currentUser?.id) ||
                      currentUser?.id;
                    const contact = users.find((u) => u.id === contactId);
                    if (!contact) return null;

                    const isSelected = conv.id === activeConversationId;
                    const lastMsg = conv.lastMessage;
                    const hasUnread =
                      lastMsg && lastMsg.receiverId === currentUser?.id && !lastMsg.isRead;

                    return (
                      <div
                        key={conv.id}
                        onClick={() => {
                          setActiveConversationId(conv.id);
                          setIsMobileListOpen(false);
                          setTimeout(() => {
                            messageInputRef.current?.focus();
                          }, 100);
                        }}
                        className={`flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-100 border border-indigo-200 dark:border-indigo-800'
                            : 'hover:bg-white dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-transparent'
                        }`}
                      >
                        <div className="relative shrink-0">
                          <img
                            src={contact.avatar}
                            alt={contact.fullName}
                            className="w-11 h-11 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                          />
                          <Circle className="w-3 h-3 fill-emerald-500 text-emerald-500 absolute bottom-0 right-0" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs truncate">
                              {contact.fullName}
                            </span>
                            {lastMsg && (
                              <span className="text-[10px] text-neutral-400 shrink-0">
                                {new Date(lastMsg.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-xs truncate mt-0.5 ${
                              hasUnread
                                ? 'font-bold text-neutral-900 dark:text-neutral-100'
                                : 'text-neutral-500 dark:text-neutral-400'
                            }`}
                          >
                            {lastMsg ? lastMsg.text : 'Start chatting...'}
                          </p>
                        </div>

                        {hasUnread && (
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-neutral-400">
                  {lang === 'bn'
                    ? 'কোনো বার্তালাপ এখনও চালু নেই'
                    : 'No active conversations yet'}
                </div>
              )}
            </div>
          )}

          {/* ALL CONTACTS / QUICK CONNECT */}
          {!cleanSearch && (
            <div className="pt-2">
              <div className="px-2 pb-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                {lang === 'bn' ? 'সকল বন্ধু ও ক্রিয়েটর' : 'All Contacts'}
              </div>

              <div className="space-y-1">
                {suggestedContacts.map((u) => {
                  return (
                    <div
                      key={u.id}
                      onClick={() => handleStartChatWithUser(u.id)}
                      className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-white dark:hover:bg-neutral-800 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={u.avatar}
                          alt={u.fullName}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="font-semibold text-xs text-neutral-800 dark:text-neutral-200 block truncate group-hover:text-indigo-600 transition-colors">
                            {u.fullName}
                          </span>
                          <span className="text-[10px] text-neutral-400 truncate block font-mono">
                            @{u.username}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartChatWithUser(u.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 group-hover:bg-indigo-600 group-hover:text-white text-neutral-600 dark:text-neutral-300 text-[11px] font-medium transition-all shrink-0 flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>{lang === 'bn' ? 'মেসেজ' : 'Chat'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Area: Active Chat Thread with Message Input & Send Options */}
      <div
        className={`flex-1 flex flex-col bg-white dark:bg-neutral-900 ${
          !activeConversationId || isMobileListOpen ? 'hidden md:flex' : 'flex'
        }`}
      >
        {activeConv && otherUser ? (
          <>
            {/* Chat Header */}
            <div className="p-2.5 sm:p-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {/* Back button on mobile */}
                <button
                  id="mobile-back-to-list-btn"
                  onClick={() => setIsMobileListOpen(true)}
                  className="md:hidden p-1.5 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
                  title="Back to contacts"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="relative shrink-0">
                  <img
                    src={otherUser.avatar}
                    alt={otherUser.fullName}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                  />
                  <Circle className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500 absolute bottom-0 right-0" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5 truncate">
                    <span className="truncate">{otherUser.fullName}</span>
                    {otherUser.isVerified && (
                      <span className="text-xs text-sky-500 shrink-0" title="Verified">✓</span>
                    )}
                    {otherUser.isVip && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold shrink-0">VIP</span>
                    )}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
                    <span className="truncate">Online • @{otherUser.username}</span>
                  </p>
                </div>
              </div>

              {/* Prominent Audio Call & Video Call Buttons */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button
                  id="chat-audio-call-btn"
                  onClick={() => setActiveCall({ type: 'audio', user: otherUser })}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                  title={lang === 'bn' ? 'অডিও কল শুরু করুন' : 'Start Audio Call'}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold">{lang === 'bn' ? 'অডিও' : 'Audio'}</span>
                </button>

                <button
                  id="chat-video-call-btn"
                  onClick={() => setActiveCall({ type: 'video', user: otherUser })}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                  title={lang === 'bn' ? 'ভিডিও কল শুরু করুন' : 'Start Video Call'}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold">{lang === 'bn' ? 'ভিডিও' : 'Video'}</span>
                </button>
              </div>
            </div>

            {/* Chat Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50/30 dark:bg-neutral-900/30">
              {/* Friendly Welcome Card in Chat */}
              <div className="text-center my-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>
                    {lang === 'bn'
                      ? 'এন্ড-টু-এন্ড এনক্রিপ্টকৃত চ্যাট বার্তালাপ'
                      : 'Real-time interactive messaging session'}
                  </span>
                </div>
              </div>

              {convMessages.length === 0 ? (
                <div className="text-center py-12 text-neutral-400 text-xs">
                  <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                    {lang === 'bn'
                      ? `${otherUser.fullName}-এর সাথে বার্তালাপ শুরু করুন`
                      : `Say hello to ${otherUser.fullName}`}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    {lang === 'bn'
                      ? 'নিচের মেসেজ বক্সে লিখুন এবং সেন্ড বাটনে চাপুন।'
                      : 'Type below and press the Send button to start messaging.'}
                  </p>
                </div>
              ) : (
                convMessages.map((msg) => {
                  const isMe = msg.senderId === currentUser?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 shadow-xs ${
                          isMe
                            ? 'bg-indigo-600 text-white rounded-br-xs'
                            : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-bl-xs border border-neutral-200 dark:border-neutral-700'
                        }`}
                      >
                        {msg.imageUrl && (
                          <div className="mb-2 rounded-xl overflow-hidden max-h-60 bg-neutral-900">
                            <img
                              src={msg.imageUrl}
                              alt="Attachment"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                        {msg.text && (
                          <p className="text-xs leading-relaxed break-words whitespace-pre-wrap">
                            {msg.text}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 mt-1 text-[10px] text-neutral-400 px-1">
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {isMe && (
                          <CheckCheck
                            className={`w-3 h-3 ${
                              msg.isRead ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-400'
                            }`}
                          />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Selected Image Preview before sending */}
            {chatImage && (
              <div className="px-4 py-2 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={chatImage}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded-lg border border-neutral-300 dark:border-neutral-700"
                  />
                  <span className="text-xs text-neutral-600 dark:text-neutral-400">
                    {lang === 'bn' ? 'ছবি যুক্ত হয়েছে' : 'Image attached'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setChatImage(null)}
                  className="p-1 rounded-full text-neutral-500 hover:text-red-500 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Quick Reply Suggestions */}
            <div className="px-4 py-1.5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-neutral-400 shrink-0 text-[11px]">
                {lang === 'bn' ? 'কুইক রিপ্লাই:' : 'Quick:'}
              </span>
              {[
                lang === 'bn' ? 'দারুণ ছবি!' : 'Loved your photo! 📸',
                lang === 'bn' ? 'কেমন আছেন?' : 'How are you? ✨',
                lang === 'bn' ? 'ধন্যবাদ!' : 'Thank you! 🚀',
              ].map((phrase, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setInputMessage(phrase);
                    messageInputRef.current?.focus();
                  }}
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-indigo-400 text-neutral-700 dark:text-neutral-300 text-[11px] whitespace-nowrap transition-colors"
                >
                  {phrase}
                </button>
              ))}
            </div>

            {/* MESSAGE INPUT & SEND FORM - Sleek, Compact & Responsive */}
            <form
              onSubmit={handleSend}
              className="p-2 sm:p-2.5 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center gap-1.5"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAttachImage}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-neutral-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
                title="Attach image"
              >
                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setInputMessage((prev) => prev + ' 😊');
                  messageInputRef.current?.focus();
                }}
                className="p-1.5 text-neutral-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
                title="Add emoji"
              >
                <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <input
                ref={messageInputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  lang === 'bn' ? 'মেসেজ লিখুন...' : 'Type a message...'
                }
                className="flex-1 min-w-0 px-3 py-1.5 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-transparent focus:border-indigo-500 text-neutral-900 dark:text-neutral-100 outline-none"
              />

              {/* Prominent Send Message Button */}
              <button
                id="send-message-btn"
                type="submit"
                disabled={!inputMessage.trim() && !chatImage}
                className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs disabled:opacity-40 transition-all shadow-sm shadow-indigo-500/20 active:scale-95 shrink-0"
                title="Send Message"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {lang === 'bn' ? 'সেন্ড' : 'Send'}
                </span>
              </button>
            </form>
          </>
        ) : (
          /* Empty Chat Placeholder with Direct Actions */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-neutral-400">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3 shadow-inner">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-base text-neutral-800 dark:text-neutral-200 mb-1">
              {lang === 'bn' ? 'কোনো বার্তালাপ নির্বাচন করা হয়নি' : 'No conversation selected'}
            </h3>
            <p className="text-xs max-w-sm text-neutral-500 mb-5">
              {lang === 'bn'
                ? 'বাম পাশের তালিকা থেকে যেকোনো বন্ধু বা ক্রিয়েটরের সাথে রিয়েল-টাইমে চ্যাট শুরু করুন।'
                : 'Select a contact or search someone by name or username to start chatting.'}
            </p>

            {/* Quick Pick to Start Chat */}
            <div className="w-full max-w-xs space-y-2">
              <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                {lang === 'bn' ? 'সরাসরি চ্যাট শুরু করুন:' : 'Directly chat with:'}
              </p>
              {suggestedContacts.slice(0, 3).map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleStartChatWithUser(u.id)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <div className="text-left min-w-0">
                      <p className="font-bold text-xs truncate group-hover:text-indigo-600">{u.fullName}</p>
                      <p className="text-[10px] text-neutral-400 font-mono">@{u.username}</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 shrink-0">
                    <span>{lang === 'bn' ? 'মেসেজ পাঠান' : 'Chat'}</span>
                    <Send className="w-3 h-3" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Audio & Video Call Modal */}
      {activeCall && (
        <CallModal
          type={activeCall.type}
          user={activeCall.user}
          onClose={() => setActiveCall(null)}
          lang={lang}
        />
      )}
    </div>
  );
};
