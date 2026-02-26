import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Facebook, Linkedin, Instagram } from 'lucide-react';
import { format } from 'date-fns';

export default function ConversationList({ conversations, selectedId, onSelect }) {
  const platformIcons = {
    gmail: Mail,
    outlook: Mail,
    facebook: Facebook,
    linkedin: Linkedin,
    instagram: Instagram,
  };

  const platformColors = {
    gmail: 'text-red-600',
    outlook: 'text-blue-600',
    facebook: 'text-blue-700',
    linkedin: 'text-blue-600',
    instagram: 'text-pink-600',
  };

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No conversations found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
      {conversations.map((conv) => {
        const Icon = platformIcons[conv.platform] || Mail;
        const isSelected = conv.id === selectedId;
        
        return (
          <Card
            key={conv.id}
            className={`p-3 cursor-pointer hover:shadow-md transition-all ${
              isSelected ? 'border-2 border-blue-500 bg-blue-50' : ''
            } ${conv.unread_count > 0 ? 'bg-blue-50/50' : ''}`}
            onClick={() => onSelect(conv)}
          >
            <div className="flex gap-3">
              <Avatar>
                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  {conv.contact_name?.[0]?.toUpperCase() || conv.contact_email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <p className={`font-semibold text-sm truncate ${
                    conv.unread_count > 0 ? 'text-gray-900' : 'text-gray-700'
                  }`}>
                    {conv.contact_name || conv.contact_email}
                  </p>
                  {conv.last_message_at && (
                    <span className="text-xs text-gray-500 ml-2">
                      {format(new Date(conv.last_message_at), 'MMM d')}
                    </span>
                  )}
                </div>
                
                <p className={`text-xs truncate mb-1 ${
                  conv.unread_count > 0 ? 'text-gray-700 font-medium' : 'text-gray-500'
                }`}>
                  {conv.subject || conv.last_message}
                </p>
                
                <div className="flex items-center justify-between">
                  <Icon className={`w-3 h-3 ${platformColors[conv.platform]}`} />
                  {conv.unread_count > 0 && (
                    <Badge className="bg-blue-600 text-white text-xs">
                      {conv.unread_count}
                    </Badge>
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