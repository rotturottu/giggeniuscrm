import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { BarChart3, Calendar, ChevronDown, ChevronUp, Edit, Eye, Mail, MousePointer, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

export default function CampaignList({ onEdit }) {
  const [expandedCampaign, setExpandedCampaign] = useState(null);
  const queryClient = useQueryClient();

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['email-campaigns'],
    queryFn: () => base44.entities.EmailCampaign.list('-created_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EmailCampaign.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
    },
  });

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      scheduled: 'bg-blue-100 text-blue-700',
      sending: 'bg-purple-100 text-purple-700',
      sent: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || colors.draft;
  };

  const calculateOpenRate = (campaign) => {
    if (campaign.sent_count === 0) return 0;
    return ((campaign.opened_count / campaign.sent_count) * 100).toFixed(1);
  };

  const calculateClickRate = (campaign) => {
    if (campaign.sent_count === 0) return 0;
    return ((campaign.clicked_count / campaign.sent_count) * 100).toFixed(1);
  };

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Loading campaigns...</div>;
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No campaigns yet. Create your first campaign to get started!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <Card key={campaign.id} className="border-2 hover:border-blue-300 transition-all">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <CardTitle>{campaign.name}</CardTitle>
                  <Badge className={getStatusColor(campaign.status)}>
                    {campaign.status}
                  </Badge>
                </div>

                {campaign.status === 'sent' && (
                  <div className="grid grid-cols-4 gap-4 mt-3">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="text-xs text-gray-600 mb-1">Sent</div>
                      <div className="text-lg font-bold text-blue-600">{campaign.sent_count || 0}</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="text-xs text-gray-600 mb-1">Opens</div>
                      <div className="text-lg font-bold text-green-600">{calculateOpenRate(campaign)}%</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <div className="text-xs text-gray-600 mb-1">Clicks</div>
                      <div className="text-lg font-bold text-purple-600">{calculateClickRate(campaign)}%</div>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded">
                      <div className="text-xs text-gray-600 mb-1">Bounces</div>
                      <div className="text-lg font-bold text-red-600">{campaign.bounced_count || 0}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {campaign.scheduled_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {campaign.status === 'sent' ? 'Sent' : 'Scheduled'}: {format(new Date(campaign.scheduled_date), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{campaign.recipients_count || 0} recipients</span>
                </div>
              </div>

              {campaign.status === 'sent' && (
                <Collapsible 
                  open={expandedCampaign === campaign.id}
                  onOpenChange={() => setExpandedCampaign(expandedCampaign === campaign.id ? null : campaign.id)}
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      {expandedCampaign === campaign.id ? 'Hide' : 'View'} Detailed Analytics
                      {expandedCampaign === campaign.id ? (
                        <ChevronUp className="w-4 h-4 ml-2" />
                      ) : (
                        <ChevronDown className="w-4 h-4 ml-2" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4">
                    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Total Opened</div>
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-green-600" />
                            <span className="text-2xl font-bold text-gray-900">{campaign.opened_count || 0}</span>
                            <span className="text-sm text-gray-500">({calculateOpenRate(campaign)}%)</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Total Clicks</div>
                          <div className="flex items-center gap-2">
                            <MousePointer className="w-4 h-4 text-purple-600" />
                            <span className="text-2xl font-bold text-gray-900">{campaign.clicked_count || 0}</span>
                            <span className="text-sm text-gray-500">({calculateClickRate(campaign)}%)</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Delivered</div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-blue-600" />
                            <span className="text-2xl font-bold text-gray-900">{campaign.delivered_count || 0}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Bounced</div>
                          <div className="flex items-center gap-2">
                            <Trash2 className="w-4 h-4 text-red-600" />
                            <span className="text-2xl font-bold text-gray-900">{campaign.bounced_count || 0}</span>
                          </div>
                        </div>
                      </div>
                      <div className="pt-3 border-t">
                        <div className="text-sm text-gray-600 mb-2">Engagement Timeline</div>
                        <div className="text-xs text-gray-500">
                          {campaign.sent_at ? `Campaign sent on ${format(new Date(campaign.sent_at), 'PPP')}` : 'Not yet sent'}
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(campaign)}
                  className="flex-1"
                  disabled={campaign.status === 'sent' || campaign.status === 'sending'}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('Delete this campaign?')) {
                      deleteMutation.mutate(campaign.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}