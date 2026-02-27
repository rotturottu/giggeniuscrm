import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const EMPTY = { name: '', head_email: '', description: '', budget: '' };

export default function DepartmentsModule() {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [depts, emps] = await Promise.all([
      base44.entities.Department.list(),
      base44.entities.Employee.list(),
    ]);
    setDepartments(depts);
    setEmployees(emps);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const getCount = (deptName) => employees.filter(e => e.department === deptName && e.status === 'active').length;

  const openCreate = () => { setForm(EMPTY); setEditing(null); setShowForm(true); };
  const openEdit = (d) => { setForm({ ...d }); setEditing(d); setShowForm(true); };

  const save = async () => {
    const data = { ...form, budget: form.budget ? Number(form.budget) : undefined };
    if (editing) await base44.entities.Department.update(editing.id, data);
    else await base44.entities.Department.create(data);
    setShowForm(false);
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete department?')) return;
    await base44.entities.Department.delete(id);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Plus className="w-4 h-4" />Add Department
        </Button>
      </div>

      {loading ? <p className="text-gray-400 text-sm">Loading...</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.length === 0 && <p className="text-gray-400 text-sm col-span-3">No departments yet.</p>}
          {departments.map(dept => (
            <Card key={dept.id} className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <Building2 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{dept.name}</p>
                      <p className="text-xs text-gray-500">{getCount(dept.name)} active employees</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(dept)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => remove(dept.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
                {dept.head_email && <p className="text-xs text-gray-400 mt-2">Head: {dept.head_email}</p>}
                {dept.budget && <p className="text-xs text-gray-400">Budget: ${Number(dept.budget).toLocaleString()}</p>}
                {dept.description && <p className="text-xs text-gray-500 mt-1">{dept.description}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Edit Department' : 'Add Department'}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            {[['name', 'Department Name'], ['head_email', 'Department Head Email'], ['budget', 'Annual Budget ($)']].map(([field, label]) => (
              <div key={field}>
                <Label className="text-xs mb-1 block">{label}</Label>
                <Input type={field === 'budget' ? 'number' : 'text'} value={form[field] || ''} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} />
              </div>
            ))}
            <div>
              <Label className="text-xs mb-1 block">Description</Label>
              <Input value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
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