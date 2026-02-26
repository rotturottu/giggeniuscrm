import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Play, Pause, Edit, Trash2, Zap, Users, CheckCircle, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-700',
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  archived: 'bg-red-100 text-red-700',
};

export default function AutomationList({ onEdit, onCreate }) {
  const queryClient = useQueryClient();

  const { data: automations = [], isLoading } = useQuery({
    queryKey: ['campaign-automations'],
    queryFn: () => base44.entities.CampaignAutomation.list('-created_date', 100),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.CampaignAutomation.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-automations'] });
      toast.success('Automation updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CampaignAutomation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-automations'] });
      toast.success('Automation deleted');
    },
  });

  if (isLoading) return <div className="text-center py-12 text-gray-400">Loading automations...</div>;

  if (automations.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
          <Zap className="w-8 h-8 text-purple-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-700">No automations yet</h3>
          <p className="text-gray-500 text-sm mt-1">Create your first automation to start engaging contacts automatically.</p>
        </div>
        <Button onClick={onCreate} className="bg-gradient-to-r from-blue-600 to-purple-600">
          <Plus className="w-4 h-4 mr-2" /> Create Automation
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {automations.map(auto => (
        <Card key={auto.id} className="hover:shadow-md transition-all border-l-4 border-l-transparent hover:border-l-blue-400">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-base">{auto.name}</CardTitle>
                  {auto.description && <p className="text-sm text-gray-500 mt-0.5">{auto.description}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={STATUS_COLORS[auto.status]}>{auto.status}</Badge>
                    {auto.trigger?.type && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        Trigger: {auto.trigger.type.replace(/_/g, ' ')}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{auto.nodes?.length || 0} nodes</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {auto.status === 'active' ? (
                  <Button variant="outline" size="sm" className="h-8 text-yellow-600 border-yellow-200"
                    onClick={() => toggleMutation.mutate({ id: auto.id, status: 'paused' })}>
                    <Pause className="w-3.5 h-3.5 mr-1" /> Pause
                  </Button>
                ) : auto.status === 'paused' || auto.status === 'draft' ? (
                  <Button variant="outline" size="sm" className="h-8 text-green-600 border-green-200"
                    onClick={() => toggleMutation.mutate({ id: auto.id, status: 'active' })}>
                    <Play className="w-3.5 h-3.5 mr-1" /> Activate
                  </Button>
                ) : null}
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(auto)}>
                  <Edit className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:text-red-600"
                  onClick={() => { if (confirm('Delete this automation?')) deleteMutation.mutate(auto.id); }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-gray-600">{auto.enrolled_count || 0} enrolled</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-gray-600">{auto.completed_count || 0} completed</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span className="text-gray-600">{auto.conversion_count || 0} converted</span>
              </div>
            </div>
            {auto.last_triggered_at && (
              <p className="text-xs text-gray-400 mt-2">Last triggered: {format(new Date(auto.last_triggered_at), 'MMM d, yyyy h:mm a')}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}