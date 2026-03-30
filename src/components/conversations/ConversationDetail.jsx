import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Paperclip, MoreVertical, ShieldCheck, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function ConversationDetail({ conversation }) {
  const [reply, setReply] = useState('');
  const queryClient = useQueryClient();
  const scrollRef = useRef(null);

  // 1. Fetch Current User Identity with backup
  const { data: me } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  const myEmail = me?.email || localStorage.getItem('userEmail');

  // 2. Fetch Messages for this specific thread
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', conversation.id],
    queryFn: async () => {
      const res = await base44.entities.Message.filter({ conversation_id: conversation.id }, 'created_date');
      return Array.isArray(res) ? res : [];
    },
    refetchInterval: 3000, 
  });

  // 3. Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 4. Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      // Determine recipient: If I am the sender of the conv, recipient is contact_email.
      // If I am the recipient of the conv, recipient is sender_email.
      const recipient = myEmail === conversation.sender_email 
        ? conversation.recipient_email 
        : conversation.sender_email;

      // Create the message bubble
      await base44.entities.Message.create({
        conversation_id: conversation.id,
        sender_email: myEmail,
        sender_name: me?.firstName ? `${me.firstName} ${me.lastName}` : myEmail,
        recipient_email: recipient,
        body: content,
        is_read: 0,
        created_date: new Date().toISOString()
      });

      // Update conversation preview
      return base44.entities.Conversation.update(conversation.id, {
        last_message: content,
        last_message_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversation.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setReply('');
    },
    onError: () => toast.error("Message failed to send")
  });

  const handleSend = () => {
    if (!reply.trim() || !myEmail) return;
    sendMessageMutation.mutate(reply);
  };

  // Determine which name to show in the Header
  const otherPersonName = myEmail === conversation.sender_email 
    ? (conversation.contact_name || conversation.recipient_email) 
    : (conversation.sender_name || conversation.sender_email);

  return (
    <Card className="h-[calc(100vh-180px)] flex flex-col border-none shadow-sm bg-white overflow-hidden text-left">
      {/* Header */}
      <CardHeader className="border-b py-3 px-6 bg-white flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10 border-2 border-indigo-50">
            <AvatarFallback className="bg-indigo-600 text-white font-bold text-xs">
              {otherPersonName?.[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base font-bold text-slate-800">{otherPersonName}</CardTitle>
            <div className="flex items-center gap-1.5">
               <div className="h-2 w-2 rounded-full bg-green-500" />
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Teammate</p>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-slate-400"><MoreVertical className="w-5 h-5" /></Button>
      </CardHeader>

      {/* Chat Area */}
      <CardContent 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 custom-scrollbar"
      >
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-indigo-200">
                <ShieldCheck className="w-8 h-8" />
            </div>
            <p className="text-sm font-bold text-slate-400">Secure Conversation</p>
            <p className="text-xs text-slate-300">Start the discussion below.</p>
          </div>
        ) : (
          messages.map((msg) => {
            // CRITICAL FIX: Identity check for alignment
            const isMe = msg.sender_email === myEmail;
            
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm font-medium shadow-sm leading-relaxed ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                    }`}
                  >
                    {msg.body || msg.content}
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase mt-1.5 px-1">
                    {msg.sender_name && !isMe ? `${msg.sender_name} • ` : ''}
                    {msg.created_date ? format(new Date(msg.created_date), 'HH:mm') : 'Just now'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </CardContent>

      {/* Footer / Input */}
      <div className="p-4 bg-white border-t">
        <div className="flex items-end gap-3 bg-slate-50 rounded-2xl p-2 border border-slate-100 focus-within:border-indigo-200 transition-all">
          <Textarea
            placeholder="Write a message..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="flex-1 min-h-[45px] max-h-[150px] border-none bg-transparent shadow-none focus-visible:ring-0 resize-none py-3 px-2 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <div className="flex items-center gap-1 pb-1 pr-1">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl">
              <Paperclip className="w-5 h-5" />
            </Button>
            <Button
              onClick={handleSend}
              disabled={!reply.trim() || sendMessageMutation.isPending}
              className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md font-bold transition-all active:scale-95"
            >
              {sendMessageMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}