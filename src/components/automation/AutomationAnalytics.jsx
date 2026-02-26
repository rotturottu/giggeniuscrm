import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, CheckCircle, TrendingUp, XCircle, Clock } from 'lucide-react';

export default function AutomationAnalytics({ automationId }) {
  const { data: logs = [] } = useQuery({
    queryKey: ['automation-logs-analytics', automationId],
    queryFn: () => base44.entities.AutomationLog.filter({ automation_id: automationId }, '-executed_at', 500),
  });

  const { data: automation } = useQuery({
    queryKey: ['automation-single', automationId],
    queryFn: () => base44.entities.CampaignAutomation.filter({ id: automationId }),
    select: data => data[0],
  });

  // Aggregate by node type
  const byNodeType = logs.reduce((acc, log) => {
    const key = log.node_type || 'unknown';
    if (!acc[key]) acc[key] = { name: key.replace(/_/g, ' '), success: 0, failed: 0, total: 0 };
    acc[key].total++;
    if (log.status === 'success') acc[key].success++;
    if (log.status === 'failed') acc[key].failed++;
    return acc;
  }, {});

  const nodeData = Object.values(byNodeType);

  const statusCounts = logs.reduce((acc, l) => { acc[l.status] = (acc[l.status] || 0) + 1; return acc; }, {});
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  const PIE_COLORS = { success: '#22c55e', failed: '#ef4444', skipped: '#f59e0b', waiting: '#3b82f6' };

  const stats = [
    { label: 'Enrolled', value: automation?.enrolled_count || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Completed', value: automation?.completed_count || 0, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Converted', value: automation?.conversion_count || 0, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Failed Nodes', value: statusCounts.failed || 0, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
              <Icon className={`w-5 h-5 ${s.color} mx-auto mb-1`} />
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          );
        })}
      </div>

      {nodeData.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Node Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={nodeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="success" name="Success" fill="#22c55e" radius={[3, 3, 0, 0]} />
              <Bar dataKey="failed" name="Failed" fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {pieData.length > 0 && (
        <div className="flex gap-4 items-center">
          <PieChart width={120} height={120}>
            <Pie data={pieData} cx={55} cy={55} innerRadius={30} outerRadius={55} dataKey="value">
              {pieData.map((entry, i) => (
                <Cell key={i} fill={PIE_COLORS[entry.name] || '#6b7280'} />
              ))}
            </Pie>
          </PieChart>
          <div className="space-y-1.5">
            {pieData.map(entry => (
              <div key={entry.name} className="flex items-center gap-2 text-sm">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[entry.name] || '#6b7280' }} />
                <span className="text-gray-600 capitalize">{entry.name}</span>
                <span className="font-semibold text-gray-800">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {logs.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No execution data yet. Activate this automation to see analytics.</p>
        </div>
      )}
    </div>
  );
}