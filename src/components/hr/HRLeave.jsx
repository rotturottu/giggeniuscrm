import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { differenceInCalendarDays } from 'date-fns';
import { Calendar, CheckCircle, Clock, Plus, XCircle, User } from 'lucide-react';
import { useState } from 'react';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-700',
};

const empty = { employee_name: '', employee_email: '', leave_type: 'vacation', start_date: '', end_date: '', reason: '' };

export default function HRLeave() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  // 1. Fetch Employees for the Dropdown
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list('-created_date', 100),
  });

  // 2. Fetch Leave Requests
  const { data: requests = [] } = useQuery({
    queryKey: ['leave_requests'],
    queryFn: () => base44.entities.LeaveRequest.list('-created_date', 100),
  });

  const saveMutation = useMutation({
    mutationFn: (d) => {
      const days = d.start_date && d.end_date ? differenceInCalendarDays(new Date(d.end_date), new Date(d.start_date)) + 1 : 0;
      return base44.entities.LeaveRequest.create({ 
        ...d, 
        days_count: days, 
        status: 'pending' 
      });
    },
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['leave_requests'] }); 
      setShowForm(false); 
      setForm(empty); 
      setError('');
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.LeaveRequest.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leave_requests'] }),
  });

  const filtered = statusFilter === 'all' ? requests : requests.filter(r => r.status?.toLowerCase() === statusFilter);

  const handleSave = () => {
    const hasEmptyFields = !form.employee_name || !form.start_date || !form.end_date || !form.reason;
    
    if (hasEmptyFields) {
      setError('Please fill out all required fields.');
      return;
    }

    setError('');
    saveMutation.mutate(form);
  };

  // Helper to update form when an employee is selected from dropdown
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map(s => (
            <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm"
              className={statusFilter === s ? 'bg-indigo-600' : ''} onClick={() => setStatusFilter(s)}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
        <Button onClick={() => { setForm(empty); setError(''); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Plus className="w-4 h-4" />New Request
        </Button>
      </div>

      <div className="space-y-3">
        {filtered.map(req => (
          <Card key={req.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold text-gray-900">{req.employee_name}</p>
                    <Badge className={statusColors[req.status || 'pending']}>{req.status || 'pending'}</Badge>
                    <Badge variant="outline">{req.leave_type?.replace('_', ' ')}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />
                      {req.start_date} → {req.end_date}
                    </span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{req.days_count} day(s)</span>
                  </div>
                  {req.reason && <p className="text-sm text-gray-500 mt-1">{req.reason}</p>}
                </div>
                {req.status === 'pending' && (
                  <div className="flex gap-2 ml-4">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1" onClick={() => updateStatus.mutate({ id: req.id, status: 'approved' })}>
                      <CheckCircle className="w-3.5 h-3.5" />Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 gap-1" onClick={() => updateStatus.mutate({ id: req.id, status: 'rejected' })}>
                      <XCircle className="w-3.5 h-3.5" />Reject
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400">No leave requests found.</div>}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Leave Request</DialogTitle></DialogHeader>
          <div className="space-y-3">
            
            <div className="space-y-1">
              <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">Select Employee</Label>
              <Select onValueChange={handleEmployeeSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an employee..." />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.email}>
                      {emp.first_name} {emp.last_name} ({emp.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Employee Email</Label>
              <Input value={form.employee_email} readOnly className="bg-gray-50 cursor-not-allowed" />
            </div>
            
            <div className="space-y-1">
              <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">Leave Type</Label>
              <Select value={form.leave_type} onValueChange={v => setForm(p => ({ ...p, leave_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['vacation', 'sick', 'personal', 'maternity', 'paternity', 'unpaid', 'other'].map(t => (
                    <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">Start Date</Label>
                <Input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">End Date</Label>
                <Input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} />
              </div>
            </div>
            
            <div className="space-y-1">
              <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">Reason</Label>
              <Input value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="Brief reason for leave..." />
            </div>
          </div>

          {error && (
            <div className="mt-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-semibold">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">Submit Request</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}