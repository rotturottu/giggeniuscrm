import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { differenceInMinutes, format, isValid, parseISO } from 'date-fns';
import { BarChart2, Clock, Play, Plus, Square, Timer, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

const empty = { employee_name: '', employee_email: '', type: 'clock_in_out', project_name: '', task_description: '', date: format(new Date(), 'yyyy-MM-dd'), clock_in: '', clock_out: '', notes: '' };

function formatMinutes(mins) {
  if (!mins || isNaN(mins)) return '0h 0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

// SAFE DATE FORMATTING HELPER
// This prevents the "RangeError: Invalid time value" crash
function safeFormat(dateStr, formatStr = 'h:mm a') {
  if (!dateStr) return '---';
  try {
    // parseISO is more robust for SQLite strings than new Date()
    const date = parseISO(dateStr);
    return isValid(date) ? format(date, formatStr) : '---';
  } catch (e) {
    return '---';
  }
}

export default function HRTimeTracker() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('clockInOut');
  const [employeeName, setEmployeeName] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [clockedIn, setClockedIn] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [projectEntry, setProjectEntry] = useState({ employee_name: '', project_name: '', task_description: '', date: format(new Date(), 'yyyy-MM-dd'), clock_in: '', clock_out: '' });

  // Live timer
  useEffect(() => {
    if (!clockedIn || !clockedIn.clock_in) return;
    const interval = setInterval(() => {
      try {
        const start = parseISO(clockedIn.clock_in);
        if (isValid(start)) {
          setElapsed(Math.floor((Date.now() - start.getTime()) / 1000));
        }
      } catch (e) {
        console.error("Timer calculation error", e);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [clockedIn]);

  const { data: entries = [], isLoading, isError } = useQuery({
    queryKey: ['time_entries'],
    queryFn: () => base44.entities.TimeEntry.list('-created_date', 200),
  });

  const createMutation = useMutation({
    mutationFn: (d) => base44.entities.TimeEntry.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['time_entries'] }); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TimeEntry.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['time_entries'] }),
  });

  const handleClockIn = async () => {
    try {
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
    } catch (error) {
      console.error("Clock In Failed:", error);
    }
  };

  const handleClockOut = async () => {
    if (!clockedIn) return;
    try {
      const now = new Date().toISOString();
      const start = parseISO(clockedIn.clock_in);
      const duration = isValid(start) ? differenceInMinutes(new Date(now), start) : 0;
      
      await updateMutation.mutateAsync({ 
        id: clockedIn.id, 
        data: { clock_out: now, duration_minutes: duration, status: 'completed' } 
      });
      setClockedIn(null);
      setElapsed(0);
    } catch (error) {
      console.error("Clock Out Failed:", error);
    }
  };

  const logProject = () => {
    const d = projectEntry;
    if (!d.clock_in || !d.clock_out) return;
    try {
      const duration = differenceInMinutes(new Date(d.clock_out), new Date(d.clock_in));
      createMutation.mutate({ ...d, type: 'project', duration_minutes: duration, status: 'completed', employee_id: d.employee_name });
      setProjectEntry({ employee_name: '', project_name: '', task_description: '', date: format(new Date(), 'yyyy-MM-dd'), clock_in: '', clock_out: '' });
    } catch (e) {
      console.error("Project log error", e);
    }
  };

  const formatElapsed = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const activeSessions = entries.filter(e => e.status === 'active').length;
  const clockEntries = entries.filter(e => e.type === 'clock_in_out');
  const projectEntries = entries.filter(e => e.type === 'project');
  const totalToday = entries.filter(e => e.date === format(new Date(), 'yyyy-MM-dd')).reduce((s, e) => s + (parseInt(e.duration_minutes) || 0), 0);

  if (isError) return (
    <div className="flex flex-col items-center justify-center p-12 bg-red-50 rounded-xl border border-red-100 text-red-600">
      <AlertCircle className="w-12 h-12 mb-4" />
      <h2 className="text-xl font-bold">Connection Error</h2>
      <p className="text-sm">Could not reach the database. Please restart the backend.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <Card className="bg-indigo-50 border-indigo-200">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-8 h-8 text-indigo-600" />
            <div><p className="text-sm text-indigo-600 font-medium">Total Today</p><p className="text-xl font-bold text-indigo-900">{formatMinutes(totalToday)}</p></div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-4 flex items-center gap-3">
            <Timer className="w-8 h-8 text-emerald-600" />
            <div><p className="text-sm text-emerald-600 font-medium">Active Sessions</p><p className="text-xl font-bold text-emerald-900">{activeSessions}</p></div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4 flex items-center gap-3">
            <BarChart2 className="w-8 h-8 text-amber-600" />
            <div><p className="text-sm text-amber-600 font-medium">Entries Logged</p><p className="text-xl font-bold text-amber-900">{entries.length}</p></div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-white border p-1 h-12">
          <TabsTrigger value="clockInOut" className="px-6">🕐 Clock In/Out</TabsTrigger>
          <TabsTrigger value="project" className="px-6">📁 Project Time</TabsTrigger>
          <TabsTrigger value="timesheets" className="px-6">📋 Timesheets</TabsTrigger>
        </TabsList>

        <TabsContent value="clockInOut" className="space-y-4 mt-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader><CardTitle className="text-base font-semibold">Live Punch Clock</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {!clockedIn && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-500">
                  <div className="space-y-1.5"><Label className="text-xs text-slate-500">Full Name</Label><Input value={employeeName} onChange={e => setEmployeeName(e.target.value)} placeholder="Enter your name" className="bg-slate-50" /></div>
                  <div className="space-y-1.5"><Label className="text-xs text-slate-500">Email Address</Label><Input value={employeeEmail} onChange={e => setEmployeeEmail(e.target.value)} placeholder="Enter your email" className="bg-slate-50" /></div>
                </div>
              )}
              
              {clockedIn ? (
                <div className="flex flex-col items-center gap-4 py-8 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                  <div className="text-5xl font-mono font-bold text-indigo-700 tracking-tighter">{formatElapsed(elapsed)}</div>
                  <p className="text-sm text-indigo-500 font-medium bg-white px-4 py-1 rounded-full shadow-sm border border-indigo-50">
                    Clocked in at {safeFormat(clockedIn.clock_in)}
                  </p>
                  <Button onClick={handleClockOut} className="bg-rose-600 hover:bg-rose-700 gap-2 text-lg px-10 py-6 h-auto shadow-lg shadow-rose-100">
                    <Square className="w-5 h-5 fill-current" /> Finish Shift
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center py-8">
                  <Button onClick={handleClockIn} disabled={!employeeName || !employeeEmail} className="bg-emerald-600 hover:bg-emerald-700 gap-3 text-lg px-12 py-6 h-auto shadow-lg shadow-emerald-100 transition-all active:scale-95">
                    <Play className="w-5 h-5 fill-current" /> Start Shift
                  </Button>
                  <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3 h-3" /> Server Time: {format(new Date(), 'h:mm:ss a')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 mt-6">Recent Shift History</h3>
            <div className="grid gap-2">
              {clockEntries.slice(0, 10).map(e => (
                <div key={e.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm text-sm hover:border-indigo-200 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-700">{e.employee_name || 'Unknown User'}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{safeFormat(e.clock_in, 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <span className="text-emerald-500">In: {safeFormat(e.clock_in)}</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-rose-400">Out: {safeFormat(e.clock_out)}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold">
                      {formatMinutes(e.duration_minutes)}
                    </Badge>
                    {e.status === 'active' && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Active</Badge>}
                  </div>
                </div>
              ))}
              {clockEntries.length === 0 && <p className="text-center py-8 text-slate-400 text-sm italic">No shifts recorded yet today.</p>}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="project" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Manual Project Log</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Employee</Label><Input value={projectEntry.employee_name} onChange={e => setProjectEntry(p => ({ ...p, employee_name: e.target.value }))} /></div>
                <div className="space-y-1"><Label>Project</Label><Input value={projectEntry.project_name} onChange={e => setProjectEntry(p => ({ ...p, project_name: e.target.value }))} /></div>
                <div className="space-y-1 md:col-span-2"><Label>Task Description</Label><Input value={projectEntry.task_description} onChange={e => setProjectEntry(p => ({ ...p, task_description: e.target.value }))} /></div>
                <div className="space-y-1"><Label>Date</Label><Input type="date" value={projectEntry.date} onChange={e => setProjectEntry(p => ({ ...p, date: e.target.value }))} /></div>
                <div className="space-y-1"><Label>Duration (approx)</Label>
                  <div className="flex gap-2">
                    <Input type="time" label="Start" value={projectEntry.clock_in ? projectEntry.clock_in.split('T')[1]?.slice(0,5) : ''} onChange={e => setProjectEntry(p => ({ ...p, clock_in: `${projectEntry.date}T${e.target.value}:00` }))} />
                    <Input type="time" label="End" value={projectEntry.clock_out ? projectEntry.clock_out.split('T')[1]?.slice(0,5) : ''} onChange={e => setProjectEntry(p => ({ ...p, clock_out: `${projectEntry.date}T${e.target.value}:00` }))} />
                  </div>
                </div>
              </div>
              <Button onClick={logProject} disabled={createMutation.isPending} className="mt-6 bg-indigo-600 hover:bg-indigo-700 w-full md:w-auto">Submit Log</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timesheets" className="mt-4">
          <div className="grid gap-3">
            {(() => {
              const byEmployee = entries.reduce((acc, e) => {
                const key = e.employee_name || 'Unknown';
                if (!acc[key]) acc[key] = { name: key, total: 0, count: 0 };
                acc[key].total += parseInt(e.duration_minutes) || 0;
                acc[key].count += 1;
                return acc;
              }, {});
              
              const emps = Object.values(byEmployee);
              if (emps.length === 0) return <div className="text-center py-20 text-slate-300">No time data available.</div>;

              return emps.map(emp => (
                <Card key={emp.name} className="border-slate-100 shadow-sm">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800 text-lg leading-none mb-1">{emp.name}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase">{emp.count} total sessions</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-indigo-600 tracking-tighter">{formatMinutes(emp.total)}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Total Tracked Time</p>
                    </div>
                  </CardContent>
                </Card>
              ));
            })()}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}