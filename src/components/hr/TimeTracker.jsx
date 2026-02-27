import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, FolderKanban, Play, Plus, Square, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function TimeTracker() {
  const [user, setUser] = useState(null);
  const [clockedIn, setClockedIn] = useState(null); // active TimeEntry
  const [elapsed, setElapsed] = useState(0);
  const [entries, setEntries] = useState([]);
  const [projectForm, setProjectForm] = useState({ project_name: '', task_description: '', duration_minutes: '', date: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const load = async () => {
    const today = new Date().toISOString().split('T')[0];
    const data = await base44.entities.TimeEntry.filter({ date: today });
    setEntries(data);
    const active = data.find(e => e.status === 'active' && e.entry_type === 'clock');
    if (active) {
      setClockedIn(active);
      const start = new Date(active.clock_in).getTime();
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (clockedIn) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [clockedIn]);

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const clockIn = async () => {
    if (!user) return;
    const entry = await base44.entities.TimeEntry.create({
      employee_id: user.id,
      employee_name: user.full_name || user.email,
      employee_email: user.email,
      entry_type: 'clock',
      clock_in: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      status: 'active',
    });
    setClockedIn(entry);
    setElapsed(0);
    load();
  };

  const clockOut = async () => {
    if (!clockedIn) return;
    const now = new Date();
    const start = new Date(clockedIn.clock_in);
    const duration_minutes = Math.round((now - start) / 60000);
    await base44.entities.TimeEntry.update(clockedIn.id, {
      clock_out: now.toISOString(),
      duration_minutes,
      status: 'completed',
    });
    setClockedIn(null);
    setElapsed(0);
    load();
  };

  const logProjectTime = async () => {
    if (!user || !projectForm.project_name) return;
    await base44.entities.TimeEntry.create({
      employee_id: user.id,
      employee_name: user.full_name || user.email,
      employee_email: user.email,
      entry_type: 'project',
      project_name: projectForm.project_name,
      task_description: projectForm.task_description,
      duration_minutes: Number(projectForm.duration_minutes) || 0,
      date: projectForm.date,
      status: 'completed',
    });
    setProjectForm({ project_name: '', task_description: '', duration_minutes: '', date: new Date().toISOString().split('T')[0] });
    load();
  };

  const deleteEntry = async (id) => {
    await base44.entities.TimeEntry.delete(id);
    load();
  };

  const todayClock = entries.filter(e => e.entry_type === 'clock' && e.status === 'completed');
  const todayProjects = entries.filter(e => e.entry_type === 'project');
  const totalMins = entries.filter(e => e.status === 'completed').reduce((s, e) => s + (e.duration_minutes || 0), 0);

  return (
    <div className="space-y-6">
      {/* Clock In/Out Card */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="text-center">
            <p className="text-5xl font-mono font-bold text-indigo-700">{formatTime(elapsed)}</p>
            <p className="text-sm text-gray-500 mt-1">{clockedIn ? 'Currently clocked in' : 'Not clocked in'}</p>
          </div>
          <div className="flex flex-col gap-3 flex-1">
            {!clockedIn ? (
              <Button onClick={clockIn} className="bg-green-600 hover:bg-green-700 gap-2 text-lg h-12">
                <Play className="w-5 h-5" />Clock In
              </Button>
            ) : (
              <Button onClick={clockOut} className="bg-red-600 hover:bg-red-700 gap-2 text-lg h-12">
                <Square className="w-5 h-5" />Clock Out
              </Button>
            )}
            <div className="text-center text-sm text-gray-500">
              Today's total: <strong className="text-indigo-700">{Math.floor(totalMins / 60)}h {totalMins % 60}m</strong>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="clock">
        <TabsList className="bg-white border border-gray-200 p-1 rounded-xl">
          <TabsTrigger value="clock" className="rounded-lg gap-2"><Clock className="w-4 h-4" />Clock Entries</TabsTrigger>
          <TabsTrigger value="project" className="rounded-lg gap-2"><FolderKanban className="w-4 h-4" />Project Time</TabsTrigger>
        </TabsList>

        <TabsContent value="clock" className="mt-4 space-y-3">
          {todayClock.length === 0 && <p className="text-gray-400 text-sm">No clock entries today.</p>}
          {todayClock.map(e => (
            <Card key={e.id} className="border-0 shadow-sm">
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{e.employee_name}</p>
                  <p className="text-xs text-gray-400">{new Date(e.clock_in).toLocaleTimeString()} → {e.clock_out ? new Date(e.clock_out).toLocaleTimeString() : '—'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-indigo-600">{Math.floor((e.duration_minutes || 0) / 60)}h {(e.duration_minutes || 0) % 60}m</span>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => deleteEntry(e.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="project" className="mt-4 space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Log Project Time</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">Project Name *</Label>
                  <Input placeholder="e.g. Website Redesign" value={projectForm.project_name} onChange={e => setProjectForm(p => ({ ...p, project_name: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Date</Label>
                  <Input type="date" value={projectForm.date} onChange={e => setProjectForm(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Task Description</Label>
                  <Input placeholder="What did you work on?" value={projectForm.task_description} onChange={e => setProjectForm(p => ({ ...p, task_description: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Duration (minutes)</Label>
                  <Input type="number" placeholder="e.g. 90" value={projectForm.duration_minutes} onChange={e => setProjectForm(p => ({ ...p, duration_minutes: e.target.value }))} />
                </div>
              </div>
              <Button onClick={logProjectTime} className="bg-indigo-600 hover:bg-indigo-700 gap-2"><Plus className="w-4 h-4" />Log Time</Button>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {todayProjects.length === 0 && <p className="text-gray-400 text-sm">No project time logged today.</p>}
            {todayProjects.map(e => (
              <Card key={e.id} className="border-0 shadow-sm">
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{e.project_name}</p>
                    <p className="text-xs text-gray-400">{e.task_description || 'No description'} · {e.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-indigo-600">{Math.floor((e.duration_minutes || 0) / 60)}h {(e.duration_minutes || 0) % 60}m</span>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => deleteEntry(e.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}