import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Plus, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import TriggerSelector from './TriggerSelector';
import ActionSelector from './ActionSelector';

export default function WorkflowBuilder({ open, onClose, workflow }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState('');
  const [triggerCondition, setTriggerCondition] = useState({});
  const [actions, setActions] = useState([]);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (workflow) {
      setName(workflow.name);
      setDescription(workflow.description || '');
      setTriggerType(workflow.trigger_type);
      setTriggerCondition(workflow.trigger_condition);
      setActions(workflow.actions || []);
    } else {
      setName('');
      setDescription('');
      setTriggerType('');
      setTriggerCondition({});
      setActions([]);
    }
  }, [workflow, open]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (workflow) {
        return base44.entities.Workflow.update(workflow.id, data);
      }
      return base44.entities.Workflow.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      onClose();
    },
  });

  const addAction = () => {
    setActions([
      ...actions,
      { type: '', config: {}, order: actions.length }
    ]);
  };

  const updateAction = (index, updates) => {
    const updated = [...actions];
    updated[index] = { ...updated[index], ...updates };
    setActions(updated);
  };

  const removeAction = (index) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name || !triggerType || actions.length === 0) return;

    saveMutation.mutate({
      name,
      description,
      trigger_type: triggerType,
      trigger_condition: triggerCondition,
      actions,
      is_active: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
            {workflow ? 'Edit Workflow' : 'Create Workflow'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="text-base font-semibold">Workflow Name</Label>
            <Input
              placeholder="e.g., High-value lead auto-assignment"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-base font-semibold">Description</Label>
            <Textarea
              placeholder="What does this workflow do?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2"
            />
          </div>

          <div className="border-t pt-6">
            <Label className="text-base font-semibold mb-4 block">Trigger</Label>
            <TriggerSelector
              triggerType={triggerType}
              triggerCondition={triggerCondition}
              onTriggerTypeChange={setTriggerType}
              onTriggerConditionChange={setTriggerCondition}
            />
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-semibold">Actions</Label>
              <Button onClick={addAction} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Action
              </Button>
            </div>

            <div className="space-y-4">
              {actions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                  No actions added yet. Click "Add Action" to define what happens when the workflow triggers.
                </div>
              ) : (
                actions.map((action, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-700">Action #{index + 1}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeAction(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <ActionSelector
                      action={action}
                      onChange={(updates) => updateAction(index, updates)}
                    />
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
              disabled={!name || !triggerType || actions.length === 0 || saveMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {workflow ? 'Update' : 'Create'} Workflow
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}