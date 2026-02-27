import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const actionTypes = [
  { value: 'assign_lead', label: 'Assign Lead', icon: '👤' },
  { value: 'send_email', label: 'Send Email', icon: '✉️' },
  { value: 'create_task', label: 'Create Task', icon: '✅' },
  { value: 'update_status', label: 'Update Status', icon: '🔄' },
  { value: 'add_tag', label: 'Add Tag', icon: '🏷️' },
  { value: 'create_notification', label: 'Create Notification', icon: '🔔' },
  { value: 'wait', label: 'Wait / Delay', icon: '⏱️' },
  { value: 'condition', label: 'If/Then Condition', icon: '🔀' },
];

export default function ActionSelector({ action, onChange }) {
  const { data: emailTemplates = [] } = useQuery({
    queryKey: ['email-templates-for-workflow'],
    queryFn: () => base44.entities.EmailTemplate.filter({ is_active: true }),
    enabled: action.type === 'send_email',
  });

  const renderConfigInputs = () => {
    switch (action.type) {
      case 'assign_lead':
        return (
          <div>
            <Label className="text-sm">Assign to (User Email)</Label>
            <Input
              placeholder="user@example.com or use 'round_robin'"
              value={action.config?.assignee || ''}
              onChange={(e) => onChange({ config: { ...action.config, assignee: e.target.value } })}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter a specific user email or 'round_robin' for automatic distribution
            </p>
          </div>
        );

      case 'send_email':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-sm">Email Template (Optional)</Label>
              <Select
                value={action.config?.template_id || 'custom'}
                onValueChange={(value) => {
                  if (value === 'custom') {
                    onChange({ config: { ...action.config, template_id: null } });
                  } else {
                    const template = emailTemplates.find(t => t.id === value);
                    onChange({ 
                      config: { 
                        ...action.config, 
                        template_id: value,
                        subject: template?.subject || action.config?.subject,
                        body: template?.body || action.config?.body,
                      } 
                    });
                  }
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select template or create custom" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom Email</SelectItem>
                  {emailTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Use a template or write a custom email below
              </p>
            </div>
            <div>
              <Label className="text-sm">To</Label>
              <Input
                placeholder="lead_email, sales_rep, or specific email"
                value={action.config?.to || ''}
                onChange={(e) => onChange({ config: { ...action.config, to: e.target.value } })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">Subject</Label>
              <Input
                placeholder="Email subject"
                value={action.config?.subject || ''}
                onChange={(e) => onChange({ config: { ...action.config, subject: e.target.value } })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">Message</Label>
              <Textarea
                placeholder="Email body... Use {{lead_name}}, {{lead_email}} for variables"
                value={action.config?.body || ''}
                onChange={(e) => onChange({ config: { ...action.config, body: e.target.value } })}
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
        );

      case 'create_task':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-sm">Task Title</Label>
              <Input
                placeholder="e.g., Follow up with lead"
                value={action.config?.title || ''}
                onChange={(e) => onChange({ config: { ...action.config, title: e.target.value } })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">Assign to</Label>
              <Input
                placeholder="User email or 'lead_owner'"
                value={action.config?.assignee || ''}
                onChange={(e) => onChange({ config: { ...action.config, assignee: e.target.value } })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">Due in (days)</Label>
              <Input
                type="number"
                placeholder="e.g., 3"
                value={action.config?.due_days || ''}
                onChange={(e) => onChange({ config: { ...action.config, due_days: e.target.value } })}
                className="mt-1"
              />
            </div>
          </div>
        );

      case 'update_status':
        return (
          <div>
            <Label className="text-sm">New Status</Label>
            <Select
              value={action.config?.status || ''}
              onValueChange={(value) => onChange({ config: { ...action.config, status: value } })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'add_tag':
        return (
          <div>
            <Label className="text-sm">Tag Name</Label>
            <Input
              placeholder="e.g., hot-lead, follow-up-needed"
              value={action.config?.tag || ''}
              onChange={(e) => onChange({ config: { ...action.config, tag: e.target.value } })}
              className="mt-1"
            />
          </div>
        );

      case 'create_notification':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-sm">Notification Title</Label>
              <Input
                placeholder="e.g., New high-value lead"
                value={action.config?.title || ''}
                onChange={(e) => onChange({ config: { ...action.config, title: e.target.value } })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">Message</Label>
              <Textarea
                placeholder="Notification message..."
                value={action.config?.message || ''}
                onChange={(e) => onChange({ config: { ...action.config, message: e.target.value } })}
                className="mt-1"
                rows={3}
              />
            </div>
            <div>
              <Label className="text-sm">Notify</Label>
              <Input
                placeholder="User email or 'all_sales_reps'"
                value={action.config?.recipient || ''}
                onChange={(e) => onChange({ config: { ...action.config, recipient: e.target.value } })}
                className="mt-1"
              />
            </div>
          </div>
        );

      case 'wait':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-sm">Wait Duration</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Input
                  type="number"
                  placeholder="Number"
                  value={action.config?.duration || ''}
                  onChange={(e) => onChange({ config: { ...action.config, duration: e.target.value } })}
                />
                <Select
                  value={action.config?.unit || 'days'}
                  onValueChange={(value) => onChange({ config: { ...action.config, unit: value } })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'condition':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-sm">Condition Field</Label>
              <Select
                value={action.config?.field || ''}
                onValueChange={(value) => onChange({ config: { ...action.config, field: value } })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select field to check" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead_score">Lead Score</SelectItem>
                  <SelectItem value="lead_status">Lead Status</SelectItem>
                  <SelectItem value="deal_value">Deal Value</SelectItem>
                  <SelectItem value="email_opened">Email Opened</SelectItem>
                  <SelectItem value="link_clicked">Link Clicked</SelectItem>
                  <SelectItem value="has_tag">Has Tag</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Operator</Label>
              <Select
                value={action.config?.operator || ''}
                onValueChange={(value) => onChange({ config: { ...action.config, operator: value } })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="not_equals">Not Equals</SelectItem>
                  <SelectItem value="greater_than">Greater Than</SelectItem>
                  <SelectItem value="less_than">Less Than</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Value</Label>
              <Input
                placeholder="Comparison value"
                value={action.config?.value || ''}
                onChange={(e) => onChange({ config: { ...action.config, value: e.target.value } })}
                className="mt-1"
              />
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
              Based on this condition, subsequent actions will execute differently.
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-2 block">Action Type</Label>
        <Select value={action.type} onValueChange={(value) => onChange({ type: value, config: {} })}>
          <SelectTrigger>
            <SelectValue placeholder="Select an action" />
          </SelectTrigger>
          <SelectContent>
            {actionTypes.map((actionType) => (
              <SelectItem key={actionType.value} value={actionType.value}>
                <div className="flex items-center gap-2">
                  <span>{actionType.icon}</span>
                  <span>{actionType.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {action.type && (
        <div className="p-3 bg-gray-100 border rounded-lg">
          <Label className="text-sm font-medium mb-3 block">Action Configuration</Label>
          {renderConfigInputs()}
        </div>
      )}
    </div>
  );
}