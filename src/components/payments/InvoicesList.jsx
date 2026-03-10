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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar, FileText, Plus, ArrowLeft, Trash2, Briefcase, FileCheck, Receipt, UploadCloud, AlertTriangle } from 'lucide-react';
import { useState, useRef } from 'react';

const currencySymbols = { USD: '$', EUR: '€', PHP: '₱', CAD: 'C$', AUD: 'A$' };

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

export default function InvoicesList() {
  const qc = useQueryClient();
  const fileInputRef = useRef(null);

  const [typeFilter, setTypeFilter] = useState('template');
  const [selectedTemplate, setSelectedTemplate] = useState(null); 
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [templateFormData, setTemplateFormData] = useState({ currency: 'PHP' }); 
  const [uploadedFileName, setUploadedFileName] = useState(null);

  const [formData, setFormData] = useState({ 
    client_name: '', 
    items: [{ desc: '', qty: 1, price: 0 }], 
    tax_rate: 0, 
    currency: 'PHP' 
  });
  
  const [error, setError] = useState('');
  const [simpleContractData, setSimpleContractData] = useState({ client_name: '', total: '', currency: 'PHP' });

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices', typeFilter],
    queryFn: () => base44.entities.Invoice.filter({ type: typeFilter === 'template' ? 'contract' : typeFilter }, '-created_date'),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.Invoice.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      setShowCreateModal(false);
      setSelectedTemplate(null);
      setTemplateFormData({ currency: 'PHP' });
      setFormData({ client_name: '', items: [{ desc: '', qty: 1, price: 0 }], tax_rate: 0, currency: 'PHP' });
      setSimpleContractData({ client_name: '', total: '', currency: 'PHP' });
      setUploadedFileName(null);
      setError('');
    }
  });

  const subtotal = formData.items.reduce((acc, item) => acc + (item.qty * item.price), 0);
  const taxAmount = (subtotal * (formData.tax_rate / 100));
  const total = subtotal + taxAmount;

  const handleCreateNew = () => {
    setError('');
    setShowCreateModal(true);
  };

  const addItem = () => setFormData(p => ({ ...p, items: [...p.items, { desc: '', qty: 1, price: 0 }] }));
  const removeItem = (index) => setFormData(p => ({ ...p, items: p.items.filter((_, i) => i !== index) }));

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) setUploadedFileName(file.name);
  };

  const handleSaveDetailedTemplate = () => {
    if (!templateFormData.client_name?.trim()) return setError('Client/Employee Name is required.');
    if (!uploadedFileName) return setError('Please upload the signed contract soft copy.');

    const payload = {
      ...templateFormData,
      type: 'contract', 
      total: 0,
      status: 'draft',
      issue_date: new Date().toISOString(),
      invoice_number: `CTR-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: `Template: ${templateFieldsConfig[selectedTemplate].title}. Signed Soft Copy: ${uploadedFileName}`
    };
    saveMutation.mutate(payload);
  };

  const handleSaveDocument = () => {
    if (!formData.client_name.trim()) return setError('Client Name is required.');
    if (formData.items.some(i => !i.desc.trim())) return setError('All items must have a description.');
    
    saveMutation.mutate({
      ...formData,
      type: typeFilter,
      total: total,
      status: 'draft',
      issue_date: new Date().toISOString(),
      invoice_number: `${typeFilter.toUpperCase().slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`
    });
  };

  const handleSaveSimpleContract = () => {
    if (!simpleContractData.client_name.trim()) return setError('Please provide the Client Name.');
    if (!simpleContractData.total) return setError('Total amount is required.');
    saveMutation.mutate({
      ...simpleContractData,
      total: Number(simpleContractData.total),
      type: 'contract',
      status: 'draft',
      issue_date: new Date().toISOString(),
      invoice_number: `CTR-${Math.floor(1000 + Math.random() * 9000)}`
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><div className="text-sm text-gray-600 mb-1">Total Revenue (Paid)</div><div className="text-2xl font-bold text-green-600">₱{invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0).toLocaleString()}</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-sm text-gray-600 mb-1">Pending Invoices</div><div className="text-2xl font-bold text-blue-600">₱{invoices.filter(i => ['sent', 'viewed'].includes(i.status)).reduce((s, i) => s + i.total, 0).toLocaleString()}</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-sm text-gray-600 mb-1">Active Documents</div><div className="text-2xl font-bold text-purple-600">{invoices.length}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Documents</CardTitle>
            {typeFilter !== 'template' && (
              <Button onClick={handleCreateNew} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Create {typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={typeFilter} onValueChange={(val) => { setTypeFilter(val); setSelectedTemplate(null); setError(''); }}>
            <TabsList className="mb-6 grid grid-cols-3 md:grid-cols-6 h-auto">
              <TabsTrigger value="template">Templates</TabsTrigger>
              <TabsTrigger value="contract">Contracts</TabsTrigger>
              <TabsTrigger value="quote">Quotes</TabsTrigger>
              <TabsTrigger value="job">Jobs</TabsTrigger>
              <TabsTrigger value="invoice">Invoices</TabsTrigger>
              <TabsTrigger value="receipt">Receipts</TabsTrigger>
            </TabsList>

            {typeFilter === 'template' ? (
              selectedTemplate ? (
                <div className="animate-in fade-in space-y-6 mx-auto bg-white p-6 border rounded-xl max-w-5xl shadow-sm border-gray-100">
                  <Button variant="ghost" onClick={() => setSelectedTemplate(null)} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
                  <h2 className="text-2xl font-bold border-b border-gray-100 pb-3">{templateFieldsConfig[selectedTemplate].title} Builder</h2>
                  
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><Label>Client/Employee Name *</Label><Input value={templateFormData.client_name || ''} onChange={e => setTemplateFormData(p => ({...p, client_name: e.target.value}))} /></div>
                        <div className="space-y-1">
                          <Label>Currency Selection</Label>
                          <Select value={templateFormData.currency} onValueChange={v => setTemplateFormData(p => ({...p, currency: v}))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{Object.keys(currencySymbols).map(c => <SelectItem key={c} value={c}>{c} ({currencySymbols[c]})</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                    </div>

                    {templateFieldsConfig[selectedTemplate].fields.map(f => (
                        <div key={f.key}>
                            <Label>{f.label}</Label>
                            {f.type === 'textarea' ? <Textarea value={templateFormData[f.key] || ''} onChange={e => setTemplateFormData(p => ({...p, [f.key]: e.target.value}))} /> : <Input value={templateFormData[f.key] || ''} onChange={e => setTemplateFormData(p => ({...p, [f.key]: e.target.value}))} />}
                        </div>
                    ))}

                    <div className="border border-gray-100 p-5 rounded-lg bg-gray-50/50 mt-4">
                      <Label className="text-base font-semibold">Upload Signed Soft Copy *</Label>
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                      {uploadedFileName ? (
                        <div className="flex items-center gap-3 p-3 bg-white border rounded-md">
                          <FileText className="text-green-500" /><span>{uploadedFileName}</span>
                          <Button variant="ghost" size="icon" onClick={() => setUploadedFileName(null)} className="ml-auto text-red-500"><Trash2 className="w-4 h-4"/></Button>
                        </div>
                      ) : (
                        <Button variant="outline" onClick={() => fileInputRef.current.click()} className="w-full h-16 border-dashed border-2 gap-3">
                          <UploadCloud className="text-indigo-400" /> Click to Upload Contract
                        </Button>
                      )}
                    </div>
                    <Button onClick={handleSaveDetailedTemplate} className="w-full bg-indigo-600 hover:bg-indigo-700 min-h-[48px]">Save Contract Document</Button>
                  </div>
                </div>
              ) : (
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
              <div className="space-y-3">
                {invoices.length === 0 ? <div className="text-center py-10 text-gray-400 border rounded-lg border-dashed">No records found.</div> : 
                  invoices.map(inv => (
                    <Card key={inv.id} className="hover:shadow-sm">
                      <CardContent className="p-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-gray-100 rounded-lg">{typeFilter === 'receipt' ? <Receipt className="w-5 h-5"/> : <FileText className="w-5 h-5"/>}</div>
                          <div><p className="font-bold">{inv.invoice_number}</p><p className="text-sm text-gray-500">{inv.client_name}</p></div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{inv.status}</Badge>
                          <p className="font-bold text-green-600 text-lg">{currencySymbols[inv.currency || 'PHP']}{inv.total?.toLocaleString()}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                }
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
          <DialogHeader><DialogTitle>Create {typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}</DialogTitle></DialogHeader>
          
          {typeFilter === 'contract' ? (
             <div className="space-y-4 pt-4">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><Label>Client Name *</Label><Input value={simpleContractData.client_name} onChange={e => setSimpleContractData(p => ({...p, client_name: e.target.value}))} /></div>
                  <div className="space-y-1">
                    <Label>Currency</Label>
                    <Select value={simpleContractData.currency} onValueChange={v => setSimpleContractData(p => ({...p, currency: v}))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{Object.keys(currencySymbols).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
               </div>
               <div className="space-y-1">
                 <Label>Contract Value ({simpleContractData.currency}) *</Label>
                 <div className="relative">
                   <span className="absolute left-3 top-2.5 text-gray-400 font-medium">{currencySymbols[simpleContractData.currency]}</span>
                   <Input type="number" className="pl-8" value={simpleContractData.total} onChange={e => setSimpleContractData(p => ({...p, total: e.target.value}))} />
                 </div>
               </div>
               <DialogFooter className="mt-6"><Button onClick={handleSaveSimpleContract} className="bg-indigo-600">Save Contract</Button></DialogFooter>
             </div>
          ) : (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1 col-span-1"><Label>Client Name *</Label><Input value={formData.client_name} onChange={e => setFormData(p => ({...p, client_name: e.target.value}))} /></div>
                <div className="space-y-1"><Label>Due Date</Label><Input type="date" onChange={e => setFormData(p => ({...p, due_date: e.target.value}))} /></div>
                <div className="space-y-1">
                  <Label>Currency</Label>
                  <Select value={formData.currency} onValueChange={v => setFormData(p => ({...p, currency: v}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.keys(currencySymbols).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              {(['quote', 'invoice', 'receipt'].includes(typeFilter)) && (
                <div className="space-y-4">
                  <Label className="font-bold underline">Line Items ({formData.currency})</Label>
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-[3] space-y-1"><Label className="text-[10px]">Description</Label><Input value={item.desc} onChange={e => {
                        const newItems = [...formData.items]; newItems[index].desc = e.target.value; setFormData(p => ({...p, items: newItems}));
                      }} /></div>
                      <div className="flex-1 space-y-1"><Label className="text-[10px]">Qty</Label><Input type="number" value={item.qty} onChange={e => {
                        const newItems = [...formData.items]; newItems[index].qty = parseFloat(e.target.value) || 0; setFormData(p => ({...p, items: newItems}));
                      }} /></div>
                      <div className="flex-1 space-y-1">
                        <Label className="text-[10px]">Price</Label>
                        <div className="relative">
                          <span className="absolute left-2 top-2 text-[10px] text-gray-400">{currencySymbols[formData.currency]}</span>
                          <Input className="pl-5" type="number" value={item.price} onChange={e => {
                            const newItems = [...formData.items]; newItems[index].price = parseFloat(e.target.value) || 0; setFormData(p => ({...p, items: newItems}));
                          }} />
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(index)} className="text-red-500"><Trash2 className="w-4 h-4"/></Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addItem} className="w-full border-dashed"><Plus className="w-4 h-4 mr-2"/>Add Item</Button>
                </div>
              )}

              <div className="border-t pt-4 space-y-2 mt-4 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>{currencySymbols[formData.currency]}{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between items-center text-sm">
                  <span>Tax Rate (%)</span>
                  <Input type="number" className="w-20 h-8 text-right bg-white" value={formData.tax_rate} onChange={e => setFormData(p => ({...p, tax_rate: parseFloat(e.target.value) || 0}))} />
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2 text-indigo-700">
                  <span>Total {formData.currency}</span>
                  <span>{currencySymbols[formData.currency]}{total.toLocaleString()}</span>
                </div>
              </div>
              <DialogFooter><Button onClick={handleSaveDocument} className="bg-indigo-600">Save as Draft</Button></DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}