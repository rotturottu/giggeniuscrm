import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Calendar, Clock, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function HROverview() {
  const [stats, setStats] = useState({ employees: 0, onLeave: 0, openRequests: 0, totalHoursToday: 0 });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [employees, leaves, timeEntries] = await Promise.all([
        base44.entities.Employee.list(),
        base44.entities.LeaveRequest.list('-created_date', 5),
        base44.entities.TimeEntry.filter({ date: new Date().toISOString().split('T')[0] }),
      ]);
      const active = employees.filter(e => e.status === 'active').length;
      const onLeave = employees.filter(e => e.status === 'on_leave').length;
      const openRequests = leaves.filter(l => l.status === 'pending').length;
      const totalMins = timeEntries.reduce((sum, t) => sum + (t.duration_minutes || 0), 0);
      setStats({ employees: active, onLeave, openRequests, totalHoursToday: Math.round(totalMins / 60) });
      setRecentLeaves(leaves.slice(0, 5));
      setLoading(false);
    }
    load();
  }, []);

  const statCards = [
    { label: 'Active Employees', value: stats.employees, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'On Leave', value: stats.onLeave, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Pending Requests', value: stats.openRequests, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Hours Logged Today', value: stats.totalHoursToday, icon: Clock, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const leaveStatusColor = { pending: 'bg-yellow-100 text-yellow-800', approved: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800', cancelled: 'bg-gray-100 text-gray-800' };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`${s.bg} p-3 rounded-xl`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{loading ? '—' : s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-base">Recent Leave Requests</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : recentLeaves.length === 0 ? (
            <p className="text-sm text-gray-400">No leave requests yet.</p>
          ) : (
            <div className="space-y-3">
              {recentLeaves.map(l => (
                <div key={l.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium text-sm text-gray-800">{l.employee_name}</p>
                    <p className="text-xs text-gray-500 capitalize">{l.leave_type.replace('_', ' ')} · {l.start_date} – {l.end_date}</p>
                  </div>
                  <Badge className={`text-xs border-0 ${leaveStatusColor[l.status]}`}>{l.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}