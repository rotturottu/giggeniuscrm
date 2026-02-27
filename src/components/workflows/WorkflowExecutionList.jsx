import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function WorkflowExecutionList() {
  const { data: executions = [], isLoading } = useQuery({
    queryKey: ['workflow-executions'],
    queryFn: () => base44.entities.WorkflowExecution.list('-created_date', 50),
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'partially_completed':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'partially_completed':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-500">
        Loading execution history...
      </div>
    );
  }

  if (executions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No workflow executions yet. Workflows will appear here once they trigger.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {executions.map((execution) => (
        <Card key={execution.id} className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getStatusIcon(execution.status)}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{execution.workflow_name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Triggered by: {execution.triggered_by}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>
                      {format(new Date(execution.created_date), 'MMM d, yyyy h:mm a')}
                    </span>
                    <span>
                      Actions: {execution.actions_completed}/{execution.actions_total}
                    </span>
                  </div>
                  {execution.error_message && (
                    <p className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded">
                      Error: {execution.error_message}
                    </p>
                  )}
                </div>
              </div>
              <Badge className={getStatusColor(execution.status)}>
                {execution.status.replace('_', ' ')}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}