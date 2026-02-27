import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Target, Edit, Trash2 } from 'lucide-react';

export default function ScoringRulesList({ onEdit }) {
  const queryClient = useQueryClient();

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['lead-scoring-rules'],
    queryFn: () => base44.entities.LeadScoring.filter({}),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.LeadScoring.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-scoring-rules'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.LeadScoring.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-scoring-rules'] });
    },
  });

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Loading scoring rules...</div>;
  }

  if (rules.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No scoring rules yet. Create your first rule to start scoring leads automatically!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {rules.map((rule) => (
        <Card key={rule.id} className="border-2 hover:border-blue-300 transition-all">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                {rule.name}
              </CardTitle>
              <Switch
                checked={rule.is_active}
                onCheckedChange={(checked) =>
                  toggleActiveMutation.mutate({ id: rule.id, is_active: checked })
                }
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rule.description && (
                <p className="text-sm text-gray-600">{rule.description}</p>
              )}

              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase">Rules</span>
                <div className="mt-2 space-y-2">
                  {rule.rules?.slice(0, 3).map((r, idx) => (
                    <div key={idx} className="text-sm flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-gray-700">
                        {r.attribute} {r.condition} {r.value}
                      </span>
                      <Badge variant="secondary">+{r.points} pts</Badge>
                    </div>
                  ))}
                  {rule.rules?.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{rule.rules.length - 3} more rules
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-semibold text-blue-700">
                  Max Score: {rule.total_possible_points} points
                </span>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(rule)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('Delete this scoring rule?')) {
                      deleteMutation.mutate(rule.id);
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