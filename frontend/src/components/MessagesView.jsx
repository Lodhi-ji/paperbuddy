import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { useAuthStore } from '../store/authStore';
import { Search, Send, Loader2, User, MessageSquare, ArrowLeft } from 'lucide-react';

export default function MessagesView({ standaloneContactId }) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedContactId, setSelectedContactId] = useState(standaloneContactId || null);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);

  // If standaloneContactId changes (e.g. reused component), update it
  useEffect(() => {
    if (standaloneContactId) {
      setSelectedContactId(standaloneContactId);
    }
  }, [standaloneContactId]);

  // Fetch contacts
  const { data: contacts, isLoading: contactsLoading } = useQuery({
    queryKey: ['messageContacts'],
    queryFn: () => api.get('/messages/contacts'),
    refetchInterval: 10000,
  });

  // Fetch messages for selected contact
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedContactId],
    queryFn: () => api.get(`/messages/${selectedContactId}`),
    enabled: !!selectedContactId,
    refetchInterval: 5000,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content) => api.post(`/messages/${selectedContactId}`, { content }),
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['messages', selectedContactId] });
      queryClient.invalidateQueries({ queryKey: ['messageContacts'] });
    }
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedContactId) return;
    sendMessageMutation.mutate(messageText);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages]);

  const selectedContact = contacts?.find(c => c.id === selectedContactId);

  return (
    <div className={`relative flex w-full overflow-hidden ${standaloneContactId ? 'h-[600px] rounded-2xl border border-slate-200' : 'h-[calc(100vh-180px)] md:h-[calc(100vh-200px)]'}`}>
      
      {/* ─── CONTACTS LIST (INBOX) ─── */}
      <div 
        className={`w-full md:w-[340px] flex flex-col bg-white md:rounded-l-2xl md:border-y md:border-l border-slate-200 flex-shrink-0 transition-transform duration-300 absolute md:static inset-0 z-10
          ${selectedContactId && !standaloneContactId ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
        `}
      >
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto bg-white scrollbar-hide pb-20 md:pb-0">
          {contactsLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
          ) : contacts?.length === 0 ? (
            <div className="text-center p-8 text-sm text-slate-500">No conversations available.</div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-50">
              {contacts?.map(contact => (
                <button 
                  key={contact.id}
                  onClick={() => setSelectedContactId(contact.id)}
                  className={`flex items-start gap-3 p-4 transition-colors text-left w-full
                    ${selectedContactId === contact.id ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}
                  `}
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 shrink-0 flex items-center justify-center relative border border-indigo-100/50">
                    <User className="w-5 h-5 text-indigo-400" />
                    {contact.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="text-[14px] font-bold text-slate-900 truncate pr-2">{contact.name}</h4>
                      {contact.lastMessageAt && (
                        <span className="text-[11px] font-medium text-slate-400 shrink-0">
                          {new Date(contact.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] px-1.5 py-0.5 rounded flex-shrink-0 font-bold uppercase tracking-wider bg-slate-100 text-slate-500">
                        {contact.role === 'SCHOOL_ADMIN' ? 'Admin' : contact.role === 'ACCOUNTANT' ? 'Staff' : 'Student'}
                      </span>
                      <p className={`text-[13px] truncate ${contact.unreadCount > 0 ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                        {contact.lastMessage || 'Start a conversation'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── CHAT AREA ─── */}
      <div 
        className={`flex-1 flex flex-col bg-[#F4F4F5] md:bg-slate-50 md:rounded-r-2xl md:border-y md:border-r md:border-l border-slate-200 overflow-hidden transition-transform duration-300 absolute md:static inset-0 z-20
          ${selectedContactId || standaloneContactId ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}
      >
        {selectedContactId ? (
          <>
            {/* Chat Header */}
            <div className="h-[72px] md:h-16 px-4 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center gap-3 shrink-0 relative z-10 shadow-sm">
              <button 
                onClick={() => setSelectedContactId(null)}
                className="md:hidden w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 active:scale-95 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center border border-indigo-100/50">
                <User className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[15px] text-slate-900 truncate leading-snug">{selectedContact?.name}</h3>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">{selectedContact?.role.replace('_', ' ')}</p>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {messagesLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
              ) : messages?.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 opacity-50 pb-10">
                  <MessageSquare className="w-10 h-10" />
                  <p className="text-sm font-medium">Say hello to {selectedContact?.name}</p>
                </div>
              ) : (
                messages?.map(msg => {
                  const isMine = msg.senderId === user.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed shadow-sm flex flex-col ${
                        isMine 
                          ? 'bg-indigo-600 text-white rounded-br-sm' 
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                      }`}>
                        <p className="break-words">{msg.content}</p>
                        <span className={`text-[10px] font-medium mt-1 self-end ${isMine ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* Sticky Composer */}
            <div className="p-3 md:p-4 bg-white border-t border-slate-200 pb-[calc(env(safe-area-inset-bottom)+12px)] md:pb-4 mb-[60px] md:mb-0">
              <form onSubmit={handleSend} className="flex items-end gap-2 max-w-4xl mx-auto">
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                    placeholder="Type a message..."
                    className="w-full px-4 py-3 bg-transparent focus:outline-none text-[15px] resize-none min-h-[48px] max-h-[120px] block"
                    rows={1}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={sendMessageMutation.isPending || !messageText.trim()}
                  className="w-12 h-12 flex-shrink-0 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center shadow-md mb-0.5"
                >
                  {sendMessageMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="hidden md:flex flex-1 flex-col items-center justify-center text-slate-400 bg-slate-50/50">
            <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 border border-slate-100">
              <MessageSquare className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-500">Select a conversation</p>
            <p className="text-xs text-slate-400 mt-1">Choose a contact from the sidebar to start messaging</p>
          </div>
        )}
      </div>

    </div>
  );
}
