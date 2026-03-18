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
import { ArrowLeft, Trash2, FileCheck, Receipt, UploadCloud, ChevronDown, FileText, Plus, Save } from 'lucide-react';
import { useState, useRef } from 'react';

const currencySymbols = { USD: '$', EUR: '€', PHP: '₱', CAD: 'C$', AUD: 'A$' };

// 4th template (NDA) removed from the main grid config
const templateFieldsConfig = {
  independent: { title: 'Independent Contractor Agreement', desc: 'Professional B2B services contract template', fields: [{ key: 'scope', label: 'Scope of Work', type: 'textarea', placeholder: 'Services provided...' }, { key: 'payment', label: 'Payment Details', type: 'payment_group' }] },
  service: { title: 'Service Agreement', desc: 'SLA / Maintenance contract template', fields: [{ key: 'services', label: 'Services Provided', type: 'textarea', placeholder: 'Maintenance, server monitoring...' }, { key: 'payment', label: 'Payment Details', type: 'payment_group' }] },
  companyContract: { 
    title: 'Contract Agreement (Job/Company)', 
    desc: 'Formal Employment/Job Contract template', 
    fields: [
      { key: 'position', label: 'Position Title', type: 'text', placeholder: 'e.g. Senior Frontend Engineer' },
      { key: 'supervisor', label: 'Supervisor Name', type: 'text', placeholder: 'e.g. Maria Cruz, Director of Tech' },
      { key: 'duties', label: 'Scope of Duties', type: 'textarea', placeholder: 'Detail the primary responsibilities...' },
      { key: 'salary', label: 'Salary/Compensation Details', type: 'textarea', placeholder: 'Base pay, bonus structure, etc.' },
      { key: 'term', label: 'Term (Duration)', type: 'text', placeholder: 'e.g. Fixed Term (1 year)' },
      { key: 'termination', label: 'Termination Clause', type: 'textarea', placeholder: 'Notice period requirements, grounds...' }
    ] 
  }
};

// NDA content kept for the Custom Template logic
const ndaTemplateContent = {
  title: 'Non-Disclosure Agreement (NDA)',
  fields: [
    { key: 'confidential_info', label: 'Definition of Confidential Info', type: 'textarea', placeholder: 'Specify what information is protected...' },
    { key: 'duration', label: 'Effective Duration', type: 'text', placeholder: 'e.g. 2 years after termination' }
  ]
};

