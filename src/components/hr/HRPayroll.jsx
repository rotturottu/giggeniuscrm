import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, DollarSign, Edit, Plus, User, Trash2 } from 'lucide-react';
import { useState } from 'react';

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  approved: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
};

const currencySymbols = { USD: '$', EUR: '€', PHP: '₱', CAD: 'C$', AUD: 'A$' };

const empty = {
  employee_name: '', employee_email: '', period_start: '', period_end: '', currency: 'PHP',
  base_salary: '', hours_worked: '', overtime_hours: '', overtime_pay: '',
  bonuses: '', deductions: '', tax: '', net_pay: '0.00', status: 'draft', notes: '',
};

export default function HRPayroll() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');

  // 1. Fetch Employees for the Dropdown
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list('-created_date', 100),
  });

  // 2. Fetch Payroll Records
  const { data: records = [] } = useQuery({
    queryKey: ['payroll'],
    queryFn: () => base44.entities.PayrollRecord.list('-created_date', 100),
  });

  const saveMutation = useMutation({
    mutationFn: (d) => editing ? base44.entities.PayrollRecord.update(editing.id, d) : base44.entities.PayrollRecord.create(d),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['payroll'] }); 
      setShowForm(false); 
      setEditing(null); 
      setForm(empty); 
      setError(''); 
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PayrollRecord.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll'] }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.PayrollRecord.update(id, { status, ...(status === 'paid' ? { paid_at: new Date().toISOString() } : {}) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll'] }),
  });

  const filtered = statusFilter === 'all' ? records : records.filter(r => r.status === statusFilter);

  const calcNet = (f) => {
    const base = parseFloat(f.base_salary) || 0;
    const ot = parseFloat(f.overtime_pay) || 0;
    const bonus = parseFloat(f.bonuses) || 0;
    const ded = parseFloat(f.deductions) || 0;
    const tax = parseFloat(f.tax) || 0;
    const total = base + ot + bonus - ded - tax;
    return total > 0 ? total.toFixed(2) : '0.00';
  };

  const setField = (key, val) => {
    const numericFields = ['base_salary', 'hours_worked', 'overtime_hours', 'overtime_pay', 'bonuses', 'deductions', 'tax'];
    let finalVal = val;
    if (numericFields.includes(key)) finalVal = val.replace(/[^0-9.]/g, '');
    
    setForm(p => {
      const updated = { ...p, [key]: finalVal };
      updated.net_pay = calcNet(updated);
      return updated;
    });
    if (error) setError('');
  };

  const handleEmployeeSelect = (email) => {
    const selectedEmp = employees.find(e => e.email === email);
    if (selectedEmp) {
      setForm(p => ({ 
        ...p, 
        employee_email: selectedEmp.email, 
        employee_name: `${selectedEmp.first_name} ${selectedEmp.last_name}` 
      }));
    }
  };

  const handleSave = () => {
    if (!form.employee_name || !form.period_start || !form.period_end || !form.base_salary) {
      setError('Please fill out the required fields (*).');
      return;
    }
    saveMutation.mutate(form);
  };

  return (
    <div className="space-y-4 text-left">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          {['all', 'draft', 'approved', 'paid'].map(s => (
            <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm"
              className={statusFilter === s ? 'bg-indigo-600' : ''} onClick={() => setStatusFilter(s)}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
        <Button onClick={() => { setEditing(null); setForm(empty); setError(''); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Plus className="w-4 h-4" />Add Payroll Record
        </Button>
      </div>

      <div className="space-y-3">
        {filtered.map(rec => {
          const sym = currencySymbols[rec.currency] || '$';
          return (
            <Card key={rec.id} className="hover:shadow-sm transition-shadow group">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold text-gray-900">{rec.employee_name}</p>
                    <Badge className={statusColors[rec.status]}>{rec.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>Period: {rec.period_start} → {rec.period_end}</span>
                    <span className="font-medium">Net Pay: <strong className="text-indigo-600">{sym}{Number(rec.net_pay || 0).toLocaleString()}</strong></span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => { setEditing(rec); setForm(rec); setShowForm(true); }}><Edit className="w-3.5 h-3.5" /></Button>
                  {rec.status === 'draft' && <Button size="sm" className="bg-blue-600 h-8" onClick={() => updateStatus.mutate({ id: rec.id, status: 'approved' })}>Approve</Button>}
                  {rec.status === 'approved' && <Button size="sm" className="bg-green-600 h-8" onClick={() => updateStatus.mutate({ id: rec.id, status: 'paid' })}>Mark Paid</Button>}
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100" onClick={() => confirm('Delete record?') && deleteMutation.mutate(rec.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto text-left">
          <DialogHeader><DialogTitle>{editing ? 'Edit Payroll' : 'New Payroll Record'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 pt-4">
            
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-gray-500">Select Employee *</Label>
              <Select onValueChange={handleEmployeeSelect}>
                <SelectTrigger><SelectValue placeholder="Choose personnel..." /></SelectTrigger>
                <SelectContent>
                  {employees.map(emp => <SelectItem key={emp.id} value={emp.email}>{emp.first_name} {emp.last_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-gray-500">Employee Email</Label>
              <Input value={form.employee_email} readOnly className="bg-gray-50 cursor-not-allowed" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-gray-500">Period Start *</Label>
              <Input type="date" value={form.period_start} onChange={e => setField('period_start', e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-gray-500">Period End *</Label>
              <Input type="date" value={form.period_end} onChange={e => setField('period_end', e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-gray-500">Base Salary *</Label>
              <div className="flex gap-2">
                <Select value={form.currency} onValueChange={v => setField('currency', v)}>
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.keys(currencySymbols).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Input value={form.base_salary} onChange={e => setField('base_salary', e.target.value)} placeholder="0.00" />
              </div>
            </div>

            {[['hours_worked', 'Hours Worked'], ['overtime_hours', 'Overtime Hours'], ['overtime_pay', 'Overtime Pay'], ['bonuses', 'Bonuses'], ['deductions', 'Deductions'], ['tax', 'Tax']].map(([key, label]) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs font-bold uppercase text-gray-500">{label}</Label>
                <Input value={form[key]} onChange={e => setField(key, e.target.value)} placeholder="0.00" />
              </div>
            ))}

            <div className="col-span-2 p-4 bg-indigo-50 rounded-xl border border-indigo-100 mt-2">
              <Label className="text-indigo-600 font-bold uppercase text-xs tracking-widest">Calculated Net Pay</Label>
              <p className="text-2xl font-black text-indigo-700">{currencySymbols[form.currency]} {Number(form.net_pay).toLocaleString()}</p>
            </div>
          </div>

          {error && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-bold">{error}</div>}

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 px-8">Save Record</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}