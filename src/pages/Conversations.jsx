import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Search, Plus, Send, Paperclip, X, FileIcon, FolderOpen, Save, Trash2, User } from 'lucide-react';
import { useState, useRef } from 'react';
import ConversationDetail from '../components/conversations/ConversationDetail';
import ConversationList from '../components/conversations/ConversationList';

export default function Conversations() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeData, setComposeData] = useState({ to: '', subject: '', message: '', id: null });
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  // 1. Fetch Active Conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations', platformFilter],
    queryFn: () => base44.entities.Conversation.filter({ status: 'active' }, '-last_message_at').catch(() => []),
  });

  // 2. Fetch Drafts
  const { data: drafts = [] } = useQuery({
    queryKey: ['conversations', 'drafts'],
    queryFn: () => base44.entities.Conversation.filter({ status: 'draft' }, '-last_message_at').catch(() => []),
  });

  // 3. Fetch Contacts (FETCHING FROM CONTACTS TABLE)
  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts', 'all'],
    queryFn: () => base44.entities.Contact.list().catch(() => []),
    refetchOnWindowFocus: true
  });

  const saveMutation = useMutation({
    mutationFn: (msg) => msg.id 
      ? base44.entities.Conversation.update(msg.id, msg)
      : base44.entities.Conversation.create(msg),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setComposeOpen(false);
      setComposeData({ to: '', subject: '', message: '', id: null });
      setAttachedFile(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Conversation.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] })
  });

  const handleAction = (status = 'active') => {
    if (!composeData.to) return alert("Please select a recipient");
    
    // Split the "Name <email>" string back into parts
    const parts = composeData.to.split('<');
    const name = parts[0].trim();
    const email = parts[1] ? parts[1].replace('>', '') : name;

    saveMutation.mutate({
      ...composeData,
      contact_name: name,
      contact_email: email,
      status: status,
      platform: 'gmail',
      last_message: composeData.message,
      last_message_at: new Date().toISOString()
    });
  };

  // Restoring Filter Logic
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = (conv?.contact_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (conv?.contact_email || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (platformFilter === 'all') return matchesSearch;
    if (platformFilter === 'gmail') return matchesSearch && conv.platform === 'gmail';
    if (platformFilter === 'social') return matchesSearch && (conv.platform === 'facebook' || conv.platform === 'instagram');
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Conversations</h1>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 border-gray-200 bg-white">
                  <FolderOpen className="w-4 h-4 text-amber-500" /> Drafts ({drafts.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {drafts.length === 0 ? <p className="p-4 text-center text-xs text-gray-400">No drafts</p> : 
                  drafts.map(d => (
                    <div key={d.id} className="flex items-center hover:bg-gray-50 px-2 border-b last:border-0">
                      <DropdownMenuItem className="flex-1 cursor-pointer py-3" onClick={() => {
                        setComposeData({ id: d.id, to: `${d.contact_name} <${d.contact_email}>`, subject: d.subject, message: d.last_message });
                        setComposeOpen(true);
                      }}>
                        <div className="flex flex-col text-left"><span className="text-sm font-bold truncate">{d.subject || '(No Subject)'}</span><span className="text-[10px] text-gray-400">{d.contact_name}</span></div>
                      </DropdownMenuItem>
                      <Trash2 className="w-3 h-3 text-gray-300 hover:text-red-500 cursor-pointer" onClick={() => deleteMutation.mutate(d.id)} />
                    </div>
                  ))
                }
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={() => setComposeOpen(true)} className="gap-2 bg-indigo-600 px-6 shadow-md hover:bg-indigo-700">
              <Plus className="w-5 h-5" /> <MessageSquare className="w-4 h-4 mr-1" /> Compose
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <Card className="p-4 shadow-sm border-gray-100 bg-white/80 backdrop-blur">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search messages..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border-gray-200 focus:ring-indigo-500" />
                </div>

                <Tabs value={platformFilter} onValueChange={setPlatformFilter} className="w-full">
                  <TabsList className="grid grid-cols-4 w-full h-9 bg-gray-100/50">
                    <TabsTrigger value="all" className="text-[10px] sm:text-xs">All</TabsTrigger>
                    <TabsTrigger value="gmail" className="text-[10px] sm:text-xs">Email</TabsTrigger>
                    <TabsTrigger value="name" className="text-[10px] sm:text-xs">Name</TabsTrigger>
                    <TabsTrigger value="social" className="text-[10px] sm:text-xs">Social</TabsTrigger>
                  </TabsList>
                </Tabs>

                <ConversationList conversations={filteredConversations} selectedId={selectedConversation?.id} onSelect={setSelectedConversation} />
              </div>
            </Card>
          </div>
          <div className="lg:col-span-8">
            {selectedConversation ? <ConversationDetail conversation={selectedConversation} /> : (
              <Card className="h-full min-h-[500px] flex items-center justify-center bg-white shadow-sm border-gray-100">
                <div className="text-center text-gray-400">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20 text-indigo-500" />
                  <p className="font-medium">Select a conversation to view history</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-xl border-none shadow-2xl">
          <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
            <span className="text-sm font-bold tracking-tight">New Message</span>
            <X className="w-4 h-4 cursor-pointer opacity-70 hover:opacity-100" onClick={() => setComposeOpen(false)} />
          </div>
          <div className="p-4 space-y-3 bg-white">
            <div className="flex border-b border-gray-100 pb-2 items-center">
              <span className="text-gray-400 text-sm w-12 pt-0">To:</span>
              <select 
                className="flex-1 text-sm outline-none bg-transparent py-2 font-medium" 
                value={composeData.to} 
                onChange={(e) => setComposeData({...composeData, to: e.target.value})}
              >
                <option value="">Choose a contact from list...</option>
                {contacts.length > 0 ? (
                  contacts.sort((a,b) => (a.name||"").localeCompare(b.name||"")).map(c => (
                    <option key={c.id} value={`${c.name} <${c.email}>`}>
                      {c.name} ({c.email})
                    </option>
                  ))
                ) : (
                  <option disabled>No contacts found. Please add them in Contacts tab.</option>
                )}
              </select>
            </div>
            <Input placeholder="Subject" className="border-none shadow-none focus-visible:ring-0 text-sm border-b border-gray-100 rounded-none p-0 h-10 font-medium" value={composeData.subject} onChange={(e) => setComposeData({...composeData, subject: e.target.value})} />
            <Textarea placeholder="Message body..." className="border-none shadow-none focus-visible:ring-0 min-h-[250px] p-0 pt-2 text-sm resize-none" value={composeData.message} onChange={(e) => setComposeData({...composeData, message: e.target.value})} />
            
            {attachedFile && (
              <div className="flex items-center gap-2 p-2 bg-indigo-50 rounded border border-indigo-100 text-xs text-indigo-700">
                <FileIcon className="w-3 h-3" />
                <span className="flex-1 truncate">{attachedFile.name}</span>
                <X className="w-3 h-3 cursor-pointer" onClick={() => setAttachedFile(null)} />
              </div>
            )}
          </div>
          <DialogFooter className="p-4 bg-gray-50 border-t border-gray-100">
            <div className="flex gap-2 w-full">
              <Button onClick={() => handleAction('active')} className="bg-blue-600 hover:bg-blue-700 px-8 font-bold rounded-full shadow-lg">
                Send <Send className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" onClick={() => handleAction('draft')} className="gap-2 border-gray-200 bg-white rounded-full text-gray-600 px-6">
                <Save className="w-4 h-4" /> Save Draft
              </Button>
              
              <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setAttachedFile(e.target.files[0])} />
              <Button variant="ghost" size="icon" className="ml-auto hover:bg-gray-200 rounded-full" onClick={() => fileInputRef.current.click()}>
                <Paperclip className="w-5 h-5 text-gray-500" />
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}