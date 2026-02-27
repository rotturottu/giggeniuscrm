import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Eye, Mail, MousePointer, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function CampaignAnalytics() {
  const { data: campaigns = [] } = useQuery({
    queryKey: ['email-campaigns'],
    queryFn: () => base44.entities.EmailCampaign.filter({ status: 'sent' }),
  });

  const totalSent = campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0);
  const totalOpened = campaigns.reduce((sum, c) => sum + (c.opened_count || 0), 0);
  const totalClicked = campaigns.reduce((sum, c) => sum + (c.clicked_count || 0), 0);
  const avgOpenRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : 0;
  const avgClickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : 0;

  const campaignData = campaigns.slice(0, 10).map((campaign) => ({
    name: campaign.name.substring(0, 20),
    opened: campaign.opened_count || 0,
    clicked: campaign.clicked_count || 0,
    sent: campaign.sent_count || 0,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-2">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{totalSent}</h3>
            <p className="text-sm text-gray-600">Total Emails Sent</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-2">
              <Eye className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{avgOpenRate}%</h3>
            <p className="text-sm text-gray-600">Avg Open Rate</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-2">
              <MousePointer className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{avgClickRate}%</h3>
            <p className="text-sm text-gray-600">Avg Click Rate</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-pink-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{campaigns.length}</h3>
            <p className="text-sm text-gray-600">Campaigns Sent</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={campaignData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="sent" fill="#3b82f6" name="Sent" />
              <Bar dataKey="opened" fill="#10b981" name="Opened" />
              <Bar dataKey="clicked" fill="#8b5cf6" name="Clicked" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}