import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Circle, Loader, Plus, AlertCircle, Search, Filter, User } from 'lucide-react';
import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';

const categoryColors = {
  paperwork: 'bg-blue-100 text-blue-700',
  equipment: 'bg-purple-100 text-purple-700',
  training: 'bg-green-100 text-green-700',
  access: 'bg-orange-100 text-orange-700',
  introduction: 'bg-pink-100 text-pink-700',
  other: 'bg-gray-100 text-gray-700',
};

const empty = { employee_name: '', task_name: '', category: 'other', assigned_to: '', due_date: '', status: 'pending', notes: '' };

const defaultTasks = [
  { task_name: 'Sign employment contract', category: 'paperwork' },
  { task_name: 'Set up company email', category: 'access' },
  { task_name: 'Configure laptop/equipment', category: 'equipment' },
  { task_name: 'Complete HR orientation', category: 'training' },
  { task_name: 'Meet the team', category: 'introduction' },
  { task_name: 'Review company policies', category: 'paperwork' },
];

export default function HROnboarding() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  
  // Search states for the Custom Task Dialog
  const [empSearch, setEmpSearch] = useState('');
  const [showResults, setShowResults] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [newEmployeeDept, setNewEmployeeDept] = useState('');
  const [showBulk, setShowBulk] = useState(false);
  const [error, setError] = useState('');

  // Fetch real departments
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => base44.entities.Department.list(),
  });

  // Fetch All Employees for the Search Dropdown
  const { data: allEmployees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list(),
  });

  // Fetch Onboarding Tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ['onboarding_tasks'],
    queryFn: () => base44.entities.OnboardingTask.list('-created_date', 200),
  });

  // Filter employees for the custom task search
  const filteredEmployees = useMemo(() => {
    if (!empSearch) return [];
    return allEmployees.filter(emp => 
      `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(empSearch.toLowerCase()) ||
      emp.email.toLowerCase().includes(empSearch.toLowerCase())
    ).slice(0, 10); // Limit results for performance
  }, [empSearch, allEmployees]);

  const saveMutation = useMutation({
    mutationFn: (d) => base44.entities.OnboardingTask.create({ ...d, employee_id: d.employee_name }),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['onboarding_tasks'] }); 
      setShowForm(false);
      setForm(empty); 
      setEmpSearch('');
      toast.success('Manual task added successfully!');
    },
  });

  const bulkCreateMutation = useMutation({
    mutationFn: async ({ fName, lName, email, dept }) => {
      const fullName = `${fName} ${lName}`;
      await base44.entities.Employee.create({
        first_name: fName,
        last_name: lName,
        email: email,
        department: dept
      });

      const promises = defaultTasks.map(t => 
        base44.entities.OnboardingTask.create({ 
          ...t, 
          employee_name: fullName, 
          employee_id: email, 
          status: 'pending',
          department: dept 
        })
      );
      return Promise.all(promises);
    },
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['onboarding_tasks'] }); 
      qc.invalidateQueries({ queryKey: ['employees'] }); 
      setShowBulk(false); 
      setFirstName(''); setLastName(''); setEmployeeEmail(''); setNewEmployeeDept(''); setError('');
      toast.success('Onboarding sequence started!');
    },
    onError: (err) => {
      const serverMsg = err.response?.data?.error || err.message;
      setError(`Onboarding Failed: ${serverMsg}`);
    }
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.OnboardingTask.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['onboarding_tasks'] }),
  });

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.task_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'all' || t.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const grouped = filteredTasks.reduce((acc, t) => {
    if (!acc[t.employee_name]) acc[t.employee_name] = [];
    acc[t.employee_name].push(t);
    return acc;
  }, {});

  const statusIcon = (status) => ({
    completed: <CheckCircle className="w-4 h-4 text-green-500" />,
    in_progress: <Loader className="w-4 h-4 text-blue-500 animate-spin" />,
    pending: <Circle className="w-4 h-4 text-gray-400" />,
  }[status] || <Circle className="w-4 h-4 text-gray-400" />);

  const handleBulkSubmit = () => {
    if (!firstName.trim() || !lastName.trim() || !employeeEmail.trim() || !newEmployeeDept) {
      setError('Required Information Missing: Please complete all fields.');
      return;
    }
    setError('');
    bulkCreateMutation.mutate({ fName: firstName, lName: lastName, email: employeeEmail, dept: newEmployeeDept });
  };

  return (
    <div className="space-y-4 text-left">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col md:flex-row gap-3 items-end justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex flex-1 gap-3 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search personnel or tasks..." 
              className="pl-9 h-10 border-gray-200" 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-[180px] h-10 border-gray-200">
              <Filter className="w-3 h-3 mr-2 text-gray-400" />
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setError(''); setShowBulk(true); }} className="h-10 font-bold text-indigo-600">🚀 Onboard New</Button>
          <Button onClick={() => { setForm(empty); setEmpSearch(''); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-700 h-10 font-bold gap-2">
            <Plus className="w-4 h-4" />Task
          </Button>
        </div>
      </div>

      {/* RENDER LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Object.entries(grouped).map(([name, empTasks]) => {
          const done = empTasks.filter(t => t.status === 'completed').length;
          const pct = Math.round((done / empTasks.length) * 100);
          return (
            <Card key={name} className="border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <CardHeader className="pb-2 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <CardTitle className="text-base font-bold text-gray-800">{name}</CardTitle>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{empTasks[0]?.department || 'General'}</p>
                  </div>
                  <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded-md border">{done}/{empTasks.length} Done</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </CardHeader>
              <CardContent className="space-y-1 p-4 flex-1">
                {empTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <button onClick={() => updateStatus.mutate({ id: task.id, status: task.status === 'completed' ? 'pending' : 'completed' })}>
                      {statusIcon(task.status)}
                    </button>
                    <span className={`flex-1 text-sm ${task.status === 'completed' ? 'line-through text-gray-300' : 'text-gray-600 font-medium'}`}>{task.task_name}</span>
                    <Badge className={`${categoryColors[task.category] || 'bg-gray-100'} border-none text-[10px] uppercase font-bold px-2`} >{task.category}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Onboard Dialog */}
      <Dialog open={showBulk} onOpenChange={setShowBulk}>
        <DialogContent className="max-w-md text-left">
          <DialogHeader><DialogTitle className="font-bold text-xl text-indigo-900">Onboard New Personnel</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-slate-400">First Name</Label>
                <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" className="h-10" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-slate-400">Last Name</Label>
                <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" className="h-10" />
              </div>
            </div>
            <div className="space-y-1 text-left">
              <Label className="text-[10px] uppercase font-bold text-slate-400">Email Address</Label>
              <Input value={employeeEmail} onChange={e => setEmployeeEmail(e.target.value)} placeholder="email@company.com" className="h-10" />
            </div>
            <div className="space-y-1 text-left">
              <Label className="text-[10px] uppercase font-bold text-slate-400">Department</Label>
              <Select value={newEmployeeDept} onValueChange={setNewEmployeeDept}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Choose a department..." /></SelectTrigger>
                <SelectContent>
                  {departments.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {error && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100"><AlertCircle className="w-4 h-4 mr-2 inline" /> {error}</div>}
          </div>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowBulk(false)} className="h-10 font-bold">Cancel</Button>
            <Button onClick={handleBulkSubmit} disabled={bulkCreateMutation.isPending} className="bg-indigo-600 h-10 px-8 font-bold text-white">Start Onboarding</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* SEARCHABLE Add Custom Task Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if(!open) setShowResults(false); }}>
        <DialogContent className="max-w-md text-left overflow-visible">
          <DialogHeader><DialogTitle className="font-bold text-indigo-900">Add Custom Task</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-4 relative">
            
            {/* Searchable Employee Field */}
            <div className="space-y-1 text-left relative">
              <Label className="text-[10px] uppercase font-bold text-slate-400">Employee Personnel</Label>
              <div className="relative">
                <Input 
                  value={empSearch} 
                  onFocus={() => setShowResults(true)}
                  onChange={e => {
                    setEmpSearch(e.target.value);
                    setForm(p => ({ ...p, employee_name: e.target.value }));
                    setShowResults(true);
                  }} 
                  placeholder="Type name or email..." 
                  className="h-10 pr-10"
                />
                <User className="absolute right-3 top-3 w-4 h-4 text-slate-300" />
                
                {/* Search Dropdown Results */}
                {showResults && filteredEmployees.length > 0 && (
                  <div className="absolute z-[100] w-full mt-1 bg-white border rounded-md shadow-xl max-h-[160px] overflow-y-auto border-indigo-100 animate-in fade-in zoom-in-95">
                    {filteredEmployees.map(emp => (
                      <button
                        key={emp.id}
                        className="w-full text-left px-4 py-3 hover:bg-indigo-50 border-b last:border-0 transition-colors flex flex-col"
                        onClick={() => {
                          setForm(p => ({ ...p, employee_name: emp.email }));
                          setEmpSearch(`${emp.first_name} ${emp.last_name}`);
                          setShowResults(false);
                        }}
                      >
                        <span className="text-sm font-bold text-slate-700">{emp.first_name} {emp.last_name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{emp.email}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-[9px] text-slate-400 mt-1 italic font-medium">* Task will be linked via email.</p>
            </div>

            <div className="space-y-1 text-left">
              <Label className="text-[10px] uppercase font-bold text-slate-400">Task Details</Label>
              <Input value={form.task_name} onChange={e => setForm(p => ({ ...p, task_name: e.target.value }))} placeholder="e.g. Schedule safety training" />
            </div>

            <div className="space-y-1 text-left">
              <Label className="text-[10px] uppercase font-bold text-slate-400">Category</Label>
              <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(categoryColors).map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button 
              onClick={() => saveMutation.mutate(form)} 
              disabled={saveMutation.isPending || !form.employee_name || !form.task_name} 
              className="bg-indigo-600 font-bold px-8"
            >
              {saveMutation.isPending ? 'Saving...' : 'Save Task'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}