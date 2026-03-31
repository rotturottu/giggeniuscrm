import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, MoreVertical, ShieldCheck, Loader2, Trash2 } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function ConversationDetail({ conversation, onDeleteSuccess }) {
  const [reply, setReply] = useState('');
  const queryClient = useQueryClient();
  const scrollRef = useRef(null);

  // 1. Fetch Identity
  const { data: me } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  const myEmail = me?.email || localStorage.getItem('userEmail');

  // 2. Fetch Messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', conversation.id],
    queryFn: async () => {
      const res = await base44.entities.Message.filter({ conversation_id: conversation.id }, 'created_date');
      return Array.isArray(res) ? res : [];
    },
    refetchInterval: 3000, 
    // Ensure data is considered stale immediately when switching conversations
    cacheTime: 0,
    staleTime: 0,
  });

  // 3. Clear Internal State and Cache when conversation changes
  useEffect(() => {
    setReply('');
    // Explicitly wipe the messages cache for this ID to prevent Person A's data leaking to Person B
    queryClient.setQueryData(['messages', conversation.id], []);
  }, [conversation.id, queryClient]);

  // 4. Auto-scroll to Bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // --- DELETE CONVERSATION MUTATION ---
  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Conversation.delete(conversation.id),
    onSuccess: () => {
      // WIPE CACHE IMMEDIATELY
      queryClient.removeQueries({ queryKey: ['messages', conversation.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      toast.success("Conversation deleted");
      
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    },
    onError: () => toast.error("Failed to delete thread")
  });

  // 5. Send Message
  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      const recipient = myEmail === conversation.sender_email 
        ? conversation.recipient_email 
        : conversation.sender_email;

      await base44.entities.Message.create({
        conversation_id: conversation.id,
        sender_email: myEmail,
        sender_name: me?.firstName ? `${me.firstName} ${me.lastName}` : myEmail,
        recipient_email: recipient,
        body: content,
        created_date: new Date().toISOString()
      });

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
    onError: () => toast.error("Failed to send message")
  });

  const handleSend = () => {
    if (!reply.trim() || !myEmail) return;
    sendMessageMutation.mutate(reply);
  };

  const otherPersonName = myEmail === conversation.sender_email 
    ? (conversation.contact_name || conversation.recipient_email) 
    : (conversation.sender_name || conversation.sender_email);

  return (
    <Card className="h-[calc(100vh-180px)] flex flex-col border-none shadow-sm bg-white overflow-hidden text-left">
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
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Chat</p>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-slate-400 focus-visible:ring-0">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 p-2 shadow-xl border-slate-100">
            <DropdownMenuItem 
              className="text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer font-bold gap-2"
              onClick={() => {
                if (window.confirm("Delete this entire conversation? This cannot be undone.")) {
                  deleteMutation.mutate();
                }
              }}
            >
              <Trash2 className="w-4 h-4" />
              Delete Thread
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 flex flex-col scroll-smooth"
      >
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20">
            <ShieldCheck className="w-12 h-12 text-indigo-200 mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-400 uppercase">Private Thread</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_email === myEmail;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm font-medium shadow-sm leading-relaxed ${
                    isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border'
                  }`}>
                    {msg.body || msg.content}
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase mt-1 px-1 tracking-tight">
                    {msg.created_date ? format(new Date(msg.created_date), 'HH:mm') : 'Just now'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </CardContent>

      <div className="p-4 bg-white border-t">
        <div className="flex items-end gap-3 bg-slate-50 rounded-2xl p-2 border border-slate-100 focus-within:border-indigo-200 transition-all">
          <Textarea
            placeholder="Write your message..."
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