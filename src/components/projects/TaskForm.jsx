import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  CalendarIcon, Save, X, Bell, RefreshCw,
  ChevronDown, ChevronRight, Upload, Clock, User
} from 'lucide-react';
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

const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700'
};

const safeParseDate = (dateStr) => {
  if (!dateStr) return null;
  const d = parseISO(dateStr);
  return isValid(d) ? d : null;
};

export default function TaskForm({ open, onClose, task, isPaidUser }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: '', description: '', status: 'todo', priority: 'medium',
    assignedTo: '', projectName: '', startDate: null, startTime: '09:00',
    dueDate: null, dueTime: '17:00', subtasks: [], attachments: []
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
        assignedTo: task.assigned_to || '',
        projectName: task.list_name || '',
        startDate: safeParseDate(task.start_date),
        startTime: task.start_time || '09:00',
        dueDate: safeParseDate(task.due_date),
        dueTime: task.due_time || '17:00',
        subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
        attachments: Array.isArray(task.attachments) ? task.attachments : [],
      });
    } else if (open) {
      setForm({
        title: '', description: '', status: 'todo', priority: 'medium',
        assignedTo: '', projectName: '', startDate: null, startTime: '09:00',
        dueDate: null, dueTime: '17:00', subtasks: [], attachments: []
      });
    }
  }, [task, open]);

  const saveMutation = useMutation({
    mutationFn: (data) => task ? base44.entities.ProjectTask.update(task.id, data) : base44.entities.ProjectTask.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
      toast.success('Task saved');
      onClose();
    },
  });

  const handleSave = () => {
    if (!form.title) return toast.error('Title required');
    saveMutation.mutate({
      title: form.title,
      description: form.description,
      status: form.status,
      priority: form.priority,
      assigned_to: form.assignedTo,
      list_name: form.projectName,
      start_date: form.startDate ? format(form.startDate, 'yyyy-MM-dd') : null,
      due_date: form.dueDate ? format(form.dueDate, 'yyyy-MM-dd') : null,
      subtasks: form.subtasks,
      attachments: form.attachments,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* The z-[9999] ensures the modal is on top, but we need to ensure its children are too */}
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto text-left z-[9999]">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'New Task'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input 
            value={form.title} 
            onChange={(e) => setForm({...form, title: e.target.value})} 
            placeholder="Task title..." 
            className="text-lg font-bold border-0 border-b rounded-none px-0 focus-visible:ring-0" 
          />
          
          <Textarea 
            value={form.description} 
            onChange={(e) => setForm({...form, description: e.target.value})} 
            placeholder="Add description..." 
            className="text-sm resize-none" 
          />

          <div className="flex flex-wrap gap-2 items-center">
            {/* Status Dropdown */}
            <Select value={form.status} onValueChange={(v) => setForm({...form, status: v})}>
              <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent className="z-[10000]">
                {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Priority Dropdown */}
            <Select value={form.priority} onValueChange={(v) => setForm({...form, priority: v})}>
              <SelectTrigger className={`h-8 w-26 text-xs ${PRIORITY_COLORS[form.priority]}`}><SelectValue /></SelectTrigger>
              <SelectContent className="z-[10000]">
                {PRIORITY_OPTIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Assignee Dropdown */}
            <Select value={form.assignedTo} onValueChange={(v) => setForm({...form, assignedTo: v})}>
              <SelectTrigger className="h-8 w-44 text-xs">
                <div className="flex items-center gap-2"><User className="w-3 h-3" /><SelectValue placeholder="Assignee..." /></div>
              </SelectTrigger>
              <SelectContent className="z-[10000]">
                {employees.map(e => <SelectItem key={e.id} value={e.email}>{e.first_name} {e.last_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Start Date Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-2">
                  <CalendarIcon className="w-3 h-3" /> {form.startDate ? format(form.startDate, 'PP') : 'Start Date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[10000]" align="start">
                <Calendar mode="single" selected={form.startDate} onSelect={(d) => setForm({...form, startDate: d})} />
              </PopoverContent>
            </Popover>

            {/* Due Date Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-2">
                  <CalendarIcon className="w-3 h-3" /> {form.dueDate ? format(form.dueDate, 'PP') : 'Due Date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[10000]" align="start">
                <Calendar mode="single" selected={form.dueDate} onSelect={(d) => setForm({...form, dueDate: d})} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleSave} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={saveMutation.isPending}
            >
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}