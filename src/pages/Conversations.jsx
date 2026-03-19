import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Search, Plus, Send, Paperclip, X } from 'lucide-react';
import { useState } from 'react';
import ConversationDetail from '../components/conversations/ConversationDetail';
import ConversationList from '../components/conversations/ConversationList';

export default function Conversations() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeData, setComposeData] = useState({ to: '', subject: '', message: '' });
  const queryClient = useQueryClient();

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations', platformFilter],
    queryFn: () => base44.entities.Conversation.list(),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list(),
  });

  const sendMutation = useMutation({
    mutationFn: (msg) => base44.entities.Conversation.create({
      contact_name: msg.to.split('<')[0].trim(),
      contact_email: msg.to.includes('<') ? msg.to.split('<')[1].replace('>', '') : msg.to,
      subject: msg.subject,
      last_message: msg.message,
      status: 'active'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setComposeOpen(false);
      setComposeData({ to: '', subject: '', message: '' });
    }
  });

  const groupedContacts = (contacts || []).sort((a,b) => a.name.localeCompare(b.name)).reduce((acc, c) => {
    const letter = c.name[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(c);
    return acc;
  }, {});

  const filteredConversations = (conversations || []).filter(conv =>
    conv.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Conversations</h1>
          <Button onClick={() => setComposeOpen(true)} className="gap-2 bg-indigo-600 px-6 shadow-md hover:bg-indigo-700">
            <Plus className="w-5 h-5" /> <MessageSquare className="w-4 h-4 mr-1" /> Compose
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <Card className="p-4 shadow-sm">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                <ConversationList conversations={filteredConversations} selectedId={selectedConversation?.id} onSelect={setSelectedConversation} />
              </div>
            </Card>
          </div>
          <div className="lg:col-span-8">
            {selectedConversation ? <ConversationDetail conversation={selectedConversation} /> : (
              <Card className="h-full flex items-center justify-center p-12 bg-white/50 border-dashed border-2 text-gray-400">
                <div className="text-center"><MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" /><p>Select a contact to view history</p></div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-t-xl">
          <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
            <span className="text-sm font-medium">New Message</span>
            <X className="w-4 h-4 cursor-pointer" onClick={() => setComposeOpen(false)} />
          </div>
          <div className="p-4 space-y-2 bg-white">
            <div className="flex border-b pb-1">
              <span className="text-gray-400 text-sm w-12 pt-1">To:</span>
              <select className="flex-1 text-sm outline-none" value={composeData.to} onChange={(e) => setComposeData({...composeData, to: e.target.value})}>
                <option value="">Select a contact...</option>
                {Object.keys(groupedContacts).map(letter => (
                  <optgroup key={letter} label={`--- ${letter} ---`}>
                    {groupedContacts[letter].map(c => <option key={c.id} value={`${c.name} <${c.email}>`}>{c.name} ({c.email})</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
            <Input placeholder="Subject" className="border-none shadow-none focus-visible:ring-0 text-sm border-b rounded-none" value={composeData.subject} onChange={(e) => setComposeData({...composeData, subject: e.target.value})} />
            <Textarea placeholder="Message..." className="border-none shadow-none focus-visible:ring-0 min-h-[200px] p-0 text-sm" value={composeData.message} onChange={(e) => setComposeData({...composeData, message: e.target.value})} />
          </div>
          <DialogFooter className="p-3 bg-gray-50 flex items-center justify-between border-t">
            <div className="flex gap-2">
              <Button onClick={() => sendMutation.mutate(composeData)} className="bg-blue-600 hover:bg-blue-700 px-6 gap-2">Send <Send className="w-3 h-3" /></Button>
              <Button variant="ghost" size="icon"><Paperclip className="w-4 h-4 text-gray-500" /></Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}