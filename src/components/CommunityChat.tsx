import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Profile } from '../types';
import { db } from '../services/db';
import { useToast } from './Toast';
import {
  Send,
  MessageSquare,
  Users,
  ShieldCheck,
  Trash2,
  Smile,
  Sparkles,
} from 'lucide-react';

interface CommunityChatProps {
  currentUser: Profile;
}

export const CommunityChat: React.FC<CommunityChatProps> = ({ currentUser }) => {
  const { showToast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(db.getChatMessages());
  const [inputMessage, setInputMessage] = useState('');
  const [onlineMembers, setOnlineMembers] = useState<Profile[]>([]);

  useEffect(() => {
    setMessages(db.getChatMessages());
    setOnlineMembers(db.getProfiles().filter((p) => p.is_active));

    // Realtime subscription via BroadcastChannel / Event bus
    const unsubscribe = db.subscribe('chat', () => {
      setMessages(db.getChatMessages());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const res = db.sendChatMessage(inputMessage);
    if (res.success) {
      setInputMessage('');
      setMessages(db.getChatMessages());
    } else {
      showToast('error', 'Message error', res.error);
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    const res = db.deleteChatMessage(messageId);
    if (res.success) {
      showToast('info', 'Message deleted');
      setMessages(db.getChatMessages());
    } else {
      showToast('error', 'Cannot delete message', res.error);
    }
  };

  const handleQuickInsert = (text: string) => {
    setInputMessage((prev) => `${prev} ${text}`.trim());
  };

  return (
    <div className="h-[calc(100vh-10rem)] min-h-[550px] flex flex-col md:flex-row rounded-3xl border border-white/10 bg-[#191a1e] shadow-2xl overflow-hidden animate-in fade-in duration-300">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col justify-between h-full bg-[#131418]/90 border-b md:border-b-0 md:border-r border-white/10">
        {/* Chat Room Top Bar */}
        <div className="px-6 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#191a1e] backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#acffce]">
              <MessageSquare className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2 font-mono">
                <h2 className="text-sm font-bold text-white tracking-wide">#community-general</h2>
                <span className="flex items-center gap-1 text-[10px] text-[#acffce] bg-[#acffce]/10 px-2 py-0.5 rounded-full border border-[#acffce]/30 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#acffce] animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-[11px] text-white/40 font-mono">
                BST Tech Club Realtime Discussion Channel
              </p>
            </div>
          </div>

          <div className="text-right hidden sm:block font-mono text-xs text-white/40">
            <p>
              Logged in as <span className="text-[#acffce] font-semibold">{currentUser.full_name}</span>
            </p>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 font-mono">
              <Sparkles className="w-8 h-8 text-[#acffce]" />
              <p className="text-sm font-medium text-white">
                Start the conversation with your TechVerse community.
              </p>
              <p className="text-xs text-white/40 max-w-sm">
                Discuss Hacktoberfest pull requests, share resources, or collaborate on hackathons.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isCurrentUser = msg.user_id === currentUser.id;
              const isAdmin = currentUser.role === 'admin';
              const canModerate = isCurrentUser || isAdmin;
              const showHeader =
                index === 0 || messages[index - 1].user_id !== msg.user_id;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 group ${
                    isCurrentUser ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Sender Avatar */}
                  <img
                    src={msg.user_avatar}
                    alt={msg.user_name}
                    className="w-8 h-8 rounded-full object-cover bg-black/40 border border-white/10 shrink-0 mt-0.5"
                    referrerPolicy="no-referrer"
                  />

                  {/* Message Bubble Container */}
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] space-y-1 ${
                      isCurrentUser ? 'items-end' : 'items-start'
                    }`}
                  >
                    {showHeader && (
                      <div
                        className={`flex items-center gap-2 text-[11px] font-mono ${
                          isCurrentUser ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <span className="font-semibold text-white/80">
                          {isCurrentUser ? 'You' : msg.user_name}
                        </span>
                        {msg.user_role === 'admin' && (
                          <span className="text-[9px] uppercase tracking-wider text-[#acffce] bg-[#acffce]/10 px-1 py-0.2 rounded border border-[#acffce]/30">
                            Lead
                          </span>
                        )}
                        <span className="text-white/40 text-[10px]">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    )}

                    <div
                      className={`relative px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isCurrentUser
                          ? 'bg-[#acffce] text-[#191a1e] font-medium rounded-tr-none shadow-sm'
                          : 'bg-[#191a1e] border border-white/10 text-white/80 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.message}</p>

                      {/* Moderation / Delete Button on hover */}
                      {canModerate && (
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className={`absolute top-1 p-1 rounded text-white/40 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${
                            isCurrentUser ? '-left-7' : '-right-7'
                          }`}
                          title={isAdmin && !isCurrentUser ? 'Admin Delete Message' : 'Delete Message'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick reaction chips */}
        <div className="px-4 py-2 bg-[#131418] border-t border-white/5 flex items-center gap-2 overflow-x-auto text-xs font-mono">
          <span className="text-[10px] text-white/40 uppercase">Quick:</span>
          {['🚀 LFG', '🔥 Merged PR!', '💡 Check Idea Board', '🏆 GG', '👀 Anyone building with Go?'].map(
            (tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleQuickInsert(tag)}
                className="px-2.5 py-0.5 rounded-full bg-[#191a1e] border border-white/10 text-[11px] text-white/60 hover:text-[#acffce] hover:border-[#acffce]/40 transition-all whitespace-nowrap cursor-pointer"
              >
                {tag}
              </button>
            )
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-[#191a1e] border-t border-white/10">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Message #community-general (Press Enter)..."
              className="flex-1 px-4 py-2.5 rounded-full bg-[#131418] border border-white/10 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#acffce] transition-colors"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="button-orbit is-primary !p-2.5 !rounded-full transition-all disabled:opacity-30 cursor-pointer shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Online Community Members Sidebar */}
      <div className="w-full md:w-64 bg-[#191a1e] p-4 flex flex-col justify-between border-t md:border-t-0 border-white/10 font-mono">
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-white/40 tracking-wider">
              <Users className="w-3.5 h-3.5 text-[#acffce]" />
              <span>BST Members ({onlineMembers.length})</span>
            </div>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[380px]">
            {onlineMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#202227] transition-colors group cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={member.avatar_url}
                    alt={member.full_name}
                    className="w-7 h-7 rounded-full object-cover bg-black/40 border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#acffce] ring-2 ring-[#191a1e]" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white group-hover:text-[#acffce] transition-colors truncate">
                    {member.full_name}
                  </p>
                  <p className="text-[10px] text-white/40 truncate">{member.year}</p>
                </div>

                {member.role === 'admin' && (
                  <span className="text-[9px] uppercase tracking-wider text-[#acffce] bg-[#acffce]/10 px-1 py-0.5 rounded border border-[#acffce]/30">
                    Lead
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Channel Guidelines */}
        <div className="mt-4 p-3 rounded-xl bg-[#131418] border border-white/5 text-[11px] text-white/50">
          <p className="font-semibold text-white/80 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#acffce]" />
            Club Code of Conduct
          </p>
          <p className="leading-relaxed">
            Respect fellow hackers. Keep discussions tech-centric and collaborative.
          </p>
        </div>
      </div>
    </div>
  );
};
