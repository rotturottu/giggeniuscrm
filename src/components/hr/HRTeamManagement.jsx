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
const STAFF_STATUSES = ['active', 'on leave', 'retired'];

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

const activityColor = { approve: 'text-green-600 bg-green-50', create: 'text-blue-600 bg-blue-50', edit: 'text-yellow-600 bg-yellow-50', role: 'text-purple-600 bg-purple-50', export: 'text-gray-600 bg-gray-50', login: 'text-indigo-600 bg-indigo-50' };

export default function HRTeamManagement() {
  const qc = useQueryClient();
  const [rolePermissions, setRolePermissions] = useState(defaultRolePermissions);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('Admin');
  const [tab, setTab] = useState('access');

  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ id: '', name: '', email: '', role: 'Employee' });

  // 1. FETCH DYNAMIC PERSONNEL FROM DATABASE
  const { data: dbEmployees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list('-created_date', 200),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => base44.entities.Department.list(),
  });

  // 2. MUTATION FOR UPDATING STATUS OR DEPARTMENT
  const updateStaffMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Employee.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Personnel record updated');
    }
  });

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
    if (!inviteForm.name) return;
    toast.success(`System access granted to ${inviteForm.name}`);
    setShowInvite(false); 
    setInviteForm({ id: '', name: '', email: '', role: 'Employee' }); 
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

        {/* Staff Access - Dynamically linked to Database */}
        <TabsContent value="access">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle>Staff Access Management</CardTitle>
                  <CardDescription>Live personnel records from your directory database.</CardDescription>
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
                {isLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
                ) : filtered.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white transition-all gap-4 flex-wrap">
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                        {member.first_name ? member.first_name[0] : 'U'}{member.last_name ? member.last_name[0] : ''}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900">{member.first_name} {member.last_name}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1"><Mail className="w-3 h-3" />{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      {/* Department Change Dropdown */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-tight">Department</label>
                        <select
                          value={member.department}
                          onChange={e => updateStaffMutation.mutate({ id: member.id, data: { department: e.target.value } })}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 font-medium min-w-[130px]"
                        >
                          {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                        </select>
                      </div>

                      {/* Status Change Dropdown */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-tight">Status</label>
                        <select
                          value={member.status || 'active'}
                          onChange={e => updateStaffMutation.mutate({ id: member.id, data: { status: e.target.value } })}
                          className={`text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white font-bold capitalize 
                            ${member.status === 'active' ? 'text-green-600' : member.status === 'on leave' ? 'text-orange-500' : 'text-slate-400'}`}
                        >
                          {STAFF_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      <Badge className={`text-[10px] uppercase font-bold border-none ${
                        member.status === 'active' ? 'bg-green-100 text-green-700' : 
                        member.status === 'on leave' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}
                      >
                        {member.status || 'active'}
                      </Badge>
                    </div>
                  </div>
                ))}
                {!isLoading && filtered.length === 0 && <div className="text-center py-10 text-gray-400 italic">No personnel found in records.</div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles & Permissions */}
        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>Configure access levels for each personnel category.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 mb-6 flex-wrap">
                {ROLES.map(r => (
                  <button
                    key={r}
                    onClick={() => setSelectedRole(r)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${selectedRole === r ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                {PERMISSIONS.map(p => {
                  const enabled = (rolePermissions[selectedRole] || []).includes(p.key);
                  return (
                    <div key={p.key} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <Shield className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm text-gray-800 font-medium">{p.label}</span>
                      </div>
                      <button
                        onClick={() => togglePermission(selectedRole, p.key)}
                        className={`w-11 h-6 rounded-full transition-all duration-200 flex items-center px-1 ${enabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
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
              <CardTitle>Calendar Access</CardTitle>
              <CardDescription>Manage shared calendar permissions for personnel.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dbEmployees.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">
                        {member.first_name ? member.first_name[0] : 'U'}
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

        {/* Activity Log (Static Sample) */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Team Activity Log</CardTitle>
              <CardDescription>Historical log of administrative actions across the suite.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-20 text-gray-400 italic">No activity logs recorded for this period.</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Grant System Access Dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-bold text-[#2b2b6c] text-xl">Grant System Access</DialogTitle></DialogHeader>
          <form onSubmit={handleInvite} className="space-y-5 py-2 text-left">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search Employee</Label>
              <Select 
                value={inviteForm.id ? String(inviteForm.id) : undefined} 
                onValueChange={(val) => {
                  const selectedEmp = dbEmployees.find(e => String(e.id) === String(val));
                  setInviteForm(prev => ({ 
                    ...prev, 
                    id: String(val),
                    name: selectedEmp ? `${selectedEmp.first_name} ${selectedEmp.last_name}` : '', 
                    email: selectedEmp?.email || '' 
                  }));
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select existing personnel" /></SelectTrigger>
                <SelectContent>
                  {dbEmployees.map(emp => (
                    <SelectItem key={emp.id} value={String(emp.id)}>{emp.first_name} {emp.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Identity Email</Label>
              <Input value={inviteForm.email} readOnly className="bg-gray-50 text-gray-500 italic" placeholder="Auto-filled" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Permission Level</Label>
              <Select value={inviteForm.role} onValueChange={v => setInviteForm(p => ({ ...p, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-center gap-3 mt-6 pt-4 border-t">
              <Button type="button" variant="outline" className="w-28 font-bold" onClick={() => setShowInvite(false)}>Cancel</Button>
              <Button type="submit" disabled={!inviteForm.name} className="bg-[#9f9cf0] hover:bg-[#8b87e6] text-white font-bold w-36">Grant Access</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}