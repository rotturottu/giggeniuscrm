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
import { format } from 'date-fns';
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
const STATUS_OPTIONS = ['todo', 'in_progress', 'review', 'for_approval', 'completed'];
const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-600', medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700', urgent: 'bg-red-100 text-red-700'
};

// ── Time picker inline ────────────────────────────────────────────────────────
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

// ── Date pill button (date + optional time inside popover) ───────────────────
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

// ── Assignee input with dropdown suggestions ─────────────────────────────────
function AssigneeInput({ value, onChange, users }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(value.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(value.toLowerCase())
  ).slice(0, 6);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <User className="absolute left-2 top-1.5 w-3 h-3 text-gray-400" />
        <Input
          type="text"
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Assignee..."
          className="h-8 text-xs pl-6 w-44"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-9 left-0 w-56 bg-white border rounded-lg shadow-lg py-1 max-h-48 overflow-y-auto">
          {filtered.map(u => (
            <button
              key={u.email}
              onMouseDown={() => { onChange(u.email); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-medium flex-shrink-0">
                {(u.full_name || u.email)[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                {u.full_name && <p className="text-xs font-medium truncate">{u.full_name}</p>}
                <p className="text-xs text-gray-500 truncate">{u.email}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Subtask expanded detail ───────────────────────────────────────────────────
function SubtaskDetail({ sub, onChange, users }) {
  const [uploading, setUploading] = useState(false);
  const update = (field, val) => onChange({ ...sub, [field]: val });

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { toast.error('Max 50 MB'); return; }
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update('attachments', [...(sub.attachments || []), file_url]);
    setUploading(false);
  };

  return (
    <div className="mt-1.5 ml-10 space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
      <Textarea
        value={sub.description || ''}
        onChange={e => update('description', e.target.value)}
        placeholder="Description..."
        rows={2}
        className="text-xs resize-none"
      />

      <div className="flex flex-wrap gap-2 items-center">
        <Select value={sub.status || 'todo'} onValueChange={v => update('status', v)}>
          <SelectTrigger className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={sub.priority || 'medium'} onValueChange={v => update('priority', v)}>
          <SelectTrigger className={`h-7 w-24 text-xs ${PRIORITY_COLORS[sub.priority || 'medium']}`}><SelectValue /></SelectTrigger>
          <SelectContent>
            {PRIORITY_OPTIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>

        <AssigneeInput
          value={sub.assigned_to || ''}
          onChange={v => update('assigned_to', v)}
          users={users}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <DateButton
          label="Start date"
          dateValue={sub.start_date ? new Date(sub.start_date) : null}
          timeValue={sub.start_time}
          onDateChange={d => update('start_date', d ? format(d, 'yyyy-MM-dd') : null)}
          onTimeChange={v => update('start_time', v)}
        />
        <DateButton
          label="Due date"
          dateValue={sub.due_date ? new Date(sub.due_date) : null}
          timeValue={sub.due_time}
          onDateChange={d => update('due_date', d ? format(d, 'yyyy-MM-dd') : null)}
          onTimeChange={v => update('due_time', v)}
        />
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <label className="flex items-center gap-1 cursor-pointer text-xs text-gray-500 hover:text-blue-600 px-2 py-1 border border-dashed rounded hover:border-blue-300">
          <Paperclip className="w-3 h-3" />
          {uploading ? 'Uploading...' : 'Attach file'}
          <input type="file" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
        {(sub.attachments || []).map((url, i) => (
          <div key={i} className="flex items-center gap-1 bg-white rounded border px-2 py-1">
            <a href={url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">File {i + 1}</a>
            <button onClick={() => update('attachments', sub.attachments.filter((_, idx) => idx !== i))}>
              <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Subtask row (collapsible) ─────────────────────────────────────────────────
function SubtaskRow({ sub, onChange, onRemove, onToggle, users }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <div className="flex items-center gap-2 py-0.5">
        <input type="checkbox" checked={sub.completed} onChange={() => onToggle(sub.id)} className="rounded flex-shrink-0" />
        <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
          {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>
        <Input
          value={sub.title}
          onChange={e => onChange({ ...sub, title: e.target.value })}
          className={`h-7 text-sm flex-1 border-0 shadow-none px-0 focus-visible:ring-0 ${sub.completed ? 'line-through text-gray-400' : ''}`}
          placeholder="Subtask title..."
        />
        <button onClick={() => onRemove(sub.id)} className="text-gray-300 hover:text-red-500 flex-shrink-0">
          <X className="w-3 h-3" />
        </button>
      </div>
      {expanded && <SubtaskDetail sub={sub} onChange={onChange} users={users} />}
    </div>
  );
}

// ── Default form state ────────────────────────────────────────────────────────
const defaultState = () => ({
  title: '', description: '', status: 'todo', priority: 'medium',
  assignedTo: '', projectName: '', startDate: null, startTime: '09:00',
  dueDate: null, dueTime: '17:00', isRecurring: false,
  recurrencePattern: 'weekly', recurrenceDates: [],
  notificationBefore: '30min', notificationTypes: ['in_app'],
  subtasks: [], attachments: [],
});

// ── Main TaskForm ─────────────────────────────────────────────────────────────
export default function TaskForm({ open, onClose, task, isPaidUser }) {
  const [form, setForm] = useState(defaultState());
  const [showNotif, setShowNotif] = useState(false);
  const [showRecurring, setShowRecurring] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  // Fetch users for assignee dropdown
  const { data: users = [] } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => base44.entities.User.list(),
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '', description: task.description || '',
        status: task.status || 'todo', priority: task.priority || 'medium',
        assignedTo: task.assigned_to || '', projectName: task.list_name || '',
        startDate: task.start_date ? new Date(task.start_date) : null,
        startTime: task.start_time || '09:00',
        dueDate: task.due_date ? new Date(task.due_date) : null,
        dueTime: task.due_time || '17:00',
        isRecurring: task.is_recurring || false,
        recurrencePattern: task.recurrence_pattern || 'weekly',
        recurrenceDates: task.recurrence_dates || [],
        notificationBefore: task.notification_before || '30min',
        notificationTypes: task.notification_types || ['in_app'],
        subtasks: task.subtasks || [], attachments: task.attachments || [],
      });
      setShowNotif(!!task.notification_before);
      setShowRecurring(task.is_recurring || false);
    } else {
      setForm(defaultState());
      setShowNotif(false);
      setShowRecurring(false);
    }
    setNewSubtask('');
  }, [task, open]);

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    set('subtasks', [...form.subtasks, {
      id: Date.now().toString(), title: newSubtask.trim(), completed: false,
      description: '', priority: 'medium', status: 'todo', assigned_to: '', attachments: []
    }]);
    setNewSubtask('');
  };

  const updateSubtask = (updated) => set('subtasks', form.subtasks.map(s => s.id === updated.id ? updated : s));
  const removeSubtask = (id) => set('subtasks', form.subtasks.filter(s => s.id !== id));
  const toggleSubtask = (id) => set('subtasks', form.subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s));

  const toggleNotifType = (type) => set('notificationTypes',
    form.notificationTypes.includes(type)
      ? form.notificationTypes.filter(t => t !== type)
      : [...form.notificationTypes, type]
  );

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { toast.error('File size must be under 50 MB'); return; }
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set('attachments', [...form.attachments, file_url]);
    setUploading(false);
    toast.success('File attached');
  };

  const saveMutation = useMutation({
    mutationFn: (data) =>
      task ? base44.entities.ProjectTask.update(task.id, data) : base44.entities.ProjectTask.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
      toast.success(`Task ${task ? 'updated' : 'created'}`);
      onClose();
    },
  });

  const handleSave = () => {
    if (!form.title) { toast.error('Task title is required'); return; }
    saveMutation.mutate({
      title: form.title, description: form.description, status: form.status, priority: form.priority,
      assigned_to: form.assignedTo || null, list_name: form.projectName || null,
      start_date: form.startDate ? format(form.startDate, 'yyyy-MM-dd') : null,
      start_time: form.startDate ? form.startTime : null,
      due_date: form.dueDate ? format(form.dueDate, 'yyyy-MM-dd') : null,
      due_time: form.dueDate ? form.dueTime : null,
      is_recurring: form.isRecurring,
      recurrence_pattern: form.isRecurring ? form.recurrencePattern : null,
      recurrence_dates: form.isRecurring ? form.recurrenceDates : [],
      notification_before: showNotif ? form.notificationBefore : null,
      notification_types: showNotif ? form.notificationTypes : [],
      subtasks: form.subtasks, attachments: form.attachments,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">{task ? 'Edit Task' : 'New Task'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <Input
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="Task title..."
            className="text-base font-medium border-0 border-b rounded-none px-0 shadow-none focus-visible:ring-0"
            autoFocus
          />

          {/* Description */}
          <Textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Add description..."
            rows={2}
            className="text-sm resize-none"
          />

          {/* Status + Priority + Assignee + Project — inline chips */}
          <div className="flex flex-wrap gap-2 items-center">
            <Select value={form.status} onValueChange={v => set('status', v)}>
              <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={form.priority} onValueChange={v => set('priority', v)}>
              <SelectTrigger className={`h-8 w-26 text-xs ${PRIORITY_COLORS[form.priority]}`}><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>

            <AssigneeInput value={form.assignedTo} onChange={v => set('assignedTo', v)} users={users} />

            <Input
              value={form.projectName}
              onChange={e => set('projectName', e.target.value)}
              placeholder="Project..."
              className="h-8 text-xs w-32"
            />
          </div>

          {/* Date pills */}
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

          {/* Optional feature toggles */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowNotif(!showNotif)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs border transition-all ${
                showNotif ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Bell className="w-3 h-3" /> Notify
            </button>

            <button
              onClick={() => { setShowRecurring(!showRecurring); set('isRecurring', !showRecurring); }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs border transition-all ${
                showRecurring ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <RefreshCw className="w-3 h-3" /> Recurring
            </button>
          </div>

          {/* Notification panel */}
          {showNotif && (
            <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-lg">
              <Bell className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <Select value={form.notificationBefore} onValueChange={v => set('notificationBefore', v)}>
                <SelectTrigger className="h-7 w-20 text-xs bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {NOTIFICATION_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <span className="text-xs text-blue-600">before · via</span>
              {['in_app', 'email'].map(type => (
                <button
                  key={type}
                  onClick={() => toggleNotifType(type)}
                  className={`px-2.5 py-0.5 rounded-full text-xs border transition-all ${
                    form.notificationTypes.includes(type)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-blue-200 text-blue-600 bg-white'
                  }`}
                >
                  {type === 'in_app' ? 'In-App' : 'Email'}
                </button>
              ))}
            </div>
          )}

          {/* Recurring panel */}
          {showRecurring && (
            <div className="p-3 bg-gray-50 border rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <Select value={form.recurrencePattern} onValueChange={v => set('recurrencePattern', v)}>
                  <SelectTrigger className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-xs text-gray-500">— pick dates:</span>
                {form.recurrenceDates.length > 0 && (
                  <span className="text-xs text-blue-600 font-medium">{form.recurrenceDates.length} selected</span>
                )}
              </div>
              <Calendar
                mode="multiple"
                selected={form.recurrenceDates.map(d => new Date(d))}
                onSelect={dates => set('recurrenceDates', (dates || []).map(d => format(d, 'yyyy-MM-dd')))}
                className="border rounded-lg bg-white w-full"
              />
            </div>
          )}

          {/* Subtasks */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Subtasks {form.subtasks.length > 0 && `(${form.subtasks.filter(s => s.completed).length}/${form.subtasks.length})`}
            </p>
            {form.subtasks.map(sub => (
              <SubtaskRow
                key={sub.id}
                sub={sub}
                onChange={updateSubtask}
                onRemove={removeSubtask}
                onToggle={toggleSubtask}
                users={users}
              />
            ))}
            <div className="flex gap-2 mt-1.5">
              <Input
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                placeholder="Add a subtask..."
                className="h-8 text-sm"
                onKeyDown={e => e.key === 'Enter' && addSubtask()}
              />
              <Button variant="outline" size="sm" onClick={addSubtask} className="h-8 px-2 flex-shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Attachments</p>
            <label className="flex items-center gap-2 cursor-pointer border border-dashed rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
              <Upload className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">{uploading ? 'Uploading...' : 'Click to attach a file (max 50 MB)'}</span>
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            </label>
            {form.attachments.map((url, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 rounded px-3 py-1.5">
                <a href={url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 truncate hover:underline">
                  Attachment {i + 1}
                </a>
                <button onClick={() => set('attachments', form.attachments.filter((_, idx) => idx !== i))}>
                  <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>

          {!isPaidUser && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <Lock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                <span className="font-semibold">Pro:</span> Time tracking & automations require a paid plan.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button variant="outline" onClick={onClose} size="sm">Cancel</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending} size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Save className="w-4 h-4 mr-1.5" />
              {task ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}