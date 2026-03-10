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
import { Calendar, FileText, Plus, ArrowLeft, Trash2, Briefcase, FileCheck, Receipt } from 'lucide-react';
import { useState } from 'react';

const currencySymbols = { USD: '$', EUR: '€', PHP: '₱', CAD: 'C$', AUD: 'A$' };

const templateFieldsConfig = {
  independent: { title: 'Independent Contractor Agreement', desc: 'Professional contract template', fields: [{ key: 'scope', label: 'Scope of Work', type: 'textarea', placeholder: 'Services provided...' }, { key: 'payment', label: 'Payment Details', type: 'payment_group' }] },
  service: { title: 'Service Agreement', desc: 'Professional contract template', fields: [{ key: 'services', label: 'Services Provided', type: 'textarea', placeholder: 'Maintenance, server monitoring...' }, { key: 'payment', label: 'Payment Details', type: 'payment_group' }] },
  web: { title: 'Web Development Agreement', desc: 'Professional contract template', fields: [{ key: 'projectScope', label: 'Project Scope', type: 'textarea', placeholder: 'Design and development...' }, { key: 'timeline', label: 'Timeline & Milestones', type: 'textarea', placeholder: 'Phase 1: Design...' }, { key: 'payment', label: 'Payment Details', type: 'payment_group' }] }
};

export default function InvoicesList() {
  const qc = useQueryClient();
  const [typeFilter, setTypeFilter] = useState('template');
  const [selectedTemplate, setSelectedTemplate] = useState(null); 
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [templateFormData, setTemplateFormData] = useState({}); 
  const [formData, setFormData] = useState({ client_name: '', items: [{ desc: '', qty: 1, price: 0 }], tax_rate: 0, currency: 'PHP' });
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
      setSelectedTemplate(null);
      setTemplateFormData({});
      setFormData({ client_name: '', items: [{ desc: '', qty: 1, price: 0 }], tax_rate: 0, currency: 'PHP' });
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

  const handleSaveDocument = () => {
    if (!formData.client_name.trim()) return setError('Client Name is required.');
    if (formData.items.some(i => !i.desc.trim())) return setError('All items must have a description.');

    const payload = {
      ...formData,
      type: typeFilter,
      total: total,
      status: 'draft',
      issue_date: new Date().toISOString(),
      invoice_number: `${typeFilter.toUpperCase().slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`
    };
    saveMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><div className="text-sm text-gray-600 mb-1">Total Revenue</div><div className="text-2xl font-bold text-green-600">₱{invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0).toLocaleString()}</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-sm text-gray-600 mb-1">Pending</div><div className="text-2xl font-bold text-blue-600">₱{invoices.filter(i => ['sent', 'viewed'].includes(i.status)).reduce((s, i) => s + i.total, 0).toLocaleString()}</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-sm text-gray-600 mb-1">Total Count</div><div className="text-2xl font-bold text-purple-600">{invoices.length}</div></CardContent></Card>
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
                <div className="animate-in fade-in space-y-6 max-w-4xl mx-auto bg-white p-6 border rounded-xl">
                  <Button variant="ghost" onClick={() => setSelectedTemplate(null)} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
                  <h2 className="text-xl font-bold border-b pb-2">{templateFieldsConfig[selectedTemplate].title} Builder</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><Label>Company Name</Label><Input onChange={e => setTemplateFormData(p => ({...p, company_name: e.target.value}))} /></div>
                        <div className="space-y-1"><Label>Client Name</Label><Input onChange={e => setTemplateFormData(p => ({...p, client_name: e.target.value}))} /></div>
                    </div>
                    {templateFieldsConfig[selectedTemplate].fields.map(f => (
                        f.type === 'textarea' ? <div key={f.key}><Label>{f.label}</Label><Textarea placeholder={f.placeholder} onChange={e => setTemplateFormData(p => ({...p, [f.key]: e.target.value}))} /></div> : null
                    ))}
                    <Button onClick={() => saveMutation.mutate({ type: 'contract', client_name: templateFormData.client_name, total: 0, status: 'draft' })} className="w-full bg-indigo-600">Save Template as Contract</Button>
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
                {invoices.length === 0 ? <div className="text-center py-10 text-gray-400 border rounded-lg border-dashed">No {typeFilter}s found. Click "Create" to start.</div> : 
                  invoices.map(inv => (
                    <Card key={inv.id} className="hover:shadow-sm">
                      <CardContent className="p-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-gray-100 rounded-lg">{typeFilter === 'receipt' ? <Receipt className="w-5 h-5"/> : <FileText className="w-5 h-5"/>}</div>
                          <div>
                            <p className="font-bold">{inv.invoice_number || 'DOC-UNSET'}</p>
                            <p className="text-sm text-gray-500">{inv.client_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="mb-1">{inv.status}</Badge>
                          <p className="font-bold text-indigo-600">₱{inv.total?.toLocaleString()}</p>
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

      {/* DYNAMIC CREATE DIALOG */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
          <DialogHeader><DialogTitle>Create New {typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Client Name *</Label>
                <Input value={formData.client_name} onChange={e => setFormData(p => ({...p, client_name: e.target.value}))} placeholder="Client Business Name" />
              </div>
              <div className="space-y-1">
                <Label>Due Date</Label>
                <Input type="date" onChange={e => setFormData(p => ({...p, due_date: e.target.value}))} />
              </div>
            </div>

            {typeFilter === 'job' && (
              <div className="space-y-2">
                <Label>Job Description/Scope</Label>
                <Textarea placeholder="Detail the work to be performed..." onChange={e => setFormData(p => ({...p, job_description: e.target.value}))} />
              </div>
            )}

            {(['quote', 'invoice', 'receipt'].includes(typeFilter)) && (
              <div className="space-y-4">
                <Label className="font-bold">Line Items</Label>
                {formData.items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-[3] space-y-1">
                      <Label className="text-[10px] uppercase">Description</Label>
                      <Input value={item.desc} onChange={e => {
                        const newItems = [...formData.items];
                        newItems[index].desc = e.target.value;
                        setFormData(p => ({...p, items: newItems}));
                      }} placeholder="Item or Service" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label className="text-[10px] uppercase">Qty</Label>
                      <Input type="number" value={item.qty} onChange={e => {
                        const newItems = [...formData.items];
                        newItems[index].qty = parseFloat(e.target.value) || 0;
                        setFormData(p => ({...p, items: newItems}));
                      }} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label className="text-[10px] uppercase">Price</Label>
                      <Input type="number" value={item.price} onChange={e => {
                        const newItems = [...formData.items];
                        newItems[index].price = parseFloat(e.target.value) || 0;
                        setFormData(p => ({...p, items: newItems}));
                      }} />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(index)} className="text-red-500"><Trash2 className="w-4 h-4"/></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addItem} className="w-full border-dashed"><Plus className="w-4 h-4 mr-2"/>Add Item</Button>
              </div>
            )}

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span>₱{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between items-center text-sm">
                <span>Tax Rate (%)</span>
                <Input type="number" className="w-20 h-8 text-right" value={formData.tax_rate} onChange={e => setFormData(p => ({...p, tax_rate: parseFloat(e.target.value) || 0}))} />
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2 text-indigo-600">
                <span>Total</span>
                <span>₱{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded border border-red-100">{error}</div>}

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleSaveDocument} className="bg-indigo-600 hover:bg-indigo-700">Save as Draft</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}