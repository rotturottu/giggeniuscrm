import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save } from 'lucide-react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function TaskForm({ open, onClose, task }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [relatedToType, setRelatedToType] = useState('');
  const [relatedToId, setRelatedToId] = useState('');

  const queryClient = useQueryClient();

  const { data: leads = [] } = useQuery({
    queryKey: ['leads-for-task'],
    queryFn: () => base44.entities.Lead.list('-created_date', 50),
    enabled: relatedToType === 'lead',
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['deals-for-task'],
    queryFn: () => base44.entities.Deal.list('-created_date', 50),
    enabled: relatedToType === 'deal',
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts-for-task'],
    queryFn: () => base44.entities.Contact.list('-created_date', 50),
    enabled: relatedToType === 'contact',
  });

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setAssignedTo(task.assigned_to || '');
      setDueDate(task.due_date ? new Date(task.due_date) : null);
      setRelatedToType(task.related_to_type || '');
      setRelatedToId(task.related_to_id || '');
    } else {
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setAssignedTo('');
      setDueDate(null);
      setRelatedToType('');
      setRelatedToId('');
    }
  }, [task, open]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (task) {
        return base44.entities.Task.update(task.id, data);
      }
      return base44.entities.Task.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onClose();
    },
  });

  const handleSave = () => {
    if (!title) return;

    saveMutation.mutate({
      title,
      description: description || null,
      status,
      priority,
      assigned_to: assignedTo || null,
      due_date: dueDate ? dueDate.toISOString() : null,
      related_to_type: relatedToType || null,
      related_to_id: relatedToId || null,
    });
  };

  const getRelatedOptions = () => {
    switch (relatedToType) {
      case 'lead':
        return leads;
      case 'deal':
        return deals;
      case 'contact':
        return contacts;
      default:
        return [];
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Task Title *</Label>
            <Input
              placeholder="e.g., Follow up with client"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              placeholder="Task details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Assigned To (Email)</Label>
              <Input
                type="email"
                placeholder="user@company.com"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full mt-1 justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Related To</Label>
              <Select value={relatedToType} onValueChange={(value) => {
                setRelatedToType(value);
                setRelatedToId('');
              }}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>None</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="deal">Deal</SelectItem>
                  <SelectItem value="contact">Contact</SelectItem>
                  <SelectItem value="campaign">Campaign</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {relatedToType && relatedToType !== 'campaign' && (
              <div>
                <Label>Select {relatedToType}</Label>
                <Select value={relatedToId} onValueChange={setRelatedToId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={`Select ${relatedToType}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {getRelatedOptions().map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name || item.email || item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!title || saveMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {task ? 'Update' : 'Create'} Task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}