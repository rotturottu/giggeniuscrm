import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, DollarSign, Edit, Plus } from 'lucide-react';
import { useState } from 'react';

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  approved: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
};

const empty = {
  employee_name: '', employee_email: '', period_start: '', period_end: '',
  base_salary: '', hours_worked: '', overtime_hours: '0', overtime_pay: '0',
  bonuses: '0', deductions: '0', tax: '0', net_pay: '', status: 'draft', notes: '',
};

export default function HRPayroll() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: records = [] } = useQuery({
    queryKey: ['payroll'],
    queryFn: () => base44.entities.PayrollRecord.list('-created_date', 100),
  });

  const saveMutation = useMutation({
    mutationFn: (d) => editing ? base44.entities.PayrollRecord.update(editing.id, d) : base44.entities.PayrollRecord.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payroll'] }); setShowForm(false); setEditing(null); setForm(empty); },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.PayrollRecord.update(id, { status, ...(status === 'paid' ? { paid_at: new Date().toISOString() } : {}) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll'] }),
  });

  const filtered = statusFilter === 'all' ? records : records.filter(r => r.status === statusFilter);

  const openEdit = (r) => { setEditing(r); setForm({ ...empty, ...r }); setShowForm(true); };

  const calcNet = (f) => {
    const base = parseFloat(f.base_salary) || 0;
    const ot = parseFloat(f.overtime_pay) || 0;
    const bonus = parseFloat(f.bonuses) || 0;
    const ded = parseFloat(f.deductions) || 0;
    const tax = parseFloat(f.tax) || 0;
    return (base + ot + bonus - ded - tax).toFixed(2);
  };

  const setField = (key, val) => {
    setForm(p => {
      const updated = { ...p, [key]: val };
      updated.net_pay = calcNet(updated);
      return updated;
    });
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
        <Button onClick={() => { setEditing(null); setForm(empty); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Plus className="w-4 h-4" />Add Payroll Record
        </Button>
      </div>

      <div className="space-y-3">
        {filtered.map(rec => (
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
                    <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />Net Pay: <strong className="text-gray-900">${Number(rec.net_pay).toLocaleString()}</strong></span>
                    {rec.bonuses > 0 && <span>Bonus: +${rec.bonuses}</span>}
                    {rec.deductions > 0 && <span>Deductions: -${rec.deductions}</span>}
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
        ))}
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400">No payroll records found.</div>}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Payroll Record' : 'New Payroll Record'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {[['employee_name', 'Employee Name', 'text'], ['employee_email', 'Employee Email', 'text'], ['period_start', 'Period Start', 'date'], ['period_end', 'Period End', 'date'], ['base_salary', 'Base Salary', 'number'], ['hours_worked', 'Hours Worked', 'number'], ['overtime_hours', 'Overtime Hours', 'number'], ['overtime_pay', 'Overtime Pay', 'number'], ['bonuses', 'Bonuses', 'number'], ['deductions', 'Deductions', 'number'], ['tax', 'Tax', 'number']].map(([key, label, type]) => (
              <div key={key} className="space-y-1">
                <Label>{label}</Label>
                <Input type={type} value={form[key] || ''} onChange={e => setField(key, e.target.value)} />
              </div>
            ))}
            <div className="space-y-1">
              <Label>Net Pay (auto-calculated)</Label>
              <Input value={form.net_pay || ''} readOnly className="bg-gray-50" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}