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
  base_salary: '', hours_worked: '', overtime_hours: '0', overtime_pay: '0',
  bonuses: '0', deductions: '0', tax: '0', net_pay: '', status: 'draft', notes: '',
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

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list('-created_date', 200),
  });

  const saveMutation = useMutation({
    mutationFn: (d) => editing ? base44.entities.PayrollRecord.update(editing.id, d) : base44.entities.PayrollRecord.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payroll'] }); setShowForm(false); setEditing(null); setForm(empty); setError(''); },
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
    return (base + ot + bonus - ded - tax).toFixed(2);
  };

  const setField = (key, val) => {
    // List of fields that must strictly be numbers
    const numericFields = ['base_salary', 'hours_worked', 'overtime_hours', 'overtime_pay', 'bonuses', 'deductions', 'tax'];
    
    // If typing into a numeric field, instantly strip out alphabets
    let finalVal = val;
    if (numericFields.includes(key)) {
      finalVal = val.replace(/[^0-9.]/g, '');
    }

    setForm(p => {
      const updated = { ...p, [key]: finalVal };
      updated.net_pay = calcNet(updated);
      return updated;
    });
    
    if (error) setError(''); // Clear error as the user types
  };

  const handleSave = () => {
    // 1. Missing Input Check
    const requiredFields = ['employee_name', 'employee_email', 'period_start', 'period_end', 'base_salary', 'hours_worked', 'overtime_hours', 'overtime_pay', 'bonuses', 'deductions', 'tax'];
    const hasEmptyFields = requiredFields.some(field => form[field] === '' || form[field] === undefined);
    
    if (hasEmptyFields) {
      setError('Please fill out the form completely.');
      return;
    }

    // 2. "@" Symbol Check for Email (Redundant due to select dropdown, but good safety net)
    if (!form.employee_email.includes('@')) {
      setError('Invalid Input! Email fields must contain an "@" symbol.');
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
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />Net Pay: 
                        <strong className="text-gray-900">{sym}{Number(rec.net_pay).toLocaleString()}</strong>
                      </span>
                      {rec.bonuses > 0 && <span>Bonus: +{sym}{rec.bonuses}</span>}
                      {rec.deductions > 0 && <span>Deductions: -{sym}{rec.deductions}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => openEdit(rec)}><Edit className="w-3.5 h-3.5" /></Button>
                    {rec.status === 'draft' && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 gap-1" onClick={() => updateStatus.mutate({ id: rec.id, status: 'approved' })}>Approve</Button>
                    )}
                    {rec.status === 'approved' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1" onClick={() => updateStatus.mutate({ id: rec.id, status: 'paid' })}><CheckCircle className="w-3.5 h-3.5" />Mark Paid</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400">No payroll records found.</div>}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Payroll Record' : 'New Payroll Record'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            
            {/* New Employee Select Dropdown */}
            <div className="space-y-1">
              <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">Employee</Label>
              <Select 
                value={form.employee_email} 
                onValueChange={val => {
                  const emp = employees.find(e => e.email === val);
                  if (emp) {
                    setForm(p => ({ 
                      ...p, 
                      employee_email: emp.email, 
                      employee_name: `${emp.first_name} ${emp.last_name}` 
                    }));
                    if (error) setError('');
                  }
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select an employee..." /></SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.email}>
                      {emp.first_name} {emp.last_name} {emp.department ? `(${emp.department})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Auto-filled read-only Email */}
            <div className="space-y-1">
              <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">Employee Email</Label>
              <Input value={form.employee_email || ''} readOnly className="bg-gray-50 text-gray-500" placeholder="Auto-filled from selection" />
            </div>
            
            {[['period_start', 'Period Start *', 'date'], ['period_end', 'Period End *', 'date'], ['base_salary', 'Base Salary *', 'text'], ['hours_worked', 'Hours Worked *', 'text'], ['overtime_hours', 'Overtime Hours *', 'text'], ['overtime_pay', 'Overtime Pay *', 'text'], ['bonuses', 'Bonuses *', 'text'], ['deductions', 'Deductions *', 'text'], ['tax', 'Tax *', 'text']].map(([key, label, type]) => {
              const isMonetary = ['overtime_pay', 'bonuses', 'deductions', 'tax'].includes(key);

              return (
                <div key={key} className="space-y-1">
                  <Label className={label.includes('*') ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>{label.replace(' *', '')}</Label>
                  
                  {key === 'base_salary' ? (
                    <div className="flex gap-2">
                      <Select value={form.currency} onValueChange={v => setForm(p => ({ ...p, currency: v }))}>
                        <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="PHP">PHP</SelectItem>
                          <SelectItem value="CAD">CAD</SelectItem>
                          <SelectItem value="AUD">AUD</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-2 text-gray-500 font-medium">{currencySymbols[form.currency]}</span>
                        <Input className="pl-8" type={type} value={form[key] || ''} onChange={e => setField(key, e.target.value)} />
                      </div>
                    </div>
                  ) : isMonetary ? (
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500 font-medium">{currencySymbols[form.currency]}</span>
                      <Input className="pl-8" type={type} value={form[key] || ''} onChange={e => setField(key, e.target.value)} />
                    </div>
                  ) : (
                    <Input type={type} value={form[key] || ''} onChange={e => setField(key, e.target.value)} />
                  )}
                </div>
              );
            })}
            
            <div className="space-y-1">
              <Label>Net Pay (auto-calculated)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500 font-medium">{currencySymbols[form.currency]}</span>
                <Input value={form.net_pay || ''} readOnly className="bg-gray-50 pl-8" />
              </div>
            </div>
          </div>

          {/* Error Message Banner */}
          {error && (
            <div className="mt-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-semibold flex items-center justify-between animate-in fade-in duration-300">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={() => { setShowForm(false); setError(''); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}