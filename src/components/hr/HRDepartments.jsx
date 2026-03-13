import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Edit, Plus, Trash2, Users, Wallet } from 'lucide-react';
import { useState } from 'react';

const currencySymbols = {
  USD: '$',
  EUR: '€',
  PHP: '₱',
  CAD: 'C$',
  AUD: 'A$'
};

const empty = { name: '', head_email: '', description: '', budget: '', currency: 'PHP' };

export default function HRDepartments() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => base44.entities.Department.list('-created_date', 50),
  });
  
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list('-created_date', 200),
  });

  const saveMutation = useMutation({
    mutationFn: (d) => editing ? base44.entities.Department.update(editing.id, d) : base44.entities.Department.create(d),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['departments'] }); 
      setShowForm(false); 
      setEditing(null); 
      setForm(empty); 
      setError(''); 
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Department.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
  });

  const getCount = (name) => employees.filter(e => e.department === name).length;

  const openEdit = (d) => { setEditing(d); setForm({ ...empty, ...d }); setError(''); setShowForm(true); };
  const openNew = () => { setEditing(null); setForm(empty); setError(''); setShowForm(true); };

  const handleNumberChange = (key, value) => {
    setForm(p => ({ ...p, [key]: value }));
    if (/[a-zA-Z]/.test(value)) {
      setError('Invalid Input! Alphabets are not allowed in number-only sections.');
    } else {
      setError('');
    }
  };

  const handleEmailChange = (key, value) => {
    setForm(p => ({ ...p, [key]: value }));
    if (value && !value.includes('@')) {
      setError('Invalid Input! Email fields must contain an "@" symbol.');
    } else {
      setError('');
    }
  };

  const handleSave = () => {
    const requiredFields = ['name', 'head_email', 'description', 'budget', 'currency'];
    if (requiredFields.some(field => !form[field] || form[field].toString().trim() === '')) {
      setError('Invalid Input! Please ensure the form is completely filled out.');
      return;
    }
    if (!form.head_email.includes('@')) return;
    if (/[a-zA-Z]/.test(form.budget)) return;

    setError('');
    saveMutation.mutate(form);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Plus className="w-4 h-4" />Add Department
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {departments.map(dept => {
          const sym = currencySymbols[dept.currency] || '$';
          return (
            <Card key={dept.id} className="hover:shadow-md transition-shadow border-l-4 border-l-indigo-500">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <CardTitle className="text-lg">{dept.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(dept)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => deleteMutation.mutate(dept.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <p className="line-clamp-2 italic">{dept.description}</p>
                <div className="pt-2 space-y-2 border-t border-gray-50">
                  <div className="flex items-center gap-2"><Users className="w-4 h-4 text-gray-400" />{getCount(dept.name)} Employees</div>
                  <div className="flex items-center gap-2">👤 {dept.head_email}</div>
                  {dept.budget && (
                    <div className="flex items-center gap-2 font-bold text-indigo-700 bg-indigo-50/50 p-2 rounded-md">
                      <Wallet className="w-4 h-4" />
                      {sym}{Number(dept.budget).toLocaleString()} <span className="text-[10px] font-normal text-indigo-400 ml-1">{dept.currency}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Edit Department' : 'New Department'}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
                <Label className="after:content-['*'] after:ml-0.5 after:text-red-500 text-xs uppercase tracking-wider text-gray-500">Department Name</Label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Marketing" />
            </div>
            <div className="space-y-1">
                <Label className="after:content-['*'] after:ml-0.5 after:text-red-500 text-xs uppercase tracking-wider text-gray-500">Head Email</Label>
                <Input type="email" value={form.head_email} onChange={e => handleEmailChange('head_email', e.target.value)} placeholder="manager@company.com" />
            </div>
            <div className="space-y-1">
                <Label className="after:content-['*'] after:ml-0.5 after:text-red-500 text-xs uppercase tracking-wider text-gray-500">Description</Label>
                <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief department overview" />
            </div>
            
            <div className="space-y-1">
              <Label className="after:content-['*'] after:ml-0.5 after:text-red-500 text-xs uppercase tracking-wider text-gray-500">Annual Budget</Label>
              <div className="flex gap-2">
                <Select value={form.currency} onValueChange={(val) => setForm(p => ({ ...p, currency: val }))}>
                    <SelectTrigger className="w-[120px] bg-gray-50">
                        <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(currencySymbols).map(([code, symbol]) => (
                            <SelectItem key={code} value={code}>
                              <span className="font-medium">{code}</span> <span className="text-muted-foreground ml-1">({symbol})</span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium pointer-events-none">
                    {currencySymbols[form.currency]}
                  </span>
                  <Input 
                    placeholder="0.00"
                    type="text" 
                    className="pl-8" 
                    value={form.budget || ''} 
                    onChange={e => handleNumberChange('budget', e.target.value)} 
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-semibold animate-in zoom-in-95">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={() => { setShowForm(false); setError(''); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 min-w-[80px]">
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}