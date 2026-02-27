import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail, Plus, Search, Trash2, Upload, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function ContactManager() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [newContact, setNewContact] = useState({ email: '', first_name: '', last_name: '', company: '' });
  const [importData, setImportData] = useState('');

  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Contact.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setShowAddDialog(false);
      setNewContact({ email: '', first_name: '', last_name: '', company: '' });
      toast.success('Contact added successfully');
    },
  });

  const bulkImportMutation = useMutation({
    mutationFn: (contacts) => base44.entities.Contact.bulkCreate(contacts),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setShowImportDialog(false);
      setImportData('');
      toast.success('Contacts imported successfully');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Contact.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact deleted');
    },
  });

  const handleImport = () => {
    try {
      const lines = importData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const contactsToImport = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const contact = {};
        headers.forEach((header, index) => {
          if (values[index]) {
            contact[header] = values[index];
          }
        });
        return contact;
      }).filter(c => c.email);

      if (contactsToImport.length === 0) {
        toast.error('No valid contacts found in CSV');
        return;
      }

      bulkImportMutation.mutate(contactsToImport);
    } catch (error) {
      toast.error('Invalid CSV format');
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      subscribed: 'bg-green-100 text-green-700',
      unsubscribed: 'bg-gray-100 text-gray-700',
      bounced: 'bg-red-100 text-red-700',
      complained: 'bg-orange-100 text-orange-700',
    };
    return colors[status] || colors.subscribed;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowImportDialog(true)} variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Contacts ({filteredContacts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Loading contacts...</div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No contacts found. Add or import contacts to get started.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3 flex-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium">
                        {contact.first_name} {contact.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{contact.email}</div>
                      {contact.company && (
                        <div className="text-xs text-gray-400">{contact.company}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(contact.status)}>
                      {contact.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm('Delete this contact?')) {
                          deleteMutation.mutate(contact.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input
                  value={newContact.first_name}
                  onChange={(e) => setNewContact({ ...newContact, first_name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={newContact.last_name}
                  onChange={(e) => setNewContact({ ...newContact, last_name: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Company</Label>
              <Input
                value={newContact.company}
                onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createMutation.mutate(newContact)}
                disabled={!newContact.email || createMutation.isPending}
              >
                Add Contact
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Contacts from CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Paste CSV Data</Label>
              <p className="text-xs text-gray-500 mb-2">
                Format: email,first_name,last_name,company (first row should be headers)
              </p>
              <textarea
                className="w-full h-64 p-3 border rounded-lg font-mono text-sm"
                placeholder="email,first_name,last_name,company
john@example.com,John,Doe,Acme Inc
jane@example.com,Jane,Smith,Tech Corp"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={!importData || bulkImportMutation.isPending}
              >
                Import Contacts
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}