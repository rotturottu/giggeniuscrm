import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    XCircle
} from 'lucide-react';
import { useState } from 'react';

const ROLES = ['Admin', 'HR Manager', 'Manager', 'Employee', 'Viewer'];

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

const sampleMembers = [
  { id: 1, name: 'Alex Rivera', email: 'alex@company.com', role: 'Admin', status: 'active', lastActive: '2 mins ago', avatar: 'AR', calendarAccess: true },
  { id: 2, name: 'Maria Santos', email: 'maria@company.com', role: 'HR Manager', status: 'active', lastActive: '1 hour ago', avatar: 'MS', calendarAccess: true },
  { id: 3, name: 'James Lee', email: 'james@company.com', role: 'Manager', status: 'active', lastActive: 'Yesterday', avatar: 'JL', calendarAccess: false },
  { id: 4, name: 'Sofia Park', email: 'sofia@company.com', role: 'Employee', status: 'inactive', lastActive: '3 days ago', avatar: 'SP', calendarAccess: false },
  { id: 5, name: 'Daniel Cruz', email: 'daniel@company.com', role: 'Viewer', status: 'active', lastActive: '5 mins ago', avatar: 'DC', calendarAccess: false },
];

const activityLog = [
  { id: 1, user: 'Alex Rivera', action: 'Approved leave request for Maria Santos', time: '10 mins ago', type: 'approve' },
  { id: 2, user: 'Maria Santos', action: 'Added new employee: Daniel Cruz', time: '1 hour ago', type: 'create' },
  { id: 3, user: 'James Lee', action: 'Updated payroll record for Q1 2026', time: '3 hours ago', type: 'edit' },
  { id: 4, user: 'Alex Rivera', action: 'Changed role of Sofia Park to Employee', time: 'Yesterday', type: 'role' },
  { id: 5, user: 'Maria Santos', action: 'Exported employee report', time: 'Yesterday', type: 'export' },
  { id: 6, user: 'Daniel Cruz', action: 'Logged in from new device', time: '2 days ago', type: 'login' },
];

const activityColor = { approve: 'text-green-600 bg-green-50', create: 'text-blue-600 bg-blue-50', edit: 'text-yellow-600 bg-yellow-50', role: 'text-purple-600 bg-purple-50', export: 'text-gray-600 bg-gray-50', login: 'text-indigo-600 bg-indigo-50' };

export default function HRTeamManagement() {
  const [members, setMembers] = useState(sampleMembers);
  const [rolePermissions, setRolePermissions] = useState(defaultRolePermissions);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('Admin');
  const [tab, setTab] = useState('access');

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  const togglePermission = (role, perm) => {
    setRolePermissions(prev => {
      const perms = prev[role] || [];
      return {
        ...prev,
        [role]: perms.includes(perm) ? perms.filter(p => p !== perm) : [...perms, perm],
      };
    });
  };

  const toggleCalendar = (id) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, calendarAccess: !m.calendarAccess } : m));
  };

  const toggleStatus = (id) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' } : m));
  };

  const changeRole = (id, role) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role } : m));
  };

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-white border border-gray-200 shadow-sm p-1 rounded-xl">
          <TabsTrigger value="access" className="rounded-lg gap-2"><Users className="w-4 h-4" /> Staff Access</TabsTrigger>
          <TabsTrigger value="roles" className="rounded-lg gap-2"><Shield className="w-4 h-4" /> Roles & Permissions</TabsTrigger>
          <TabsTrigger value="calendar" className="rounded-lg gap-2"><Calendar className="w-4 h-4" /> Calendar Access</TabsTrigger>
          <TabsTrigger value="activity" className="rounded-lg gap-2"><Activity className="w-4 h-4" /> Activity Log</TabsTrigger>
        </TabsList>

        {/* Staff Access */}
        <TabsContent value="access">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle>Staff Access Management</CardTitle>
                  <CardDescription>Manage who has access and their roles in the system.</CardDescription>
                </div>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1">
                  <Plus className="w-4 h-4" /> Invite Member
                </Button>
              </div>
              <div className="relative mt-3">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input className="pl-9" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filtered.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white transition-all gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {member.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1"><Mail className="w-3 h-3" />{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={member.role}
                        onChange={e => changeRole(member.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700"
                      >
                        {ROLES.map(r => <option key={r}>{r}</option>)}
                      </select>
                      <Badge className={`text-xs ${member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {member.status === 'active' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                        {member.status}
                      </Badge>
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{member.lastActive}</span>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toggleStatus(member.id)}>
                        {member.status === 'active' ? <Lock className="w-3.5 h-3.5 text-red-400" /> : <Unlock className="w-3.5 h-3.5 text-green-500" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles & Permissions */}
        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>Configure what each role can access and do in the HR suite.</CardDescription>
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
              <CardTitle>Calendar Access Configuration</CardTitle>
              <CardDescription>Control which team members can view and manage shared calendars (leave, shifts, events).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                        {member.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-400">{member.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">Calendar Access</span>
                      <button
                        onClick={() => toggleCalendar(member.id)}
                        className={`w-11 h-6 rounded-full transition-all duration-200 flex items-center px-1 ${member.calendarAccess ? 'bg-indigo-600' : 'bg-gray-300'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${member.calendarAccess ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
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
              <CardTitle>Team Activity Log</CardTitle>
              <CardDescription>Track all actions performed by team members across the HR suite.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activityLog.map(log => (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${activityColor[log.type]}`}>
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">
                        <span className="font-semibold">{log.user}</span> — {log.action}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" />{log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}