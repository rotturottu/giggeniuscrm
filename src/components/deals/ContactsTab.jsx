import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, User, Mail, Building, Eye, Plus, Phone, Globe, AlertCircle } from 'lucide-react';
import ContactHistoryDialog from './ContactHistoryDialog';

// Common country codes with flags
const countryCodes = [
  { code: '+63', country: 'Philippines', flag: '🇵🇭' },
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
];

const emptyContact = {
  first_name: '',
  last_name: '',
  email: '',
  company: '',
  phone: '',
  country_code: '+63',
  status: 'subscribed',
  tags: []
};

export default function ContactsTab() {
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState(emptyContact);
  const [error, setError] = useState('');

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts-crm'],
    queryFn: () => base44.entities.Contact.list('-created_date', 200),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.Contact.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contacts-crm'] });
      setShowAddModal(false);
      setNewContact(emptyContact);
      setError('');
    }
  });

  const filteredContacts = contacts.filter(contact =>
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (!newContact.email || !newContact.first_name) {
      setError('First Name and Email are required.');
      return;
    }
    if (!newContact.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    const fullPhone = `${newContact.country_code}${newContact.phone}`;
    saveMutation.mutate({ ...newContact, phone: fullPhone });
  };

  const statusColors = {
    subscribed: 'bg-green-100 text-green-700',
    unsubscribed: 'bg-gray-100 text-gray-700',
    bounced: 'bg-red-100 text-red-700',
    complained: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search contacts by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 shadow-sm"
          />
        </div>
        <Button 
          onClick={() => setShowAddModal(true)} 
          className="bg-indigo-600 hover:bg-indigo-700 h-11 px-6 shadow-md transition-all gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Contact
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact) => (
          <Card key={contact.id} className="group hover:shadow-xl transition-all border-none shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                    {contact.first_name?.[0]}{contact.last_name?.[0]}
                  </div>
                  <span className="font-bold text-gray-800">
                    {contact.first_name || ''} {contact.last_name || ''}
                  </span>
                </div>
                <Badge className={`${statusColors[contact.status] || statusColors.subscribed} border-none`}>
                  {contact.status || 'subscribed'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                {contact.email}
              </div>
              {contact.company && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building className="w-3.5 h-3.5 text-gray-400" />
                  {contact.company}
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {contact.phone}
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-3 bg-white border border-gray-100 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                onClick={() => {
                  setSelectedContact(contact);
                  setHistoryOpen(true);
                }}
              >
                <Eye className="w-3.5 h-3.5 mr-2" />
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ADD CONTACT DIALOG */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              New CRM Contact
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>First Name *</Label>
                <Input 
                  value={newContact.first_name} 
                  onChange={e => setNewContact({...newContact, first_name: e.target.value})} 
                  placeholder="John"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Last Name</Label>
                <Input 
                  value={newContact.last_name} 
                  onChange={e => setNewContact({...newContact, last_name: e.target.value})} 
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Email Address *</Label>
              <Input 
                type="email"
                value={newContact.email} 
                onChange={e => setNewContact({...newContact, email: e.target.value})} 
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Company</Label>
              <Input 
                value={newContact.company} 
                onChange={e => setNewContact({...newContact, company: e.target.value})} 
                placeholder="Tech Corp Inc."
              />
            </div>

            <div className="space-y-1.5">
              <Label>Phone Number</Label>
              <div className="flex gap-2">
                <Select 
                  value={newContact.country_code} 
                  onValueChange={v => setNewContact({...newContact, country_code: v})}
                >
                  <SelectTrigger className="w-[140px] bg-gray-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countryCodes.map(c => (
                      <SelectItem key={c.code} value={c.code}>
                        <span className="mr-2">{c.flag}</span>
                        <span className="text-xs font-medium">{c.code}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input 
                  className="flex-1"
                  placeholder="912 345 6789"
                  value={newContact.phone}
                  onChange={e => setNewContact({...newContact, phone: e.target.value.replace(/\D/g, '')})}
                />
              </div>
              <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                <Globe className="w-3 h-3" /> 
                {countryCodes.find(c => c.code === newContact.country_code)?.country}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs flex items-center gap-2 animate-in zoom-in-95">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button 
              onClick={handleSave} 
              disabled={saveMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 min-w-[100px]"
            >
              {saveMutation.isPending ? 'Adding...' : 'Save Contact'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {filteredContacts.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Search className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">No contacts found matching your search.</p>
        </div>
      )}

      <ContactHistoryDialog
        open={historyOpen}
        onClose={() => {
          setHistoryOpen(false);
          setSelectedContact(null);
        }}
        contact={selectedContact}
      />
    </div>
  );
}