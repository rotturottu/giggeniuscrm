import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import {
  Folder, FolderOpen, Plus, Trash2, Edit, Users, Zap, Filter,
  Star, ChevronRight, X, Save
} from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#6366f1'];

const FILTER_FIELDS = [
  { value: 'contact_type', label: 'Contact Type' },
  { value: 'status', label: 'Status' },
  { value: 'tags', label: 'Tags' },
  { value: 'company', label: 'Company' },
  { value: 'source', label: 'Source' },
];

const OPERATORS = [
  { value: 'equals', label: 'equals' },
  { value: 'not_equals', label: 'not equals' },
  { value: 'contains', label: 'contains' },
  { value: 'not_contains', label: 'does not contain' },
];

function SmartListEditor({ list, onClose }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(list?.name || '');
  const [color, setColor] = useState(list?.color || '#3b82f6');
  const [filterType, setFilterType] = useState(list?.filter_type || 'manual');
  const [rules, setRules] = useState(list?.rules || []);

  const saveMutation = useMutation({
    mutationFn: (data) => list
      ? base44.entities.SmartList.update(list.id, data)
      : base44.entities.SmartList.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smart-lists'] });
      onClose();
    },
  });

  const addRule = () => setRules([...rules, { field: 'contact_type', operator: 'equals', value: '' }]);
  const updateRule = (i, r) => { const c = [...rules]; c[i] = r; setRules(c); };
  const removeRule = (i) => setRules(rules.filter((_, idx) => idx !== i));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{list ? 'Edit Smart List' : 'New Smart List'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>List Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Hot Leads" className="mt-1" />
          </div>
          <div>
            <Label className="mb-2 block">Color</Label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div>
            <Label>Type</Label>
            <div className="flex gap-3 mt-1">
              <button
                onClick={() => setFilterType('manual')}
                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition ${filterType === 'manual' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}
              >
                <Folder className="w-4 h-4 inline mr-2" />Manual
              </button>
              <button
                onClick={() => setFilterType('automatic')}
                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition ${filterType === 'automatic' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600'}`}
              >
                <Zap className="w-4 h-4 inline mr-2" />Automatic (Rules)
              </button>
            </div>
          </div>

          {filterType === 'automatic' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Filter Rules</Label>
                <Button variant="outline" size="sm" onClick={addRule} className="gap-1 text-xs">
                  <Plus className="w-3 h-3" /> Add Rule
                </Button>
              </div>
              {rules.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4 border border-dashed rounded-lg">
                  Add rules to automatically include matching contacts
                </p>
              )}
              <div className="space-y-2">
                {rules.map((rule, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Select value={rule.field} onValueChange={(v) => updateRule(i, { ...rule, field: v })}>
                      <SelectTrigger className="flex-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FILTER_FIELDS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={rule.operator} onValueChange={(v) => updateRule(i, { ...rule, operator: v })}>
                      <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {OPERATORS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input
                      value={rule.value}
                      onChange={(e) => updateRule(i, { ...rule, value: e.target.value })}
                      placeholder="value"
                      className="flex-1 h-8 text-xs"
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => removeRule(i)}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              onClick={() => saveMutation.mutate({ name, color, filter_type: filterType, rules })}
              disabled={!name || saveMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SmartLists({ onSelectList, selectedListId }) {
  const queryClient = useQueryClient();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingList, setEditingList] = useState(null);

  const { data: lists = [] } = useQuery({
    queryKey: ['smart-lists'],
    queryFn: () => base44.entities.SmartList.list('-created_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SmartList.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['smart-lists'] }),
  });

  return (
    <div className="w-56 flex-shrink-0 bg-white border-r flex flex-col h-full">
      <div className="p-3 border-b flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Smart Lists</span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingList(null); setEditorOpen(true); }}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {/* All Contacts */}
        <button
          onClick={() => onSelectList(null)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${!selectedListId ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <Users className="w-4 h-4" />
          All Contacts
        </button>

        {lists.length > 0 && <div className="pt-2 pb-1 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Folders</div>}

        {lists.map((list) => (
          <div
            key={list.id}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer group ${selectedListId === list.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
            onClick={() => onSelectList(list.id)}
          >
            <Folder className="w-4 h-4 flex-shrink-0" style={{ color: list.color }} />
            <span className="flex-1 truncate">{list.name}</span>
            {list.filter_type === 'automatic' && <Zap className="w-3 h-3 text-purple-400 flex-shrink-0" />}
            <div className="hidden group-hover:flex items-center gap-0.5">
              <button
                className="p-0.5 hover:text-blue-600"
                onClick={(e) => { e.stopPropagation(); setEditingList(list); setEditorOpen(true); }}
              >
                <Edit className="w-3 h-3" />
              </button>
              <button
                className="p-0.5 hover:text-red-500"
                onClick={(e) => { e.stopPropagation(); if (confirm('Delete list?')) deleteMutation.mutate(list.id); }}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {lists.length === 0 && (
          <div className="text-center py-6 text-xs text-gray-400 px-3">
            <Folder className="w-6 h-6 mx-auto mb-1 opacity-30" />
            No lists yet.<br />Create one to segment your contacts.
          </div>
        )}
      </div>

      {editorOpen && (
        <SmartListEditor list={editingList} onClose={() => { setEditorOpen(false); setEditingList(null); }} />
      )}
    </div>
  );
}