import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Save, Plus, X, Mail, Clock, TestTube } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import TriggerSelector from './TriggerSelector';
import EnhancedSegmentBuilder from '../email/EnhancedSegmentBuilder';

export default function EmailSequenceBuilder({ open, onClose, sequence }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState('');
  const [triggerCondition, setTriggerCondition] = useState({});
  const [segmentCriteria, setSegmentCriteria] = useState({});
  const [emails, setEmails] = useState([]);
  const [hasABTest, setHasABTest] = useState(false);
  const [abTestConfig, setAbTestConfig] = useState({ split_percentage: 50 });

  const queryClient = useQueryClient();

  const { data: templates = [] } = useQuery({
    queryKey: ['email-templates'],
    queryFn: () => base44.entities.EmailTemplate.filter({ is_active: true }),
  });

  useEffect(() => {
    if (sequence) {
      setName(sequence.name);
      setDescription(sequence.description || '');
      setTriggerType(sequence.trigger_type);
      setTriggerCondition(sequence.trigger_condition || {});
      setSegmentCriteria(sequence.segment_criteria || {});
      setEmails(sequence.emails || []);
      setHasABTest(sequence.has_ab_test || false);
      setAbTestConfig(sequence.ab_test_config || { split_percentage: 50 });
    } else {
      setName('');
      setDescription('');
      setTriggerType('');
      setTriggerCondition({});
      setSegmentCriteria({});
      setEmails([]);
      setHasABTest(false);
      setAbTestConfig({ split_percentage: 50 });
    }
  }, [sequence, open]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (sequence) {
        return base44.entities.EmailSequence.update(sequence.id, data);
      }
      return base44.entities.EmailSequence.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-sequences'] });
      onClose();
    },
  });

  const addEmail = () => {
    setEmails([
      ...emails,
      {
        template_id: '',
        subject: '',
        body: '',
        delay_days: emails.length === 0 ? 0 : 1,
        delay_hours: 0,
      }
    ]);
  };

  const updateEmail = (index, updates) => {
    const updated = [...emails];
    updated[index] = { ...updated[index], ...updates };
    setEmails(updated);
  };

  const removeEmail = (index) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const handleTemplateSelect = (index, templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      updateEmail(index, {
        template_id: templateId,
        subject: template.subject,
        body: template.body,
      });
    } else {
      updateEmail(index, { template_id: '' });
    }
  };

  const calculateTotalDuration = () => {
    return emails.reduce((total, email) => {
      return total + (Number(email.delay_days) || 0);
    }, 0);
  };

  const handleSave = () => {
    if (!name || !triggerType || emails.length === 0) return;

    saveMutation.mutate({
      name,
      description,
      trigger_type: triggerType,
      trigger_condition: triggerCondition,
      segment_criteria: segmentCriteria,
      emails,
      has_ab_test: hasABTest,
      ab_test_config: hasABTest ? abTestConfig : null,
      total_duration_days: calculateTotalDuration(),
      is_active: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            {sequence ? 'Edit Email Sequence' : 'Create Email Sequence'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-base font-semibold">Sequence Name</Label>
              <Input
                placeholder="e.g., Welcome Drip Campaign"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-base font-semibold">Description</Label>
              <Input
                placeholder="What is this sequence for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2"
              />
            </div>
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
            <Label className="text-base font-semibold mb-4 block">Audience Segmentation (Optional)</Label>
            <EnhancedSegmentBuilder
              criteria={segmentCriteria}
              onChange={setSegmentCriteria}
            />
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Label className="text-base font-semibold">Email Sequence</Label>
                <p className="text-sm text-gray-500 mt-1">
                  Total duration: {calculateTotalDuration()} days
                </p>
              </div>
              <Button onClick={addEmail} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Email
              </Button>
            </div>

            <div className="space-y-4">
              {emails.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                  No emails added yet. Click "Add Email" to start building your sequence.
                </div>
              ) : (
                emails.map((email, index) => (
                  <Card key={index} className="border-2 border-pink-200 bg-pink-50/30">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Mail className="w-5 h-5 text-pink-600" />
                            <span className="font-semibold text-gray-700">Email #{index + 1}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeEmail(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-2">
                            <Label className="text-sm">Email Template (Optional)</Label>
                            <Select
                              value={email.template_id || 'custom'}
                              onValueChange={(value) => handleTemplateSelect(index, value === 'custom' ? '' : value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select template or write custom" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="custom">Custom Email</SelectItem>
                                {templates.map((template) => (
                                  <SelectItem key={template.id} value={template.id}>
                                    {template.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-sm flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Delay (Days)
                            </Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={email.delay_days}
                              onChange={(e) => updateEmail(index, { delay_days: e.target.value })}
                              className="mt-1"
                              min="0"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm">Subject Line</Label>
                          <Input
                            placeholder="Email subject..."
                            value={email.subject}
                            onChange={(e) => updateEmail(index, { subject: e.target.value })}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-sm">Email Body</Label>
                          <Textarea
                            placeholder="Email content... Use {{first_name}}, {{company}} for personalization"
                            value={email.body}
                            onChange={(e) => updateEmail(index, { body: e.target.value })}
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <TestTube className="w-5 h-5 text-purple-600" />
                <div>
                  <Label className="text-base font-semibold">A/B Testing</Label>
                  <p className="text-sm text-gray-500">Test different subject lines or content</p>
                </div>
              </div>
              <Switch checked={hasABTest} onCheckedChange={setHasABTest} />
            </div>

            {hasABTest && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-3">
                <div>
                  <Label className="text-sm">Email to Test (Select from sequence above)</Label>
                  <Select
                    value={abTestConfig.email_index?.toString() || '0'}
                    onValueChange={(value) => setAbTestConfig({ ...abTestConfig, email_index: parseInt(value) })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {emails.map((_, idx) => (
                        <SelectItem key={idx} value={idx.toString()}>
                          Email #{idx + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Variant A Subject</Label>
                    <Input
                      placeholder="First subject line"
                      value={abTestConfig.variant_a_subject || ''}
                      onChange={(e) => setAbTestConfig({ ...abTestConfig, variant_a_subject: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Variant B Subject</Label>
                    <Input
                      placeholder="Second subject line"
                      value={abTestConfig.variant_b_subject || ''}
                      onChange={(e) => setAbTestConfig({ ...abTestConfig, variant_b_subject: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Traffic Split (%)</Label>
                  <Input
                    type="number"
                    placeholder="50"
                    value={abTestConfig.split_percentage}
                    onChange={(e) => setAbTestConfig({ ...abTestConfig, split_percentage: e.target.value })}
                    className="mt-1"
                    min="10"
                    max="90"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {abTestConfig.split_percentage}% will see Variant A, {100 - abTestConfig.split_percentage}% will see Variant B
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name || !triggerType || emails.length === 0 || saveMutation.isPending}
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {sequence ? 'Update' : 'Create'} Sequence
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}