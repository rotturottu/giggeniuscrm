import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

const EMPTY = { employee_name: '', pay_period_start: '', pay_period_end: '', base_salary: '', hours_worked: '', overtime_hours: 0, bonuses: 0, deductions: 0, tax: 0, net_pay: '', status: 'draft' };

const statusColor = { draft: 'bg-gray-100 text-gray-700', approved: 'bg-blue-100 text-blue-700', paid: 'bg-green-100 text-green-800' };

export default function PayrollModule() {
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const data = await base44.entities.PayrollRecord.list('-created_date');
    setRecords(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const calcNet = (f) => {
    const base = Number(f.base_salary) || 0;
    const bonus = Number(f.bonuses) || 0;
    const deduct = Number(f.deductions) || 0;
    const tax = Number(f.tax) || 0;
    return (base + bonus - deduct - tax).toFixed(2);
  };

  const save = async () => {
    const data = { ...form, net_pay: Number(calcNet(form)), employee_id: form.employee_name };
    ['base_salary', 'hours_worked', 'overtime_hours', 'bonuses', 'deductions', 'tax'].forEach(k => { data[k] = Number(data[k]) || 0; });
    await base44.entities.PayrollRecord.create(data);
    setShowForm(false);
    setForm(EMPTY);
    load();
  };

  const updateStatus = async (rec, status) => {
    const update = { status };
    if (status === 'paid') update.paid_at = new Date().toISOString();
    await base44.entities.PayrollRecord.update(rec.id, update);
    load();
  };

  const filtered = filterStatus === 'all' ? records : records.filter(r => r.status === filterStatus);
  const totalPaid = records.filter(r => r.status === 'paid').reduce((s, r) => s + (r.net_pay || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          {['all', 'draft', 'approved', 'paid'].map(s => (
            <Button key={s} size="sm" variant={filterStatus === s ? 'default' : 'outline'}
              className={filterStatus === s ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
              onClick={() => setFilterStatus(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Total paid: <strong className="text-green-700">${totalPaid.toLocaleString()}</strong></span>
          <Button onClick={() => { setForm(EMPTY); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            <Plus className="w-4 h-4" />Add Record
          </Button>
        </div>
      </div>

      {loading ? <p className="text-gray-400 text-sm">Loading...</p> : (
        <div className="space-y-3">
          {filtered.length === 0 && <p className="text-gray-400 text-sm">No payroll records.</p>}
          {filtered.map(rec => (
            <Card key={rec.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">{rec.employee_name}</p>
                      <Badge className={`text-xs border-0 ${statusColor[rec.status]}`}>{rec.status}</Badge>
                    </div>
                    <p className="text-xs text-gray-400">{rec.pay_period_start} → {rec.pay_period_end}</p>
                    <div className="flex gap-4 mt-1 text-xs text-gray-500">
                      <span>Base: ${(rec.base_salary || 0).toLocaleString()}</span>
                      {rec.bonuses > 0 && <span className="text-green-600">+${rec.bonuses} bonus</span>}
                      {rec.deductions > 0 && <span className="text-red-500">-${rec.deductions} deductions</span>}
                      {rec.tax > 0 && <span className="text-orange-500">-${rec.tax} tax</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xl font-bold text-indigo-700">${(rec.net_pay || 0).toLocaleString()}</p>
                    {rec.status === 'draft' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(rec, 'approved')}>Approve</Button>
                    )}
                    {rec.status === 'approved' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1" onClick={() => updateStatus(rec, 'paid')}>
                        <CheckCircle className="w-3.5 h-3.5" />Mark Paid
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Payroll Record</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label className="text-xs mb-1 block">Employee Name</Label>
              <Input value={form.employee_name} onChange={e => setForm(p => ({ ...p, employee_name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Period Start</Label>
                <Input type="date" value={form.pay_period_start} onChange={e => setForm(p => ({ ...p, pay_period_start: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Period End</Label>
                <Input type="date" value={form.pay_period_end} onChange={e => setForm(p => ({ ...p, pay_period_end: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[['base_salary', 'Base Salary ($)'], ['hours_worked', 'Hours Worked'], ['overtime_hours', 'Overtime Hours'], ['bonuses', 'Bonuses ($)'], ['deductions', 'Deductions ($)'], ['tax', 'Tax ($)']].map(([field, label]) => (
                <div key={field}>
                  <Label className="text-xs mb-1 block">{label}</Label>
                  <Input type="number" value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div className="bg-indigo-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Net Pay</p>
              <p className="text-2xl font-bold text-indigo-700">${calcNet(form)}</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={save} className="bg-indigo-600 hover:bg-indigo-700">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}