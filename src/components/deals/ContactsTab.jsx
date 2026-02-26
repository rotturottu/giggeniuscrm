import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, User, Mail, Building, Eye } from 'lucide-react';
import ContactHistoryDialog from './ContactHistoryDialog';

export default function ContactsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts-crm'],
    queryFn: () => base44.entities.Contact.list('-created_date', 200),
  });

  const filteredContacts = contacts.filter(contact =>
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors = {
    subscribed: 'bg-green-100 text-green-700',
    unsubscribed: 'bg-gray-100 text-gray-700',
    bounced: 'bg-red-100 text-red-700',
    complained: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search contacts by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact) => (
          <Card key={contact.id} className="hover:shadow-lg transition-all cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>
                    {contact.first_name || ''} {contact.last_name || contact.email.split('@')[0]}
                  </span>
                </div>
                <Badge className={statusColors[contact.status] || statusColors.subscribed}>
                  {contact.status || 'subscribed'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-3 h-3" />
                {contact.email}
              </div>
              {contact.company && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building className="w-3 h-3" />
                  {contact.company}
                </div>
              )}
              {contact.tags && contact.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {contact.tags.slice(0, 3).map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3"
                onClick={() => {
                  setSelectedContact(contact);
                  setHistoryOpen(true);
                }}
              >
                <Eye className="w-3 h-3 mr-2" />
                View History
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No contacts found matching your search.
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