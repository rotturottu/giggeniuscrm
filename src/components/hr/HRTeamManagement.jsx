import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarWidget } from '@/components/ui/calendar'; // Ensure you have this shadcn component
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
  Loader2,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ROLES = ['Admin', 'HR Manager', 'Manager', 'Employee', 'Viewer'];
const STAFF_STATUSES = ['active', 'on leave', 'retired'];
const activityColor = { role: 'text-purple-600 bg-purple-50', status: 'text-blue-600 bg-blue-50', dept: 'text-orange-600 bg-orange-50' };

export default function HRTeamManagement() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('access');
  const [date, setDate] = useState(new Date());
  const [showInvite, setShowInvite] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ id: '', name: '', email: '', role: 'Employee' });

  // 1. FETCH DATA
  const { data: dbEmployees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list('-created_date', 200),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => base44.entities.Department.list(),
  });

  const { data: activityLogs = [] } = useQuery({
    queryKey: ['activity_logs'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 50),
  });

  // 2. MUTATIONS
  const updateStaffMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Employee.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Personnel record updated');
    }
  });

  const grantAccessMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.Employee.update(data.id, { role: data.role, has_access: true });
      return base44.entities.ActivityLog.create({
        action: 'System Access Granted',
        details: `Granted ${data.role} permissions to ${data.name}`,
        category: 'role',
        target_id: data.id,
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      qc.invalidateQueries({ queryKey: ['activity_logs'] });
      setConfirmOpen(false);
      setShowInvite(false);
      setInviteForm({ id: '', name: '', email: '', role: 'Employee' });
      toast.success('Access granted and activity logged!');
    }
  });

  const filtered = dbEmployees.filter(m => {
    const fullName = `${m.first_name} ${m.last_name}`.toLowerCase();
    return fullName.includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
  });

  const handlePreInvite = (e) => {
    e.preventDefault();
    if (!inviteForm.name) return;
    setConfirmOpen(true);
  };

  const handleFinalConfirm = () => {
    grantAccessMutation.mutate(inviteForm);
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles & Permissions Tab - RESTORED */}
        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Personnel Roles & Permission Levels</CardTitle>
              <CardDescription>Review the access hierarchy and current roles for all employed personnel.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dbEmployees.map(emp => (
                  <div key={emp.id} className="flex items-center justify-between p-4 rounded-xl border bg-slate-50/50 hover:bg-white transition-all border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-800">{emp.first_name} {emp.last_name}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{emp.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Current Role</p>
                        <Badge variant="outline" className="bg-white border-indigo-100 text-indigo-600 font-bold text-xs uppercase px-3">
                           {emp.role || 'No Access'}
                        </Badge>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Status</p>
                        <p className={`text-xs font-black capitalize ${emp.status === 'active' ? 'text-green-500' : 'text-slate-400'}`}>
                          {emp.status || 'active'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar Access Tab - RESTORED */}
        <TabsContent value="calendar">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Schedule Overview</CardTitle>
                  <CardDescription>Select a date to manage shifts.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <CalendarWidget
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border shadow-sm bg-white"
                  />
                </CardContent>
              </Card>
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-500" /> 
                    Timeline: {format(date, 'MMMM d, yyyy')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="space-y-4">
                      {dbEmployees.slice(0, 4).map(emp => (
                        <div key={emp.id} className="flex items-center justify-between p-3 border-l-4 border-indigo-400 bg-slate-50 rounded-r-lg">
                           <div>
                              <p className="text-sm font-bold">{emp.first_name} {emp.last_name}</p>
                              <p className="text-[10px] text-gray-500 uppercase tracking-widest">{emp.department}</p>
                           </div>
                           <Badge className="bg-white text-indigo-600 border-indigo-100">8:00 AM - 5:00 PM</Badge>
                        </div>
                      ))}
                      <p className="text-center text-xs text-slate-400 italic pt-4">Attendance and shift management is synchronized with local time.</p>
                   </div>
                </CardContent>
              </Card>
           </div>
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Team Activity Log</CardTitle>
              <CardDescription>Historical record of access grants and administrative changes.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLogs.length > 0 ? (
                  activityLogs.map(log => (
                    <div key={log.id} className="flex items-start gap-4 p-3 rounded-lg border border-gray-100 bg-white shadow-sm">
                      <div className={`p-2 rounded-lg ${activityColor[log.category] || 'bg-gray-100 text-gray-600'}`}>
                        <Activity className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-bold text-gray-900">{log.action}</p>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            {log.created_date ? format(new Date(log.created_date), 'MMM d, h:mm a') : 'Recently'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 font-medium">{log.details}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 text-gray-400 italic font-medium">No activity logs recorded yet.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODAL 1: GRANT ACCESS FORM */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-bold text-[#2b2b6c] text-xl">Grant System Access</DialogTitle></DialogHeader>
          <form onSubmit={handlePreInvite} className="space-y-5 py-2 text-left">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search Employee</Label>
              <Select 
                value={inviteForm.id} 
                onValueChange={(val) => {
                  const selectedEmp = dbEmployees.find(e => String(e.id) === String(val));
                  setInviteForm(prev => ({ 
                    ...prev, id: val, 
                    name: selectedEmp ? `${selectedEmp.first_name} ${selectedEmp.last_name}` : '', 
                    email: selectedEmp?.email || '' 
                  }));
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select personnel" /></SelectTrigger>
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
                <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex justify-center gap-3 mt-6 pt-4 border-t">
              <Button type="button" variant="outline" className="w-28 font-bold" onClick={() => setShowInvite(false)}>Cancel</Button>
              <Button type="submit" disabled={!inviteForm.name} className="bg-[#9f9cf0] hover:bg-[#8b87e6] text-white font-bold w-36">Grant Access</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: FINAL CONFIRMATION POPUP */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md text-center">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="p-3 bg-amber-50 rounded-full">
              <AlertTriangle className="w-10 h-10 text-amber-500" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-xl font-bold">Is this decision final?</DialogTitle>
              <p className="text-sm text-gray-500">
                You are about to grant <span className="font-bold text-indigo-600">{inviteForm.role}</span> access to 
                <span className="font-bold text-gray-900"> {inviteForm.name}</span>. This will allow them to view and manage company data.
              </p>
            </div>
          </div>
          <DialogFooter className="flex justify-center sm:justify-center gap-3 border-t pt-4">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} className="w-32">Wait, Go Back</Button>
            <Button 
                onClick={handleFinalConfirm} 
                disabled={grantAccessMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white w-32 font-bold"
            >
              {grantAccessMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Confirm Access"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}