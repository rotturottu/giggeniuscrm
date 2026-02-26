import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function ConversationDetail({ conversation }) {
  const [reply, setReply] = useState('');
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', conversation.id],
    queryFn: () => base44.entities.Message.filter({ conversation_id: conversation.id }, 'created_date'),
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.Message.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversation.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setReply('');
      toast.success('Message sent');
    },
  });

  const handleSend = () => {
    if (!reply.trim()) return;

    sendMessageMutation.mutate({
      conversation_id: conversation.id,
      sender_email: 'me',
      sender_name: 'Me',
      content: reply,
      platform: conversation.platform,
      is_outbound: true,
      read: true,
    });
  };

  return (
    <Card className="h-[calc(100vh-200px)] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                {conversation.contact_name?.[0]?.toUpperCase() || conversation.contact_email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{conversation.contact_name || conversation.contact_email}</CardTitle>
              <p className="text-sm text-gray-600">{conversation.subject}</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No messages yet
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.is_outbound ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.is_outbound
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {!message.is_outbound && (
                  <p className="text-xs font-semibold mb-1">{message.sender_name}</p>
                )}
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.is_outbound ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {format(new Date(message.created_date), 'MMM d, h:mm a')}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            placeholder="Type your message..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="flex-1 min-h-[60px] max-h-[120px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <div className="flex flex-col gap-2">
            <Button variant="outline" size="icon">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleSend}
              disabled={!reply.trim() || sendMessageMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}