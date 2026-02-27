import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Circle, Loader, Plus } from 'lucide-react';
import { useState } from 'react';

const categoryColors = {
  paperwork: 'bg-blue-100 text-blue-700',
  equipment: 'bg-purple-100 text-purple-700',
  training: 'bg-green-100 text-green-700',
  access: 'bg-orange-100 text-orange-700',
  introduction: 'bg-pink-100 text-pink-700',
  other: 'bg-gray-100 text-gray-700',
};

const empty = { employee_name: '', task_name: '', category: 'other', assigned_to: '', due_date: '', status: 'pending', notes: '' };

const defaultTasks = [
  { task_name: 'Sign employment contract', category: 'paperwork' },
  { task_name: 'Set up company email', category: 'access' },
  { task_name: 'Configure laptop/equipment', category: 'equipment' },
  { task_name: 'Complete HR orientation', category: 'training' },
  { task_name: 'Meet the team', category: 'introduction' },
  { task_name: 'Review company policies', category: 'paperwork' },
];

export default function HROnboarding() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [showBulk, setShowBulk] = useState(false);

  const { data: tasks = [] } = useQuery({
    queryKey: ['onboarding_tasks'],
    queryFn: () => base44.entities.OnboardingTask.list('-created_date', 200),
  });

  const saveMutation = useMutation({
    mutationFn: (d) => base44.entities.OnboardingTask.create({ ...d, employee_id: d.employee_name }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['onboarding_tasks'] }); setShowForm(false); setForm(empty); },
  });

  const bulkCreateMutation = useMutation({
    mutationFn: (name) => base44.entities.OnboardingTask.bulkCreate(
      defaultTasks.map(t => ({ ...t, employee_name: name, employee_id: name, status: 'pending' }))
    ),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['onboarding_tasks'] }); setShowBulk(false); setNewEmployeeName(''); },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.OnboardingTask.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['onboarding_tasks'] }),
  });

  const grouped = tasks.reduce((acc, t) => {
    if (!acc[t.employee_name]) acc[t.employee_name] = [];
    acc[t.employee_name].push(t);
    return acc;
  }, {});

  const statusIcon = (status) => ({
    completed: <CheckCircle className="w-4 h-4 text-green-500" />,
    in_progress: <Loader className="w-4 h-4 text-blue-500" />,
    pending: <Circle className="w-4 h-4 text-gray-400" />,
  }[status] || <Circle className="w-4 h-4 text-gray-400" />);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={() => setShowBulk(true)}>🚀 Onboard New Employee</Button>
        <Button onClick={() => { setForm(empty); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-700 gap-2"><Plus className="w-4 h-4" />Add Task</Button>
      </div>

      {Object.entries(grouped).map(([name, empTasks]) => {
        const done = empTasks.filter(t => t.status === 'completed').length;
        const pct = Math.round((done / empTasks.length) * 100);
        return (
          <Card key={name}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{name}</CardTitle>
                <span className="text-sm text-gray-500">{done}/{empTasks.length} completed ({pct}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {empTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <button onClick={() => updateStatus.mutate({ id: task.id, status: task.status === 'completed' ? 'pending' : 'completed' })}>
                    {statusIcon(task.status)}
                  </button>
                  <span className={`flex-1 text-sm ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.task_name}</span>
                  <Badge className={categoryColors[task.category] || 'bg-gray-100 text-gray-700'} >{task.category}</Badge>
                  {task.due_date && <span className="text-xs text-gray-400">{task.due_date}</span>}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
      {Object.keys(grouped).length === 0 && <div className="text-center py-12 text-gray-400">No onboarding tasks yet. Click "Onboard New Employee" to get started.</div>}

      {/* Bulk Onboard Dialog */}
      <Dialog open={showBulk} onOpenChange={setShowBulk}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Onboard New Employee</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-500">Creates a standard checklist of onboarding tasks for the new employee.</p>
          <div className="space-y-1">
            <Label>Employee Name</Label>
            <Input value={newEmployeeName} onChange={e => setNewEmployeeName(e.target.value)} placeholder="Full name" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowBulk(false)}>Cancel</Button>
            <Button onClick={() => bulkCreateMutation.mutate(newEmployeeName)} disabled={!newEmployeeName || bulkCreateMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">Create Checklist</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Single Task Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Onboarding Task</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Employee Name</Label><Input value={form.employee_name} onChange={e => setForm(p => ({ ...p, employee_name: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Task Name</Label><Input value={form.task_name} onChange={e => setForm(p => ({ ...p, task_name: e.target.value }))} /></div>
            <div className="space-y-1">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.keys(categoryColors).map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Assigned To</Label><Input value={form.assigned_to} onChange={e => setForm(p => ({ ...p, assigned_to: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} /></div>
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