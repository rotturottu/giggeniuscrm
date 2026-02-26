import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { endOfMonth, startOfMonth } from 'date-fns';
import { LayoutDashboard, Plus, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import ConversionChart from '../components/analytics/ConversionChart';
import CustomReportBuilder from '../components/analytics/CustomReportBuilder';
import DateRangeSelector from '../components/analytics/DateRangeSelector';
import DetailedSocialMetrics from '../components/analytics/DetailedSocialMetrics';
import DynamicWidget from '../components/analytics/DynamicWidget';
import ExportMenu from '../components/analytics/ExportMenu';
import LeadGrowthChart from '../components/analytics/LeadGrowthChart';
import LeadScoreChart from '../components/analytics/LeadScoreChart';
import MetricsOverview from '../components/analytics/MetricsOverview';
import SavedDashboards from '../components/analytics/SavedDashboards';
import SocialMediaChart from '../components/analytics/SocialMediaChart';
import TicketsDashboard from '../components/tickets/TicketsDashboard';

export default function Overview() {
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [showReportBuilder, setShowReportBuilder] = useState(false);
  const [activeDashboard, setActiveDashboard] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: customDashboards = [] } = useQuery({
    queryKey: ['custom-dashboards'],
    queryFn: () => base44.entities.CustomDashboard.filter({}),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Overview Dashboard
            </h1>
            <p className="text-gray-600">Track your business performance and growth metrics</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setShowReportBuilder(true)}
              variant="outline"
              className="border-blue-300 hover:border-blue-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Custom Dashboard
            </Button>
            <DateRangeSelector dateRange={dateRange} onDateRangeChange={setDateRange} />
            <ExportMenu dateRange={dateRange} />
          </div>
        </div>

        <MetricsOverview dateRange={dateRange} />

        <SavedDashboards
          dashboards={customDashboards}
          onSelect={setActiveDashboard}
          activeDashboardId={activeDashboard?.id}
        />

        {activeDashboard ? (
          <div className="space-y-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                <LayoutDashboard className="w-6 h-6 inline mr-2 text-blue-600" />
                {activeDashboard.name}
              </h2>
              <Button variant="outline" onClick={() => setActiveDashboard(null)}>
                View Standard Dashboards
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeDashboard.layout?.map((widget) => (
                <DynamicWidget
                  key={widget.id}
                  metric={widget.metric}
                  chartType={widget.chartType}
                />
              ))}
            </div>
          </div>
        ) : (
          <Tabs defaultValue="leads" className="space-y-6 mt-6">
          <TabsList className="grid w-full grid-cols-6 max-w-4xl">
            <TabsTrigger value="leads">Lead Growth</TabsTrigger>
            <TabsTrigger value="conversion">Conversions</TabsTrigger>
            <TabsTrigger value="scoring">Lead Scoring</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          </TabsList>

          <TabsContent value="leads">
            <LeadGrowthChart dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="conversion">
            <ConversionChart dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="scoring">
            <LeadScoreChart dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="social">
            <div className="space-y-6">
              <SocialMediaChart dateRange={dateRange} />
              <DetailedSocialMetrics dateRange={dateRange} />
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Sales Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  Sales performance metrics will be displayed here
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets">
            <TicketsDashboard />
          </TabsContent>
        </Tabs>
        )}

        <CustomReportBuilder
          open={showReportBuilder}
          onClose={() => setShowReportBuilder(false)}
        />
      </div>
    </div>
  );
}