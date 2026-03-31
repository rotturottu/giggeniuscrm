import { base44 } from '@/api/base44Client';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Search, Plus, Send, X, FolderOpen, Save, Trash2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ConversationDetail from '../components/conversations/ConversationDetail';
import ConversationList from '../components/conversations/ConversationList';

export default function Conversations() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter] = useState('all');
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeData, setComposeData] = useState({ to: '', subject: '', message: '', id: null });
  const queryClient = useQueryClient();

  const { data: me } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  const myEmail = me?.email || localStorage.getItem('userEmail');

  // --- SESSION ISOLATION: Wipe everything if the user account changes ---
  useEffect(() => {
    setSelectedConversation(null);
    queryClient.clear(); // Complete cache wipe to prevent cross-account leakage
  }, [myEmail, queryClient]);

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations', platformFilter, myEmail],
    queryFn: async () => {
      const res = await base44.entities.Conversation.filter({ 
        status: 'active',
        participant_email: myEmail 
      }, '-last_message_at');
      return Array.isArray(res) ? res : [];
    },
    enabled: !!myEmail
  });

  const { data: drafts = [] } = useQuery({
    queryKey: ['conversations', 'drafts', myEmail],
    queryFn: async () => {
      const res = await base44.entities.Conversation.filter({ 
        status: 'draft', 
        sender_email: myEmail 
      }, '-last_message_at');
      return Array.isArray(res) ? res : [];
    },
    enabled: !!myEmail
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts', 'list'],
    queryFn: () => base44.entities.Contact.list().catch(() => []),
  });

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const conv = payload.id 
        ? await base44.entities.Conversation.update(payload.id, payload)
        : await base44.entities.Conversation.create(payload);
      
      if (payload.status === 'active') {
        await base44.entities.Message.create({
          conversation_id: conv.id,
          sender_email: payload.sender_email,
          sender_name: payload.sender_name,
          recipient_email: payload.recipient_email,
          body: payload.last_message,
          created_date: new Date().toISOString()
        });
      }
      return conv;
    },
    onSuccess: (newConv) => {
      // 1. Force the detail window to close and PURGE the cache for this thread
      setSelectedConversation(null);
      queryClient.removeQueries({ queryKey: ['messages', newConv.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });

      setComposeOpen(false);
      setComposeData({ to: '', subject: '', message: '', id: null });
      
      // 2. Open the fresh, empty-history window after a slight delay
      setTimeout(() => setSelectedConversation(newConv), 100);
      toast.success("New thread started!");
    }
  });

  const deleteDraftMutation = useMutation({
    mutationFn: (id) => base44.entities.Conversation.delete(id),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        toast.success("Draft deleted");
    }
  });

  const handleAction = (status = 'active') => {
    if (!composeData.to || !composeData.message) return toast.error("Check recipient and message content");
    if (!myEmail) return toast.error("Session expired. Please log in.");

    const selectedContact = contacts.find(c => c.email === composeData.to);
    const recipientName = selectedContact ? selectedContact.name : composeData.to;

    const payload = {
      contact_name: recipientName,
      contact_email: composeData.to,
      sender_email: myEmail,
      recipient_email: composeData.to,
      sender_name: me?.firstName ? `${me.firstName} ${me.lastName}` : myEmail,
      subject: composeData.subject || "(No Subject)",
      last_message: composeData.message,
      status: status,
      platform: 'crm',
      last_message_at: new Date().toISOString()
    };

    if (composeData.id) payload.id = composeData.id;
    saveMutation.mutate(payload);
  };

  const filteredConversations = conversations.filter(conv => {
    const search = searchTerm.toLowerCase();
    return (conv?.contact_name || '').toLowerCase().includes(search) || 
           (conv?.contact_email || '').toLowerCase().includes(search);
  });

  const handleConversationDeleted = () => {
    // Hard wipe of messages cache when a window is deleted
    if (selectedConversation) {
      queryClient.removeQueries({ queryKey: ['messages', selectedConversation.id] });
    }
    setSelectedConversation(null);
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-6 text-left">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-3">
             <MessageSquare className="text-indigo-600 w-8 h-8" /> Conversations
          </h1>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 border-slate-200 bg-white font-bold">
                  <FolderOpen className="w-4 h-4 text-amber-500" /> Drafts ({drafts.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 shadow-xl border-slate-100">
                {drafts.length === 0 ? <p className="p-4 text-center text-xs text-gray-400 font-bold">No drafts</p> : 
                  drafts.map(d => (
                    <div key={d.id} className="flex items-center hover:bg-slate-50 rounded-lg px-2 group">
                      <DropdownMenuItem className="flex-1 cursor-pointer py-3 border-none outline-none" onClick={() => {
                        setSelectedConversation(null); // Wipe UI before opening draft
                        setComposeData({ id: d.id, to: d.contact_email, subject: d.subject, message: d.last_message });
                        setComposeOpen(true);
                      }}>
                        <div className="flex flex-col text-left">
                           <span className="text-sm font-bold truncate">{d.subject || '(No Subject)'}</span>
                           <span className="text-[10px] text-gray-400 font-bold">To: {d.contact_name}</span>
                        </div>
                      </DropdownMenuItem>
                      <Trash2 className="w-4 h-4 text-slate-300 hover:text-red-500 cursor-pointer transition-colors" onClick={(e) => { e.stopPropagation(); deleteDraftMutation.mutate(d.id); }} />
                    </div>
                  ))
                }
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={() => { 
              setSelectedConversation(null); 
              setComposeData({ to: '', subject: '', message: '', id: null }); 
              setComposeOpen(true); 
            }} className="gap-2 bg-indigo-600 px-6 font-bold shadow-indigo-200 shadow-xl hover:bg-indigo-700 transition-all active:scale-95">
              <Plus className="w-4 h-4" /> Compose
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <Card className="p-4 border-none shadow-sm bg-white rounded-2xl">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search threads..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 h-11 border-slate-100 bg-slate-50 font-bold rounded-xl" />
                </div>
                {isLoading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" /></div> : 
                    <ConversationList 
                        conversations={filteredConversations} 
                        selectedId={selectedConversation?.id} 
                        onSelect={(c) => {
                            // FORCE CLEARANCE ON SELECTION
                            setSelectedConversation(null);
                            setTimeout(() => setSelectedConversation(c), 20);
                        }} 
                    />
                }
              </div>
            </Card>
          </div>
          
          <div className="lg:col-span-8">
            {selectedConversation ? (
              <ConversationDetail 
                key={selectedConversation.id} // CRITICAL: This destroys the component when switching users
                conversation={selectedConversation} 
                onDeleteSuccess={handleConversationDeleted}
              />
            ) : (
              <Card className="h-full min-h-[550px] flex items-center justify-center bg-white border-none shadow-sm text-center p-8 rounded-2xl">
                <div className="max-w-xs space-y-3">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <MessageSquare className="w-10 h-10 text-slate-200" />
                  </div>
                  <p className="font-bold text-slate-600 text-lg">Identity Verified</p>
                  <p className="text-sm text-slate-400">Your messages are strictly private and isolated. Select a thread to view history.</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
          <DialogHeader className="bg-slate-900 text-white p-6">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Send className="w-5 h-5 text-indigo-400" /> Secure Message
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-medium">Messages are isolated per user account.</DialogDescription>
          </DialogHeader>
          <div className="p-6 space-y-4 bg-white text-left">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Recipient</Label>
              <select className="w-full h-11 px-3 rounded-xl border border-slate-100 bg-slate-50 text-sm font-bold outline-none ring-offset-white focus:ring-2 focus:ring-indigo-500/20" value={composeData.to} onChange={(e) => setComposeData({...composeData, to: e.target.value})}>
                <option value="">Select a teammate...</option>
                {contacts.map(c => <option key={c.id} value={c.email}>{c.name} ({c.email})</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
               <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Subject</Label>
               <Input placeholder="Thread topic" className="h-11 border-slate-100 bg-slate-50 font-bold px-4 rounded-xl" value={composeData.subject} onChange={(e) => setComposeData({...composeData, subject: e.target.value})} />
            </div>
            <div className="space-y-1.5">
               <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Initial Message</Label>
               <Textarea placeholder="Type your first message..." className="min-h-[180px] border-slate-100 bg-slate-50 p-4 rounded-xl resize-none text-sm font-medium" value={composeData.message} onChange={(e) => setComposeData({...composeData, message: e.target.value})} />
            </div>
          </div>
          <DialogFooter className="p-6 bg-slate-50/50 border-t border-slate-100">
            <div className="flex gap-3 w-full">
              <Button onClick={() => handleAction('active')} disabled={saveMutation.isPending} className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-12 font-bold rounded-xl shadow-lg shadow-indigo-100">
                {saveMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Send Message"}
              </Button>
              <Button variant="outline" onClick={() => handleAction('draft')} disabled={saveMutation.isPending} className="h-12 border-slate-200 bg-white rounded-xl text-slate-600 px-6 font-bold">
                <Save className="w-4 h-4 mr-2" /> Save Draft
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}