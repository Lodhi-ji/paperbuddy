import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { useAuthStore } from '../store/authStore';
import { Search, Send, Loader2, User, MessageSquare } from 'lucide-react';

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
    refetchInterval: 10000, // Poll every 10s for new messages/read status
  });

  // Fetch messages for selected contact
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedContactId],
    queryFn: () => api.get(`/messages/${selectedContactId}`),
    enabled: !!selectedContactId,
    refetchInterval: 5000, // Poll every 5s for active chat
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content) => api.post(`/messages/${selectedContactId}`, { content }),
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries(['messages', selectedContactId]);
      queryClient.invalidateQueries(['messageContacts']);
    }
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedContactId) return;
    sendMessageMutation.mutate(messageText);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectedContact = contacts?.find(c => c.id === selectedContactId);

  return (
    <div className={`flex gap-6 ${standaloneContactId ? 'h-[600px]' : 'h-[calc(100vh-140px)] p-6'}`}>
      {/* Contacts Sidebar */}
      {!standaloneContactId && (
        <div className="w-1/3 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-primary" />
            Messages
          </h2>
        </div>
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search contacts..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {contactsLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
          ) : contacts?.length === 0 ? (
            <div className="text-center p-8 text-sm text-slate-500">No contacts available.</div>
          ) : (
            <div className="flex flex-col">
              {contacts?.map(contact => (
                <button 
                  key={contact.id}
                  onClick={() => setSelectedContactId(contact.id)}
                  className={`flex items-start gap-3 p-4 border-b border-slate-50 transition-colors text-left
                    ${selectedContactId === contact.id ? 'bg-brand-primary/5 border-l-4 border-l-brand-primary' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0 flex items-center justify-center relative">
                    <User className="w-5 h-5 text-slate-500" />
                    {contact.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="text-sm font-bold text-slate-800 truncate">{contact.name}</h4>
                      {contact.lastMessageAt && (
                        <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                          {new Date(contact.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 font-semibold uppercase shrink-0">
                        {contact.role === 'SCHOOL_ADMIN' ? 'Admin' : contact.role === 'ACCOUNTANT' ? 'Staff' : 'Student'}
                      </span>
                      <p className={`text-xs truncate ${contact.unreadCount > 0 ? 'text-slate-800 font-semibold' : 'text-slate-500'}`}>
                        {contact.lastMessage || 'Click to start chatting'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        {selectedContactId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                <User className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{selectedContact?.name}</h3>
                <p className="text-xs text-slate-500 capitalize">{selectedContact?.role.replace('_', ' ').toLowerCase()}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {messagesLoading ? (
                <div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
              ) : messages?.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <MessageSquare className="w-8 h-8 opacity-20" />
                  <p className="text-sm">Start a conversation with {selectedContact?.name}</p>
                </div>
              ) : (
                messages?.map(msg => {
                  const isMine = msg.senderId === user.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                        isMine 
                          ? 'bg-brand-primary text-white rounded-br-sm' 
                          : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'
                      }`}>
                        <p>{msg.content}</p>
                        <span className={`text-[10px] mt-1 block ${isMine ? 'text-brand-primary-light/80' : 'text-slate-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm"
                />
                <button 
                  type="submit"
                  disabled={sendMessageMutation.isPending || !messageText.trim()}
                  className="px-4 py-2.5 bg-brand-primary text-white rounded-xl hover:bg-brand-secondary transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {sendMessageMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm font-medium">Select a contact to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
