import { base44 } from '@/api/base44Client';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Search, Plus, Send, Paperclip, X, FileIcon, FolderOpen, Save, Trash2, User, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
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

  // 0. Fetch Logged In User Info
  const { data: me } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => base44.auth.me(),
  });

  // 1. Fetch Active Conversations (Strictly Sender OR Recipient)
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations', platformFilter, me?.email],
    queryFn: async () => {
      // Backend handles the (sender_email = me OR recipient_email = me) logic
      const res = await base44.entities.Conversation.filter({ status: 'active' }, '-last_message_at');
      return Array.isArray(res) ? res : [];
    },
    enabled: !!me?.email
  });

  // 2. Fetch Drafts
  const { data: drafts = [] } = useQuery({
    queryKey: ['conversations', 'drafts', me?.email],
    queryFn: async () => {
      const res = await base44.entities.Conversation.filter({ status: 'draft' }, '-last_message_at');
      return Array.isArray(res) ? res : [];
    },
    enabled: !!me?.email
  });

  // 3. Fetch Registered Teammates (Employees) for the "To:" field
  const { data: employees = [] } = useQuery({
    queryKey: ['employees', 'list'],
    queryFn: () => base44.entities.Employee.list().catch(() => []),
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
      toast.success("Message sent successfully!");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Conversation.delete(id),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        toast.success("Draft deleted");
    }
  });

  const handleAction = (status = 'active') => {
    if (!composeData.to) return toast.error("Please select a recipient");
    if (!me?.email) return toast.error("Auth session error. Please re-login.");

    // Recipient Info
    const selectedEmp = employees.find(e => e.email === composeData.to);
    const recipientName = selectedEmp ? `${selectedEmp.first_name} ${selectedEmp.last_name}` : composeData.to;

    saveMutation.mutate({
      ...composeData,
      contact_name: recipientName, // For Kier's sidebar view
      contact_email: composeData.to,
      sender_email: me.email,      // Gab's email
      recipient_email: composeData.to, // Kier's email
      sender_name: `${me.firstName} ${me.lastName}`, // Fixing the "null" display
      status: status,
      platform: 'crm',
      last_message: composeData.message,
      last_message_at: new Date().toISOString()
    });
  };

  const filteredConversations = conversations.filter(conv => {
    const nameMatch = (conv?.contact_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = (conv?.contact_email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const subjectMatch = (conv?.subject || '').toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || emailMatch || subjectMatch;
  });

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
              <DropdownMenuContent align="end" className="w-64">
                {drafts.length === 0 ? <p className="p-4 text-center text-xs text-gray-400">No drafts</p> : 
                  drafts.map(d => (
                    <div key={d.id} className="flex items-center hover:bg-gray-50 px-2 border-b last:border-0">
                      <DropdownMenuItem className="flex-1 cursor-pointer py-3" onClick={() => {
                        setComposeData({ id: d.id, to: d.contact_email, subject: d.subject, message: d.last_message });
                        setComposeOpen(true);
                      }}>
                        <div className="flex flex-col text-left">
                           <span className="text-sm font-bold truncate">{d.subject || '(No Subject)'}</span>
                           <span className="text-[10px] text-gray-400">To: {d.contact_name}</span>
                        </div>
                      </DropdownMenuItem>
                      <Trash2 className="w-3 h-3 text-gray-300 hover:text-red-500 cursor-pointer" onClick={() => deleteMutation.mutate(d.id)} />
                    </div>
                  ))
                }
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={() => setComposeOpen(true)} className="gap-2 bg-indigo-600 px-6 font-bold shadow-indigo-100 shadow-lg hover:bg-indigo-700">
              <Plus className="w-4 h-4" /> Compose
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <Card className="p-4 border-none shadow-sm bg-white">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder="Search people or subjects..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="pl-10 h-11 border-slate-100 bg-slate-50/50" 
                  />
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" /></div>
                ) : (
                    <ConversationList 
                        conversations={filteredConversations} 
                        selectedId={selectedConversation?.id} 
                        onSelect={setSelectedConversation} 
                    />
                )}
              </div>
            </Card>
          </div>
          
          <div className="lg:col-span-8">
            {selectedConversation ? <ConversationDetail conversation={selectedConversation} /> : (
              <Card className="h-full min-h-[550px] flex items-center justify-center bg-white border-none shadow-sm">
                <div className="text-center text-slate-300">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-10 h-10 opacity-20" />
                  </div>
                  <p className="font-bold">Inbox is Ready</p>
                  <p className="text-sm">Select a teammate from the left to start chatting</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* NEW MESSAGE MODAL */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
          <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-white/10 rounded-lg"><Send className="w-4 h-4 text-indigo-300" /></div>
                <span className="font-bold tracking-tight">Compose Teammate Message</span>
            </div>
            <X className="w-5 h-5 cursor-pointer opacity-50 hover:opacity-100 transition-opacity" onClick={() => setComposeOpen(false)} />
          </div>
          
          <div className="p-6 space-y-4 bg-white">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Recipient</Label>
              <select 
                className="w-full h-11 px-3 rounded-xl border border-slate-100 bg-slate-50 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" 
                value={composeData.to} 
                onChange={(e) => setComposeData({...composeData, to: e.target.value})}
              >
                <option value="">Select a registered user...</option>
                {employees.map(emp => (
                    <option key={emp.id} value={emp.email}>
                        {emp.first_name} {emp.last_name} ({emp.email})
                    </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
               <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Subject</Label>
               <Input 
                placeholder="What is this about?" 
                className="h-11 border-slate-100 bg-slate-50 font-bold px-4 rounded-xl" 
                value={composeData.subject} 
                onChange={(e) => setComposeData({...composeData, subject: e.target.value})} 
               />
            </div>

            <div className="space-y-1.5">
               <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Message Content</Label>
               <Textarea 
                placeholder="Type your message here..." 
                className="min-h-[200px] border-slate-100 bg-slate-50 p-4 rounded-xl resize-none text-sm leading-relaxed" 
                value={composeData.message} 
                onChange={(e) => setComposeData({...composeData, message: e.target.value})} 
               />
            </div>
            
            {attachedFile && (
              <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-xs text-indigo-700 animate-in fade-in slide-in-from-top-1">
                <FileIcon className="w-4 h-4" />
                <span className="flex-1 font-bold truncate">{attachedFile.name}</span>
                <X className="w-4 h-4 cursor-pointer hover:text-red-500" onClick={() => setAttachedFile(null)} />
              </div>
            )}
          </div>

          <DialogFooter className="p-6 bg-slate-50/50 border-t border-slate-100">
            <div className="flex gap-3 w-full">
              <Button 
                onClick={() => handleAction('active')} 
                disabled={saveMutation.isPending || !composeData.to}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-12 font-bold rounded-xl shadow-lg shadow-indigo-100"
              >
                {saveMutation.isPending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                Send Message
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleAction('draft')} 
                className="h-12 border-slate-200 bg-white rounded-xl text-slate-600 px-6 font-bold"
              >
                <Save className="w-4 h-4 mr-2" /> Save Draft
              </Button>
              
              <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setAttachedFile(e.target.files[0])} />
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-12 w-12 hover:bg-indigo-100 hover:text-indigo-600 text-slate-400 rounded-xl transition-colors" 
                onClick={() => fileInputRef.current.click()}
              >
                <Paperclip className="w-5 h-5" />
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}