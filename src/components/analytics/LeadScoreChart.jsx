import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Target, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function LeadScoreChart({ dateRange }) {
  const { data: leads = [] } = useQuery({
    queryKey: ['leads-for-analytics'],
    queryFn: () => base44.entities.Lead.filter({}),
  });

  // Score distribution
  const scoreRanges = [
    { range: '0-20', min: 0, max: 20, count: 0, color: '#ef4444' },
    { range: '21-40', min: 21, max: 40, count: 0, color: '#f97316' },
    { range: '41-60', min: 41, max: 60, count: 0, color: '#f59e0b' },
    { range: '61-80', min: 61, max: 80, count: 0, color: '#3b82f6' },
    { range: '81-100', min: 81, max: 100, count: 0, color: '#10b981' },
  ];

  leads.forEach((lead) => {
    const score = lead.score || 0;
    const range = scoreRanges.find(r => score >= r.min && score <= r.max);
    if (range) range.count++;
  });

  // Grade distribution
  const gradeData = [
    { name: 'A', value: 0, color: '#10b981' },
    { name: 'B', value: 0, color: '#3b82f6' },
    { name: 'C', value: 0, color: '#f59e0b' },
    { name: 'D', value: 0, color: '#f97316' },
    { name: 'F', value: 0, color: '#ef4444' },
  ];

  leads.forEach((lead) => {
    const grade = lead.score_grade;
    const gradeItem = gradeData.find(g => g.name === grade);
    if (gradeItem) gradeItem.value++;
  });

  const avgScore = leads.length > 0
    ? (leads.reduce((sum, lead) => sum + (lead.score || 0), 0) / leads.length).toFixed(1)
    : 0;

  const highQualityLeads = leads.filter(lead => (lead.score || 0) >= 70).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-2">
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{avgScore}</h3>
            <p className="text-sm text-gray-600">Average Lead Score</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{highQualityLeads}</h3>
            <p className="text-sm text-gray-600">High-Quality Leads (70+)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Lead Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreRanges}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="range" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                  {scoreRanges.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Lead Grade Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gradeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {gradeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}