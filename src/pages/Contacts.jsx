import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';
import ContactForm from '../components/contacts/ContactForm';
import ContactImport from '../components/contacts/ContactImport';
import ContactList from '../components/contacts/ContactList';
import FormsModule from '../components/contacts/FormsModule';
import SmartLists from '../components/contacts/SmartLists';

export default function Contacts() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [tab, setTab] = useState('list');
  const [selectedSmartList, setSelectedSmartList] = useState(null);

  const openAdd = () => { setEditingContact(null); setFormOpen(true); };
  const openEdit = (c) => { setEditingContact(c); setFormOpen(true); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Contacts
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage your leads, customers, and partners</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setTab('import')} className="gap-2">
              <Upload className="w-4 h-4" /> Import
            </Button>
            <Button onClick={openAdd} className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600">
              <UserPlus className="w-4 h-4" /> Add Contact
            </Button>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="list" className="gap-2"><Users className="w-4 h-4" /> All Contacts</TabsTrigger>
            <TabsTrigger value="import" className="gap-2"><Upload className="w-4 h-4" /> Bulk Import</TabsTrigger>
            <TabsTrigger value="forms" className="gap-2"><FileText className="w-4 h-4" /> Forms</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-4">
            <div className="flex gap-0 border rounded-xl overflow-hidden bg-white shadow-sm" style={{ minHeight: '500px' }}>
              <SmartLists onSelectList={setSelectedSmartList} selectedListId={selectedSmartList} />
              <div className="flex-1 p-4 overflow-auto">
                <ContactList onEdit={openEdit} onView={openEdit} smartListId={selectedSmartList} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="import" className="mt-4">
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-base font-semibold mb-1">Bulk Import Contacts</h2>
              <p className="text-sm text-gray-500 mb-4">Upload a CSV, Excel, or JSON file to import multiple contacts at once.</p>
              <ContactImport onDone={() => setTab('list')} />
            </div>
          </TabsContent>

          <TabsContent value="forms" className="mt-4">
            <div className="bg-white rounded-xl border p-6">
              <FormsModule />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ContactForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingContact(null); }}
        contact={editingContact}
      />
    </div>
  );
}