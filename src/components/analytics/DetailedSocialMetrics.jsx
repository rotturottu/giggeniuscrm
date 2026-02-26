import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Frown, Meh, MessageSquare, MousePointer, Smile } from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis, YAxis
} from 'recharts';

export default function DetailedSocialMetrics({ dateRange }) {
  // Mock detailed metrics data
  const ctrData = [
    { platform: 'Facebook', ctr: 3.2, clicks: 1240, impressions: 38750 },
    { platform: 'LinkedIn', ctr: 4.8, clicks: 920, impressions: 19167 },
    { platform: 'Instagram', ctr: 2.9, clicks: 1850, impressions: 63793 },
    { platform: 'Google', ctr: 5.1, clicks: 730, impressions: 14314 },
    { platform: 'Threads', ctr: 2.4, clicks: 560, impressions: 23333 },
  ];

  const sentimentData = [
    { name: 'Positive', value: 68, color: '#10b981' },
    { name: 'Neutral', value: 24, color: '#f59e0b' },
    { name: 'Negative', value: 8, color: '#ef4444' },
  ];

  const engagementTrend = [
    { date: 'Week 1', likes: 420, shares: 85, comments: 156 },
    { date: 'Week 2', likes: 580, shares: 112, comments: 203 },
    { date: 'Week 3', likes: 720, shares: 145, comments: 278 },
    { date: 'Week 4', likes: 890, shares: 178, comments: 342 },
  ];

  const avgCTR = (ctrData.reduce((acc, d) => acc + d.ctr, 0) / ctrData.length).toFixed(2);
  const totalClicks = ctrData.reduce((acc, d) => acc + d.clicks, 0);
  const totalImpressions = ctrData.reduce((acc, d) => acc + d.impressions, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 hover:border-blue-300 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-2">
              <MousePointer className="w-8 h-8 text-blue-600" />
              <Badge className="bg-green-100 text-green-700">+12.4%</Badge>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{avgCTR}%</h3>
            <p className="text-sm text-gray-600">Avg Click-Through Rate</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-blue-300 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-2">
              <MessageSquare className="w-8 h-8 text-purple-600" />
              <Badge className="bg-green-100 text-green-700">+18.2%</Badge>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{totalClicks.toLocaleString()}</h3>
            <p className="text-sm text-gray-600">Total Clicks</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-blue-300 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-2">
              <Smile className="w-8 h-8 text-green-600" />
              <Badge className="bg-green-100 text-green-700">+5.3%</Badge>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{sentimentData[0].value}%</h3>
            <p className="text-sm text-gray-600">Positive Sentiment</p>
          </CardContent>
        </Card>
      </div>

      {/* CTR by Platform */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MousePointer className="w-5 h-5 text-blue-600" />
            Click-Through Rate by Platform
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ctrData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="platform" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value, name) => {
                  if (name === 'ctr') return [value + '%', 'CTR'];
                  return [value.toLocaleString(), name];
                }}
              />
              <Legend />
              <Bar dataKey="ctr" fill="#3b82f6" radius={[8, 8, 0, 0]} name="CTR %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smile className="w-5 h-5 text-green-600" />
              Sentiment Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Smile className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">Positive: {sentimentData[0].value}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Meh className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-gray-600">Neutral: {sentimentData[1].value}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Frown className="w-4 h-4 text-red-600" />
                <span className="text-sm text-gray-600">Negative: {sentimentData[2].value}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              Engagement Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementTrend}>
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
                <Line type="monotone" dataKey="likes" stroke="#3b82f6" strokeWidth={2} name="Likes" />
                <Line type="monotone" dataKey="shares" stroke="#ec4899" strokeWidth={2} name="Shares" />
                <Line type="monotone" dataKey="comments" stroke="#8b5cf6" strokeWidth={2} name="Comments" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}