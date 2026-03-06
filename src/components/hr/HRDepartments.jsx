import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, DollarSign, Edit, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

// Map to display the designated currency symbol inside the input and on the card
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

  const openEdit = (d) => { 
    setEditing(d); 
    setForm({ ...empty, ...d, currency: d.currency || 'PHP' }); 
    setError(''); 
    setShowForm(true); 
  };
  
  const openNew = () => { setEditing(null); setForm(empty); setError(''); setShowForm(true); };

  // Real-time strict validation for the budget (removes any non-number character instantly)
  const handleNumberChange = (key, value) => {
    // This regex strictly replaces anything that isn't a number or a decimal point with an empty string
    const strictNumericValue = value.replace(/[^0-9.]/g, '');
    
    setForm(p => ({ ...p, [key]: strictNumericValue }));
    if (error) setError('');
  };

  // Real-time validation for email
  const handleEmailChange = (key, value) => {
    setForm(p => ({ ...p, [key]: value }));
    if (value && !value.includes('@')) {
      setError('Invalid Input! Email fields must contain an "@" symbol.');
    } else {
      setError('');
    }
  };

  // Validation check before saving
  const handleSave = () => {
    // 1. Completely filled out check
    const requiredFields = ['name', 'head_email', 'description', 'budget'];
    const hasEmptyFields = requiredFields.some(field => !form[field] || form[field].toString().trim() === '');
    
    if (hasEmptyFields) {
      setError('Invalid Input! Please ensure the form is completely filled out.');
      return;
    }

    // 2. "@" Check
    if (!form.head_email.includes('@')) {
      setError('Invalid Input! Email fields must contain an "@" symbol.');
      return;
    }

    setError('');
    saveMutation.mutate(form);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew} className="bg-indigo-600 hover:bg-indigo-700 gap-2"><Plus className="w-4 h-4" />Add Department</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {departments.map(dept => {
          const sym = currencySymbols[dept.currency] || '$';
          return (
            <Card key={dept.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
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
              <CardContent className="space-y-2 text-sm text-gray-600">
                {dept.description && <p>{dept.description}</p>}
                <div className="flex items-center gap-2"><Users className="w-4 h-4" />{getCount(dept.name)} Employees</div>
                {dept.head_email && <div className="flex items-center gap-2">👤 {dept.head_email}</div>}
                {dept.budget && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    {sym}{Number(dept.budget).toLocaleString()} budget
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {departments.length === 0 && <div className="col-span-3 text-center py-12 text-gray-400">No departments yet.</div>}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Edit Department' : 'New Department'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            
            {/* Map over inputs with required asterisks and custom handlers */}
            {[['name', 'Department Name *'], ['head_email', 'Head Email *'], ['description', 'Description *'], ['budget', 'Annual Budget *']].map(([key, label]) => (
              <div key={key} className="space-y-1">
                <Label className={label.includes('*') ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>{label.replace(' *', '')}</Label>
                
                {key === 'budget' ? (
                  // BUDGET: Dropdown + Currency Input Wrapper
                  <div className="flex gap-2">
                    <Select value={form.currency} onValueChange={v => setForm(p => ({ ...p, currency: v }))}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="PHP">PHP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                        <SelectItem value="AUD">AUD</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative flex-1">
                      {/* Designated Currency Symbol Placed inside */}
                      <span className="absolute left-3 top-2 text-gray-500 font-medium">
                        {currencySymbols[form.currency]}
                      </span>
                      <Input 
                        type="text" 
                        className="pl-8"
                        value={form[key] || ''} 
                        onChange={e => handleNumberChange(key, e.target.value)} 
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                ) : key === 'head_email' ? (
                  <Input 
                    type="email" 
                    value={form[key] || ''} 
                    onChange={e => handleEmailChange(key, e.target.value)} 
                  />
                ) : (
                  <Input 
                    type="text" 
                    value={form[key] || ''} 
                    onChange={e => { 
                      setForm(p => ({ ...p, [key]: e.target.value })); 
                      if(error) setError(''); 
                    }} 
                  />
                )}
              </div>
            ))}
          </div>

          {/* Error Message Banner */}
          {error && (
            <div className="mt-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-semibold flex items-center justify-between animate-in fade-in duration-300">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={() => { setShowForm(false); setError(''); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}