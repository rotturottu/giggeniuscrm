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
import { Plus, Star, Trash2, User, Target, Award, TrendingUp } from 'lucide-react';
import { useState } from 'react';

const ratingColors = { 5: 'text-green-600', 4: 'text-blue-600', 3: 'text-amber-500', 2: 'text-orange-500', 1: 'text-red-500' };
const statusColors = { draft: 'bg-gray-100 text-gray-600', submitted: 'bg-blue-100 text-blue-700', acknowledged: 'bg-green-100 text-green-700' };

const empty = { 
  employee_name: '', 
  employee_email: '', 
  reviewer_email: '', 
  review_period: '', 
  overall_rating: '3', 
  goals_met: 'met', 
  strengths: '', 
  areas_of_improvement: '', 
  goals_next_period: '', 
  comments: '', 
  status: 'draft' 
};

export default function HRPerformance() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  // 1. Fetch Employees for Dropdown
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list(),
  });

  // 2. Fetch Performance Reviews
  const { data: reviews = [] } = useQuery({
    queryKey: ['performance_reviews'],
    queryFn: () => base44.entities.PerformanceReview.list('-created_date', 100),
  });

  const saveMutation = useMutation({
    mutationFn: (d) => editing 
      ? base44.entities.PerformanceReview.update(editing.id, d) 
      : base44.entities.PerformanceReview.create(d),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['performance_reviews'] }); 
      setShowForm(false); 
      setEditing(null); 
      setForm(empty); 
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PerformanceReview.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['performance_reviews'] }),
  });

  const openEdit = (r) => { 
    setEditing(r); 
    setForm({ ...empty, ...r }); 
    setShowForm(true); 
  };

  const handleEmployeeSelect = (email) => {
    const emp = employees.find(e => e.email === email);
    if (emp) {
      setForm(p => ({ ...p, employee_email: emp.email, employee_name: `${emp.first_name} ${emp.last_name}` }));
    }
  };

  const renderStars = (rating) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'fill-current ' + (ratingColors[rating] || 'text-gray-400') : 'text-gray-200'}`} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Performance Management</h2>
          <p className="text-xs text-gray-500">Track employee evaluations and career growth</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm(empty); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-700 gap-2 shadow-md">
          <Plus className="w-4 h-4" />New Review
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.map(rev => (
          <Card key={rev.id} className="group relative border-gray-100 hover:shadow-lg transition-all cursor-pointer bg-white" onClick={() => openEdit(rev)}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                    {rev.employee_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 leading-none mb-1">{rev.employee_name}</p>
                    <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">{rev.review_period}</p>
                  </div>
                </div>
                <Badge className={`${statusColors[rev.status] || 'bg-gray-100'} border-none shadow-none text-[10px] uppercase font-bold`}>
                  {rev.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mb-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Overall Score</p>
                  {renderStars(rev.overall_rating)}
                </div>
                <div className={`text-2xl font-black ${ratingColors[rev.overall_rating]}`}>
                  {rev.overall_rating}<span className="text-xs text-gray-300 ml-1">/5</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-gray-600">
                  <Target className="w-3 h-3 text-indigo-400" />
                  <span>Goals Status: <strong className="text-gray-800 capitalize">{rev.goals_met?.replace('_', ' ')}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-3 h-3 text-indigo-400" />
                  <span className="truncate">Reviewer: <strong className="text-gray-800">{rev.reviewer_email}</strong></span>
                </div>
              </div>

              <Button 
                variant="ghost" size="icon" 
                className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
                onClick={(e) => { e.stopPropagation(); if(confirm('Delete review?')) deleteMutation.mutate(rev.id); }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-20 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
          <Award className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium italic text-sm">No performance reviews recorded yet.</p>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto text-left">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <DialogTitle className="font-bold text-xl">{editing ? 'Modify Review' : 'Employee Evaluation'}</DialogTitle>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-5 pt-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Employee Name</Label>
              <Select value={form.employee_email} onValueChange={handleEmployeeSelect}>
                <SelectTrigger className="h-11 shadow-sm"><SelectValue placeholder="Select personnel..." /></SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.email}>{emp.first_name} {emp.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Reviewer Email</Label>
              <Input className="h-11" placeholder="manager@company.com" value={form.reviewer_email} onChange={e => setForm(p => ({ ...p, reviewer_email: e.target.value }))} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Review Period</Label>
              <Input className="h-11" placeholder="e.g. Annual 2026" value={form.review_period} onChange={e => setForm(p => ({ ...p, review_period: e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Rating</Label>
                <Select value={String(form.overall_rating)} onValueChange={v => setForm(p => ({ ...p, overall_rating: v }))}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>{[5,4,3,2,1].map(r => <SelectItem key={r} value={String(r)}>{r} Star</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Goals Met</Label>
                <Select value={form.goals_met} onValueChange={v => setForm(p => ({ ...p, goals_met: v }))}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exceeded">Exceeded</SelectItem>
                    <SelectItem value="met">Met</SelectItem>
                    <SelectItem value="partially_met">Partially</SelectItem>
                    <SelectItem value="not_met">Not Met</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Key Strengths</Label>
              <Textarea placeholder="What did they do well?" rows={2} value={form.strengths} onChange={e => setForm(p => ({ ...p, strengths: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Areas for Improvement</Label>
              <Textarea placeholder="Where can they grow?" rows={2} value={form.areas_of_improvement} onChange={e => setForm(p => ({ ...p, areas_of_improvement: e.target.value }))} />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <Button variant="outline" className="h-11 px-6 rounded-xl" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button 
              onClick={() => saveMutation.mutate(form)} 
              disabled={saveMutation.isPending} 
              className="bg-indigo-600 hover:bg-indigo-700 h-11 px-10 rounded-xl shadow-lg shadow-indigo-100"
            >
              {saveMutation.isPending ? 'Syncing...' : 'Save Evaluation'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}