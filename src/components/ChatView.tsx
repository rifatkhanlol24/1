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
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ChatView: React.FC = () => {
  const {
    currentUser,
    users,
    conversations,
    messages,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    lang,
    showToast,
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const [chatImage, setChatImage] = useState<string | null>(null);
  const [isMobileListOpen, setIsMobileListOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter conversations for the current user
  const userConversations = conversations.filter((c) =>
    currentUser ? c.participantIds.includes(currentUser.id) : false
  );

  // Active conversation
  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const otherParticipantId = activeConv?.participantIds.find(
    (id) => id !== currentUser?.id
  );
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
    if (!otherParticipantId || (!inputMessage.trim() && !chatImage)) return;

    sendMessage(otherParticipantId, inputMessage.trim(), chatImage || undefined);
    setInputMessage('');
    setChatImage(null);
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

  // Contacts list including users you haven't messaged yet
  const filteredUsers = users.filter(
    (u) =>
      u.id !== currentUser?.id &&
      (u.fullName.toLowerCase().includes(chatSearch.toLowerCase()) ||
        u.username.toLowerCase().includes(chatSearch.toLowerCase()))
  );

  return (
    <div
      id="chat-view-container"
      className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden h-[calc(100vh-6.5rem)] flex"
    >
      {/* Left Sidebar: Conversations & Contacts List */}
      <div
        className={`w-full md:w-80 border-r border-neutral-200 dark:border-neutral-800 flex flex-col bg-neutral-50/50 dark:bg-neutral-900/50 shrink-0 ${
          activeConversationId && !isMobileListOpen ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Contact List Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span>{lang === 'bn' ? 'মেসেঞ্জার চ্যাট' : 'Direct Messages'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
          </div>

          {/* Search Contacts */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              placeholder={lang === 'bn' ? 'বন্ধু বা ইউজার খুঁজুন...' : 'Search contacts...'}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500 shadow-inner"
            />
          </div>
        </div>

        {/* Conversations / Available Contacts */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-2 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            {lang === 'bn' ? 'সক্রিয় বার্তালাপ' : 'Conversations'}
          </div>

          {userConversations.map((conv) => {
            const contactId = conv.participantIds.find(
              (id) => id !== currentUser?.id
            );
            const contact = users.find((u) => u.id === contactId);
            if (!contact) return null;

            const isSelected = conv.id === activeConversationId;
            const lastMsg = conv.lastMessage;
            const hasUnread = lastMsg && lastMsg.receiverId === currentUser?.id && !lastMsg.isRead;

            return (
              <div
                key={conv.id}
                onClick={() => {
                  setActiveConversationId(conv.id);
                  setIsMobileListOpen(false);
                }}
                className={`flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-100'
                    : 'hover:bg-white dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <div className="relative">
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
                      <span className="text-[10px] text-neutral-400">
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

          {/* All Users quick connect */}
          <div className="px-2 pt-3 pb-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            {lang === 'bn' ? 'সকল বন্ধু ও ক্রিয়েটর' : 'All Contacts'}
          </div>

          {filteredUsers.map((u) => {
            const alreadyHasConv = userConversations.some((c) =>
              c.participantIds.includes(u.id)
            );
            if (alreadyHasConv && !chatSearch) return null;

            return (
              <div
                key={u.id}
                onClick={() => {
                  // Find or create conversation
                  let targetConv = conversations.find(
                    (c) =>
                      c.participantIds.includes(currentUser?.id || '') &&
                      c.participantIds.includes(u.id)
                  );
                  if (targetConv) {
                    setActiveConversationId(targetConv.id);
                  } else {
                    sendMessage(u.id, lang === 'bn' ? 'হাই! কেমন আছেন?' : 'Hi! How are you?');
                  }
                  setIsMobileListOpen(false);
                }}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-neutral-800 cursor-pointer transition-colors"
              >
                <img
                  src={u.avatar}
                  alt={u.fullName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-xs text-neutral-800 dark:text-neutral-200 block truncate">
                    {u.fullName}
                  </span>
                  <span className="text-[10px] text-neutral-400 truncate block">
                    @{u.username}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Area: Active Chat Thread */}
      <div
        className={`flex-1 flex flex-col bg-white dark:bg-neutral-900 ${
          !activeConversationId || isMobileListOpen ? 'hidden md:flex' : 'flex'
        }`}
      >
        {activeConv && otherUser ? (
          <>
            {/* Chat Header */}
            <div className="p-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Back button on mobile */}
                <button
                  onClick={() => setIsMobileListOpen(true)}
                  className="md:hidden p-1.5 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="relative">
                  <img
                    src={otherUser.avatar}
                    alt={otherUser.fullName}
                    className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                  />
                  <Circle className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500 absolute bottom-0 right-0" />
                </div>

                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                    {otherUser.fullName}
                    {otherUser.isVerified && (
                      <span className="text-xs text-sky-500">✓</span>
                    )}
                  </h3>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    Online • @{otherUser.username}
                  </p>
                </div>
              </div>

              {/* Call / Action Mockups */}
              <div className="flex items-center gap-1 text-neutral-500">
                <button
                  onClick={() => showToast(lang === 'bn' ? 'ভয়েস কল ফিচার শীঘ্রই আসছে' : 'Voice call coming soon')}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                  title="Voice Call"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => showToast(lang === 'bn' ? 'ভিডিও কল ফিচার শীঘ্রই আসছে' : 'Video call coming soon')}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                  title="Video Call"
                >
                  <Video className="w-4 h-4" />
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

              {convMessages.map((msg) => {
                const isMe = msg.senderId === currentUser?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${
                      isMe ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {!isMe && (
                      <img
                        src={otherUser.avatar}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover shrink-0 mb-0.5"
                      />
                    )}

                    <div
                      className={`max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-br-xs'
                          : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 rounded-bl-xs'
                      }`}
                    >
                      {msg.imageUrl && (
                        <img
                          src={msg.imageUrl}
                          alt="Attachment"
                          className="rounded-xl mb-2 max-h-48 w-full object-cover"
                        />
                      )}
                      <p className="whitespace-pre-line">{msg.text}</p>
                      <div
                        className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                          isMe ? 'text-indigo-200' : 'text-neutral-400'
                        }`}
                      >
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {isMe && <CheckCheck className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* Attached Image Preview in Input */}
            {chatImage && (
              <div className="p-2 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={chatImage}
                    alt="Preview"
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <span className="text-xs text-neutral-600 dark:text-neutral-300">
                    Image attachment ready
                  </span>
                </div>
                <button
                  onClick={() => setChatImage(null)}
                  className="text-xs text-rose-500 font-semibold px-2 py-1"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Quick Greeting Chips */}
            <div className="px-4 py-1.5 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center gap-2 overflow-x-auto text-[11px]">
              <span className="text-neutral-400 shrink-0">Quick reply:</span>
              {[
                lang === 'bn' ? 'দারুণ ছবি!' : 'Loved your photo! 📸',
                lang === 'bn' ? 'কেমন চলছে?' : 'How is it going? ✨',
                lang === 'bn' ? 'চলুন চ্যাট করি' : "Let's connect! 🚀",
              ].map((phrase, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setInputMessage(phrase)}
                  className="px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 whitespace-nowrap transition-colors"
                >
                  {phrase}
                </button>
              ))}
            </div>

            {/* Input Message Form */}
            <form
              onSubmit={handleSend}
              className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center gap-2"
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
                className="p-2 text-neutral-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Attach image"
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setInputMessage((prev) => prev + ' 😊')}
                className="p-2 text-neutral-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Add emoji"
              >
                <Smile className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  lang === 'bn' ? 'মেসেজ লিখুন...' : 'Type a message...'
                }
                className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-transparent focus:border-indigo-500 text-neutral-900 dark:text-neutral-100 outline-none"
              />

              <button
                id="send-message-btn"
                type="submit"
                disabled={!inputMessage.trim() && !chatImage}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition-opacity shadow-sm shadow-indigo-500/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          /* Empty Chat Placeholder */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-neutral-400">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-base text-neutral-800 dark:text-neutral-200 mb-1">
              {lang === 'bn' ? 'কোনো বার্তালাপ নির্বাচন করা হয়নি' : 'No conversation selected'}
            </h3>
            <p className="text-xs max-w-sm text-neutral-500">
              {lang === 'bn'
                ? 'বাম পাশের তালিকা থেকে যেকোনো বন্ধু বা ক্রিয়েটরের সাথে রিয়েল-টাইমে চ্যাট শুরু করুন।'
                : 'Select a contact on the left to start exchanging real-time messages and photos.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
