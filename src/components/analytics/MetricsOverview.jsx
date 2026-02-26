import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Calendar, MessageSquare, Target, TrendingDown, TrendingUp, Users } from 'lucide-react';

export default function MetricsOverview({ dateRange }) {
  // Mock data - in production, fetch from backend
  const metrics = [
    {
      title: 'Total Leads',
      value: '2,847',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Conversion Rate',
      value: '24.3%',
      change: '+3.2%',
      trend: 'up',
      icon: Target,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      title: 'Scheduled Posts',
      value: '156',
      change: '+8.1%',
      trend: 'up',
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      title: 'Social Engagement',
      value: '18.2K',
      change: '-2.4%',
      trend: 'down',
      icon: MessageSquare,
      color: 'text-pink-600',
      bg: 'bg-pink-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
        
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="border-2 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${metric.bg}`}>
                    <Icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-semibold ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendIcon className="w-4 h-4" />
                    {metric.change}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h3>
                <p className="text-sm text-gray-600">{metric.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}