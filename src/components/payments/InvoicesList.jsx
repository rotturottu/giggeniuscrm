import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label'; 
import { Input } from '@/components/ui/input'; 
import { Textarea } from '@/components/ui/textarea'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar, FileText, Plus, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

const currencySymbols = {
  USD: '$',
  EUR: '€',
  PHP: '₱',
  CAD: 'C$',
  AUD: 'A$'
};

const templateFieldsConfig = {
  independent: {
    title: 'Independent Contractor Agreement',
    desc: 'Professional contract template',
    fields: [
      { key: 'scope', label: 'Scope of Work', type: 'textarea', placeholder: 'e.g., The Contractor agrees to provide frontend web development services, including UI design and API integration...' },
      { key: 'payment', label: 'Payment Details', type: 'payment_group' },
    ],
  },
  service: {
    title: 'Service Agreement',
    desc: 'Professional contract template',
    fields: [
      { key: 'services', label: 'Services Provided', type: 'textarea', placeholder: 'e.g., Provider agrees to perform weekly maintenance, server monitoring, and backup management...' },
      { key: 'payment', label: 'Payment Details', type: 'payment_group' },
    ],
  },
  web: {
    title: 'Web Development Agreement',
    desc: 'Professional contract template',
    fields: [
      { key: 'projectScope', label: 'Project Scope', type: 'textarea', placeholder: 'e.g., Design and development of a 5-page e-commerce website with payment integration...' },
      { key: 'timeline', label: 'Timeline & Milestones', type: 'textarea', placeholder: 'e.g., Phase 1: Design (2 weeks), Phase 2: Development (4 weeks)...' },
      { key: 'payment', label: 'Payment Details', type: 'payment_group' },
    ],
  }
};

