import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Plus, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

const EMPTY = { employee_name: '', employee_email: '', leave_type: 'vacation', start_date: '', end_date: '', reason: '' };

const statusColor = { pending: 'bg-yellow-100 text-yellow-800', approved: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800', cancelled: 'bg-gray-100 text-gray-800' };
const leaveTypes = ['vacation', 'sick', 'personal', 'maternity', 'paternity', 'unpaid', 'other'];

export default function LeaveManagement() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const data = await base44.entities.LeaveRequest.list('-created_date');
    setRequests(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  const calcDays = (start, end) => {
    if (!start || !end) return 0;
    const diff = new Date(end) - new Date(start);
    return Math.max(1, Math.round(diff / 86400000) + 1);
  };

  const submit = async () => {
    const days_count = calcDays(form.start_date, form.end_date);
    await base44.entities.LeaveRequest.create({ ...form, days_count, status: 'pending', employee_id: form.employee_email });
    setShowForm(false);
    setForm(EMPTY);
    load();
  };

  const updateStatus = async (req, status) => {
    await base44.entities.LeaveRequest.update(req.id, { status });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'approved', 'rejected'].map(s => (
            <Button key={s} size="sm" variant={filter === s ? 'default' : 'outline'}
              className={filter === s ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
              onClick={() => setFilter(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
        <Button onClick={() => { setForm(EMPTY); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Plus className="w-4 h-4" />New Request
        </Button>
      </div>

      {loading ? <p className="text-gray-400 text-sm">Loading...</p> : (
        <div className="space-y-3">
          {filtered.length === 0 && <p className="text-gray-400 text-sm">No leave requests.</p>}
          {filtered.map(req => (
            <Card key={req.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">{req.employee_name}</p>
                      <Badge className={`text-xs border-0 ${statusColor[req.status]}`}>{req.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 capitalize">{req.leave_type?.replace('_', ' ')} — {req.days_count || calcDays(req.start_date, req.end_date)} day(s)</p>
                    <p className="text-xs text-gray-400">{req.start_date} → {req.end_date}</p>
                    {req.reason && <p className="text-xs text-gray-500 mt-1">"{req.reason}"</p>}
                  </div>
                  {req.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1" onClick={() => updateStatus(req, 'approved')}>
                        <CheckCircle className="w-3.5 h-3.5" />Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 gap-1" onClick={() => updateStatus(req, 'rejected')}>
                        <XCircle className="w-3.5 h-3.5" />Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Leave Request</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-xs mb-1 block">Employee Name</Label>
              <Input value={form.employee_name} onChange={e => setForm(p => ({ ...p, employee_name: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Employee Email</Label>
              <Input type="email" value={form.employee_email} onChange={e => setForm(p => ({ ...p, employee_email: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Leave Type</Label>
              <Select value={form.leave_type} onValueChange={v => setForm(p => ({ ...p, leave_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{leaveTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ')}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Start Date</Label>
                <Input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs mb-1 block">End Date</Label>
                <Input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} />
              </div>
            </div>
            {form.start_date && form.end_date && (
              <p className="text-xs text-indigo-600 font-medium">{calcDays(form.start_date, form.end_date)} day(s) requested</p>
            )}
            <div>
              <Label className="text-xs mb-1 block">Reason</Label>
              <Textarea rows={3} value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={submit} className="bg-indigo-600 hover:bg-indigo-700">Submit Request</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}