import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Star } from 'lucide-react';
import { useState } from 'react';

const ratingColors = { 5: 'text-green-600', 4: 'text-blue-600', 3: 'text-yellow-600', 2: 'text-orange-600', 1: 'text-red-600' };
const empty = { employee_name: '', reviewer_email: '', review_period: '', overall_rating: '', goals_met: 'met', strengths: '', areas_of_improvement: '', goals_next_period: '', comments: '', status: 'draft' };

export default function HRPerformance() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const { data: reviews = [] } = useQuery({
    queryKey: ['performance_reviews'],
    queryFn: () => base44.entities.PerformanceReview.list('-created_date', 100),
  });

  const saveMutation = useMutation({
    mutationFn: (d) => editing ? base44.entities.PerformanceReview.update(editing.id, d) : base44.entities.PerformanceReview.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['performance_reviews'] }); setShowForm(false); setEditing(null); setForm(empty); },
  });

  const openEdit = (r) => { setEditing(r); setForm({ ...empty, ...r }); setShowForm(true); };

  const renderStars = (rating) => Array.from({ length: 5 }, (_, i) => (
    <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-current ' + (ratingColors[rating] || 'text-gray-400') : 'text-gray-200'}`} />
  ));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditing(null); setForm(empty); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Plus className="w-4 h-4" />New Review
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map(rev => (
          <Card key={rev.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openEdit(rev)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{rev.employee_name}</p>
                  <p className="text-sm text-gray-500">{rev.review_period}</p>
                </div>
                <Badge variant="outline">{rev.status}</Badge>
              </div>
              <div className="flex items-center gap-1 mb-2">{renderStars(rev.overall_rating)}<span className="ml-1 text-sm font-medium">{rev.overall_rating}/5</span></div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500">Goals: <strong className="text-gray-800">{rev.goals_met?.replace('_', ' ')}</strong></span>
                <span className="text-gray-500">By: <strong className="text-gray-800">{rev.reviewer_email}</strong></span>
              </div>
              {rev.strengths && <p className="text-sm text-gray-600 mt-2 truncate">✅ {rev.strengths}</p>}
            </CardContent>
          </Card>
        ))}
        {reviews.length === 0 && <div className="col-span-2 text-center py-12 text-gray-400">No performance reviews yet.</div>}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Review' : 'New Performance Review'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Employee Name</Label><Input value={form.employee_name} onChange={e => setForm(p => ({ ...p, employee_name: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Reviewer Email</Label><Input value={form.reviewer_email} onChange={e => setForm(p => ({ ...p, reviewer_email: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Review Period</Label><Input placeholder="e.g. Q1 2026" value={form.review_period} onChange={e => setForm(p => ({ ...p, review_period: e.target.value }))} /></div>
            <div className="space-y-1">
              <Label>Overall Rating (1-5)</Label>
              <Select value={String(form.overall_rating)} onValueChange={v => setForm(p => ({ ...p, overall_rating: Number(v) }))}>
                <SelectTrigger><SelectValue placeholder="Select rating" /></SelectTrigger>
                <SelectContent>{[5,4,3,2,1].map(r => <SelectItem key={r} value={String(r)}>{r} - {['','Poor','Below Average','Average','Good','Excellent'][r]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Goals Met</Label>
              <Select value={form.goals_met} onValueChange={v => setForm(p => ({ ...p, goals_met: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="exceeded">Exceeded</SelectItem>
                  <SelectItem value="met">Met</SelectItem>
                  <SelectItem value="partially_met">Partially Met</SelectItem>
                  <SelectItem value="not_met">Not Met</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-3 mt-2">
            {[['strengths', 'Strengths'], ['areas_of_improvement', 'Areas of Improvement'], ['goals_next_period', 'Goals for Next Period'], ['comments', 'Additional Comments']].map(([key, label]) => (
              <div key={key} className="space-y-1">
                <Label>{label}</Label>
                <Textarea rows={2} value={form[key] || ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}