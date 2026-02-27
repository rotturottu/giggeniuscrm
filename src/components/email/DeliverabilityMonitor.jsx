import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, AlertTriangle, CheckCircle, Mail, TrendingDown, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function DeliverabilityMonitor() {
  const { data: metrics = [] } = useQuery({
    queryKey: ['email-metrics'],
    queryFn: () => base44.entities.EmailCampaignMetric.list('-created_date', 500),
  });

  const { data: domains = [] } = useQuery({
    queryKey: ['email-domains'],
    queryFn: () => base44.entities.EmailDomain.list(),
  });

  // Calculate overall stats
  const totalSent = metrics.length;
  const totalBounced = metrics.filter(m => m.bounced).length;
  const totalOpened = metrics.filter(m => m.opened_at).length;
  const totalClicked = metrics.filter(m => m.clicked_at).length;
  const totalUnsubscribed = metrics.filter(m => m.unsubscribed).length;

  const bounceRate = totalSent > 0 ? ((totalBounced / totalSent) * 100).toFixed(2) : 0;
  const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(2) : 0;
  const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(2) : 0;
  const complainRate = totalSent > 0 ? ((totalUnsubscribed / totalSent) * 100).toFixed(2) : 0;

  // Domain-based analysis
  const domainStats = {};
  metrics.forEach(metric => {
    const domain = metric.recipient_email?.split('@')[1];
    if (!domain) return;

    if (!domainStats[domain]) {
      domainStats[domain] = { sent: 0, bounced: 0, opened: 0, clicked: 0, complaints: 0 };
    }
    domainStats[domain].sent++;
    if (metric.bounced) domainStats[domain].bounced++;
    if (metric.opened_at) domainStats[domain].opened++;
    if (metric.clicked_at) domainStats[domain].clicked++;
    if (metric.unsubscribed) domainStats[domain].complaints++;
  });

  const domainData = Object.entries(domainStats)
    .map(([domain, stats]) => ({
      domain,
      bounceRate: ((stats.bounced / stats.sent) * 100).toFixed(1),
      openRate: ((stats.opened / stats.sent) * 100).toFixed(1),
      clickRate: ((stats.clicked / stats.sent) * 100).toFixed(1),
      complainRate: ((stats.complaints / stats.sent) * 100).toFixed(1),
      sent: stats.sent,
    }))
    .sort((a, b) => b.sent - a.sent)
    .slice(0, 10);

  const getHealthStatus = (rate, type) => {
    if (type === 'bounce' || type === 'complain') {
      if (rate > 5) return { color: 'text-red-600', bg: 'bg-red-100', label: 'Poor', icon: AlertTriangle };
      if (rate > 2) return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Fair', icon: AlertCircle };
      return { color: 'text-green-600', bg: 'bg-green-100', label: 'Good', icon: CheckCircle };
    } else {
      if (rate < 15) return { color: 'text-red-600', bg: 'bg-red-100', label: 'Poor', icon: TrendingDown };
      if (rate < 25) return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Fair', icon: AlertCircle };
      return { color: 'text-green-600', bg: 'bg-green-100', label: 'Good', icon: TrendingUp };
    }
  };

  const bounceHealth = getHealthStatus(parseFloat(bounceRate), 'bounce');
  const complainHealth = getHealthStatus(parseFloat(complainRate), 'complain');
  const openHealth = getHealthStatus(parseFloat(openRate), 'open');

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${bounceHealth.bg}`}>
                <bounceHealth.icon className={`w-5 h-5 ${bounceHealth.color}`} />
              </div>
              <Badge className={bounceHealth.bg}>{bounceHealth.label}</Badge>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{bounceRate}%</div>
            <div className="text-sm text-gray-600">Bounce Rate</div>
            <div className="text-xs text-gray-500 mt-1">{totalBounced} of {totalSent}</div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${complainHealth.bg}`}>
                <complainHealth.icon className={`w-5 h-5 ${complainHealth.color}`} />
              </div>
              <Badge className={complainHealth.bg}>{complainHealth.label}</Badge>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{complainRate}%</div>
            <div className="text-sm text-gray-600">Complaint Rate</div>
            <div className="text-xs text-gray-500 mt-1">{totalUnsubscribed} complaints</div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${openHealth.bg}`}>
                <openHealth.icon className={`w-5 h-5 ${openHealth.color}`} />
              </div>
              <Badge className={openHealth.bg}>{openHealth.label}</Badge>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{openRate}%</div>
            <div className="text-sm text-gray-600">Open Rate</div>
            <div className="text-xs text-gray-500 mt-1">{totalOpened} opened</div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-purple-100">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{clickRate}%</div>
            <div className="text-sm text-gray-600">Click Rate</div>
            <div className="text-xs text-gray-500 mt-1">{totalClicked} clicked</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance by Recipient Domain</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={domainData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="domain" stroke="#666" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="openRate" fill="#10b981" name="Open Rate %" />
              <Bar dataKey="clickRate" fill="#3b82f6" name="Click Rate %" />
              <Bar dataKey="bounceRate" fill="#ef4444" name="Bounce Rate %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Domains by Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {domainData.slice(0, 5).map((domain, idx) => (
                <div key={domain.domain} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-gray-400">#{idx + 1}</div>
                    <div>
                      <div className="font-semibold text-gray-900">{domain.domain}</div>
                      <div className="text-xs text-gray-500">{domain.sent} emails sent</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">{domain.openRate}% opened</div>
                    <div className="text-xs text-red-600">{domain.bounceRate}% bounced</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Domain Verification Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {domains.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No domains configured. Add domains in Domain Verification tab.
                </div>
              ) : (
                domains.map((domain) => (
                  <div key={domain.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-900">{domain.domain}</div>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={domain.dkim_verified ? 'default' : 'outline'} className="text-xs">
                          DKIM {domain.dkim_verified ? '✓' : '✗'}
                        </Badge>
                        <Badge variant={domain.spf_verified ? 'default' : 'outline'} className="text-xs">
                          SPF {domain.spf_verified ? '✓' : '✗'}
                        </Badge>
                        <Badge variant={domain.dmarc_verified ? 'default' : 'outline'} className="text-xs">
                          DMARC {domain.dmarc_verified ? '✓' : '✗'}
                        </Badge>
                      </div>
                    </div>
                    <Badge className={
                      domain.verification_status === 'verified' 
                        ? 'bg-green-100 text-green-700'
                        : domain.verification_status === 'failed'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }>
                      {domain.verification_status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}