export default function InvoicesList({ onCreateNew }) {
  const qc = useQueryClient();
  const [typeFilter, setTypeFilter] = useState('template');
  const [selectedTemplate, setSelectedTemplate] = useState(null); 
  const [templateFormData, setTemplateFormData] = useState({}); 
  const [error, setError] = useState('');

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices', typeFilter],
    queryFn: () => base44.entities.Invoice.filter({ type: typeFilter }, '-created_date'),
  });

  const saveContractMutation = useMutation({
    mutationFn: (data) => base44.entities.Invoice.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      setSelectedTemplate(null);
      setTemplateFormData({});
      setError('');
      setTypeFilter('contract');
    }
  });

  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    viewed: 'bg-purple-100 text-purple-700',
    paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-500',
  };

  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);

  const pendingAmount = invoices
    .filter(inv => ['sent', 'viewed'].includes(inv.status))
    .reduce((sum, inv) => sum + inv.total, 0);

  const getCreateButtonText = () => {
    const name = typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1);
    return `Create ${name}`;
  };

  const handleTemplateSelect = (key) => {
    setSelectedTemplate(key);
    setError('');
    setTemplateFormData({ currency: 'USD' });
  };

  const handleNumericChange = (field, value) => {
    const strictNumericValue = value.replace(/[^0-9.]/g, '');
    setTemplateFormData(p => ({ ...p, [field]: strictNumericValue }));
    if (error) setError('');
  };

  const handleSaveTemplateForm = () => {
    // 1. Check base header fields
    if (!templateFormData.company_name || !templateFormData.client_name) {
      setError('Please complete all fields, including Company Name and Client Name.');
      return;
    }

    // 2. Check dynamic template fields based on config
    const config = templateFieldsConfig[selectedTemplate];
    for (const field of config.fields) {
      if (field.type === 'textarea' && !templateFormData[field.key]) {
        setError(`Please fill out the "${field.label}" section.`);
        return;
      }
      if (field.type === 'payment_group') {
        if (!templateFormData.payment_amount || !templateFormData.payment_schedule || !templateFormData.payment_terms) {
          setError('Please complete all Payment Details fields.');
          return;
        }
      }
    }

    // 3. Clear errors and Save to backend
    setError('');
    
    const newContractPayload = {
      type: 'contract', 
      client_name: templateFormData.client_name,
      invoice_number: `CTR-${Math.floor(1000 + Math.random() * 9000)}`, 
      total: Number(templateFormData.payment_amount),
      status: 'draft',
      issue_date: new Date().toISOString(),
    };

    saveContractMutation.mutate(newContractPayload);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
            <div className="text-2xl font-bold text-green-600">
              ${totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Pending Payment</div>
            <div className="text-2xl font-bold text-blue-600">
              ${pendingAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Total Documents</div>
            <div className="text-2xl font-bold text-purple-600">{invoices.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Documents</CardTitle>
            <Button onClick={onCreateNew} className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              {getCreateButtonText()}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs 
            value={typeFilter} 
            onValueChange={(val) => {
              setTypeFilter(val);
              setSelectedTemplate(null); 
              setTemplateFormData({}); 
              setError('');
            }}
          >
            <TabsList className="mb-6">
              <TabsTrigger value="template">Templates</TabsTrigger>
              <TabsTrigger value="contract">Contracts</TabsTrigger>
              <TabsTrigger value="quote">Quotes</TabsTrigger>
              <TabsTrigger value="job">Jobs</TabsTrigger>
              <TabsTrigger value="invoice">Invoices</TabsTrigger>
              <TabsTrigger value="receipt">Receipts</TabsTrigger>
            </TabsList>

            {typeFilter === 'template' ? (
              
              selectedTemplate ? (
                // 1. Functional Template Builder View
                <div className="animate-in fade-in duration-300">
                  <div className="flex items-center gap-4 mb-6 border-b pb-4">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedTemplate(null)} className="hover:bg-gray-100">
                      <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Button>
                    <h2 className="text-2xl font-bold text-gray-900">Template Builder</h2>
                  </div>
                  
                  <div className="bg-white p-8 rounded-xl border border-gray-100 space-y-8 min-h-[400px] max-w-4xl">
                    
                    {/* Template Header Section */}
                    <div className="border-b pb-4 mb-6">
                      <h1 className="text-2xl font-bold text-gray-950">{templateFieldsConfig[selectedTemplate].title}</h1>
                      <p className="text-gray-600 text-sm mt-1">{templateFieldsConfig[selectedTemplate].desc}</p>
                    </div>

                    {/* Static Agreement Text - Restored to original design */}
                    <p className="text-gray-500 italic font-medium leading-relaxed mb-6">
                      This agreement is between company_name and client_name.
                    </p>
                    
                    {/* Dynamic Form Editor Section */}
                    <div className="space-y-8">

                      {/* Restored standard alignment for Company and Client inputs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-gray-800 font-bold text-base">Company Name</Label>
                          <Input 
                            className="w-full bg-gray-50 focus:bg-white transition-colors" 
                            placeholder="e.g., Your Company LLC" 
                            value={templateFormData.company_name || ''}
                            onChange={(e) => {
                              setTemplateFormData(p => ({ ...p, company_name: e.target.value }));
                              if (error) setError('');
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-800 font-bold text-base">Client Name</Label>
                          <Input 
                            className="w-full bg-gray-50 focus:bg-white transition-colors" 
                            placeholder="e.g., Client Business Inc." 
                            value={templateFormData.client_name || ''}
                            onChange={(e) => {
                              setTemplateFormData(p => ({ ...p, client_name: e.target.value }));
                              if (error) setError('');
                            }}
                          />
                        </div>
                      </div>

                      {templateFieldsConfig[selectedTemplate].fields.map(field => {
                        
                        if (field.type === 'textarea') {
                          return (
                            <div key={field.key} className="space-y-2">
                              <Label htmlFor={field.key} className="text-gray-800 font-bold text-base">{field.label}</Label>
                              <Textarea
                                id={field.key}
                                rows={4}
                                value={templateFormData[field.key] || ''}
                                onChange={(e) => {
                                  setTemplateFormData(p => ({ ...p, [field.key]: e.target.value }));
                                  if (error) setError('');
                                }}
                                className="w-full bg-gray-50 focus:bg-white transition-colors"
                                placeholder={field.placeholder} 
                              />
                            </div>
                          );
                        }

                        if (field.type === 'payment_group') {
                          return (
                            <div key={field.key} className="space-y-4 p-6 bg-gray-50/80 rounded-xl border border-gray-200">
                              <Label className="text-gray-900 font-bold text-lg">{field.label}</Label>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                                <div className="space-y-2">
                                  <Label className="text-gray-700">Total Compensation / Rate</Label>
                                  <div className="flex gap-2">
                                    <Select 
                                      value={templateFormData.currency || 'USD'} 
                                      onValueChange={(val) => {
                                        setTemplateFormData(p => ({ ...p, currency: val }));
                                        if (error) setError('');
                                      }}
                                    >
                                      <SelectTrigger className="w-24 bg-white"><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="USD">USD</SelectItem>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                        <SelectItem value="PHP">PHP</SelectItem>
                                        <SelectItem value="CAD">CAD</SelectItem>
                                        <SelectItem value="AUD">AUD</SelectItem>
                                      </SelectContent>
                                    </Select>

                                    <div className="relative flex-1">
                                      <span className="absolute left-3 top-2.5 text-gray-500 font-medium">
                                        {currencySymbols[templateFormData.currency || 'USD']}
                                      </span>
                                      <Input 
                                        type="text" 
                                        className="pl-8 bg-white" 
                                        placeholder="0.00" 
                                        value={templateFormData.payment_amount || ''}
                                        onChange={(e) => handleNumericChange('payment_amount', e.target.value)}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-gray-700">Payment Schedule</Label>
                                  <Select 
                                    value={templateFormData.payment_schedule || ''} 
                                    onValueChange={(val) => {
                                      setTemplateFormData(p => ({ ...p, payment_schedule: val }));
                                      if (error) setError('');
                                    }}
                                  >
                                    <SelectTrigger className="bg-white"><SelectValue placeholder="Select schedule..." /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="upfront">100% Upfront</SelectItem>
                                      <SelectItem value="milestones">Milestone Based</SelectItem>
                                      <SelectItem value="completion">Upon Completion</SelectItem>
                                      <SelectItem value="monthly">Monthly Retainer</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="space-y-2 pt-2">
                                <Label className="text-gray-700">Additional Payment Terms</Label>
                                <Textarea 
                                  rows={2} 
                                  className="bg-white"
                                  placeholder="e.g., Invoices are to be paid Net 30. A late fee of 1.5% applies to overdue balances."
                                  value={templateFormData.payment_terms || ''}
                                  onChange={(e) => {
                                    setTemplateFormData(p => ({ ...p, payment_terms: e.target.value }));
                                    if (error) setError('');
                                  }}
                                />
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>

                    {/* Error Banner */}
                    {error && (
                      <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-semibold animate-in fade-in duration-300">
                        {error}
                      </div>
                    )}

                    <div className="flex justify-end pt-4 border-t mt-4">
                      <Button 
                        onClick={handleSaveTemplateForm} 
                        disabled={saveContractMutation.isPending}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {saveContractMutation.isPending ? 'Saving...' : 'Save Changes to Template'}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                // 2. Templates Grid View
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
                  {Object.entries(templateFieldsConfig).map(([key, data]) => (
                    <Card 
                      key={key} 
                      onClick={() => handleTemplateSelect(key)} 
                      className="hover:shadow-md hover:border-blue-300 transition-all cursor-pointer border border-gray-200"
                    >
                      <CardContent className="p-6">
                        <h3 className="font-bold text-lg text-gray-900 mb-3 leading-tight">
                          {data.title}
                        </h3>
                        <p className="text-gray-600 text-sm">{data.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )

            ) : (
              // 3. Standard List View for all other tabs
              <div className="space-y-3 animate-in fade-in duration-300">
                {invoices.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No {typeFilter}s found. Create your first one!
                  </div>
                ) : (
                  invoices.map((invoice) => {
                    const docNumber = invoice.invoice_number || `DOC-${invoice.id.slice(0,6)}`;
                    const cName = invoice.client_name || 'Unnamed Client';
                    
                    return (
                      <Card key={invoice.id} className="hover:shadow-md transition-all">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <FileText className="w-5 h-5 text-gray-400" />
                                <div>
                                  <p className="font-semibold">{docNumber}</p>
                                  <p className="text-sm text-gray-600">{cName}</p>
                                </div>
                              </div>
                              <div className="flex gap-4 text-sm text-gray-600">
                                {invoice.issue_date && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {format(new Date(invoice.issue_date), 'MMM d, yyyy')}
                                  </div>
                                )}
                                {invoice.due_date && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Due: {format(new Date(invoice.due_date), 'MMM d, yyyy')}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={statusColors[invoice.status] || 'bg-gray-100 text-gray-700'}>
                                {invoice.status || 'draft'}
                              </Badge>
                              <p className="text-2xl font-bold text-green-600 mt-2">
                                ${invoice.total?.toLocaleString() || '0'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}