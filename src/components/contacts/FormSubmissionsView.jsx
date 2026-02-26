import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, Eye, CheckCircle, Flag, BarChart3, Users, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

const statusColors = {
  new: 'bg-blue-100 text-blue-700',
  reviewed: 'bg-yellow-100 text-yellow-700',
  converted: 'bg-green-100 text-green-700',
  spam: 'bg-red-100 text-red-700',
};

function SubmissionDetail({ submission, onClose }) {
  if (!submission) return null;
  return (
    <Dialog open={!!submission} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Submission Detail</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{format(new Date(submission.created_date), 'MMM d, yyyy · h:mm a')}</span>
            <Badge className={statusColors[submission.status]}>{submission.status}</Badge>
          </div>
          <div className="border rounded-lg divide-y">
            {Object.entries(submission.data || {}).map(([key, val]) => (
              <div key={key} className="flex px-4 py-2 gap-4">
                <span className="text-sm font-medium text-gray-600 w-1/3 capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="text-sm text-gray-900 flex-1">{String(val)}</span>
              </div>
            ))}
          </div>
          {submission.source_url && (
            <p className="text-xs text-gray-400">Source: {submission.source_url}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function FormSubmissionsView({ formId, formName }) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(null);

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['form-submissions', formId],
    queryFn: () => base44.entities.FormSubmission.filter({ form_id: formId }, '-created_date'),
    enabled: !!formId,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.FormSubmission.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['form-submissions', formId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FormSubmission.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['form-submissions', formId] }),
  });

  const stats = {
    total: submissions.length,
    new: submissions.filter(s => s.status === 'new').length,
    converted: submissions.filter(s => s.status === 'converted').length,
  };

  if (isLoading) return <div className="text-center py-12 text-gray-400">Loading submissions…</div>;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><Users className="w-5 h-5 text-blue-600" /></div>
          <div><p className="text-2xl font-bold text-blue-700">{stats.total}</p><p className="text-xs text-gray-500">Total Submissions</p></div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center"><Flag className="w-5 h-5 text-yellow-600" /></div>
          <div><p className="text-2xl font-bold text-yellow-700">{stats.new}</p><p className="text-xs text-gray-500">New / Unreviewed</p></div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><TrendingUp className="w-5 h-5 text-green-600" /></div>
          <div><p className="text-2xl font-bold text-green-700">{stats.total > 0 ? Math.round((stats.converted / stats.total) * 100) : 0}%</p><p className="text-xs text-gray-500">Conversion Rate</p></div>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No submissions yet for this form.</p>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Submitted</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 text-xs">{format(new Date(sub.created_date), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-3 font-medium">{sub.data?.email || sub.contact_email || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{sub.data?.name || sub.data?.full_name || '—'}</td>
                  <td className="px-4 py-3">
                    <Select value={sub.status} onValueChange={(v) => updateMutation.mutate({ id: sub.id, status: v })}>
                      <SelectTrigger className="h-7 w-32 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="spam">Spam</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelected(sub)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7 text-red-400"
                        onClick={() => { if (confirm('Delete submission?')) deleteMutation.mutate(sub.id); }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SubmissionDetail submission={selected} onClose={() => setSelected(null)} />
    </div>
  );
}