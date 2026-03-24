import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  Calendar,
  CheckCircle,
  Clock,
  Lock,
  Mail,
  Plus,
  Search,
  Shield,
  Unlock,
  Users,
  XCircle,
  Loader2
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const ROLES = ['Admin', 'HR Manager', 'Manager', 'Employee', 'Viewer'];
const EMPLOYMENT_STATUSES = ['active', 'on leave', 'retired'];

const PERMISSIONS = [
  { key: 'view_employees', label: 'View Employees' },
  { key: 'edit_employees', label: 'Edit Employees' },
  { key: 'manage_payroll', label: 'Manage Payroll' },
  { key: 'approve_leave', label: 'Approve Leave' },
  { key: 'view_reports', label: 'View Reports' },
  { key: 'manage_settings', label: 'Manage Settings' },
  { key: 'manage_users', label: 'Manage Users' },
];

const defaultRolePermissions = {
  Admin: ['view_employees','edit_employees','manage_payroll','approve_leave','view_reports','manage_settings','manage_users'],
  'HR Manager': ['view_employees','edit_employees','approve_leave','view_reports'],
  Manager: ['view_employees','approve_leave','view_reports'],
  Employee: ['view_employees'],
  Viewer: ['view_employees','view_reports'],
};

export default function HRTeamManagement() {
  const qc = useQueryClient();
  const [rolePermissions, setRolePermissions] = useState(defaultRolePermissions);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('Admin');
  const [tab, setTab] = useState('access');

  const [showInvite, setShowInvite] = useState(false);
  // Added department state here to match your requested updates
  const [inviteForm, setInviteForm] = useState({ id: '', name: '', email: '', role: 'Employee', department: 'Employee' });

  // 1. Fetch Dynamic Data from Database
  const { data: dbEmployees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list('-created_date', 200),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => base44.entities.Department.list(),
  });

  // 2. Mutation for Updating Employee Records (Status/Department)
  const updateEmployee = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Employee.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee record updated');
    },
    onError: () => toast.error('Update failed')
  });

  // 3. Filtering Logic
  const filtered = dbEmployees.filter(m => {
    const fullName = `${m.first_name} ${m.last_name}`.toLowerCase();
    return fullName.includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
  });

  const togglePermission = (role, perm) => {
    setRolePermissions(prev => {
      const perms = prev[role] || [];
      return {
        ...prev,
        [role]: perms.includes(perm) ? perms.filter(p => p !== perm) : [...perms, perm],
      };
    });
  };

  const handleInvite = (e) => {
    e.preventDefault();
<<<<<<< HEAD
    if (!inviteForm.name) return;
    toast.success(`Access level set for ${inviteForm.name}`);
=======
    if (!inviteForm.name || !inviteForm.email) return;

    const newId = members.length ? Math.max(...members.map(m => m.id)) + 1 : 1;
    const initials = inviteForm.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    const newMember = {
      id: newId,
      name: inviteForm.name,
      email: inviteForm.email,
      role: inviteForm.role,
      department: inviteForm.department,
      status: 'active',
      lastActive: 'Just now',
      avatar: initials,
      calendarAccess: false
    };

    setMembers([newMember, ...members]); 
>>>>>>> 21754aec27b58e28173973fac4cdd157f73ffac1
    setShowInvite(false); 
    setInviteForm({ id: '', name: '', email: '', role: 'Employee', department: 'Employee' }); 
  };

  return (
    <div className="space-y-6 text-left">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-white border border-gray-200 shadow-sm p-1 rounded-xl">
          <TabsTrigger value="access" className="rounded-lg gap-2"><Users className="w-4 h-4" /> Staff Access</TabsTrigger>
          <TabsTrigger value="roles" className="rounded-lg gap-2"><Shield className="w-4 h-4" /> Roles & Permissions</TabsTrigger>
          <TabsTrigger value="calendar" className="rounded-lg gap-2"><Calendar className="w-4 h-4" /> Calendar Access</TabsTrigger>
          <TabsTrigger value="activity" className="rounded-lg gap-2"><Activity className="w-4 h-4" /> Activity Log</TabsTrigger>
        </TabsList>

        {/* Staff Access Tab */}
        <TabsContent value="access">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle>Staff Access Management</CardTitle>
                  <CardDescription>View and manage employment status and department placement for your team.</CardDescription>
                </div>
                <Button onClick={() => setShowInvite(true)} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1 font-bold">
                  <Plus className="w-4 h-4" /> Grant System Access
                </Button>
              </div>
              <div className="relative mt-3">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input className="pl-9" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loadingEmployees ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
                ) : filtered.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white transition-all gap-4 flex-wrap">
                    <div className="flex items-center gap-3 min-w-[220px]">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        {member.first_name[0]}{member.last_name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900">{member.first_name} {member.last_name}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1"><Mail className="w-3 h-3" />{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      {/* Live Department Selection */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Position/Dept</label>
                        <select
                          value={member.department}
                          onChange={e => updateEmployee.mutate({ id: member.id, data: { department: e.target.value } })}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 font-medium min-w-[140px] focus:ring-1 focus:ring-indigo-500 outline-none"
                        >
                          {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                        </select>
                      </div>

                      {/* Live Status Selection */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Status</label>
                        <select
                          value={member.status || 'active'}
                          onChange={e => updateEmployee.mutate({ id: member.id, data: { status: e.target.value } })}
                          className={`text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white font-bold capitalize outline-none 
                            ${member.status === 'active' ? 'text-green-600' : member.status === 'on leave' ? 'text-orange-500' : 'text-slate-400'}`}
                        >
                          {EMPLOYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      <Badge className={`text-[10px] uppercase font-bold border-none px-3 py-1 ${
                        member.status === 'active' ? 'bg-green-100 text-green-700' : 
                        member.status === 'on leave' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}
                      >
                        {member.status || 'active'}
                      </Badge>
                    </div>
                  </div>
                ))}
                {!loadingEmployees && filtered.length === 0 && <div className="text-center py-10 text-gray-500 text-sm italic border-2 border-dashed rounded-xl">No team members matched your search.</div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles & Permissions */}
        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>System Roles</CardTitle>
              <CardDescription>Define access levels for each personnel category.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-6 flex-wrap">
                {ROLES.map(r => (
                  <Button 
                    key={r} 
                    variant={selectedRole === r ? 'default' : 'outline'} 
                    onClick={() => setSelectedRole(r)}
                    className="rounded-full px-6 font-bold"
                  >
                    {r}
                  </Button>
                ))}
              </div>
              <div className="space-y-3">
                {PERMISSIONS.map(p => {
                  const enabled = (rolePermissions[selectedRole] || []).includes(p.key);
                  return (
                    <div key={p.key} className="flex items-center justify-between p-4 rounded-xl border bg-gray-50/50">
                      <span className="text-sm font-semibold text-gray-700">{p.label}</span>
                      <button
                        onClick={() => togglePermission(selectedRole, p.key)}
                        className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${enabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar Access */}
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Shared Calendars</CardTitle>
              <CardDescription>Manage who can see and edit the company schedule.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dbEmployees.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">
                        {member.first_name[0]}{member.last_name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900">{member.first_name} {member.last_name}</p>
                        <p className="text-xs text-gray-400">{member.department}</p>
                      </div>
                    </div>
                    <button className="w-11 h-6 rounded-full bg-gray-300 transition-all flex items-center px-1">
                      <div className="w-4 h-4 bg-white rounded-full shadow translate-x-0" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Log */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>Historical log of administrative actions.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="text-center py-20 text-gray-400 italic font-medium">No activity recorded for this period.</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite/Grant Access Dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="max-w-sm">
<<<<<<< HEAD
          <DialogHeader><DialogTitle className="font-bold text-indigo-900">Grant System Access</DialogTitle></DialogHeader>
          <form onSubmit={handleInvite} className="space-y-4 py-2 text-left">
=======
          <DialogHeader>
            <DialogTitle>Invite New Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInvite} className="space-y-4 py-2">
            
            {/* FIX 1: value is now strictly a string using .toString() */}
>>>>>>> 21754aec27b58e28173973fac4cdd157f73ffac1
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold text-slate-400">Search Employee</Label>
              <Select 
                value={inviteForm.id?.toString()} 
                onValueChange={(selectedId) => {
                  // FIX 2: Compare string-to-string 
                  const selectedEmp = dbEmployees.find(e => e.id.toString() === selectedId);
                  setInviteForm(prev => ({ 
                    ...prev, 
                    id: selectedId,
                    name: selectedEmp ? `${selectedEmp.first_name} ${selectedEmp.last_name}` : '', 
                    email: selectedEmp?.email || '' 
                  }));
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select existing personnel" /></SelectTrigger>
                <SelectContent>
<<<<<<< HEAD
                  {dbEmployees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</SelectItem>
=======
                  {dbEmployees.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">No employees found in database.</div>
                  ) : (
                    dbEmployees.map(emp => (
                      // FIX 3: Assign Item value as a string
                      <SelectItem key={emp.id} value={emp.id.toString()}>
                        {emp.first_name} {emp.last_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Email Address</Label>
              <Input 
                type="email" 
                value={inviteForm.email} 
                readOnly 
                className="bg-gray-50 text-gray-500" 
                placeholder="Auto-filled from selection" 
              />
            </div>

            {/* Added the Department Dropdown */}
            <div className="space-y-1">
              <Label>Assign Department</Label>
              <Select value={inviteForm.department} onValueChange={v => setInviteForm(p => ({ ...p, department: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Employee">Employee</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Assign Role</Label>
              <Select value={inviteForm.role} onValueChange={v => setInviteForm(p => ({ ...p, role: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
>>>>>>> 21754aec27b58e28173973fac4cdd157f73ffac1
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold text-slate-400">Identity Email</Label>
              <Input value={inviteForm.email} readOnly className="bg-gray-50 text-gray-500 italic" placeholder="Auto-populated" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold text-slate-400">Permission Level</Label>
              <Select value={inviteForm.role} onValueChange={v => setInviteForm(p => ({ ...p, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setShowInvite(false)} className="font-bold">Cancel</Button>
              <Button type="submit" disabled={!inviteForm.name} className="bg-indigo-600 font-bold px-6">Invite Member</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}