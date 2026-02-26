import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Save } from 'lucide-react';
import { useState } from 'react';
import ChartTypeSelector from './ChartTypeSelector';
import MetricsSelector from './MetricsSelector';

export default function CustomReportBuilder({ open, onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [widgets, setWidgets] = useState([]);
  
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.CustomDashboard.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-dashboards'] });
      onClose();
      setName('');
      setDescription('');
      setWidgets([]);
    },
  });

  const addWidget = () => {
    setWidgets([
      ...widgets,
      { id: Date.now().toString(), metric: '', chartType: 'line', position: widgets.length }
    ]);
  };

  const updateWidget = (id, updates) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const removeWidget = (id) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const handleSave = () => {
    if (!name || widgets.length === 0) return;
    
    saveMutation.mutate({
      name,
      description,
      layout: widgets,
      is_default: false,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
            Create Custom Dashboard
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="text-base font-semibold">Dashboard Name</Label>
            <Input
              placeholder="e.g., Sales Performance Dashboard"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-base font-semibold">Description</Label>
            <Textarea
              placeholder="Brief description of what this dashboard tracks..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-semibold">Widgets</Label>
              <Button onClick={addWidget} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Widget
              </Button>
            </div>

            <div className="space-y-4">
              {widgets.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                  No widgets added yet. Click "Add Widget" to get started.
                </div>
              ) : (
                widgets.map((widget, index) => (
                  <div key={widget.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-700">Widget #{index + 1}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeWidget(widget.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <MetricsSelector
                        value={widget.metric}
                        onChange={(metric) => updateWidget(widget.id, { metric })}
                      />
                      <ChartTypeSelector
                        value={widget.chartType}
                        onChange={(chartType) => updateWidget(widget.id, { chartType })}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name || widgets.length === 0 || saveMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Dashboard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}