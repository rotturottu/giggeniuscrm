import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const triggerTypes = [
  { value: 'lead_score', label: 'Lead Score', description: 'When a lead\'s qualification score changes' },
  { value: 'lead_status', label: 'Lead Status', description: 'When a lead\'s status is updated' },
  { value: 'deal_value', label: 'Deal Value', description: 'When a deal value reaches a threshold' },
  { value: 'lead_source', label: 'Lead Source', description: 'When a lead comes from a specific source' },
  { value: 'no_activity', label: 'No Activity', description: 'When there\'s no activity for X days' },
  { value: 'user_signup', label: 'User Sign-up', description: 'When a user signs up or registers' },
  { value: 'user_purchase', label: 'User Purchase', description: 'When a user makes a purchase' },
  { value: 'user_inactivity', label: 'User Inactivity', description: 'When a user is inactive for X days' },
  { value: 'contact_created', label: 'Contact Created', description: 'When a new contact is added' },
  { value: 'tag_added', label: 'Tag Added', description: 'When a specific tag is added to a contact' },
];

export default function TriggerSelector({
  triggerType,
  triggerCondition,
  onTriggerTypeChange,
  onTriggerConditionChange,
}) {
  const renderConditionInputs = () => {
    switch (triggerType) {
      case 'lead_score':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Operator</Label>
              <Select
                value={triggerCondition.operator || ''}
                onValueChange={(value) => onTriggerConditionChange({ ...triggerCondition, operator: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="greater_than">Greater than</SelectItem>
                  <SelectItem value="less_than">Less than</SelectItem>
                  <SelectItem value="equal_to">Equal to</SelectItem>
                  <SelectItem value="between">Between</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Score Value</Label>
              <Input
                type="number"
                placeholder="e.g., 80"
                value={triggerCondition.value || ''}
                onChange={(e) => onTriggerConditionChange({ ...triggerCondition, value: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        );

      case 'lead_status':
        return (
          <div>
            <Label className="text-sm">Status Value</Label>
            <Select
              value={triggerCondition.status || ''}
              onValueChange={(value) => onTriggerConditionChange({ ...triggerCondition, status: value })}
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

      case 'deal_value':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Operator</Label>
              <Select
                value={triggerCondition.operator || ''}
                onValueChange={(value) => onTriggerConditionChange({ ...triggerCondition, operator: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="greater_than">Greater than</SelectItem>
                  <SelectItem value="less_than">Less than</SelectItem>
                  <SelectItem value="equal_to">Equal to</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Amount ($)</Label>
              <Input
                type="number"
                placeholder="e.g., 10000"
                value={triggerCondition.value || ''}
                onChange={(e) => onTriggerConditionChange({ ...triggerCondition, value: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        );

      case 'lead_source':
        return (
          <div>
            <Label className="text-sm">Source</Label>
            <Input
              placeholder="e.g., Website, Referral, Event"
              value={triggerCondition.source || ''}
              onChange={(e) => onTriggerConditionChange({ ...triggerCondition, source: e.target.value })}
              className="mt-1"
            />
          </div>
        );

      case 'no_activity':
      case 'user_inactivity':
        return (
          <div>
            <Label className="text-sm">Days of Inactivity</Label>
            <Input
              type="number"
              placeholder="e.g., 7"
              value={triggerCondition.days || ''}
              onChange={(e) => onTriggerConditionChange({ ...triggerCondition, days: e.target.value })}
              className="mt-1"
            />
          </div>
        );

      case 'user_signup':
      case 'user_purchase':
      case 'contact_created':
        return (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
            This workflow will trigger immediately when the event occurs.
          </div>
        );

      case 'tag_added':
        return (
          <div>
            <Label className="text-sm">Tag Name</Label>
            <Input
              placeholder="e.g., vip, newsletter"
              value={triggerCondition.tag || ''}
              onChange={(e) => onTriggerConditionChange({ ...triggerCondition, tag: e.target.value })}
              className="mt-1"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-2 block">Trigger Type</Label>
        <Select value={triggerType} onValueChange={onTriggerTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select when this workflow should trigger" />
          </SelectTrigger>
          <SelectContent>
            {triggerTypes.map((trigger) => (
              <SelectItem key={trigger.value} value={trigger.value}>
                <div>
                  <div className="font-medium">{trigger.label}</div>
                  <div className="text-xs text-gray-500">{trigger.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {triggerType && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Label className="text-sm font-medium mb-3 block">Trigger Conditions</Label>
          {renderConditionInputs()}
        </div>
      )}
    </div>
  );
}