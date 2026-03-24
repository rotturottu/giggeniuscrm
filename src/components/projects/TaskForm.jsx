import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, User, CheckCircle2 } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'for_approval', label: 'For Approval' },
  { value: 'completed', label: 'Completed' },
];

export default function TaskForm({ open, onClose, task }) {
  const queryClient = useQueryClient();
  const [newSubtask, setNewSubtask] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', status: 'todo', priority: 'medium',
    assigned_to: '', start_date: null, due_date: null, subtasks: []
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list(),
  });

  useEffect(() => {
    if (task && open) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        assigned_to: task.assigned_to || '',
        start_date: task.start_date ? parseISO(task.start_date) : null,
        due_date: task.due_date ? parseISO(task.due_date) : null,
        subtasks: Array.isArray(task.subtasks) ? task.subtasks : (typeof task.subtasks === 'string' ? JSON.parse(task.subtasks) : []),
      });
    } else if (open) {
      setForm({ title: '', description: '', status: 'todo', priority: 'medium', assigned_to: '', start_date: null, due_date: null, subtasks: [] });
    }
  }, [task, open]);

  const saveMutation = useMutation({
    mutationFn: (data) => task ? base44.entities.ProjectTask.update(task.id, data) : base44.entities.ProjectTask.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
      toast.success('Synced to Cloud');
      onClose();
    },
  });

  const handleSave = () => {
    if (!form.title) return toast.error('Title required');
    const payload = {
      ...form,
      start_date: form.start_date && isValid(form.start_date) ? format(form.start_date, 'yyyy-MM-dd') : null,
      due_date: form.due_date && isValid(form.due_date) ? format(form.due_date, 'yyyy-MM-dd') : null,
      subtasks: JSON.stringify(form.subtasks)
    };
    saveMutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto text-left z-[9999]">
        <DialogHeader><DialogTitle className="text-xl font-bold">{task ? 'Edit Task' : 'New Task'}</DialogTitle></DialogHeader>
        <div className="space-y-6 pt-2">
          <Input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="Task title..." className="text-lg font-bold border-0 border-b rounded-none px-0 focus-visible:ring-0" />
          <Textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Add description..." className="text-sm min-h-[120px] bg-slate-50/50 p-3 rounded-md border-slate-200" />
          
          <div className="flex flex-wrap gap-3">
            <Select value={form.status} onValueChange={(v) => setForm({...form, status: v})}>
              <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent className="z-[10001]">{STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={form.assigned_to} onValueChange={(v) => setForm({...form, assigned_to: v})}>
              <SelectTrigger className="w-[180px] h-9 text-xs"><div className="flex items-center gap-2"><User className="w-3 h-3" /><SelectValue placeholder="Assignee" /></div></SelectTrigger>
              <SelectContent className="z-[10001]">{employees.map(e => <SelectItem key={e.id} value={e.email}>{e.first_name} {e.last_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Popover>
              <PopoverTrigger asChild><Button variant="outline" className="h-9 text-xs gap-2"><CalendarIcon className="w-3 h-3" /> {form.start_date ? format(form.start_date, 'MMM d') : 'Start Date'}</Button></PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[10001]" align="start"><Calendar mode="single" selected={form.start_date} onSelect={(d) => setForm({...form, start_date: d})} /></PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild><Button variant="outline" className="h-9 text-xs gap-2"><CalendarIcon className="w-3 h-3" /> {form.due_date ? format(form.due_date, 'MMM d') : 'Due Date'}</Button></PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[10001]" align="start"><Calendar mode="single" selected={form.due_date} onSelect={(d) => setForm({...form, due_date: d})} /></PopoverContent>
            </Popover>
          </div>

          <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subtasks</h4>
            {form.subtasks.map((sub, i) => (
              <div key={i} className="flex items-center gap-2"><CheckCircle2 className={`w-4 h-4 cursor-pointer ${sub.completed ? 'text-green-500' : 'text-slate-300'}`} onClick={() => { const u = [...form.subtasks]; u[i].completed = !u[i].completed; setForm({...form, subtasks: u}); }} /><span className={`text-sm ${sub.completed ? 'line-through text-slate-400' : ''}`}>{sub.title}</span></div>
            ))}
            <Input value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} placeholder="Add subtask..." className="h-8 text-xs bg-white" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), newSubtask.trim() && (setForm({...form, subtasks: [...form.subtasks, {id: Date.now(), title: newSubtask, completed: false}]}), setNewSubtask('')))} />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]">{saveMutation.isPending ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}