export default function InvoicesList() {
  const qc = useQueryClient();
  const fileInputRef = useRef(null);

  const [typeFilter, setTypeFilter] = useState('template');
  const [selectedTemplate, setSelectedTemplate] = useState(null); 
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNDAModal, setShowNDAModal] = useState(false); // Modal for NDA/Custom
  const [templateFormData, setTemplateFormData] = useState({ currency: 'PHP' }); 
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [error, setError] = useState('');

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices', typeFilter],
    queryFn: () => base44.entities.Invoice.filter({ type: typeFilter === 'template' ? 'contract' : typeFilter }, '-created_date'),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.Invoice.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      setShowCreateModal(false);
      setShowNDAModal(false);
      setSelectedTemplate(null);
      setTemplateFormData({ currency: 'PHP' });
      setUploadedFileName(null);
      setError('');
    }
  });

  const handleSaveNDA = (isDraft = false) => {
    if (!templateFormData.document_name?.trim()) return setError('Document Name is required.');
    
    const payload = {
      ...templateFormData,
      type: 'contract', 
      total: 0,
      status: isDraft ? 'draft' : 'active',
      issue_date: new Date().toISOString(),
      invoice_number: `NDA-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: `NDA Template custom input. Status: ${isDraft ? 'Draft' : 'Completed'}`
    };
    saveMutation.mutate(payload);
  };

  const handleSaveDetailedTemplate = () => {
    if (!templateFormData.client_name?.trim()) return setError('Client/Employee Name is required.');
    if (!uploadedFileName) return setError('Please upload the signed contract soft copy.');

    const payload = {
      ...templateFormData,
      type: 'contract', 
      total: 0,
      status: 'active',
      issue_date: new Date().toISOString(),
      invoice_number: `CTR-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: `Template: ${templateFieldsConfig[selectedTemplate]?.title}. Signed: ${uploadedFileName}`
    };
    saveMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row (Omitted for brevity, kept same) */}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Documents</CardTitle>
            <div className="flex gap-2">
              {typeFilter === 'template' && (
                <Button 
                  onClick={() => { setError(''); setShowNDAModal(true); }} 
                  variant="outline" 
                  className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add a Custom Template
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={typeFilter} onValueChange={(val) => { setTypeFilter(val); setSelectedTemplate(null); }}>
            <TabsList className="mb-6 grid grid-cols-6 h-auto">
              <TabsTrigger value="template">Documents</TabsTrigger>
              <TabsTrigger value="contract">Contracts</TabsTrigger>
              <TabsTrigger value="quote">Quotes</TabsTrigger>
              <TabsTrigger value="job">Jobs</TabsTrigger>
              <TabsTrigger value="invoice">Invoices</TabsTrigger>
              <TabsTrigger value="receipt">Receipts</TabsTrigger>
            </TabsList>

            {typeFilter === 'template' ? (
              selectedTemplate ? (
                /* Detailed Template Builder (Same as original) */
                <div className="animate-in fade-in space-y-6 bg-white p-6 border rounded-xl shadow-sm">
                   <Button variant="ghost" onClick={() => setSelectedTemplate(null)} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
                   <h2 className="text-2xl font-bold border-b pb-3">{templateFieldsConfig[selectedTemplate].title} Builder</h2>
                   <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><Label>Client/Employee Name *</Label><Input value={templateFormData.client_name || ''} onChange={e => setTemplateFormData(p => ({...p, client_name: e.target.value}))} /></div>
                        <div className="space-y-1">
                          <Label>Currency</Label>
                          <Select value={templateFormData.currency} onValueChange={v => setTemplateFormData(p => ({...p, currency: v}))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{Object.keys(currencySymbols).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>
                      {templateFieldsConfig[selectedTemplate].fields.map(f => (
                        <div key={f.key} className="space-y-1">
                          <Label>{f.label}</Label>
                          {f.type === 'textarea' ? <Textarea value={templateFormData[f.key] || ''} onChange={e => setTemplateFormData(p => ({...p, [f.key]: e.target.value}))} /> : <Input value={templateFormData[f.key] || ''} onChange={e => setTemplateFormData(p => ({...p, [f.key]: e.target.value}))} />}
                        </div>
                      ))}
                      <div className="border p-4 rounded-lg bg-gray-50/50">
                        <Label className="font-semibold">Upload Signed Soft Copy *</Label>
                        <input type="file" ref={fileInputRef} onChange={(e) => setUploadedFileName(e.target.files[0]?.name)} className="hidden" />
                        {uploadedFileName ? <div className="p-2 bg-white border rounded flex items-center justify-between"><span>{uploadedFileName}</span><Button variant="ghost" size="icon" onClick={() => setUploadedFileName(null)}><Trash2 className="w-4 h-4"/></Button></div> : <Button variant="outline" onClick={() => fileInputRef.current.click()} className="w-full h-16 border-dashed">Upload Contract</Button>}
                      </div>
                      {error && <p className="text-red-500 text-sm">{error}</p>}
                      <Button onClick={handleSaveDetailedTemplate} className="w-full bg-indigo-600">Save Contract Document</Button>
                   </div>
                </div>
              ) : (
                /* Main Grid - NDA Card removed here */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(templateFieldsConfig).map(([key, data]) => (
                    <Card key={key} onClick={() => setSelectedTemplate(key)} className="hover:border-indigo-500 cursor-pointer transition-all border-dashed border-2">
                      <CardContent className="p-6 text-center">
                        <FileCheck className="w-10 h-10 text-indigo-500 mx-auto mb-3" />
                        <h3 className="font-bold">{data.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{data.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            ) : (
              /* Mapping existing invoices (Omitted for brevity) */
              <div className="space-y-3">
                 {invoices.map(inv => (
                    <Card key={inv.id}><CardContent className="p-4 flex justify-between items-center"><div><p className="font-bold">{inv.invoice_number}</p><p className="text-sm text-gray-500">{inv.client_name || inv.document_name}</p></div><Badge>{inv.status}</Badge></CardContent></Card>
                 ))}
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* NEW: Custom Template / NDA Pop-up Window */}
      <Dialog open={showNDAModal} onOpenChange={setShowNDAModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Custom Template (NDA)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Document Name *</Label>
              <Input 
                placeholder="e.g. Employee Non-Disclosure Agreement" 
                value={templateFormData.document_name || ''}
                onChange={e => setTemplateFormData(p => ({...p, document_name: e.target.value}))}
              />
            </div>
            {ndaTemplateContent.fields.map(f => (
              <div key={f.key} className="space-y-2">
                <Label>{f.label}</Label>
                {f.type === 'textarea' ? (
                  <Textarea 
                    placeholder={f.placeholder}
                    value={templateFormData[f.key] || ''}
                    onChange={e => setTemplateFormData(p => ({...p, [f.key]: e.target.value}))}
                  />
                ) : (
                  <Input 
                    placeholder={f.placeholder}
                    value={templateFormData[f.key] || ''}
                    onChange={e => setTemplateFormData(p => ({...p, [f.key]: e.target.value}))}
                  />
                )}
              </div>
            ))}
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => handleSaveNDA(true)} className="gap-2">
              <Save className="w-4 h-4" /> Save as Draft
            </Button>
            <Button onClick={() => handleSaveNDA(false)} className="bg-indigo-600">
              Save Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}