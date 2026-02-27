import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Copy, Edit, FileText, Trash2 } from 'lucide-react';

export default function TemplateList({ templates, onEdit }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EmailTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (template) => {
      const { id, created_date, updated_date, created_by, ...data } = template;
      return base44.entities.EmailTemplate.create({
        ...data,
        name: `${data.name} (Copy)`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    },
  });

  if (templates.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No templates yet. Create your first email template to get started!
      </div>
    );
  }

  const getCategoryColor = (category) => {
    const colors = {
      welcome: 'bg-blue-100 text-blue-700',
      follow_up: 'bg-green-100 text-green-700',
      nurture: 'bg-purple-100 text-purple-700',
      promotional: 'bg-pink-100 text-pink-700',
      newsletter: 'bg-amber-100 text-amber-700',
      custom: 'bg-gray-100 text-gray-700',
    };
    return colors[category] || colors.custom;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {templates.map((template) => (
        <Card key={template.id} className="border-2 hover:border-blue-300 transition-all">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                {template.name}
              </CardTitle>
              <Badge className={getCategoryColor(template.category)}>
                {template.category}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Subject:</p>
              <p className="text-sm text-gray-600">{template.subject}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Preview:</p>
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded max-h-20 overflow-hidden">
                {template.body.substring(0, 150)}...
              </div>
            </div>

            {template.variables && template.variables.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Variables:</p>
                <div className="flex flex-wrap gap-2">
                  {template.variables.map((variable, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(template)}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => duplicateMutation.mutate(template)}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm('Delete this template?')) {
                    deleteMutation.mutate(template.id);
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