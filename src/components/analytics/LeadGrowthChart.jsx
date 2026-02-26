import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function LeadGrowthChart({ dateRange }) {
  // Mock data - in production, fetch based on dateRange
  const data = [
    { date: 'Jan 1', leads: 120, converted: 28 },
    { date: 'Jan 8', leads: 185, converted: 42 },
    { date: 'Jan 15', leads: 240, converted: 58 },
    { date: 'Jan 22', leads: 310, converted: 72 },
    { date: 'Jan 29', leads: 380, converted: 95 },
    { date: 'Feb 5', leads: 450, converted: 110 },
    { date: 'Feb 12', leads: 520, converted: 128 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Lead Growth Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="leads"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 4 }}
              name="Total Leads"
            />
            <Line
              type="monotone"
              dataKey="converted"
              stroke="#ec4899"
              strokeWidth={3}
              dot={{ fill: '#ec4899', r: 4 }}
              name="Converted Leads"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}