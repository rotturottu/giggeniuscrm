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
import { ArrowLeft, Trash2, FileCheck, Receipt, UploadCloud, ChevronDown, FileText, Plus, Save, FolderOpen, Search, Calendar, FileDigit, Briefcase, FileSpreadsheet, FilePlus } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const currencySymbols = { USD: '$', EUR: '€', PHP: '₱', CAD: 'C$', AUD: 'A$' };

export default function InvoicesList() {
  const qc = useQueryClient();
  const [typeFilter, setTypeFilter] = useState('template');
  const [showNDAModal, setShowNDAModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false); 
  const [templateFormData, setTemplateFormData] = useState({ currency: 'PHP', duration_unit: 'Years' }); 
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices', typeFilter],
    queryFn: async () => {
        const dbType = typeFilter === 'template' ? 'contract' : typeFilter;
        const res = await base44.entities.Invoice.list('-created_date');
        return Array.isArray(res) ? res.filter(inv => inv.type === dbType && inv.status === 'active') : [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data) => data.id ? base44.entities.Invoice.update(data.id, data) : base44.entities.Invoice.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      setShowNDAModal(false); 
      setShowCreateModal(false); 
      setTemplateFormData({ currency: 'PHP', duration_unit: 'Years' }); 
      toast.success('Document saved successfully');
    }
  });

  const handleSaveCustom = (isDraft = false) => {
    if (!templateFormData.document_name?.trim()) return setError('Title is required.');
    saveMutation.mutate({
      ...templateFormData,
      type: 'contract', 
      client_name: templateFormData.document_name, 
      status: isDraft ? 'draft' : 'active',
      invoice_number: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: templateFormData.details || ''
    });
  };

  return (
    <div className="space-y-6 text-left">
      <Card className="border-none shadow-md">
        <CardHeader className="bg-gray-50/50 rounded-t-xl">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-gray-800">Sales & Documents</CardTitle>
            <Button 
              onClick={() => {
                console.log("Button clicked!");
                if (typeFilter === 'template') setShowNDAModal(true);
                else setShowCreateModal(true);
              }} 
              className="bg-indigo-600 hover:bg-indigo-700 font-bold"
            >
              <Plus className="w-4 h-4 mr-2" /> {typeFilter === 'template' ? 'Add Custom Template' : `New ${typeFilter}`}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <Tabs value={typeFilter} onValueChange={setTypeFilter}>
            <TabsList className="mb-8 grid grid-cols-6 h-auto bg-gray-100 p-1 rounded-xl">
              {['template', 'contract', 'quote', 'job', 'invoice', 'receipt'].map(t => (
                <TabsTrigger key={t} value={t} className="capitalize py-2 rounded-lg">{t === 'template' ? 'Documents' : t}</TabsTrigger>
              ))}
            </TabsList>

            {/* List View */}
            <div className="space-y-4">
              {invoices.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-gray-50/50">
                  <FileSpreadsheet className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium">No records found</p>
                </div>
              ) : (
                invoices.map(inv => (
                  <Card key={inv.id} className="hover:shadow-md border-gray-100">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <FileText className="w-5 h-5 text-indigo-500" />
                        <div>
                          <p className="font-bold text-gray-900">{inv.invoice_number}</p>
                          <p className="text-sm text-gray-500">{inv.client_name}</p>
                        </div>
                      </div>
                      <p className="font-black text-lg">{currencySymbols[inv.currency || 'PHP']}{inv.total || 0}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* CUSTOMIZER MODAL */}
      <Dialog open={showNDAModal} onOpenChange={setShowNDAModal}>
        <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Document Customizer</DialogTitle>
            <DialogDescription>Create a fully custom document for your records.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Document Title</Label>
                <Input value={templateFormData.document_name || ''} onChange={e => setTemplateFormData(p => ({...p, document_name: e.target.value}))} />
              </div>
              <div className="space-y-1">
                <Label>Date</Label>
                <Input type="date" value={templateFormData.signing_date || ''} onChange={e => setTemplateFormData(p => ({...p, signing_date: e.target.value}))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Document Content</Label>
              <Textarea className="min-h-[200px]" value={templateFormData.details || ''} onChange={e => setTemplateFormData(p => ({...p, details: e.target.value}))} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => handleSaveCustom(false)} className="bg-indigo-600 w-full">Save Document</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}