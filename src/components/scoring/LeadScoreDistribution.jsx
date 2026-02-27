import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Users } from 'lucide-react';

export default function LeadScoreDistribution() {
  const { data: leads = [] } = useQuery({
    queryKey: ['leads-with-scores'],
    queryFn: () => base44.entities.Lead.filter({}),
  });

  // Calculate distribution by score ranges
  const scoreRanges = {
    '0-20': 0,
    '21-40': 0,
    '41-60': 0,
    '61-80': 0,
    '81-100': 0,
  };

  leads.forEach((lead) => {
    const score = lead.score || 0;
    if (score <= 20) scoreRanges['0-20']++;
    else if (score <= 40) scoreRanges['21-40']++;
    else if (score <= 60) scoreRanges['41-60']++;
    else if (score <= 80) scoreRanges['61-80']++;
    else scoreRanges['81-100']++;
  });

  const distributionData = Object.entries(scoreRanges).map(([range, count]) => ({
    range,
    count,
  }));

  // Calculate grade distribution
  const gradeDistribution = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    F: 0,
  };

  leads.forEach((lead) => {
    const grade = lead.score_grade || 'F';
    gradeDistribution[grade]++;
  });

  const gradeData = Object.entries(gradeDistribution).map(([grade, count]) => ({
    name: `Grade ${grade}`,
    value: count,
  }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444'];

  const avgScore = leads.length > 0
    ? (leads.reduce((sum, lead) => sum + (lead.score || 0), 0) / leads.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{leads.length}</h3>
            <p className="text-sm text-gray-600">Total Leads</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{avgScore}</h3>
            <p className="text-sm text-gray-600">Average Score</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{gradeDistribution.A}</h3>
            <p className="text-sm text-gray-600">Grade A Leads</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={distributionData}>
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
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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