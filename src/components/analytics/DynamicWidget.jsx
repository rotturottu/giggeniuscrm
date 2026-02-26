import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis, YAxis
} from 'recharts';

// Mock data generators for different metrics
const getDataForMetric = (metric) => {
  const generators = {
    lead_growth: [
      { date: 'Week 1', value: 120 },
      { date: 'Week 2', value: 185 },
      { date: 'Week 3', value: 240 },
      { date: 'Week 4', value: 310 },
    ],
    conversion_rate: [
      { date: 'Week 1', rate: 22.5 },
      { date: 'Week 2', rate: 24.1 },
      { date: 'Week 3', rate: 23.8 },
      { date: 'Week 4', rate: 25.3 },
    ],
    social_engagement: [
      { category: 'Likes', value: 8900 },
      { category: 'Shares', value: 1780 },
      { category: 'Comments', value: 3420 },
    ],
    revenue: [
      { month: 'Jan', value: 42000 },
      { month: 'Feb', value: 58000 },
      { month: 'Mar', value: 67000 },
      { month: 'Apr', value: 73000 },
    ],
  };
  
  return generators[metric] || generators.lead_growth;
};

const metricLabels = {
  lead_growth: 'Lead Growth',
  conversion_rate: 'Conversion Rate',
  conversion_funnel: 'Conversion Funnel',
  social_posts: 'Social Media Posts',
  social_engagement: 'Social Engagement',
  social_ctr: 'Click-Through Rate',
  social_sentiment: 'Sentiment Analysis',
  revenue: 'Revenue Trends',
  team_performance: 'Team Performance',
};

export default function DynamicWidget({ metric, chartType }) {
  const data = getDataForMetric(metric);
  const title = metricLabels[metric] || metric;
  
  const renderChart = () => {
    const dataKey = data[0]?.value !== undefined ? 'value' : data[0]?.rate !== undefined ? 'rate' : 'value';
    const xKey = data[0]?.date !== undefined ? 'date' : data[0]?.month !== undefined ? 'month' : 'category';

    switch (chartType) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={xKey} stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip />
            <Line type="monotone" dataKey={dataKey} stroke="#3b82f6" strokeWidth={3} />
          </LineChart>
        );
      
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={xKey} stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip />
            <Bar dataKey={dataKey} fill="#ec4899" radius={[8, 8, 0, 0]} />
          </BarChart>
        );
      
      case 'area':
        return (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={xKey} stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip />
            <Area type="monotone" dataKey={dataKey} stroke="#8b5cf6" fill="url(#colorValue)" />
          </AreaChart>
        );
      
      case 'pie':
        const COLORS = ['#3b82f6', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b'];
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ category, value }) => `${category}: ${value}`}
              outerRadius={100}
              fill="#8884d8"
              dataKey={dataKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );
      
      default:
        return <div className="text-center text-gray-500">Chart type not supported</div>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}