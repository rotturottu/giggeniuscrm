import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Facebook, Linkedin, Instagram, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function ConversationList({ conversations, selectedId, onSelect }) {
  // Fetch current user to know who "Me" is
  const { data: me } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => base44.auth.me(),
  });

  const platformIcons = {
    crm: MessageSquare,
    gmail: Mail,
    facebook: Facebook,
    instagram: Instagram,
  };

  const platformColors = {
    crm: 'text-indigo-600',
    gmail: 'text-red-600',
    facebook: 'text-blue-700',
    instagram: 'text-pink-600',
  };

  const safeConversations = Array.isArray(conversations) ? conversations : [];

  if (safeConversations.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        <MessageSquare className="w-8 h-8 text-slate-200 mx-auto mb-2" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No messages yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-1 custom-scrollbar">
      {safeConversations.map((conv) => {
        const Icon = platformIcons[conv.platform] || MessageSquare;
        const isSelected = conv.id === selectedId;
        
        // DYNAMIC LOGIC: If I sent the last message, show the recipient's name. 
        // If they sent it, show their name.
        const displayName = conv.sender_email === me?.email 
          ? (conv.contact_name || conv.recipient_email) 
          : (conv.sender_name || conv.sender_email || "Teammate");

        const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

        return (
          <Card
            key={conv.id}
            className={`p-4 cursor-pointer transition-all border-none shadow-none group relative ${
              isSelected ? 'bg-indigo-50' : 'bg-white hover:bg-slate-50'
            }`}
            onClick={() => onSelect(conv)}
          >
            {isSelected && <div className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-r-full" />}
            
            <div className="flex gap-4">
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-black">
                  {initials || '?'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <p className={`text-sm truncate font-bold ${
                    isSelected ? 'text-indigo-900' : 'text-slate-700'
                  }`}>
                    {displayName}
                  </p>
                  {conv.last_message_at && (
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {format(new Date(conv.last_message_at), 'HH:mm')}
                    </span>
                  )}
                </div>
                
                <p className="text-xs truncate text-slate-500 font-medium">
                  {conv.last_message || conv.subject || "Started a conversation"}
                </p>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <Icon className={`w-3 h-3 ${platformColors[conv.platform] || 'text-slate-400'}`} />
                    <span className="text-[9px] font-black uppercase text-slate-300 tracking-tighter">{conv.platform || 'crm'}</span>
                  </div>
                  {conv.unread_count > 0 && (
                    <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}