import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  CalendarIcon, Save, Upload, Plus, X, Lock, Bell, RefreshCw,
  ChevronDown, ChevronRight, Paperclip, Clock, User
} from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const NOTIFICATION_OPTIONS = [
  { value: '5min', label: '5 min' }, { value: '10min', label: '10 min' },
  { value: '15min', label: '15 min' }, { value: '30min', label: '30 min' },
  { value: '1hour', label: '1 hr' }, { value: '2hours', label: '2 hrs' },
  { value: '12hours', label: '12 hrs' }, { value: '24hours', label: '24 hrs' },
];
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'for_approval', label: 'For Approval' },
  { value: 'completed', label: 'Completed' },
];

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-600', medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700', urgent: 'bg-red-100 text-red-700'
};

const safeParseDate = (dateStr) => {
  if (!dateStr) return null;
  const d = parseISO(dateStr);
  return isValid(d) ? d : null;
};

function TimeInline({ value, onChange }) {
  const parse = (v) => {
    if (!v) return { hour: '09', minute: '00', ampm: 'AM' };
    const [h, m] = v.split(':');
    const hNum = parseInt(h);
    return {
      hour: String(hNum > 12 ? hNum - 12 : hNum === 0 ? 12 : hNum).padStart(2, '0'),
      minute: m || '00',
      ampm: hNum >= 12 ? 'PM' : 'AM',
    };
  };
  const { hour, minute, ampm } = parse(value);
  const emit = (h, m, a) => {
    let h24 = parseInt(h);
    if (a === 'PM' && h24 !== 12) h24 += 12;
    if (a === 'AM' && h24 === 12) h24 = 0;
    onChange(`${String(h24).padStart(2, '0')}:${m}`);
  };
  return (
    <div className="flex items-center gap-1">
      <Clock className="w-3 h-3 text-gray-400" />
      <Select value={hour} onValueChange={v => emit(v, minute, ampm)}>
        <SelectTrigger className="h-7 w-14 text-xs px-1"><SelectValue /></SelectTrigger>
        <SelectContent>{HOURS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
      </Select>
      <span className="text-gray-400 text-xs">:</span>
      <Select value={minute} onValueChange={v => emit(hour, v, ampm)}>
        <SelectTrigger className="h-7 w-14 text-xs px-1"><SelectValue /></SelectTrigger>
        <SelectContent>{MINUTES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={ampm} onValueChange={v => emit(hour, minute, v)}>
        <SelectTrigger className="h-7 w-14 text-xs px-1"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function DateButton({ label, dateValue, timeValue, onDateChange, onTimeChange }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all ${
          dateValue ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
        }`}>
          <CalendarIcon className="w-3 h-3" />
          {dateValue
            ? `${format(dateValue, 'MMM d, yyyy')}${timeValue ? ' · ' + format(new Date(`2000-01-01T${timeValue}`), 'h:mm a') : ''}`
            : label}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <Calendar mode="single" selected={dateValue} onSelect={onDateChange} />
        {dateValue && (
          <div className="border-t pt-2 mt-2 space-y-2">
            <p className="text-xs text-gray-500 font-medium">Time (optional)</p>
            <TimeInline value={timeValue} onChange={onTimeChange} />
          </div>
        )}
        {dateValue && (
          <button onClick={() => onDateChange(null)} className="mt-2 text-xs text-red-500 hover:underline">
            Clear date
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}

function SubtaskDetail({ sub, onChange, employees }) {
  const update = (field, val) => onChange({ ...sub, [field]: val });
  return (
    <div className="mt-1.5 ml-10 space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-100 text-left">
      <Textarea value={sub.description || ''} onChange={e => update('description', e.target.value)} placeholder="Description..." rows={2} className="text-xs resize-none" />
      <div className="flex flex-wrap gap-2 items-center">
        <Select value={sub.status || 'todo'} onValueChange={v => update('status', v)}>
          <SelectTrigger className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={sub.assigned_to || ''} onValueChange={v => update('assigned_to', v)}>
          <SelectTrigger className="h-7 w-44 text-xs"><SelectValue placeholder="Assignee..." /></SelectTrigger>
          <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.email}>{e.first_name} {e.last_name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    </div>
  );
}

function SubtaskRow({ sub, onChange, onRemove, onToggle, employees }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="text-left">
      <div className="flex items-center gap-2 py-0.5">
        <input type="checkbox" checked={sub.completed} onChange={() => onToggle(sub.id)} className="rounded flex-shrink-0" />
        <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
          {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>
        <Input value={sub.title} onChange={e => onChange({ ...sub, title: e.target.value })} className={`h-7 text-sm flex-1 border-0 shadow-none px-0 focus-visible:ring-0 ${sub.completed ? 'line-through text-gray-400' : ''}`} placeholder="Subtask title..." />
        <button onClick={() => onRemove(sub.id)} className="text-gray-300 hover:text-red-500 flex-shrink-0"><X className="w-3 h-3" /></button>
      </div>
      {expanded && <SubtaskDetail sub={sub} onChange={onChange} employees={employees} />}
    </div>
  );
}

const defaultState = () => ({
  title: '', description: '', status: 'todo', priority: 'medium',
  assignedTo: '', projectName: '', startDate: null, startTime: '09:00',
  dueDate: null, dueTime: '17:00', isRecurring: false,
  recurrencePattern: 'weekly', recurrenceDates: [],
  notificationBefore: '30min', notificationTypes: ['in_app'],
  subtasks: [], attachments: [],
});

export default function TaskForm({ open, onClose, task, isPaidUser }) {
  const [form, setForm] = useState(defaultState());
  const [showNotif, setShowNotif] = useState(false);
  const [showRecurring, setShowRecurring] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list(),
  });

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

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
        isRecurring: task.is_recurring || false,
        recurrencePattern: task.recurrence_pattern || 'weekly',
        recurrenceDates: task.recurrence_dates || [],
        notificationBefore: task.notification_before || '30min',
        notificationTypes: task.notification_types || ['in_app'],
        subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
        attachments: Array.isArray(task.attachments) ? task.attachments : [],
      });
      setShowNotif(!!task.notification_before);
      setShowRecurring(task.is_recurring || false);
    } else if (!task && open) {
      setForm(defaultState());
      setShowNotif(false);
      setShowRecurring(false);
    }
  }, [task, open]);

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    set('subtasks', [...form.subtasks, {
      id: Date.now().toString(), title: newSubtask.trim(), completed: false,
      description: '', priority: 'medium', status: 'todo', assigned_to: '', attachments: []
    }]);
    setNewSubtask('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      set('attachments', [...form.attachments, file_url]);
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: (data) => 
      task 
        ? base44.entities.ProjectTask.update(task.id, data) 
        : base44.entities.ProjectTask.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
      toast.success(`Task saved`);
      onClose();
    },
  });

  const handleSave = () => {
    if (!form.title) {
      toast.error('Title required');
      return;
    }

    saveMutation.mutate({
      title: form.title,
      description: form.description,
      status: form.status,
      priority: form.priority,
      assigned_to: form.assignedTo,
      list_name: form.projectName,
      start_date: form.startDate ? format(form.startDate, 'yyyy-MM-dd') : null,
      start_time: form.startDate ? form.startTime : null,
      due_date: form.dueDate ? format(form.dueDate, 'yyyy-MM-dd') : null,
      due_time: form.dueDate ? form.dueTime : null,
      is_recurring: form.isRecurring,
      subtasks: form.subtasks,
      attachments: form.attachments,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto text-left z-[9999]">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'New Task'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input 
            value={form.title} 
            onChange={e => set('title', e.target.value)} 
            placeholder="Task title..." 
            className="text-lg font-bold border-0 border-b rounded-none px-0 focus-visible:ring-0" 
          />
          <Textarea 
            value={form.description} 
            onChange={e => set('description', e.target.value)} 
            placeholder="Add description..." 
            rows={2} 
            className="text-sm resize-none" 
          />

          <div className="flex flex-wrap gap-2 items-center">
            <Select value={form.status} onValueChange={v => set('status', v)}>
              <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={form.priority} onValueChange={v => set('priority', v)}>
              <SelectTrigger className={`h-8 w-26 text-xs ${PRIORITY_COLORS[form.priority]}`}><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={form.assignedTo} onValueChange={v => set('assignedTo', v)}>
              <SelectTrigger className="h-8 w-44 text-xs">
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3 text-gray-400" />
                  <SelectValue placeholder="Assignee..." />
                </div>
              </SelectTrigger>
              <SelectContent>
                {employees.map(e => <SelectItem key={e.id} value={e.email}>{e.first_name} {e.last_name}</SelectItem>)}
              </SelectContent>
            </Select>

            <Input 
              value={form.projectName} 
              onChange={e => set('projectName', e.target.value)} 
              placeholder="Project..." 
              className="h-8 text-xs w-32" 
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <DateButton 
              label="+ Start date" 
              dateValue={form.startDate} 
              timeValue={form.startTime} 
              onDateChange={d => set('startDate', d)} 
              onTimeChange={v => set('startTime', v)} 
            />
            <DateButton 
              label="+ Due date" 
              dateValue={form.dueDate} 
              timeValue={form.dueTime} 
              onDateChange={d => set('dueDate', d)} 
              onTimeChange={v => set('dueTime', v)} 
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowNotif(!showNotif)} className={showNotif ? 'bg-blue-50 border-blue-200' : ''}><Bell className="w-3 h-3 mr-1" /> Notify</Button>
            <Button variant="outline" size="sm" onClick={() => setShowRecurring(!showRecurring)} className={showRecurring ? 'bg-blue-50 border-blue-200' : ''}><RefreshCw className="w-3 h-3 mr-1" /> Recurring</Button>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase">Subtasks</p>
            {form.subtasks.map(s => (
              <SubtaskRow 
                key={s.id} 
                sub={s} 
                onChange={updated => set('subtasks', form.subtasks.map(x => x.id === updated.id ? updated : x))} 
                onRemove={id => set('subtasks', form.subtasks.filter(x => x.id !== id))} 
                onToggle={id => set('subtasks', form.subtasks.map(x => x.id === id ? { ...x, completed: !x.completed } : x))} 
                employees={employees} 
              />
            ))}
            <div className="flex gap-2 mt-2">
              <Input 
                value={newSubtask} 
                onChange={e => setNewSubtask(e.target.value)} 
                placeholder="Add a subtask..." 
                className="h-8 text-sm" 
                onKeyDown={e => e.key === 'Enter' && addSubtask()} 
              />
              <Button variant="outline" size="sm" onClick={addSubtask} className="h-8 px-2"><Plus className="w-4 h-4" /></Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase">Attachments</p>
            <label className="flex items-center gap-2 cursor-pointer border border-dashed rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
              <Upload className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">{uploading ? 'Uploading...' : 'Attach a file'}</span>
              <input type="file" className="hidden" onChange={handleFileUpload} />
            </label>
            {form.attachments.map((url, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
                <a href={url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 truncate underline">File {i+1}</a>
                <button onClick={() => set('attachments', form.attachments.filter((_, idx) => idx !== i))}><X className="w-3 h-3" /></button>
              </div>
            ))}
          </div>

          {!isPaidUser && <div className="bg-amber-50 p-2 rounded text-[10px] text-amber-700 flex items-center gap-2 border border-amber-100"><Lock className="w-3 h-3" /> Pro: Time tracking & automations require a paid plan.</div>}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 min-w-[100px]">
              {saveMutation.isPending ? 'Syncing...' : (task ? 'Update' : 'Create')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}