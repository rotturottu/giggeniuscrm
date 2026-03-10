import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, DollarSign, Edit, Plus } from 'lucide-react';
import { useState } from 'react';

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  approved: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
};

const currencySymbols = {
  USD: '$',
  EUR: '€',
  PHP: '₱',
  CAD: 'C$',
  AUD: 'A$'
};

const empty = {
  employee_name: '', employee_email: '', period_start: '', period_end: '', currency: 'PHP',
  base_salary: '', hours_worked: '', overtime_hours: '', overtime_pay: '',
  bonuses: '', deductions: '', tax: '', net_pay: '', status: 'draft', notes: '',
};

export default function HRPayroll() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');

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

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.PayrollRecord.update(id, { status, ...(status === 'paid' ? { paid_at: new Date().toISOString() } : {}) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll'] }),
  });

  const filtered = statusFilter === 'all' ? records : records.filter(r => r.status === statusFilter);

  const openEdit = (r) => { 
    setEditing(r); 
    setForm({ ...empty, ...r, currency: r.currency || 'PHP' }); 
    setError('');
    setShowForm(true); 
  };

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
    
    if (numericFields.includes(key)) {
      finalVal = val.replace(/[^0-9.]/g, '');
    }
    
    setForm(p => {
      const updated = { ...p, [key]: finalVal };
      updated.net_pay = calcNet(updated);
      return updated;
    });
    if (error) setError('');
  };

  const handleSave = () => {
    const requiredFields = ['employee_name', 'employee_email', 'period_start', 'period_end', 'base_salary'];
    const hasEmptyFields = requiredFields.some(field => !form[field] || form[field].toString().trim() === '');
    
    if (hasEmptyFields) {
      setError('Please fill out the required fields (*).');
      return;
    }

    if (!form.employee_email.includes('@')) {
      setError('Invalid email format.');
      return;
    }

    setError('');
    saveMutation.mutate(form);
  };

  return (
    <div className="space-y-4">
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
            <Card key={rec.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-gray-900">{rec.employee_name}</p>
                      <Badge className={statusColors[rec.status]}>{rec.status}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>Period: {rec.period_start} → {rec.period_end}</span>
                      <span className="flex items-center gap-1 font-medium">
                        Net Pay: <strong className="text-indigo-600">{sym}{Number(rec.net_pay || 0).toLocaleString()}</strong>
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => openEdit(rec)}><Edit className="w-3.5 h-3.5" /></Button>
                    {rec.status === 'draft' && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-8" onClick={() => updateStatus.mutate({ id: rec.id, status: 'approved' })}>Approve</Button>
                    )}
                    {rec.status === 'approved' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8 gap-1" onClick={() => updateStatus.mutate({ id: rec.id, status: 'paid' })}><CheckCircle className="w-3.5 h-3.5" />Mark Paid</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Payroll Record' : 'New Payroll Record'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            
            {[['employee_name', 'Employee Name *', 'text'], ['employee_email', 'Employee Email *', 'text'], ['period_start', 'Period Start *', 'date'], ['period_end', 'Period End *', 'date'], ['base_salary', 'Base Salary *', 'text'], ['hours_worked', 'Hours Worked', 'text'], ['overtime_hours', 'Overtime Hours', 'text'], ['overtime_pay', 'Overtime Pay', 'text'], ['bonuses', 'Bonuses', 'text'], ['deductions', 'Deductions', 'text'], ['tax', 'Tax', 'text']].map(([key, label, type]) => {
              const isMonetary = ['overtime_pay', 'bonuses', 'deductions', 'tax'].includes(key);

              if (key === 'base_salary') {
                return (
                  <div key={key} className="space-y-1">
                    <Label className="after:content-['*'] after:ml-0.5 after:text-red-500 text-xs uppercase tracking-wider text-gray-500">{label.replace(' *', '')}</Label>
                    <div className="flex gap-2">
                      <Select value={form.currency} onValueChange={v => setForm(p => ({ ...p, currency: v }))}>
                        <SelectTrigger className="w-24 bg-gray-50"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.keys(currencySymbols).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-2.5 text-gray-400 text-sm font-medium">{currencySymbols[form.currency]}</span>
                        <Input className="pl-8" type={type} value={form[key]} onChange={e => setField(key, e.target.value)} placeholder="0.00" />
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={key} className="space-y-1">
                  <Label className={label.includes('*') ? "after:content-['*'] after:ml-0.5 after:text-red-500 text-xs uppercase tracking-wider text-gray-500" : "text-xs uppercase tracking-wider text-gray-500"}>{label.replace(' *', '')}</Label>
                  <div className="relative">
                    {isMonetary && <span className="absolute left-3 top-2.5 text-gray-400 text-sm font-medium">{currencySymbols[form.currency]}</span>}
                    <Input className={isMonetary ? "pl-8" : ""} type={type} value={form[key]} onChange={e => setField(key, e.target.value)} placeholder={isMonetary ? "0.00" : ""} />
                  </div>
                </div>
              );
            })}
            
            <div className="space-y-1">
              <Label className="text-indigo-600 font-bold text-xs uppercase tracking-wider">Net Pay (auto-calculated)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-indigo-400 font-bold">{currencySymbols[form.currency]}</span>
                <Input value={form.net_pay} readOnly className="bg-indigo-50/50 pl-8 font-bold text-indigo-700 border-indigo-100" />
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-semibold animate-in fade-in duration-300">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={() => { setShowForm(false); setError(''); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 px-8">
              {saveMutation.isPending ? 'Saving...' : 'Save Record'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}