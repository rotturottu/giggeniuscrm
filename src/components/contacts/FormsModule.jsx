import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, BarChart3, Eye, FileText, ExternalLink } from 'lucide-react';
import FormBuilder from './FormBuilder';
import FormSubmissionsView from './FormSubmissionsView';

export default function FormsModule() {
  const queryClient = useQueryClient();
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [viewingForm, setViewingForm] = useState(null); // {id, name}

  const { data: forms = [], isLoading } = useQuery({
    queryKey: ['contact-forms'],
    queryFn: () => base44.entities.ContactForm.list('-created_date'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.ContactForm.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contact-forms'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ContactForm.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contact-forms'] }),
  });

  if (viewingForm) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-5">
          <Button variant="outline" size="sm" onClick={() => setViewingForm(null)}>← Back to Forms</Button>
          <h2 className="text-base font-semibold">{viewingForm.name} — Submissions</h2>
        </div>
        <FormSubmissionsView formId={viewingForm.id} formName={viewingForm.name} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Forms</h2>
          <p className="text-sm text-gray-500">Build forms to capture leads and collect contact information</p>
        </div>
        <Button
          onClick={() => { setEditingForm(null); setBuilderOpen(true); }}
          className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
        >
          <Plus className="w-4 h-4" /> Create Form
        </Button>
      </div>

      {isLoading && <div className="text-center py-12 text-gray-400">Loading forms…</div>}

      {!isLoading && forms.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-xl bg-gray-50">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium text-gray-500">No forms yet</p>
          <p className="text-sm text-gray-400 mb-4">Create your first form to start capturing leads</p>
          <Button onClick={() => { setEditingForm(null); setBuilderOpen(true); }} className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Plus className="w-4 h-4 mr-2" /> Create Form
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {forms.map((form) => (
          <Card key={form.id} className="border hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate">{form.name}</CardTitle>
                  {form.description && <p className="text-xs text-gray-500 mt-1 truncate">{form.description}</p>}
                </div>
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(v) => toggleMutation.mutate({ id: form.id, is_active: v })}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    {form.fields?.length || 0} fields
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-3.5 h-3.5" />
                    {form.submissions_count || 0} submissions
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {form.fields?.slice(0, 3).map((f, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{f.label}</Badge>
                  ))}
                  {(form.fields?.length || 0) > 3 && (
                    <Badge variant="outline" className="text-xs">+{form.fields.length - 3} more</Badge>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline" size="sm" className="flex-1 gap-1 text-xs"
                    onClick={() => setViewingForm({ id: form.id, name: form.name })}
                  >
                    <Eye className="w-3.5 h-3.5" /> Submissions
                  </Button>
                  <Button
                    variant="outline" size="sm" className="gap-1 text-xs"
                    onClick={() => { setEditingForm(form); setBuilderOpen(true); }}
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <Button
                    variant="outline" size="sm" className="text-red-400 hover:text-red-600"
                    onClick={() => { if (confirm('Delete this form?')) deleteMutation.mutate(form.id); }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <FormBuilder
        open={builderOpen}
        onClose={() => { setBuilderOpen(false); setEditingForm(null); }}
        form={editingForm}
      />
    </div>
  );
}