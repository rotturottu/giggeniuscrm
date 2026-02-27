import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, Edit, Eye, Mail, Monitor, Smartphone, Tablet, Trash2 } from 'lucide-react';
import { useState } from 'react';

const DEVICE_WIDTHS = { desktop: '640px', tablet: '480px', mobile: '375px' };

function HoverPreview({ template }) {
  const hasHtml = template.visual_blocks?.length > 0 || template.body?.includes('<');
  return (
    <div className="pointer-events-none absolute left-full top-0 ml-3 z-50 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
      <div className="bg-gray-50 border-b px-3 py-2">
        <p className="text-xs font-semibold text-gray-600 truncate">{template.subject}</p>
      </div>
      <div className="relative overflow-hidden" style={{ height: '220px' }}>
        {hasHtml ? (
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="origin-top-left"
              style={{ transform: 'scale(0.45)', width: '640px', height: '490px' }}
              dangerouslySetInnerHTML={{ __html: template.body }}
            />
          </div>
        ) : (
          <div className="p-4 text-xs text-gray-600 leading-relaxed whitespace-pre-wrap overflow-hidden h-full">
            {template.body?.slice(0, 400)}
          </div>
        )}
        {/* Fade out at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
      </div>
    </div>
  );
}

export default function EmailTemplateList({ onEdit }) {
  const queryClient = useQueryClient();
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [hoveredId, setHoveredId] = useState(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: () => base44.entities.EmailTemplate.filter({}),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EmailTemplate.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['email-templates'] }),
  });

  const duplicateMutation = useMutation({
    mutationFn: (template) => {
      const { id, created_date, updated_date, created_by, ...data } = template;
      return base44.entities.EmailTemplate.create({ ...data, name: `${data.name} (Copy)` });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['email-templates'] }),
  });

  const getCategoryColor = (category) => {
    const colors = {
      welcome: 'bg-green-100 text-green-700',
      follow_up: 'bg-blue-100 text-blue-700',
      nurture: 'bg-purple-100 text-purple-700',
      promotional: 'bg-pink-100 text-pink-700',
      transactional: 'bg-gray-100 text-gray-700',
      other: 'bg-amber-100 text-amber-700',
    };
    return colors[category] || colors.other;
  };

  const hasHtml = (t) => t?.visual_blocks?.length > 0 || t?.body?.includes('<');

  return (
    <>
      {/* Full Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-5 py-4 border-b flex-shrink-0">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-base font-semibold">{previewTemplate?.name}</span>
                <span className="text-xs text-gray-400 font-normal">Subject: {previewTemplate?.subject}</span>
              </div>
              <div className="flex items-center gap-1 border rounded-lg p-1 mr-8 bg-gray-50">
                {[
                  { key: 'desktop', Icon: Monitor, label: 'Desktop' },
                  { key: 'tablet', Icon: Tablet, label: 'Tablet' },
                  { key: 'mobile', Icon: Smartphone, label: 'Mobile' },
                ].map(({ key, Icon, label }) => (
                  <button
                    key={key}
                    onClick={() => setPreviewDevice(key)}
                    title={label}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all
                      ${previewDevice === key ? 'bg-white shadow text-blue-600 border border-blue-200' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Icon className="w-3.5 h-3.5" />{label}
                  </button>
                ))}
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto bg-gray-200 p-6 flex justify-center items-start">
            <div
              className="bg-white shadow-2xl rounded-sm overflow-hidden transition-all duration-300"
              style={{ width: DEVICE_WIDTHS[previewDevice], minHeight: '400px' }}
            >
              {hasHtml(previewTemplate) ? (
                <iframe
                  key={previewDevice}
                  srcDoc={previewTemplate?.body}
                  title="Email Preview"
                  className="w-full border-0 block"
                  style={{ height: '560px' }}
                  sandbox="allow-same-origin"
                />
              ) : (
                <div className="p-6 text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                  <div className="font-bold text-base mb-4 pb-2 border-b text-gray-800">
                    {previewTemplate?.subject}
                  </div>
                  {previewTemplate?.body}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading && <div className="text-center py-12 text-gray-500">Loading templates...</div>}
      {!isLoading && templates.length === 0 && (
        <div className="text-center py-12 text-gray-500">No email templates yet. Create your first template to get started!</div>
      )}
      {!isLoading && templates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="relative"
              onMouseEnter={() => setHoveredId(template.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <Card className="border-2 hover:border-blue-300 transition-all cursor-default">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="truncate">{template.name}</span>
                  </CardTitle>
                  <Badge className={`${getCategoryColor(template.category)} w-fit text-xs`}>
                    {template.category?.replace('_', ' ')}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Subject</span>
                      <p className="text-sm text-gray-700 mt-0.5 truncate">{template.subject}</p>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Variables</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {template.variables?.length > 0
                          ? template.variables.map((variable, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {variable}
                            </Badge>
                          ))
                          : <span className="text-xs text-gray-400">None</span>
                        }
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button variant="outline" size="sm" onClick={() => onEdit(template)} className="flex-1">
                        <Edit className="w-3.5 h-3.5 mr-1.5" />Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { setPreviewTemplate(template); setPreviewDevice('desktop'); }} title="Preview">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => duplicateMutation.mutate(template)} title="Duplicate">
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="outline" size="sm"
                        onClick={() => { if (confirm('Delete this template?')) deleteMutation.mutate(template.id); }}
                        className="text-red-500 hover:text-red-700 hover:border-red-300" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hover mini-preview */}
              {hoveredId === template.id && <HoverPreview template={template} />}
            </div>
          ))}
        </div>
      )}
    </>
  );
}