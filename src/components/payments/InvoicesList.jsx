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
import { ArrowLeft, Trash2, FileCheck, Receipt, UploadCloud, ChevronDown, FileText, Plus, Save, FolderOpen, X, Search } from 'lucide-react';
import { useState, useRef } from 'react';

const currencySymbols = { USD: '$', EUR: '€', PHP: '₱', CAD: 'C$', AUD: 'A$' };

const templateFieldsConfig = {
  independent: { title: 'Independent Contractor Agreement', desc: 'Professional B2B services contract template', fields: [{ key: 'scope', label: 'Scope of Work', type: 'textarea', placeholder: 'Services provided...' }] },
  service: { title: 'Service Agreement', desc: 'SLA / Maintenance contract template', fields: [{ key: 'services', label: 'Services Provided', type: 'textarea', placeholder: 'Maintenance...' }] },
  companyContract: { 
    title: 'Contract Agreement (Job/Company)', 
    desc: 'Formal Employment/Job Contract template', 
    fields: [{ key: 'position', label: 'Position Title', type: 'text' }, { key: 'salary', label: 'Salary/Compensation', type: 'text' }] 
  }
};

export default function InvoicesList() {
  const qc = useQueryClient();
  const fileInputRef = useRef(null);
  const customFileRef = useRef(null);

  const [typeFilter, setTypeFilter] = useState('template');
  const [selectedTemplate, setSelectedTemplate] = useState(null); 
  const [showNDAModal, setShowNDAModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false); 
  const [templateFormData, setTemplateFormData] = useState({ currency: 'PHP', duration_unit: 'Years' }); 
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch items matching current tab
  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices', typeFilter],
    queryFn: () => {
        const dbType = typeFilter === 'template' ? 'contract' : typeFilter;
        return base44.entities.Invoice.filter({ type: dbType, status: 'active' }, '-created_date');
    },
  });

  // Fetch Drafts
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
      setTemplateFormData({ currency: 'PHP', duration_unit: 'Years' });
      setUploadedFileName(null);
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

  const handleSaveCustom = (isDraft = false) => {
    if (!templateFormData.document_name?.trim()) return setError('Contract Name is required.');
    saveMutation.mutate({
      ...templateFormData,
      type: 'contract', 
      status: isDraft ? 'draft' : 'active',
      issue_date: templateFormData.signing_date || new Date().toISOString(),
      invoice_number: templateFormData.invoice_number || `CTR-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: `Duration: ${templateFormData.duration_val} ${templateFormData.duration_unit}. Details: ${templateFormData.details}. File: ${uploadedFileName || 'None'}`
    });
  };

  const handleSaveStandard = () => {
    if (!templateFormData.client_name?.trim()) return setError('Client Name is required.');
    saveMutation.mutate({
      ...templateFormData,
      type: typeFilter,
      status: 'active',
      issue_date: new Date().toISOString(),
      invoice_number: `${typeFilter.toUpperCase().slice(0,3)}-${Math.floor(1000 + Math.random() * 9000)}`,
    });
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    inv.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Sales & Documents</CardTitle>
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
                        <span className="font-bold text-sm">{draft.client_name || 'Untitled Draft'}</span>
                      </DropdownMenuItem>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(draft.id)}><Trash2 className="w-3 h-3 text-red-400" /></Button>
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {typeFilter === 'template' ? (
                <Button onClick={() => { setTemplateFormData({currency: 'PHP', duration_unit: 'Years'}); setShowNDAModal(true); }} className="bg-indigo-600">
                  <Plus className="w-4 h-4 mr-2" /> Add a Custom Template
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
          <Tabs value={typeFilter} onValueChange={(val) => { setTypeFilter(val); setSelectedTemplate(null); setSearchQuery(''); }}>
            <TabsList className="mb-6 grid grid-cols-6 h-auto">
              <TabsTrigger value="template">Documents</TabsTrigger>
              <TabsTrigger value="contract">Contracts</TabsTrigger>
              <TabsTrigger value="quote">Quotes</TabsTrigger>
              <TabsTrigger value="job">Jobs</TabsTrigger>
              <TabsTrigger value="invoice">Invoices</TabsTrigger>
              <TabsTrigger value="receipt">Receipts</TabsTrigger>
            </TabsList>

            {/* SEARCH FIELD */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                    placeholder={`Search ${typeFilter} items...`} 
                    className="pl-10" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {typeFilter === 'template' && !selectedTemplate && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {Object.entries(templateFieldsConfig).map(([key, data]) => (
                  <Card key={key} onClick={() => setSelectedTemplate(key)} className="hover:border-indigo-500 cursor-pointer border-dashed border-2">
                    <CardContent className="p-6 text-center">
                      <FileCheck className="w-10 h-10 text-indigo-500 mx-auto mb-3" />
                      <h3 className="font-bold">{data.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{data.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {selectedTemplate && typeFilter === 'template' ? (
                <div className="animate-in fade-in space-y-6 bg-white p-6 border rounded-xl mb-10">
                   <Button variant="ghost" onClick={() => setSelectedTemplate(null)} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
                   <h2 className="text-2xl font-bold border-b pb-3">{templateFieldsConfig[selectedTemplate].title}</h2>
                   <div className="space-y-4 pt-2">
                      <Label>Client Name *</Label>
                      <Input value={templateFormData.client_name || ''} onChange={e => setTemplateFormData(p => ({...p, client_name: e.target.value}))} />
                      {templateFieldsConfig[selectedTemplate].fields.map(f => (
                        <div key={f.key} className="space-y-1">
                          <Label>{f.label}</Label>
                          <Textarea value={templateFormData[f.key] || ''} onChange={e => setTemplateFormData(p => ({...p, [f.key]: e.target.value}))} />
                        </div>
                      ))}
                      <div className="border p-4 rounded-lg bg-gray-50/50">
                        <Label className="font-semibold text-xs">Upload Supporting File</Label>
                        <Input type="file" className="mt-2" onChange={(e) => setUploadedFileName(e.target.files[0]?.name)} />
                      </div>
                      <Button onClick={handleSaveDetailedTemplate} className="w-full bg-indigo-600">Save Document</Button>
                   </div>
                </div>
            ) : (
              <div className="space-y-3">
                 {filteredInvoices.length === 0 ? <div className="text-center py-10 text-gray-400 border border-dashed rounded-lg">No {typeFilter} records found.</div> : 
                  filteredInvoices.map(inv => (
                    <Card key={inv.id} className="hover:shadow-sm">
                      <CardContent className="p-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-gray-100 rounded-lg"><FileText className="w-5 h-5 text-indigo-500"/></div>
                          <div><p className="font-bold">{inv.invoice_number}</p><p className="text-sm text-gray-500">{inv.client_name}</p></div>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                          <p className="font-bold text-gray-700">{currencySymbols[inv.currency || 'PHP']}{inv.total?.toLocaleString()}</p>
                          <Button variant="ghost" size="icon" className="text-gray-300 hover:text-red-500" onClick={() => deleteMutation.mutate(inv.id)}><Trash2 className="w-4 h-4"/></Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* FORMAL CUSTOM CONTRACT MODAL */}
      <Dialog open={showNDAModal} onOpenChange={setShowNDAModal}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader><DialogTitle className="text-xl font-serif">Formal Contract Agreement</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label>Contract Name/Title *</Label>
                    <Input placeholder="e.g. Service Level Agreement" value={templateFormData.document_name || ''} onChange={e => setTemplateFormData(p => ({...p, document_name: e.target.value}))}/>
                </div>
                <div className="space-y-1">
                    <Label>Date of Signing</Label>
                    <Input type="date" value={templateFormData.signing_date || ''} onChange={e => setTemplateFormData(p => ({...p, signing_date: e.target.value}))}/>
                </div>
            </div>

            <div className="space-y-1">
                <Label>Details of Contract</Label>
                <Textarea className="h-32" placeholder="Outline the primary terms..." value={templateFormData.details || ''} onChange={e => setTemplateFormData(p => ({...p, details: e.target.value}))}/>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label>Duration Value</Label>
                    <Input type="number" placeholder="3" value={templateFormData.duration_val || ''} onChange={e => setTemplateFormData(p => ({...p, duration_val: e.target.value}))}/>
                </div>
                <div className="space-y-1">
                    <Label>Duration Unit</Label>
                    <Select value={templateFormData.duration_unit} onValueChange={v => setTemplateFormData(p => ({...p, duration_unit: v}))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Months">Months</SelectItem>
                            <SelectItem value="Years">Years</SelectItem>
                            <SelectItem value="Indefinite">Indefinite</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="border-t pt-4">
                <Label className="flex items-center gap-2"><UploadCloud className="w-4 h-4" /> Upload Supporting Document</Label>
                <Input type="file" className="mt-2" onChange={(e) => setUploadedFileName(e.target.files[0]?.name)} />
            </div>

            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => handleSaveCustom(true)} className="flex-1 gap-2"><Save className="w-4 h-4"/> Save Draft</Button>
            <Button onClick={() => handleSaveCustom(false)} className="flex-1 bg-indigo-600">Save Document</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Standard Creator Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>New {typeFilter}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Label>Client Name *</Label>
            <Input value={templateFormData.client_name || ''} onChange={e => setTemplateFormData(p => ({...p, client_name: e.target.value}))}/>
            <Label>Total Amount</Label>
            <Input type="number" value={templateFormData.total || ''} onChange={e => setTemplateFormData(p => ({...p, total: e.target.value}))}/>
            <div className="border-t pt-2">
                <Label className="text-xs">Attach Receipt/File</Label>
                <Input type="file" className="mt-1" />
            </div>
            <Button onClick={handleSaveStandard} className="w-full bg-indigo-600 mt-4">Create {typeFilter}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}