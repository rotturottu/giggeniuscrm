import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LayoutDashboard, Star, Trash2 } from 'lucide-react';

export default function SavedDashboards({ dashboards, onSelect, activeDashboardId }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CustomDashboard.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-dashboards'] });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async ({ id, currentDefault }) => {
      if (currentDefault) {
        await base44.entities.CustomDashboard.update(currentDefault, { is_default: false });
      }
      await base44.entities.CustomDashboard.update(id, { is_default: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-dashboards'] });
    },
  });

  if (dashboards.length === 0) return null;

  const currentDefault = dashboards.find(d => d.is_default)?.id;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">Saved Dashboards</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dashboards.map((dashboard) => (
          <Card
            key={dashboard.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              activeDashboardId === dashboard.id ? 'border-2 border-blue-500' : ''
            }`}
            onClick={() => onSelect(dashboard)}
          >
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">{dashboard.name}</h4>
                </div>
                {dashboard.is_default && (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                    <Star className="w-3 h-3 mr-1 fill-yellow-600" />
                    Default
                  </Badge>
                )}
              </div>
              
              {dashboard.description && (
                <p className="text-sm text-gray-600 mb-3">{dashboard.description}</p>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {dashboard.layout?.length || 0} widgets
                </span>
                <div className="flex gap-2">
                  {!dashboard.is_default && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDefaultMutation.mutate({ id: dashboard.id, currentDefault });
                      }}
                      className="h-7 px-2"
                    >
                      <Star className="w-3 h-3" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this dashboard?')) {
                        deleteMutation.mutate(dashboard.id);
                      }
                    }}
                    className="h-7 px-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}