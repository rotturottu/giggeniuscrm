import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const availableFields = [
  { value: 'lead_score', label: 'Lead Score' },
  { value: 'lead_status', label: 'Lead Status' },
  { value: 'lead_source', label: 'Lead Source' },
  { value: 'company', label: 'Company' },
  { value: 'industry', label: 'Industry' },
  { value: 'created_date', label: 'Created Date' },
];

const operators = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
];

export default function SegmentBuilder({ open, onClose, segment }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [filters, setFilters] = useState([]);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (segment) {
      setName(segment.name);
      setDescription(segment.description || '');
      setFilters(segment.filters || []);
    } else {
      setName('');
      setDescription('');
      setFilters([]);
    }
  }, [segment, open]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (segment) {
        return base44.entities.EmailSegment.update(segment.id, data);
      }
      return base44.entities.EmailSegment.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-segments'] });
      onClose();
    },
  });

  const addFilter = () => {
    setFilters([...filters, { field: '', operator: 'equals', value: '' }]);
  };

  const updateFilter = (index, updates) => {
    const updated = [...filters];
    updated[index] = { ...updated[index], ...updates };
    setFilters(updated);
  };

  const removeFilter = (index) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name || filters.length === 0) return;

    saveMutation.mutate({
      name,
      description,
      filters,
      lead_count: 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
            {segment ? 'Edit Segment' : 'Create Lead Segment'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="text-base font-semibold">Segment Name</Label>
            <Input
              placeholder="e.g., High-value leads"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-base font-semibold">Description</Label>
            <Textarea
              placeholder="Describe this segment..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-semibold">Filters</Label>
              <Button onClick={addFilter} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Filter
              </Button>
            </div>

            <div className="space-y-4">
              {filters.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                  No filters added yet. Click "Add Filter" to define segment criteria.
                </div>
              ) : (
                filters.map((filter, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-700">Filter #{index + 1}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFilter(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-sm">Field</Label>
                        <Select
                          value={filter.field}
                          onValueChange={(value) => updateFilter(index, { field: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableFields.map((field) => (
                              <SelectItem key={field.value} value={field.value}>
                                {field.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm">Operator</Label>
                        <Select
                          value={filter.operator}
                          onValueChange={(value) => updateFilter(index, { operator: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select operator" />
                          </SelectTrigger>
                          <SelectContent>
                            {operators.map((op) => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm">Value</Label>
                        <Input
                          placeholder="Enter value"
                          value={filter.value}
                          onChange={(e) => updateFilter(index, { value: e.target.value })}
                          className="mt-1"
                        />
                      </div>
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
              disabled={!name || filters.length === 0 || saveMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {segment ? 'Update' : 'Create'} Segment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}