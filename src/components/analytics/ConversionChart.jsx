import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function ConversionChart({ dateRange }) {
  // Mock data - in production, fetch based on dateRange
  const data = [
    { stage: 'New Lead', count: 520, rate: 100 },
    { stage: 'Contacted', count: 412, rate: 79.2 },
    { stage: 'Qualified', count: 298, rate: 57.3 },
    { stage: 'Proposal', count: 185, rate: 35.6 },
    { stage: 'Negotiation', count: 142, rate: 27.3 },
    { stage: 'Closed Won', count: 128, rate: 24.6 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-green-600" />
          Conversion Funnel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" stroke="#666" />
            <YAxis dataKey="stage" type="category" stroke="#666" width={100} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
              }}
              formatter={(value, name) => {
                if (name === 'count') return [value, 'Leads'];
                return [value + '%', 'Conversion Rate'];
              }}
            />
            <Legend />
            <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]} name="Leads" />
            <Bar dataKey="rate" fill="#10b981" radius={[0, 8, 8, 0]} name="Rate %" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}