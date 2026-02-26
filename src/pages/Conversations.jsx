import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Search } from 'lucide-react';
import { useState } from 'react';
import ConversationDetail from '../components/conversations/ConversationDetail';
import ConversationList from '../components/conversations/ConversationList';

export default function Conversations() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations', platformFilter],
    queryFn: () => {
      if (platformFilter === 'all') {
        return base44.entities.Conversation.filter({ status: 'active' }, '-last_message_at');
      }
      return base44.entities.Conversation.filter({ 
        status: 'active', 
        platform: platformFilter 
      }, '-last_message_at');
    },
  });

  const filteredConversations = conversations.filter(conv =>
    conv.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = conversations.filter(c => c.unread_count > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Conversations
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Manage all your communications in one place</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-4">
            <Card className="p-4">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Tabs value={platformFilter} onValueChange={setPlatformFilter}>
                  <TabsList className="w-full">
                    <TabsTrigger value="all" className="flex-1">
                      All
                      {unreadCount > 0 && (
                        <Badge className="ml-2 bg-red-500 text-white">{unreadCount}</Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="gmail">Email</TabsTrigger>
                    <TabsTrigger value="facebook">Social</TabsTrigger>
                  </TabsList>
                </Tabs>

                <ConversationList
                  conversations={filteredConversations}
                  selectedId={selectedConversation?.id}
                  onSelect={setSelectedConversation}
                />
              </div>
            </Card>
          </div>

          <div className="lg:col-span-8">
            {selectedConversation ? (
              <ConversationDetail conversation={selectedConversation} />
            ) : (
              <Card className="h-full min-h-[400px] lg:min-h-0 flex items-center justify-center p-6 sm:p-12">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                    No conversation selected
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500">
                    Select a conversation from the list to view messages
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}