import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Settings, Copy, Eye, Code, GripVertical, BarChart2 } from 'lucide-react';

const FIELD_TYPES = [
  { type: 'text', label: 'Text Input', icon: '✏️' },
  { type: 'email', label: 'Email', icon: '📧' },
  { type: 'phone', label: 'Phone', icon: '📱' },
  { type: 'textarea', label: 'Text Area', icon: '📄' },
  { type: 'select', label: 'Dropdown', icon: '▾' },
  { type: 'checkbox', label: 'Checkbox', icon: '☑️' },
  { type: 'radio', label: 'Radio Group', icon: '⊙' },
  { type: 'date', label: 'Date Picker', icon: '📅' },
  { type: 'file', label: 'File Upload', icon: '📎' },
  { type: 'hidden', label: 'Hidden Field', icon: '👻' },
  { type: 'heading', label: 'Heading', icon: '🔤' },
  { type: 'divider', label: 'Divider', icon: '—' },
];

const sampleForms = [
  { id: '1', name: 'Lead Capture Form', fields: 4, submissions: 142, status: 'active' },
  { id: '2', name: 'Contact Us', fields: 6, submissions: 88, status: 'active' },
  { id: '3', name: 'Newsletter Signup', fields: 2, submissions: 310, status: 'active' },
];

export default function SitesForms() {
  const [view, setView] = useState('list');
  const [fields, setFields] = useState([
    { id: '1', type: 'text', label: 'Full Name', placeholder: 'Enter your name', required: true },
    { id: '2', type: 'email', label: 'Email Address', placeholder: 'you@example.com', required: true },
    { id: '3', type: 'phone', label: 'Phone Number', placeholder: '+1 (555) 000-0000', required: false },
    { id: '4', type: 'textarea', label: 'Message', placeholder: 'How can we help you?', required: false },
  ]);
  const [selectedField, setSelectedField] = useState(null);
  const [formName, setFormName] = useState('New Lead Form');

  const addField = (type) => {
    const ft = FIELD_TYPES.find(f => f.type === type);
    const newField = { id: Date.now().toString(), type, label: ft.label, placeholder: '', required: false };
    setFields(prev => [...prev, newField]);
    setSelectedField(newField.id);
  };

  const deleteField = (id) => setFields(prev => prev.filter(f => f.id !== id));

  const updateField = (id, key, value) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const renderFieldPreview = (field) => {
    switch (field.type) {
      case 'text': case 'email': case 'phone':
        return <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50" placeholder={field.placeholder || field.label} readOnly />;
      case 'textarea':
        return <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 h-20 resize-none" placeholder={field.placeholder} readOnly />;
      case 'select':
        return <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50"><option>Select an option</option></select>;
      case 'checkbox':
        return <label className="flex items-center gap-2 text-sm"><input type="checkbox" readOnly /> I agree to the terms</label>;
      case 'radio':
        return <div className="space-y-1">{['Option A', 'Option B'].map(o => <label key={o} className="flex items-center gap-2 text-sm"><input type="radio" readOnly /> {o}</label>)}</div>;
      case 'date':
        return <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50" readOnly />;
      case 'file':
        return <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center text-sm text-gray-400">Click to upload file</div>;
      case 'heading':
        return <p className="text-lg font-bold text-gray-800">{field.label}</p>;
      case 'divider':
        return <hr className="border-gray-200" />;
      default:
        return null;
    }
  };

  if (view === 'list') {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Forms</h2>
          <Button onClick={() => setView('builder')} className="bg-violet-600 hover:bg-violet-700 gap-2">
            <Plus className="w-4 h-4" /> Create Form
          </Button>
        </div>
        <div className="grid gap-4">
          {sampleForms.map(form => (
            <Card key={form.id} className="hover:shadow-md transition">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="font-semibold text-gray-900">{form.name}</p>
                  <p className="text-sm text-gray-500">{form.fields} fields · {form.submissions} submissions</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-700 border-0">{form.status}</Badge>
                  <Button size="sm" variant="outline" className="gap-1 text-xs"><BarChart2 className="w-3 h-3" />Stats</Button>
                  <Button size="sm" variant="outline" className="gap-1 text-xs"><Code className="w-3 h-3" />Embed</Button>
                  <Button size="sm" variant="outline" onClick={() => setView('builder')} className="gap-1 text-xs"><Settings className="w-3 h-3" />Edit</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Field Types */}
      <div className="w-56 border-r border-gray-100 bg-gray-50 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-100">
          <Button variant="ghost" size="sm" onClick={() => setView('list')} className="text-xs text-gray-500 mb-2 -ml-2">← Back</Button>
          <p className="font-bold text-gray-800 text-sm">Field Types</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {FIELD_TYPES.map(ft => (
            <button key={ft.type} onClick={() => addField(ft.type)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-violet-50 hover:text-violet-700 text-gray-600 bg-white border border-gray-100 hover:border-violet-200">
              <span>{ft.icon}</span><span className="font-medium">{ft.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form Canvas */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <Input value={formName} onChange={e => setFormName(e.target.value)} className="h-8 text-sm font-semibold w-56 border-gray-200" />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1 text-xs h-8"><Eye className="w-3.5 h-3.5" />Preview</Button>
            <Button size="sm" variant="outline" className="gap-1 text-xs h-8"><Code className="w-3.5 h-3.5" />Embed Code</Button>
            <Button size="sm" className="gap-1 text-xs h-8 bg-violet-600 hover:bg-violet-700">Save Form</Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 text-center">{formName}</h3>
            {fields.map(field => (
              <div
                key={field.id}
                onClick={() => setSelectedField(field.id)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition ${selectedField === field.id ? 'border-violet-500 bg-violet-50' : 'border-transparent hover:border-gray-200'}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-gray-700">{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</label>
                  <div className="flex gap-1">
                    <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                    <button onClick={e => { e.stopPropagation(); deleteField(field.id); }}><Trash2 className="w-3.5 h-3.5 text-gray-300 hover:text-red-400" /></button>
                  </div>
                </div>
                {renderFieldPreview(field)}
              </div>
            ))}
            <button className="w-full py-3 rounded-xl bg-violet-600 text-white font-semibold mt-4 hover:bg-violet-700">Submit</button>
          </div>
        </div>
      </div>

      {/* Field Settings */}
      <div className="w-64 border-l border-gray-100 bg-gray-50 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-100">
          <p className="font-bold text-gray-800 text-sm">Field Settings</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {selectedField ? (() => {
            const field = fields.find(f => f.id === selectedField);
            if (!field) return null;
            return (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Label</Label>
                  <Input value={field.label} onChange={e => updateField(field.id, 'label', e.target.value)} className="text-sm h-8" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Placeholder</Label>
                  <Input value={field.placeholder} onChange={e => updateField(field.id, 'placeholder', e.target.value)} className="text-sm h-8" />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={field.required} onChange={e => updateField(field.id, 'required', e.target.checked)} />
                  <span className="font-medium text-gray-700">Required</span>
                </label>
              </div>
            );
          })() : (
            <p className="text-xs text-gray-400 text-center mt-8">Click a field to edit its settings</p>
          )}
        </div>
      </div>
    </div>
  );
}