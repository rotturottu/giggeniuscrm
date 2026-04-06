import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label'; 
import { Input } from '@/components/ui/input'; 
import { Textarea } from '@/components/ui/textarea'; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Trash2, FileCheck, Receipt, UploadCloud, ChevronDown, FileText, Plus, Save, FolderOpen, X, Search, Calendar, FileDigit, Briefcase, FileSpreadsheet, FilePlus } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const currencySymbols = { USD: '$', EUR: '€', PHP: '₱', CAD: 'C$', AUD: 'A$' };

const templateFieldsConfig = {
  independent: { 
    title: 'Independent Contractor Agreement', 
    desc: 'Professional B2B services contract', 
    fields: [{ key: 'details', label: 'Scope of Work', type: 'textarea' }] 
  },
  service: { 
    title: 'Service Agreement', 
    desc: 'Maintenance/SLA contract', 
    fields: [{ key: 'details', label: 'Services Provided', type: 'textarea' }] 
  },
  companyContract: { 
    title: 'Contract Agreement (Job/Company)', 
    desc: 'Formal Employment Contract', 
    fields: [{ key: 'details', label: 'Position & Compensation Details', type: 'textarea' }] 
  }
};

export default function InvoicesList() {
  const qc = useQueryClient();
  const [typeFilter, setTypeFilter] = useState('template');
  const [selectedTemplate, setSelectedTemplate] = useState(null); 
  const [showNDAModal, setShowNDAModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false); 
  const [templateFormData, setTemplateFormData] = useState({ currency: 'PHP', duration_unit: 'Years' }); 
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Queries
  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices', typeFilter],
    queryFn: async () => {
        const dbType = typeFilter === 'template' ? 'contract' : typeFilter;
        const res = await base44.entities.Invoice.list('-created_date');
        return Array.isArray(res) ? res.filter(inv => inv.type === dbType && inv.status === 'active') : [];
    },
  });

  const { data: drafts = [] } = useQuery({
    queryKey: ['invoices', 'drafts'],
    queryFn: async () => {
        const res = await base44.entities.Invoice.list('-created_date');
        return Array.isArray(res) ? res.filter(inv => inv.status === 'draft') : [];
    }
  });

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (data) => data.id ? base44.entities.Invoice.update(data.id, data) : base44.entities.Invoice.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['invoices', 'drafts'] });
      setShowNDAModal(false); 
      setShowCreateModal(false); 
      setSelectedTemplate(null);
      setTemplateFormData({ currency: 'PHP', duration_unit: 'Years' }); 
      setUploadedFileName(null); 
      setError('');
      toast.success('Document saved successfully');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Invoice.delete(id),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['invoices'] }); 
      qc.invalidateQueries({ queryKey: ['invoices', 'drafts'] }); 
      toast.success('Record removed');
    }
  });

  const handleSaveCustom = (isDraft = false) => {
    if (!templateFormData.document_name?.trim()) return setError('Document Title is required.');
    saveMutation.mutate({
      ...templateFormData,
      type: 'contract', 
      client_name: templateFormData.document_name, 
      status: isDraft ? 'draft' : 'active',
      issue_date: templateFormData.signing_date || new Date().toISOString(),
      invoice_number: templateFormData.invoice_number || `CTR-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: `Duration: ${templateFormData.duration_val || 'N/A'} ${templateFormData.duration_unit}. Content: ${templateFormData.details || ''}`
    });
  };

  const handleSaveStandard = () => {
    if (!templateFormData.client_name?.trim()) return setError('Required fields missing.');
    saveMutation.mutate({
      ...templateFormData,
      type: typeFilter, 
      status: 'active',
      issue_date: new Date().toISOString(),
      invoice_number: `${typeFilter.toUpperCase().slice(0,3)}-${Math.floor(1000 + Math.random() * 9000)}`,
    });
  };

  const filteredInvoices = invoices.filter(inv => {
    return (inv.client_name || inv.document_name || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 text-left relative">
      <Card className="border-none shadow-md relative z-10">
        <CardHeader className="bg-gray-50/50 rounded-t-xl">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-gray-800">Sales & Documents Management</CardTitle>
            <div className="flex gap-3 relative z-50">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-white border-gray-200 font-bold">
                    <FolderOpen className="w-4 h-4 mr-2 text-indigo-500" /> Drafts ({drafts.length}) <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  {drafts.length === 0 ? <p className="p-4 text-center text-xs text-gray-400">No drafts found</p> :
                    drafts.map((d) => (
                      <div key={d.id} className="flex items-center p-1 group">
                        <DropdownMenuItem onClick={() => { setTemplateFormData({...d, document_name: d.client_name}); setShowNDAModal(true); }} className="flex-1">
                          <div className="flex flex-col"><span className="font-bold">{d.client_name || 'Untitled'}</span><span className="text-[10px] text-gray-400">{d.invoice_number}</span></div>
                        </DropdownMenuItem>
                        <Trash2 className="w-4 h-4 mr-2 text-gray-300 hover:text-red-500 cursor-pointer" onClick={() => deleteMutation.mutate(d.id)} />
                      </div>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  setTemplateFormData({ currency: 'PHP', duration_unit: 'Years', document_name: '', details: '' });
                  if (typeFilter === 'template') {
                    setShowNDAModal(true);
                  } else {
                    setShowCreateModal(true);
                  }
                }} 
                className="bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-100"
              >
                <Plus className="w-4 h-4 mr-2" /> {typeFilter === 'template' ? 'Add Custom Template' : `New ${typeFilter}`}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <Tabs value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setSelectedTemplate(null); setSearchQuery(''); }}>
            <TabsList className="mb-8 grid grid-cols-6 h-auto bg-gray-100 p-1 rounded-xl">
              {['template', 'contract', 'quote', 'job', 'invoice', 'receipt'].map(t => (
                <TabsTrigger key={t} value={t} className="capitalize py-2 rounded-lg">{t === 'template' ? 'Documents' : t}</TabsTrigger>
              ))}
            </TabsList>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder={`Filter ${typeFilter} records...`} className="pl-10 h-11 border-gray-200" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            {typeFilter === 'template' && (
              <div className="mb-10 grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card 
                  onClick={() => {
                    setTemplateFormData({ currency: 'PHP', duration_unit: 'Years', document_name: '', details: '' });
                    setShowNDAModal(true);
                  }} 
                  className="hover:border-indigo-500 transition-all cursor-pointer border-dashed border-2 bg-indigo-50/20 group shadow-sm"
                >
                  <CardContent className="p-6 text-center">
                    <FilePlus className="w-12 h-12 text-indigo-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-indigo-900">Blank Document</h3>
                    <p className="text-xs text-gray-500 mt-2">Start a unique template</p>
                  </CardContent>
                </Card>

                {Object.entries(templateFieldsConfig).map(([key, data]) => (
                  <Card 
                    key={key} 
                    onClick={() => {
                      setTemplateFormData({ currency: 'PHP', duration_unit: 'Years', document_name: data.title, details: '' });
                      setShowNDAModal(true);
                    }} 
                    className="hover:border-indigo-500 transition-all cursor-pointer border-dashed border-2 bg-indigo-50/20 group shadow-sm"
                  >
                    <CardContent className="p-6 text-center">
                      <FileCheck className="w-12 h-12 text-indigo-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="font-bold text-indigo-900">{data.title}</h3>
                      <p className="text-xs text-gray-500 mt-2">{data.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="space-y-4 mt-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 px-2">Saved Records</h4>
              {filteredInvoices.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-gray-50/50">
                  <FileSpreadsheet className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium">No records found</p>
                </div>
              ) : (
                filteredInvoices.map(inv => (
                  <Card key={inv.id} className="hover:shadow-md transition-all border-gray-100 rounded-xl group">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          {inv.type === 'receipt' ? <Receipt className="w-5 h-5"/> : <FileText className="w-5 h-5"/>}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 tracking-tight">{inv.invoice_number}</p>
                          <p className="text-sm text-gray-500 font-bold">{inv.client_name || inv.document_name}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-8">
                        <div>
                          <Badge className="bg-green-50 text-green-600 border-green-100 px-3 py-0.5 rounded-md font-bold text-[10px]">ACTIVE</Badge>
                          <p className="font-black text-lg text-gray-800">{currencySymbols[inv.currency || 'PHP']}{inv.total?.toLocaleString() || '0'}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-gray-300 hover:text-red-500 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); if(confirm('Delete?')) deleteMutation.mutate(inv.id) }}><Trash2 className="w-4 h-4"/></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* DOCUMENT CUSTOMIZER MODAL */}
      <Dialog open={showNDAModal} onOpenChange={setShowNDAModal}>
        <DialogContent className="max-w-3xl overflow-y-auto max-h-[95vh] text-left">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FilePlus className="w-6 h-6 text-indigo-600" />
              Document Customizer
            </DialogTitle>
            <DialogDescription>
              Configure the details and content of your custom document below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-bold text-gray-700">Document Title *</Label>
                <Input placeholder="Title..." className="h-12" value={templateFormData.document_name || ''} onChange={e => setTemplateFormData(p => ({...p, document_name: e.target.value}))}/>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-gray-700">Signing Date</Label>
                <Input type="date" className="h-12" value={templateFormData.signing_date || ''} onChange={e => setTemplateFormData(p => ({...p, signing_date: e.target.value}))}/>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-gray-700">Content / Terms</Label>
              <Textarea className="min-h-[250px] bg-gray-50/50" placeholder="Type or paste document content..." value={templateFormData.details || ''} onChange={e => setTemplateFormData(p => ({...p, details: e.target.value}))}/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-bold text-gray-700">Validity</Label>
                <Input type="number" placeholder="Value..." className="h-12" value={templateFormData.duration_val || ''} onChange={e => setTemplateFormData(p => ({...p, duration_val: e.target.value}))}/>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-gray-700">Unit</Label>
                <Select value={templateFormData.duration_unit} onValueChange={v => setTemplateFormData(p => ({...p, duration_unit: v}))}>
                  <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Months">Months</SelectItem>
                    <SelectItem value="Years">Years</SelectItem>
                    <SelectItem value="Indefinite">Indefinite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="border-t pt-6 flex gap-4">
            <Button variant="outline" onClick={() => handleSaveCustom(true)} className="flex-1 h-12 font-bold"><Save className="w-4 h-4 mr-2" /> Save Draft</Button>
            <Button onClick={() => handleSaveCustom(false)} disabled={saveMutation.isPending} className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200">
              {saveMutation.isPending ? 'Saving...' : 'Register Final Document'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-xl text-left">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="capitalize flex items-center gap-2 font-bold text-xl">New {typeFilter} Form</DialogTitle>
            <DialogDescription>Create a standard financial or tracking record.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-6">
            <div className="space-y-2"><Label className="font-bold text-gray-600">Client Name *</Label><Input className="h-11" value={templateFormData.client_name || ''} onChange={e => setTemplateFormData(p => ({...p, client_name: e.target.value}))}/></div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2"><Label className="font-bold text-gray-600">Value</Label><Input className="h-11" type="number" placeholder="0.00" value={templateFormData.total || ''} onChange={e => setTemplateFormData(p => ({...p, total: e.target.value}))}/></div>
               <div className="space-y-2"><Label className="font-bold text-gray-600">Currency</Label>
                 <Select value={templateFormData.currency} onValueChange={v => setTemplateFormData(p => ({...p, currency: v}))}>
                   <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                   <SelectContent>{Object.keys(currencySymbols).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                 </Select></div>
            </div>
          </div>
          <DialogFooter className="border-t pt-4">
            <Button onClick={handleSaveStandard} disabled={saveMutation.isPending} className="w-full bg-indigo-600 h-12 font-bold">
              {saveMutation.isPending ? 'Saving...' : `Create ${typeFilter}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}