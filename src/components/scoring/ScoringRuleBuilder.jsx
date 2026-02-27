import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Plus, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const attributeOptions = [
  { value: 'status', label: 'Lead Status' },
  { value: 'source', label: 'Lead Source' },
  { value: 'company', label: 'Has Company' },
  { value: 'deal_value', label: 'Deal Value' },
  { value: 'email_opened', label: 'Email Opened' },
  { value: 'website_visits', label: 'Website Visits' },
  { value: 'form_submitted', label: 'Form Submitted' },
];

const conditionOptions = [
  { value: 'equals', label: 'Equals' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'contains', label: 'Contains' },
  { value: 'exists', label: 'Exists' },
];

export default function ScoringRuleBuilder({ open, onClose, rule }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState([]);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (rule) {
      setName(rule.name);
      setDescription(rule.description || '');
      setRules(rule.rules || []);
    } else {
      setName('');
      setDescription('');
      setRules([]);
    }
  }, [rule, open]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (rule) {
        return base44.entities.LeadScoring.update(rule.id, data);
      }
      return base44.entities.LeadScoring.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-scoring-rules'] });
      onClose();
    },
  });

  const addRule = () => {
    setRules([...rules, { attribute: '', condition: 'equals', value: '', points: 0 }]);
  };

  const updateRule = (index, updates) => {
    const updated = [...rules];
    updated[index] = { ...updated[index], ...updates };
    setRules(updated);
  };

  const removeRule = (index) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const calculateTotalPoints = () => {
    return rules.reduce((sum, rule) => sum + (parseInt(rule.points) || 0), 0);
  };

  const handleSave = () => {
    if (!name || rules.length === 0) return;

    saveMutation.mutate({
      name,
      description,
      rules,
      total_possible_points: calculateTotalPoints(),
      is_active: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
            {rule ? 'Edit Scoring Rule' : 'Create Scoring Rule'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="text-base font-semibold">Rule Name</Label>
            <Input
              placeholder="e.g., Engagement-based scoring"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-base font-semibold">Description</Label>
            <Textarea
              placeholder="Describe what this scoring rule does..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2"
            />
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-semibold">Scoring Rules</Label>
              <Button onClick={addRule} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Rule
              </Button>
            </div>

            <div className="space-y-4">
              {rules.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                  No rules added yet. Click "Add Rule" to define scoring criteria.
                </div>
              ) : (
                rules.map((rule, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-gray-700">Rule #{index + 1}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeRule(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <Label className="text-sm">Attribute</Label>
                        <Select
                          value={rule.attribute}
                          onValueChange={(value) => updateRule(index, { attribute: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {attributeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm">Condition</Label>
                        <Select
                          value={rule.condition}
                          onValueChange={(value) => updateRule(index, { condition: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {conditionOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm">Value</Label>
                        <Input
                          placeholder="Value"
                          value={rule.value}
                          onChange={(e) => updateRule(index, { value: e.target.value })}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-sm">Points</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={rule.points}
                          onChange={(e) => updateRule(index, { points: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {rules.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-sm font-semibold text-blue-700">
                  Total Possible Points: {calculateTotalPoints()}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name || rules.length === 0 || saveMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {rule ? 'Update' : 'Create'} Rule
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}