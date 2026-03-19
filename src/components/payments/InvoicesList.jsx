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
import { ArrowLeft, Trash2, FileCheck, Receipt, UploadCloud, ChevronDown, FileText, Plus, Save, FolderOpen, X, Search, Calendar, FileDigit, Briefcase, FileSpreadsheet } from 'lucide-react';
import { useState, useRef } from 'react';

const currencySymbols = { USD: '$', EUR: '€', PHP: '₱', CAD: 'C$', AUD: 'A$' };

const templateFieldsConfig = {
  independent: { title: 'Independent Contractor Agreement', desc: 'Professional B2B services contract', fields: [{ key: 'scope', label: 'Scope of Work', type: 'textarea' }] },
  service: { title: 'Service Agreement', desc: 'Maintenance/SLA contract', fields: [{ key: 'services', label: 'Services Provided', type: 'textarea' }] },
  companyContract: { 
    title: 'Contract Agreement (Job/Company)', 
    desc: 'Formal Employment Contract', 
    fields: [{ key: 'position', label: 'Position Title', type: 'text' }, { key: 'salary', label: 'Compensation', type: 'text' }] 
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

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices', typeFilter],
    queryFn: () => {
        const dbType = typeFilter === 'template' ? 'contract' : typeFilter;
        return base44.entities.Invoice.filter({ type: dbType, status: 'active' }, '-created_date');
    },
  });

  const { data: drafts = [] } = useQuery({
    queryKey: ['invoices', 'drafts'],
    queryFn: () => base44.entities.Invoice.filter({ status: 'draft' }, '-created_date'),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => data.id ? base44.entities.Invoice.update(data.id, data) : base44.entities.Invoice.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['invoices', 'drafts'] });
      setShowNDAModal(false); setShowCreateModal(false); setSelectedTemplate(null);
      setTemplateFormData({ currency: 'PHP', duration_unit: 'Years' }); setUploadedFileName(null); setError('');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Invoice.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); qc.invalidateQueries({ queryKey: ['invoices', 'drafts'] }); }
  });

  const handleSaveCustom = (isDraft = false) => {
    if (!templateFormData.document_name?.trim()) return setError('Contract Name is required.');
    saveMutation.mutate({
      ...templateFormData,
      type: 'contract', 
      status: isDraft ? 'draft' : 'active',
      issue_date: templateFormData.signing_date || new Date().toISOString(),
      invoice_number: templateFormData.invoice_number || `CTR-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: `Duration: ${templateFormData.duration_val} ${templateFormData.duration_unit}. Details: ${templateFormData.details}`
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

  const filteredInvoices = invoices.filter(inv => 
    (inv.client_name || inv.document_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-md">
        <CardHeader className="bg-gray-50/50 rounded-t-xl">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-gray-800">Sales & Documents Management</CardTitle>
            <div className="flex gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-white border-gray-200">
                    <FolderOpen className="w-4 h-4 mr-2 text-indigo-500" /> Drafts ({drafts.length}) <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  {drafts.length === 0 ? <p className="p-4 text-center text-xs text-gray-400">No drafts</p> :
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
              <Button onClick={() => typeFilter === 'template' ? setShowNDAModal(true) : setShowCreateModal(true)} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" /> {typeFilter === 'template' ? 'Add Custom Template' : `New ${typeFilter}`}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setSelectedTemplate(null); setSearchQuery(''); }}>
            <TabsList className="mb-8 grid grid-cols-6 h-auto bg-gray-100 p-1">
              {['template', 'contract', 'quote', 'job', 'invoice', 'receipt'].map(t => (
                <TabsTrigger key={t} value={t} className="capitalize py-2">{t === 'template' ? 'Documents' : t}</TabsTrigger>
              ))}
            </TabsList>

            {/* SEARCH AREA */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder={`Filter ${typeFilter} records...`} className="pl-10 h-11 border-gray-200 focus:ring-indigo-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            {/* DOCUMENT TAB SPECIFIC: CARDS ON TOP */}
            {typeFilter === 'template' && !selectedTemplate && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {Object.entries(templateFieldsConfig).map(([key, data]) => (
                  <Card key={key} onClick={() => setSelectedTemplate(key)} className="hover:border-indigo-500 transition-all cursor-pointer border-dashed border-2 bg-indigo-50/20 group">
                    <CardContent className="p-6 text-center">
                      <FileCheck className="w-12 h-12 text-indigo-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="font-bold text-indigo-900">{data.title}</h3>
                      <p className="text-xs text-gray-500 mt-2">{data.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* LIST AREA - ISOLATED FOR EACH TAB */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 px-2">Saved {typeFilter} Records</h4>
              {filteredInvoices.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed rounded-xl bg-gray-50/50">
                  <FileSpreadsheet className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400">No active {typeFilter} files found</p>
                </div>
              ) : (
                filteredInvoices.map(inv => (
                  <Card key={inv.id} className="hover:shadow-md transition-shadow border-gray-100">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                          {typeFilter === 'receipt' ? <Receipt className="w-5 h-5"/> : <FileText className="w-5 h-5"/>}
                        </div>
                        <div>
                          <p className="font-extrabold text-gray-900">{inv.invoice_number}</p>
                          <p className="text-sm text-gray-500 font-medium">{inv.client_name}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-6">
                        <div>
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-3">Active</Badge>
                          <p className="font-bold text-lg mt-1 text-gray-700">{currencySymbols[inv.currency || 'PHP']}{inv.total?.toLocaleString()}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-gray-300 hover:text-red-500 hover:bg-red-50" onClick={() => deleteMutation.mutate(inv.id)}><Trash2 className="w-4 h-4"/></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* MODAL: CUSTOM CONTRACT (FORMAL) */}
      <Dialog open={showNDAModal} onOpenChange={setShowNDAModal}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader className="border-b pb-4"><DialogTitle className="text-2xl font-serif text-gray-800">Formal Contract Agreement</DialogTitle></DialogHeader>
          <div className="space-y-5 py-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Contract Name/Title *</Label><Input placeholder="e.g. Master Service Agreement" value={templateFormData.document_name || ''} onChange={e => setTemplateFormData(p => ({...p, document_name: e.target.value}))}/></div>
              <div className="space-y-2"><Label>Date of Signing</Label><div className="relative"><Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" /><Input type="date" className="pl-10" value={templateFormData.signing_date || ''} onChange={e => setTemplateFormData(p => ({...p, signing_date: e.target.value}))}/></div></div>
            </div>
            <div className="space-y-2"><Label>Details of Contract</Label><Textarea className="min-h-[120px] bg-gray-50/30" placeholder="Scope, terms, and obligations..." value={templateFormData.details || ''} onChange={e => setTemplateFormData(p => ({...p, details: e.target.value}))}/></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Duration Value</Label><Input type="number" value={templateFormData.duration_val || ''} onChange={e => setTemplateFormData(p => ({...p, duration_val: e.target.value}))}/></div>
              <div className="space-y-2"><Label>Duration Unit</Label>
                <Select value={templateFormData.duration_unit} onValueChange={v => setTemplateFormData(p => ({...p, duration_unit: v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Months">Months</SelectItem><SelectItem value="Years">Years</SelectItem><SelectItem value="Indefinite">Indefinite</SelectItem></SelectContent>
                </Select></div>
            </div>
            <div className="p-4 border-2 border-dashed rounded-xl bg-gray-50 text-center">
              <Label className="cursor-pointer">
                <UploadCloud className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <span className="text-xs text-gray-500 block">Attach Signed Soft Copy (PDF/IMG)</span>
                <Input type="file" className="hidden" onChange={(e) => setUploadedFileName(e.target.files[0]?.name)} />
                {uploadedFileName && <Badge className="mt-2 bg-indigo-100 text-indigo-700">{uploadedFileName}</Badge>}
              </Label>
            </div>
            {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
          </div>
          <DialogFooter className="border-t pt-4 flex gap-3">
            <Button variant="outline" onClick={() => handleSaveCustom(true)} className="flex-1 h-11 border-gray-200 font-semibold"><Save className="w-4 h-4 mr-2" /> Save Draft</Button>
            <Button onClick={() => handleSaveCustom(false)} className="flex-1 h-11 bg-indigo-600 font-semibold">Finalize Document</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: TAB-SPECIFIC CREATORS (QUOTE, JOB, ETC) */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="capitalize flex items-center gap-2">
              {typeFilter === 'quote' && <FileDigit className="text-blue-500" />}
              {typeFilter === 'job' && <Briefcase className="text-orange-500" />}
              New {typeFilter} Form
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-6">
            <div className="space-y-2"><Label>Client/Business Name *</Label><Input value={templateFormData.client_name || ''} onChange={e => setTemplateFormData(p => ({...p, client_name: e.target.value}))}/></div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2"><Label>Total Amount</Label><Input type="number" placeholder="0.00" value={templateFormData.total || ''} onChange={e => setTemplateFormData(p => ({...p, total: e.target.value}))}/></div>
               <div className="space-y-2"><Label>Currency</Label>
                 <Select value={templateFormData.currency} onValueChange={v => setTemplateFormData(p => ({...p, currency: v}))}>
                   <SelectTrigger><SelectValue /></SelectTrigger>
                   <SelectContent>{Object.keys(currencySymbols).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                 </Select></div>
            </div>
            <div className="space-y-2"><Label>{typeFilter === 'quote' ? 'Validity Period' : 'Terms/Deadlines'}</Label><Input placeholder="e.g. Valid for 30 days" value={templateFormData.notes || ''} onChange={e => setTemplateFormData(p => ({...p, notes: e.target.value}))}/></div>
            <div className="border p-4 rounded-xl bg-gray-50 text-center border-dashed">
               <Label className="cursor-pointer text-xs font-semibold text-gray-500">
                  <UploadCloud className="w-5 h-5 mx-auto mb-1 text-gray-400" /> Attach Supporting Document
                  <Input type="file" className="hidden" />
               </Label>
            </div>
          </div>
          <DialogFooter className="border-t pt-4">
            <Button onClick={handleSaveStandard} className="w-full bg-indigo-600 h-11">Register {typeFilter}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}