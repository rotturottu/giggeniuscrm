import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

const EMPTY = { employee_name: '', review_period: '', overall_rating: 3, goals_met: 'met', strengths: '', areas_for_improvement: '', goals_next_period: '', comments: '', status: 'draft' };
const statusColor = { draft: 'bg-gray-100 text-gray-700', submitted: 'bg-blue-100 text-blue-700', acknowledged: 'bg-green-100 text-green-800' };
const goalsMetColor = { exceeded: 'text-green-600', met: 'text-blue-600', partially_met: 'text-amber-600', not_met: 'text-red-600' };

export default function PerformanceReviews() {
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const data = await base44.entities.PerformanceReview.list('-created_date');
    setReviews(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setEditing(null); setShowForm(true); };
  const openEdit = (r) => { setForm({ ...r }); setEditing(r); setShowForm(true); };

  const save = async () => {
    const data = { ...form, overall_rating: Number(form.overall_rating) };
    if (editing) await base44.entities.PerformanceReview.update(editing.id, data);
    else await base44.entities.PerformanceReview.create({ ...data, employee_id: data.employee_name });
    setShowForm(false);
    load();
  };

  const updateStatus = async (id, status) => {
    await base44.entities.PerformanceReview.update(id, { status });
    load();
  };

  const StarRating = ({ rating }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`w-4 h-4 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Plus className="w-4 h-4" />New Review
        </Button>
      </div>

      {loading ? <p className="text-gray-400 text-sm">Loading...</p> : (
        <div className="space-y-3">
          {reviews.length === 0 && <p className="text-gray-400 text-sm">No performance reviews yet.</p>}
          {reviews.map(r => (
            <Card key={r.id} className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => openEdit(r)}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">{r.employee_name}</p>
                      <Badge className={`text-xs border-0 ${statusColor[r.status]}`}>{r.status}</Badge>
                    </div>
                    <p className="text-xs text-gray-500">{r.review_period}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <StarRating rating={r.overall_rating} />
                      <span className={`text-xs font-medium capitalize ${goalsMetColor[r.goals_met]}`}>{r.goals_met?.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {r.status === 'draft' && (
                      <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); updateStatus(r.id, 'submitted'); }}>Submit</Button>
                    )}
                    {r.status === 'submitted' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={e => { e.stopPropagation(); updateStatus(r.id, 'acknowledged'); }}>Acknowledge</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Review' : 'New Performance Review'}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Employee Name</Label>
                <Input value={form.employee_name} onChange={e => setForm(p => ({ ...p, employee_name: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Review Period (e.g. Q1 2026)</Label>
                <Input value={form.review_period} onChange={e => setForm(p => ({ ...p, review_period: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Overall Rating (1-5)</Label>
                <Select value={String(form.overall_rating)} onValueChange={v => setForm(p => ({ ...p, overall_rating: Number(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n} — {['Poor','Below Average','Average','Good','Excellent'][n-1]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1 block">Goals Met</Label>
                <Select value={form.goals_met} onValueChange={v => setForm(p => ({ ...p, goals_met: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['exceeded', 'met', 'partially_met', 'not_met'].map(g => <SelectItem key={g} value={g} className="capitalize">{g.replace('_', ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {[['strengths', 'Strengths'], ['areas_for_improvement', 'Areas for Improvement'], ['goals_next_period', 'Goals for Next Period'], ['comments', 'Additional Comments']].map(([field, label]) => (
              <div key={field}>
                <Label className="text-xs mb-1 block">{label}</Label>
                <Textarea rows={2} value={form[field] || ''} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={save} className="bg-indigo-600 hover:bg-indigo-700">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}