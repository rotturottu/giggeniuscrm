import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, DollarSign, Edit, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

const empty = { name: '', head_email: '', description: '', budget: '' };

export default function HRDepartments() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => base44.entities.Department.list('-created_date', 50),
  });
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list('-created_date', 200),
  });

  const saveMutation = useMutation({
    mutationFn: (d) => editing ? base44.entities.Department.update(editing.id, d) : base44.entities.Department.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['departments'] }); setShowForm(false); setEditing(null); setForm(empty); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Department.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
  });

  const getCount = (name) => employees.filter(e => e.department === name).length;

  const openEdit = (d) => { setEditing(d); setForm({ ...empty, ...d }); setShowForm(true); };
  const openNew = () => { setEditing(null); setForm(empty); setShowForm(true); };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew} className="bg-indigo-600 hover:bg-indigo-700 gap-2"><Plus className="w-4 h-4" />Add Department</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {departments.map(dept => (
          <Card key={dept.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <CardTitle className="text-lg">{dept.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(dept)}><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => deleteMutation.mutate(dept.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              {dept.description && <p>{dept.description}</p>}
              <div className="flex items-center gap-2"><Users className="w-4 h-4" />{getCount(dept.name)} Employees</div>
              {dept.head_email && <div className="flex items-center gap-2">👤 {dept.head_email}</div>}
              {dept.budget && <div className="flex items-center gap-2"><DollarSign className="w-4 h-4" />${Number(dept.budget).toLocaleString()} budget</div>}
            </CardContent>
          </Card>
        ))}
        {departments.length === 0 && <div className="col-span-3 text-center py-12 text-gray-400">No departments yet.</div>}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Edit Department' : 'New Department'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {[['name', 'Department Name'], ['head_email', 'Head Email'], ['description', 'Description'], ['budget', 'Annual Budget']].map(([key, label]) => (
              <div key={key} className="space-y-1">
                <Label>{label}</Label>
                <Input type={key === 'budget' ? 'number' : 'text'} value={form[key] || ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
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