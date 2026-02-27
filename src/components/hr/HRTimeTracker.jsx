import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { differenceInMinutes, format } from 'date-fns';
import { BarChart2, Clock, Play, Plus, Square, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';

const empty = { employee_name: '', employee_email: '', type: 'clock_in_out', project_name: '', task_description: '', date: format(new Date(), 'yyyy-MM-dd'), clock_in: '', clock_out: '', notes: '' };

function formatMinutes(mins) {
  if (!mins) return '0h 0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export default function HRTimeTracker() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('clockInOut');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [clockedIn, setClockedIn] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [employeeName, setEmployeeName] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [projectEntry, setProjectEntry] = useState({ employee_name: '', project_name: '', task_description: '', date: format(new Date(), 'yyyy-MM-dd'), clock_in: '', clock_out: '' });

  // Live timer
  useEffect(() => {
    if (!clockedIn) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(clockedIn.clock_in).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [clockedIn]);

  const { data: entries = [] } = useQuery({
    queryKey: ['time_entries'],
    queryFn: () => base44.entities.TimeEntry.list('-created_date', 200),
  });

  const createMutation = useMutation({
    mutationFn: (d) => base44.entities.TimeEntry.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['time_entries'] }); setShowForm(false); setForm(empty); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TimeEntry.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['time_entries'] }),
  });

  const handleClockIn = async () => {
    const now = new Date().toISOString();
    const entry = await base44.entities.TimeEntry.create({
      employee_name: employeeName,
      employee_email: employeeEmail,
      type: 'clock_in_out',
      date: format(new Date(), 'yyyy-MM-dd'),
      clock_in: now,
      status: 'active',
    });
    setClockedIn(entry);
    setElapsed(0);
    qc.invalidateQueries({ queryKey: ['time_entries'] });
  };

  const handleClockOut = async () => {
    if (!clockedIn) return;
    const now = new Date().toISOString();
    const duration = differenceInMinutes(new Date(now), new Date(clockedIn.clock_in));
    await updateMutation.mutateAsync({ id: clockedIn.id, data: { clock_out: now, duration_minutes: duration, status: 'completed' } });
    setClockedIn(null);
    setElapsed(0);
  };

  const logProject = () => {
    const d = projectEntry;
    if (!d.clock_in || !d.clock_out) return;
    const duration = differenceInMinutes(new Date(d.clock_out), new Date(d.clock_in));
    createMutation.mutate({ ...d, type: 'project', duration_minutes: duration, status: 'completed', employee_id: d.employee_name });
    setProjectEntry({ employee_name: '', project_name: '', task_description: '', date: format(new Date(), 'yyyy-MM-dd'), clock_in: '', clock_out: '' });
  };

  const clockEntries = entries.filter(e => e.type === 'clock_in_out');
  const projectEntries = entries.filter(e => e.type === 'project');

  const totalToday = entries.filter(e => e.date === format(new Date(), 'yyyy-MM-dd')).reduce((s, e) => s + (e.duration_minutes || 0), 0);

  const formatElapsed = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <Card className="bg-indigo-50 border-indigo-200">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-8 h-8 text-indigo-600" />
            <div><p className="text-sm text-indigo-600">Total Today</p><p className="text-xl font-bold text-indigo-900">{formatMinutes(totalToday)}</p></div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 flex items-center gap-3">
            <Timer className="w-8 h-8 text-green-600" />
            <div><p className="text-sm text-green-600">Active Sessions</p><p className="text-xl font-bold text-green-900">{entries.filter(e => e.status === 'active').length}</p></div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 flex items-center gap-3">
            <BarChart2 className="w-8 h-8 text-purple-600" />
            <div><p className="text-sm text-purple-600">This Week</p><p className="text-xl font-bold text-purple-900">{formatMinutes(entries.slice(0, 50).reduce((s, e) => s + (e.duration_minutes || 0), 0))}</p></div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-white border">
          <TabsTrigger value="clockInOut">🕐 Clock In/Out</TabsTrigger>
          <TabsTrigger value="project">📁 Project Time</TabsTrigger>
          <TabsTrigger value="timesheets">📋 Timesheets</TabsTrigger>
        </TabsList>

        <TabsContent value="clockInOut" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Clock In / Out</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Your Name</Label><Input value={employeeName} onChange={e => setEmployeeName(e.target.value)} placeholder="Full name" /></div>
                <div className="space-y-1"><Label>Your Email</Label><Input value={employeeEmail} onChange={e => setEmployeeEmail(e.target.value)} placeholder="Email" /></div>
              </div>
              {clockedIn ? (
                <div className="flex flex-col items-center gap-4 py-6">
                  <div className="text-4xl font-mono font-bold text-indigo-700">{formatElapsed(elapsed)}</div>
                  <p className="text-sm text-gray-500">Clocked in since {format(new Date(clockedIn.clock_in), 'h:mm a')}</p>
                  <Button onClick={handleClockOut} className="bg-red-600 hover:bg-red-700 gap-2 text-lg px-8 py-4">
                    <Square className="w-5 h-5" />Clock Out
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center py-6">
                  <Button onClick={handleClockIn} disabled={!employeeName} className="bg-green-600 hover:bg-green-700 gap-2 text-lg px-8 py-4">
                    <Play className="w-5 h-5" />Clock In
                  </Button>
                  <p className="text-sm text-gray-400 mt-2">Current time: {format(new Date(), 'h:mm a')}</p>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700">Recent Clock Entries</h3>
            {clockEntries.slice(0, 10).map(e => (
              <div key={e.id} className="flex items-center justify-between p-3 bg-white rounded-lg border text-sm">
                <div>
                  <span className="font-medium">{e.employee_name}</span>
                  <span className="text-gray-400 ml-2">{e.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  {e.clock_in && <span className="text-green-600">In: {format(new Date(e.clock_in), 'h:mm a')}</span>}
                  {e.clock_out && <span className="text-red-600">Out: {format(new Date(e.clock_out), 'h:mm a')}</span>}
                  {e.duration_minutes && <Badge variant="outline">{formatMinutes(e.duration_minutes)}</Badge>}
                  {e.status === 'active' && <Badge className="bg-green-100 text-green-700">Active</Badge>}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="project" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Log Project Time</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Employee Name</Label><Input value={projectEntry.employee_name} onChange={e => setProjectEntry(p => ({ ...p, employee_name: e.target.value }))} /></div>
                <div className="space-y-1"><Label>Project Name</Label><Input value={projectEntry.project_name} onChange={e => setProjectEntry(p => ({ ...p, project_name: e.target.value }))} /></div>
                <div className="space-y-1"><Label>Task Description</Label><Input value={projectEntry.task_description} onChange={e => setProjectEntry(p => ({ ...p, task_description: e.target.value }))} /></div>
                <div className="space-y-1"><Label>Date</Label><Input type="date" value={projectEntry.date} onChange={e => setProjectEntry(p => ({ ...p, date: e.target.value }))} /></div>
                <div className="space-y-1"><Label>Start Time</Label><Input type="time" value={projectEntry.clock_in} onChange={e => setProjectEntry(p => ({ ...p, clock_in: `${projectEntry.date}T${e.target.value}:00` }))} /></div>
                <div className="space-y-1"><Label>End Time</Label><Input type="time" value={projectEntry.clock_out?.split('T')[1]?.slice(0,5) || ''} onChange={e => setProjectEntry(p => ({ ...p, clock_out: `${projectEntry.date}T${e.target.value}:00` }))} /></div>
              </div>
              <Button onClick={logProject} disabled={createMutation.isPending} className="mt-4 bg-indigo-600 hover:bg-indigo-700 gap-2"><Plus className="w-4 h-4" />Log Time</Button>
            </CardContent>
          </Card>
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700">Project Time Entries</h3>
            {projectEntries.slice(0, 15).map(e => (
              <div key={e.id} className="flex items-center justify-between p-3 bg-white rounded-lg border text-sm">
                <div>
                  <span className="font-medium">{e.employee_name}</span>
                  {e.project_name && <Badge variant="outline" className="ml-2">{e.project_name}</Badge>}
                  {e.task_description && <span className="text-gray-500 ml-2">{e.task_description}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">{e.date}</span>
                  <Badge variant="outline">{formatMinutes(e.duration_minutes)}</Badge>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timesheets" className="mt-4">
          <div className="space-y-2">
            {(() => {
              const byEmployee = entries.reduce((acc, e) => {
                const key = e.employee_name;
                if (!acc[key]) acc[key] = { name: key, total: 0, entries: [] };
                acc[key].total += e.duration_minutes || 0;
                acc[key].entries.push(e);
                return acc;
              }, {});
              return Object.values(byEmployee).map(emp => (
                <Card key={emp.name}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{emp.name}</p>
                      <Badge className="bg-indigo-100 text-indigo-700">{formatMinutes(emp.total)} total</Badge>
                    </div>
                    <p className="text-sm text-gray-500">{emp.entries.length} entries</p>
                  </CardContent>
                </Card>
              ));
            })()}
            {entries.length === 0 && <div className="text-center py-12 text-gray-400">No time entries yet.</div>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}