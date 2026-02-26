import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Mail, DollarSign, Zap, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function ContactHistoryDialog({ open, onClose, contact }) {
  const { data: deals = [] } = useQuery({
    queryKey: ['contact-deals', contact?.id],
    queryFn: () => base44.entities.Deal.filter({ contact_id: contact.id }),
    enabled: !!contact,
  });

  const { data: campaignMetrics = [] } = useQuery({
    queryKey: ['contact-campaigns', contact?.email],
    queryFn: () => base44.entities.EmailCampaignMetric.filter({ recipient_email: contact.email }),
    enabled: !!contact,
  });

  const { data: workflowExecutions = [] } = useQuery({
    queryKey: ['contact-workflows', contact?.email],
    queryFn: () => base44.entities.WorkflowExecution.filter({ triggered_by: contact.email }),
    enabled: !!contact,
  });

  if (!contact) return null;

  const totalDealValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {contact.first_name || ''} {contact.last_name || contact.email}
          </DialogTitle>
          <p className="text-sm text-gray-600">{contact.email}</p>
        </DialogHeader>

        <Tabs defaultValue="deals" className="mt-4">
          <TabsList>
            <TabsTrigger value="deals">
              <DollarSign className="w-4 h-4 mr-2" />
              Deals ({deals.length})
            </TabsTrigger>
            <TabsTrigger value="campaigns">
              <Mail className="w-4 h-4 mr-2" />
              Campaigns ({campaignMetrics.length})
            </TabsTrigger>
            <TabsTrigger value="automations">
              <Zap className="w-4 h-4 mr-2" />
              Automations ({workflowExecutions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deals" className="space-y-4">
            {deals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No deals associated with this contact
              </div>
            ) : (
              <>
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="text-sm text-gray-600 mb-1">Total Deal Value</div>
                    <div className="text-3xl font-bold text-blue-600">
                      ${totalDealValue.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
                {deals.map((deal) => (
                  <Card key={deal.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold">{deal.name}</div>
                        <Badge>{deal.stage.replace('_', ' ')}</Badge>
                      </div>
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        ${deal.value?.toLocaleString()}
                      </div>
                      {deal.expected_close_date && (
                        <div className="text-sm text-gray-600">
                          Expected close: {new Date(deal.expected_close_date).toLocaleDateString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-4">
            {campaignMetrics.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No campaign interactions yet
              </div>
            ) : (
              campaignMetrics.map((metric) => (
                <Card key={metric.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="font-semibold">Campaign Activity</div>
                      {metric.sent_at && (
                        <div className="text-sm text-gray-600">
                          {format(new Date(metric.sent_at), 'MMM d, yyyy')}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {metric.opened_at && (
                        <Badge className="bg-green-100 text-green-700">Opened</Badge>
                      )}
                      {metric.clicked_at && (
                        <Badge className="bg-blue-100 text-blue-700">Clicked</Badge>
                      )}
                      {metric.bounced && (
                        <Badge className="bg-red-100 text-red-700">Bounced</Badge>
                      )}
                      {metric.unsubscribed && (
                        <Badge className="bg-gray-100 text-gray-700">Unsubscribed</Badge>
                      )}
                    </div>
                    {metric.opens_count > 0 && (
                      <div className="text-sm text-gray-600 mt-2">
                        Opened {metric.opens_count} times
                      </div>
                    )}
                    {metric.clicks_count > 0 && (
                      <div className="text-sm text-gray-600">
                        Clicked {metric.clicks_count} times
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="automations" className="space-y-4">
            {workflowExecutions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No automation activity
              </div>
            ) : (
              workflowExecutions.map((execution) => (
                <Card key={execution.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold">{execution.workflow_name}</div>
                      <Badge
                        className={
                          execution.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : execution.status === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        }
                      >
                        {execution.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {execution.actions_completed} of {execution.actions_total} actions completed
                    </div>
                    {execution.created_date && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(execution.created_date), 'MMM d, yyyy h:mm a')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}