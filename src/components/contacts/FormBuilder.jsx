import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, GripVertical, Save, Type, Mail, Phone, AlignLeft, ChevronDown, CheckSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const FIELD_TYPES = [
  { value: 'text', label: 'Short Text', icon: Type },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone', icon: Phone },
  { value: 'textarea', label: 'Long Text', icon: AlignLeft },
  { value: 'select', label: 'Dropdown', icon: ChevronDown },
  { value: 'checkbox', label: 'Checkbox', icon: CheckSquare },
];

function FieldEditor({ field, onChange, onRemove }) {
  return (
    <div className="border rounded-lg p-4 bg-white space-y-3">
      <div className="flex items-center gap-3">
        <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
        <div className="flex-1 grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-gray-500">Field Label</Label>
            <Input
              value={field.label}
              onChange={(e) => onChange({ ...field, label: e.target.value })}
              placeholder="e.g. Full Name"
              className="mt-1 h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Field Type</Label>
            <Select value={field.type} onValueChange={(v) => onChange({ ...field, type: v })}>
              <SelectTrigger className="mt-1 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Required</span>
          <Switch
            checked={field.required || false}
            onCheckedChange={(v) => onChange({ ...field, required: v })}
          />
        </div>
        <Button variant="ghost" size="icon" className="text-red-400 h-8 w-8" onClick={onRemove}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      {field.type === 'select' && (
        <div>
          <Label className="text-xs text-gray-500">Options (comma-separated)</Label>
          <Input
            value={(field.options || []).join(', ')}
            onChange={(e) => onChange({ ...field, options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
            placeholder="Option 1, Option 2, Option 3"
            className="mt-1 h-8 text-sm"
          />
        </div>
      )}
      <div>
        <Label className="text-xs text-gray-500">Placeholder</Label>
        <Input
          value={field.placeholder || ''}
          onChange={(e) => onChange({ ...field, placeholder: e.target.value })}
          placeholder="Optional placeholder text"
          className="mt-1 h-8 text-sm"
        />
      </div>
    </div>
  );
}

export default function FormBuilder({ open, onClose, form }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(form?.name || '');
  const [description, setDescription] = useState(form?.description || '');
  const [thankYou, setThankYou] = useState(form?.thank_you_message || 'Thank you! We\'ll be in touch soon.');
  const [fields, setFields] = useState(form?.fields || [
    { id: '1', type: 'text', label: 'Full Name', required: true, placeholder: 'Enter your name' },
    { id: '2', type: 'email', label: 'Email Address', required: true, placeholder: 'Enter your email' },
    { id: '3', type: 'phone', label: 'Phone Number', required: false, placeholder: 'Enter your phone' },
    { id: '4', type: 'textarea', label: 'Message', required: false, placeholder: 'How can we help you?' },
  ]);

  const saveMutation = useMutation({
    mutationFn: (data) => form
      ? base44.entities.ContactForm.update(form.id, data)
      : base44.entities.ContactForm.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-forms'] });
      onClose();
    },
  });

  const addField = () => {
    setFields([...fields, {
      id: Date.now().toString(),
      type: 'text',
      label: 'New Field',
      required: false,
      placeholder: '',
    }]);
  };

  const updateField = (idx, updated) => {
    const copy = [...fields];
    copy[idx] = updated;
    setFields(copy);
  };

  const removeField = (idx) => {
    setFields(fields.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    saveMutation.mutate({ name, description, fields, thank_you_message: thankYou, is_active: true });
  };

  React.useEffect(() => {
    if (open) {
      setName(form?.name || '');
      setDescription(form?.description || '');
      setThankYou(form?.thank_you_message || "Thank you! We'll be in touch soon.");
      setFields(form?.fields || [
        { id: '1', type: 'text', label: 'Full Name', required: true, placeholder: 'Enter your name' },
        { id: '2', type: 'email', label: 'Email Address', required: true, placeholder: 'Enter your email' },
        { id: '3', type: 'phone', label: 'Phone Number', required: false, placeholder: 'Enter your phone' },
        { id: '4', type: 'textarea', label: 'Message', required: false, placeholder: 'How can we help you?' },
      ]);
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {form ? 'Edit Form' : 'Create New Form'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Form Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Contact Us Form" className="mt-1" />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this form for?" className="mt-1" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">Form Fields</Label>
              <Button variant="outline" size="sm" onClick={addField} className="gap-1">
                <Plus className="w-4 h-4" /> Add Field
              </Button>
            </div>
            <div className="space-y-3">
              {fields.map((field, idx) => (
                <FieldEditor
                  key={field.id || idx}
                  field={field}
                  onChange={(updated) => updateField(idx, updated)}
                  onRemove={() => removeField(idx)}
                />
              ))}
            </div>
          </div>

          <div>
            <Label>Thank You Message</Label>
            <Textarea
              value={thankYou}
              onChange={(e) => setThankYou(e.target.value)}
              placeholder="Message shown after form is submitted"
              className="mt-1 h-20 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={!name || fields.length === 0 || saveMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? 'Saving...' : (form ? 'Update Form' : 'Create Form')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}