import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const EMPTY = { first_name: '', last_name: '', email: '', phone: '', department: '', job_title: '', employment_type: 'full_time', status: 'active', start_date: '', salary: '', hourly_rate: '', manager_email: '' };

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const data = await base44.entities.Employee.list('-created_date');
    setEmployees(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];

  const filtered = employees.filter(e => {
    const name = `${e.first_name} ${e.last_name}`.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) || e.email?.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === 'all' || e.department === filterDept;
    return matchSearch && matchDept;
  });

  const openCreate = () => { setForm(EMPTY); setEditing(null); setShowForm(true); };
  const openEdit = (emp) => { setForm({ ...emp }); setEditing(emp); setShowForm(true); };

  const save = async () => {
    const data = { ...form, salary: form.salary ? Number(form.salary) : undefined, hourly_rate: form.hourly_rate ? Number(form.hourly_rate) : undefined };
    if (editing) await base44.entities.Employee.update(editing.id, data);
    else await base44.entities.Employee.create(data);
    setShowForm(false);
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this employee?')) return;
    await base44.entities.Employee.delete(id);
    load();
  };

  const statusColor = { active: 'bg-green-100 text-green-800', on_leave: 'bg-amber-100 text-amber-800', terminated: 'bg-red-100 text-red-800' };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search employees..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={filterDept} onValueChange={setFilterDept}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 gap-2"><Plus className="w-4 h-4" />Add Employee</Button>
      </div>

      {loading ? <p className="text-gray-400 text-sm">Loading...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(emp => (
            <Card key={emp.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm flex-shrink-0">
                      {emp.first_name?.[0]}{emp.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{emp.first_name} {emp.last_name}</p>
                      <p className="text-xs text-gray-500">{emp.job_title}</p>
                      <p className="text-xs text-gray-400">{emp.department}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(emp)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => remove(emp.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-gray-400">{emp.email}</p>
                  <Badge className={`text-xs border-0 capitalize ${statusColor[emp.status] || 'bg-gray-100 text-gray-700'}`}>{emp.status?.replace('_', ' ')}</Badge>
                </div>
                <div className="mt-1 flex gap-3 text-xs text-gray-400">
                  <span className="capitalize">{emp.employment_type?.replace('_', ' ')}</span>
                  {emp.start_date && <span>Since {emp.start_date}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <p className="text-gray-400 text-sm col-span-3">No employees found.</p>}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Employee' : 'Add Employee'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {[['first_name', 'First Name'], ['last_name', 'Last Name'], ['email', 'Email'], ['phone', 'Phone'], ['department', 'Department'], ['job_title', 'Job Title'], ['manager_email', 'Manager Email'], ['start_date', 'Start Date'], ['salary', 'Annual Salary ($)'], ['hourly_rate', 'Hourly Rate ($)']].map(([field, label]) => (
              <div key={field} className={field === 'email' || field === 'department' ? 'col-span-2 sm:col-span-1' : ''}>
                <Label className="text-xs mb-1 block">{label}</Label>
                <Input type={field.includes('date') ? 'date' : field === 'salary' || field === 'hourly_rate' ? 'number' : 'text'}
                  value={form[field] || ''} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} />
              </div>
            ))}
            <div>
              <Label className="text-xs mb-1 block">Employment Type</Label>
              <Select value={form.employment_type} onValueChange={v => setForm(p => ({ ...p, employment_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['full_time', 'part_time', 'contractor', 'intern'].map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Status</Label>
              <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['active', 'on_leave', 'terminated'].map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>)}
                </SelectContent>
              </Select>
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