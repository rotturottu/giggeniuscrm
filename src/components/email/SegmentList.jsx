import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Filter, Trash2, Users } from 'lucide-react';

export default function SegmentList({ segments, onEdit }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EmailSegment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-segments'] });
    },
  });

  if (segments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No segments yet. Create your first lead segment to get started!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {segments.map((segment) => (
        <Card key={segment.id} className="border-2 hover:border-blue-300 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              {segment.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {segment.description && (
              <p className="text-sm text-gray-600">{segment.description}</p>
            )}

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">Estimated Leads</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">{segment.lead_count || 0}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-semibold text-gray-500 uppercase">Filters</span>
              </div>
              <div className="space-y-2">
                {segment.filters?.map((filter, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {filter.field} {filter.operator} {filter.value}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(segment)}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm('Delete this segment?')) {
                    deleteMutation.mutate(segment.id);
                  }
                }}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}