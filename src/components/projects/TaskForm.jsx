import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  CalendarIcon, X, Upload, User, Plus, CheckCircle2
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

export default function TaskForm({ open, onClose, task }) {
  const queryClient = useQueryClient();
  const [newSubtask, setNewSubtask] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const [form, setForm] = useState({
    title: '', description: '', status: 'todo', priority: 'medium',
    assignedTo: '', projectName: '', startDate: null,
    dueDate: null, subtasks: [], attachments: []
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
        startDate: task.start_date ? parseISO(task.start_date) : null,
        dueDate: task.due_date ? parseISO(task.due_date) : null,
        subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
        attachments: Array.isArray(task.attachments) ? task.attachments : [],
      });
    } else if (open) {
      setForm({
        title: '', description: '', status: 'todo', priority: 'medium',
        assignedTo: '', projectName: '', startDate: null,
        dueDate: null, subtasks: [], attachments: []
      });
    }
  }, [task, open]);

  const saveMutation = useMutation({
    mutationFn: (data) => task ? base44.entities.ProjectTask.update(task.id, data) : base44.entities.ProjectTask.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
      toast.success('Task saved!');
      onClose();
    },
  });

  const handleSave = () => {
    if (!form.title) return toast.error('Title required');
    saveMutation.mutate({
      ...form,
      assigned_to: form.assignedTo,
      list_name: form.projectName,
      start_date: form.startDate && isValid(form.startDate) ? format(form.startDate, 'yyyy-MM-dd') : null,
      due_date: form.dueDate && isValid(form.dueDate) ? format(form.dueDate, 'yyyy-MM-dd') : null,
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(prev => ({ ...prev, attachments: [...prev.attachments, file_url] }));
      toast.success('File attached');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto text-left z-[9999]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{task ? 'Edit Task' : 'New Task'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Main Info */}
          <div className="space-y-2">
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
              className="text-sm min-h-[80px]" 
            />
          </div>

          {/* Selectors */}
          <div className="flex flex-wrap gap-3">
            <Select value={form.status} onValueChange={(v) => setForm({...form, status: v})}>
              <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent className="z-[10001]">
                {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={form.assignedTo} onValueChange={(v) => setForm({...form, assignedTo: v})}>
              <SelectTrigger className="w-[180px] h-9 text-xs">
                <div className="flex items-center gap-2"><User className="w-3 h-3" /><SelectValue placeholder="Assignee" /></div>
              </SelectTrigger>
              <SelectContent className="z-[10001]">
                {employees.map(e => <SelectItem key={e.id} value={e.email}>{e.first_name} {e.last_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="flex gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 text-xs gap-2">
                  <CalendarIcon className="w-3 h-3" /> {form.startDate ? format(form.startDate, 'MMM d') : 'Start Date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[10001]" align="start">
                <Calendar mode="single" selected={form.startDate} onSelect={(d) => setForm({...form, startDate: d})} />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 text-xs gap-2">
                  <CalendarIcon className="w-3 h-3" /> {form.dueDate ? format(form.dueDate, 'MMM d') : 'Due Date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[10001]" align="start">
                <Calendar mode="single" selected={form.dueDate} onSelect={(d) => setForm({...form, dueDate: d})} />
              </PopoverContent>
            </Popover>
          </div>

          {/* Subtasks */}
          <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subtasks</h4>
            <div className="space-y-2">
              {form.subtasks.map((sub, i) => (
                <div key={i} className="flex items-center gap-2 group">
                   <button 
                    onClick={() => {
                      const updated = [...form.subtasks];
                      updated[i].completed = !updated[i].completed;
                      setForm({...form, subtasks: updated});
                    }}
                    className={sub.completed ? "text-green-500" : "text-slate-300"}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <span className={`text-sm flex-1 ${sub.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{sub.title}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input 
                value={newSubtask} 
                onChange={(e) => setNewSubtask(e.target.value)} 
                placeholder="Add subtask..." 
                className="h-8 text-xs bg-white"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), (newSubtask.trim() && (setForm({...form, subtasks: [...form.subtasks, {id: Date.now(), title: newSubtask, completed: false}]}), setNewSubtask(''))))}
              />
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attachments</h4>
            <div className="flex flex-wrap gap-2">
              {form.attachments.map((url, i) => (
                <div key={i} className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-slate-200 text-[10px] shadow-sm">
                  <a href={url} target="_blank" className="text-indigo-600 font-medium hover:underline truncate max-w-[100px]">File {i+1}</a>
                  <button onClick={() => setForm({...form, attachments: form.attachments.filter((_, idx) => idx !== i)})}><X className="w-3 h-3 text-slate-400 hover:text-red-500" /></button>
                </div>
              ))}
            </div>
            <label className="flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed border-slate-200 p-3 rounded-lg hover:bg-slate-50 transition-all text-slate-500 hover:text-indigo-600">
              <Upload className="w-4 h-4" />
              <span className="text-xs font-medium">{uploading ? 'Uploading...' : 'Upload File'}</span>
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="ghost" onClick={onClose} className="text-slate-500">Cancel</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 min-w-[120px]">
              {saveMutation.isPending ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}