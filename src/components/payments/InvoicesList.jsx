import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label'; 
import { Input } from '@/components/ui/input'; 
import { Textarea } from '@/components/ui/textarea'; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Trash2, FileCheck, Receipt, UploadCloud, ChevronDown, FileText, Plus, Save, FolderOpen, X } from 'lucide-react';
import { useState, useRef } from 'react';

const currencySymbols = { USD: '$', EUR: '€', PHP: '₱', CAD: 'C$', AUD: 'A$' };

const templateFieldsConfig = {
  independent: { title: 'Independent Contractor Agreement', desc: 'Professional B2B services contract template', fields: [{ key: 'scope', label: 'Scope of Work', type: 'textarea', placeholder: 'Services provided...' }] },
  service: { title: 'Service Agreement', desc: 'SLA / Maintenance contract template', fields: [{ key: 'services', label: 'Services Provided', type: 'textarea', placeholder: 'Maintenance...' }] },
  companyContract: { 
    title: 'Contract Agreement (Job/Company)', 
    desc: 'Formal Employment Contract', 
    fields: [{ key: 'position', label: 'Position Title', type: 'text' }, { key: 'salary', label: 'Salary', type: 'text' }] 
  }
};

const ndaTemplateContent = {
  title: 'Non-Disclosure Agreement (NDA)',
  fields: [
    { key: 'confidential_info', label: 'Definition of Confidential Info', type: 'textarea' },
    { key: 'duration', label: 'Effective Duration', type: 'text' }
  ]
};

export default function InvoicesList() {
  const qc = useQueryClient();
  const fileInputRef = useRef(null);
  const customFileRef = useRef(null);

  const [typeFilter, setTypeFilter] = useState('template'); // 'template' is our Documents tab
  const [selectedTemplate, setSelectedTemplate] = useState(null); 
  const [showNDAModal, setShowNDAModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false); // Modal for other tabs
  const [templateFormData, setTemplateFormData] = useState({ currency: 'PHP' }); 
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [error, setError] = useState('');

  // CRITICAL FIX: The filter now maps 'template' to 'contract' for the DB, 
  // but keeps 'quote', 'job', etc. separate.
  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices', typeFilter],
    queryFn: () => {
        const dbType = typeFilter === 'template' ? 'contract' : typeFilter;
        return base44.entities.Invoice.filter({ type: dbType }, '-created_date');
    },
  });

  const { data: drafts = [] } = useQuery({
    queryKey: ['invoices', 'drafts'],
    queryFn: () => base44.entities.Invoice.filter({ status: 'draft' }, '-created_date'),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => data.id 
      ? base44.entities.Invoice.update(data.id, data) 
      : base44.entities.Invoice.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['invoices', 'drafts'] });
      setShowNDAModal(false);
      setShowCreateModal(false);
      setSelectedTemplate(null);
      setTemplateFormData({ currency: 'PHP' });
      setError('');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Invoice.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['invoices', 'drafts'] });
    }
  });

  const handleSaveNDA = (isDraft = false) => {
    if (!templateFormData.document_name?.trim()) return setError('Document Name is required.');
    saveMutation.mutate({
      ...templateFormData,
      type: 'contract', 
      status: isDraft ? 'draft' : 'active',
      issue_date: new Date().toISOString(),
      invoice_number: templateFormData.invoice_number || `NDA-${Math.floor(1000 + Math.random() * 9000)}`,
    });
  };

  const handleSaveStandard = () => {
    if (!templateFormData.client_name?.trim()) return setError('Client Name is required.');
    saveMutation.mutate({
      ...templateFormData,
      type: typeFilter, // Matches 'quote', 'job', 'invoice', 'receipt'
      status: 'active',
      issue_date: new Date().toISOString(),
      invoice_number: `${typeFilter.toUpperCase().slice(0,3)}-${Math.floor(1000 + Math.random() * 9000)}`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Documents</CardTitle>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-gray-600 flex gap-2">
                    <FolderOpen className="w-4 h-4" /> Drafts ({drafts.length}) <ChevronDown className="w-4 h-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  {drafts.map((draft) => (
                    <div key={draft.id} className="flex items-center group px-2 hover:bg-gray-50">
                      <DropdownMenuItem onClick={() => { setTemplateFormData({...draft, document_name: draft.client_name}); setShowNDAModal(true); }} className="flex-1 p-2">
                        <span className="font-bold text-sm">{draft.client_name || 'Untitled'}</span>
                      </DropdownMenuItem>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(draft.id)}><Trash2 className="w-3 h-3 text-red-400" /></Button>
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* DYNAMIC BUTTONS BASED ON TAB */}
              {typeFilter === 'template' ? (
                <Button onClick={() => setShowNDAModal(true)} className="bg-indigo-600">
                  <Plus className="w-4 h-4 mr-2" /> Add Custom Template
                </Button>
              ) : (
                <Button onClick={() => setShowCreateModal(true)} className="bg-indigo-600">
                  <Plus className="w-4 h-4 mr-2" /> Create {typeFilter}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={typeFilter} onValueChange={(val) => { setTypeFilter(val); setSelectedTemplate(null); }}>
            <TabsList className="mb-6 grid grid-cols-6 h-auto">
              <TabsTrigger value="template">Documents</TabsTrigger>
              <TabsTrigger value="quote">Quotes</TabsTrigger>
              <TabsTrigger value="job">Jobs</TabsTrigger>
              <TabsTrigger value="invoice">Invoices</TabsTrigger>
              <TabsTrigger value="receipt">Receipts</TabsTrigger>
              <TabsTrigger value="contract">All Contracts</TabsTrigger>
            </TabsList>

            <div className="space-y-3">
              {invoices.length === 0 ? <div className="text-center py-10 text-gray-400 border border-dashed rounded-lg">No {typeFilter} records found.</div> : 
                invoices.map(inv => (
                  <Card key={inv.id} className="hover:shadow-sm">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-100 rounded-lg"><FileText className="w-5 h-5 text-indigo-500"/></div>
                        <div><p className="font-bold">{inv.invoice_number}</p><p className="text-sm text-gray-500">{inv.client_name}</p></div>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <div><Badge variant="outline">{inv.status}</Badge><p className="font-bold text-green-600">{currencySymbols[inv.currency || 'PHP']}{inv.total?.toLocaleString()}</p></div>
                        <Button variant="ghost" size="icon" className="text-gray-300 hover:text-red-500" onClick={() => deleteMutation.mutate(inv.id)}><Trash2 className="w-4 h-4"/></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              }
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* MODAL 1: Custom Template (For Documents Tab) */}
      <Dialog open={showNDAModal} onOpenChange={setShowNDAModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Add Custom Template</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Label>Document Name *</Label>
            <Input value={templateFormData.document_name || ''} onChange={e => setTemplateFormData(p => ({...p, document_name: e.target.value}))}/>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <DialogFooter><Button onClick={() => handleSaveNDA(false)}>Save Document</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Standard Creator (For Quotes, Jobs, etc.) */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>New {typeFilter}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1"><Label>Client Name *</Label><Input value={templateFormData.client_name || ''} onChange={e => setTemplateFormData(p => ({...p, client_name: e.target.value}))}/></div>
            <div className="space-y-1"><Label>Total Amount</Label><Input type="number" value={templateFormData.total || ''} onChange={e => setTemplateFormData(p => ({...p, total: e.target.value}))}/></div>
          </div>
          <DialogFooter><Button onClick={handleSaveStandard}>Create {typeFilter}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}