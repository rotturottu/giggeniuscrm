import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { Plus, TrendingUp, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function EnhancedSegmentBuilder({ criteria, onChange, onEstimatedCountChange }) {
  const [rules, setRules] = useState([]);

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list(),
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['email-campaigns'],
    queryFn: () => base44.entities.EmailCampaign.filter({ status: 'sent' }),
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ['email-metrics'],
    queryFn: () => base44.entities.EmailCampaignMetric.list(),
  });

  useEffect(() => {
    if (criteria && criteria.rules && criteria.rules.length > 0) {
      setRules(criteria.rules);
    } else {
      setRules([{ field: 'status', operator: 'equals', value: 'subscribed' }]);
    }
  }, [criteria]);

  const fieldOptions = [
    { value: 'status', label: 'Subscription Status', type: 'enum' },
    { value: 'first_name', label: 'First Name', type: 'text' },
    { value: 'last_name', label: 'Last Name', type: 'text' },
    { value: 'email', label: 'Email', type: 'text' },
    { value: 'company', label: 'Company', type: 'text' },
    { value: 'tags', label: 'Tags', type: 'array' },
    { value: 'source', label: 'Lead Source', type: 'text' },
    { value: 'last_engaged', label: 'Last Engaged Date', type: 'date' },
    { value: 'subscribed_at', label: 'Subscription Date', type: 'date' },
    { value: 'opened_email', label: 'Opened Email', type: 'behavior' },
    { value: 'clicked_link', label: 'Clicked Link', type: 'behavior' },
    { value: 'bounced_email', label: 'Email Bounced', type: 'behavior' },
    { value: 'engagement_score', label: 'Engagement Score', type: 'number' },
  ];

  const operatorsByType = {
    text: ['equals', 'contains', 'starts_with', 'ends_with', 'not_equals'],
    enum: ['equals', 'not_equals', 'in'],
    array: ['contains', 'not_contains'],
    date: ['before', 'after', 'within_days'],
    behavior: ['has', 'has_not'],
    number: ['equals', 'greater_than', 'less_than', 'between'],
  };

  const statusOptions = ['subscribed', 'unsubscribed', 'bounced', 'complained'];

  const addRule = () => {
    setRules([...rules, { field: 'status', operator: 'equals', value: '' }]);
  };

  const removeRule = (index) => {
    const newRules = rules.filter((_, i) => i !== index);
    setRules(newRules);
    updateCriteria(newRules);
  };

  const updateRule = (index, field, value) => {
    const newRules = [...rules];
    newRules[index][field] = value;
    
    // Reset operator when field changes
    if (field === 'field') {
      const fieldType = fieldOptions.find(f => f.value === value)?.type;
      newRules[index].operator = operatorsByType[fieldType]?.[0] || 'equals';
      newRules[index].value = '';
    }
    
    setRules(newRules);
    updateCriteria(newRules);
  };

  const updateCriteria = (newRules) => {
    onChange({ rules: newRules });
    calculateEstimate(newRules);
  };

  const calculateEstimate = (rulesArray) => {
    let filteredContacts = [...contacts];

    rulesArray.forEach(rule => {
      if (!rule.value && rule.field !== 'opened_email' && rule.field !== 'clicked_link' && rule.field !== 'bounced_email') return;

      switch (rule.field) {
        case 'status':
          if (rule.operator === 'equals') {
            filteredContacts = filteredContacts.filter(c => c.status === rule.value);
          }
          break;
        case 'email':
        case 'first_name':
        case 'last_name':
        case 'company':
        case 'source':
          if (rule.operator === 'contains') {
            filteredContacts = filteredContacts.filter(c => 
              c[rule.field]?.toLowerCase().includes(rule.value.toLowerCase())
            );
          } else if (rule.operator === 'equals') {
            filteredContacts = filteredContacts.filter(c => 
              c[rule.field]?.toLowerCase() === rule.value.toLowerCase()
            );
          }
          break;
        case 'tags':
          if (rule.operator === 'contains') {
            filteredContacts = filteredContacts.filter(c => 
              c.tags?.includes(rule.value)
            );
          }
          break;
        case 'last_engaged':
          if (rule.operator === 'within_days') {
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - parseInt(rule.value));
            filteredContacts = filteredContacts.filter(c => 
              c.last_engaged && new Date(c.last_engaged) >= daysAgo
            );
          }
          break;
        case 'opened_email':
          const openedEmails = metrics.filter(m => m.opened_at).map(m => m.recipient_email);
          if (rule.operator === 'has') {
            filteredContacts = filteredContacts.filter(c => openedEmails.includes(c.email));
          } else if (rule.operator === 'has_not') {
            filteredContacts = filteredContacts.filter(c => !openedEmails.includes(c.email));
          }
          break;
        case 'clicked_link':
          const clickedEmails = metrics.filter(m => m.clicked_at).map(m => m.recipient_email);
          if (rule.operator === 'has') {
            filteredContacts = filteredContacts.filter(c => clickedEmails.includes(c.email));
          } else if (rule.operator === 'has_not') {
            filteredContacts = filteredContacts.filter(c => !clickedEmails.includes(c.email));
          }
          break;
        case 'bounced_email':
          const bouncedEmails = metrics.filter(m => m.bounced).map(m => m.recipient_email);
          if (rule.operator === 'has') {
            filteredContacts = filteredContacts.filter(c => bouncedEmails.includes(c.email));
          } else if (rule.operator === 'has_not') {
            filteredContacts = filteredContacts.filter(c => !bouncedEmails.includes(c.email));
          }
          break;
      }
    });

    onEstimatedCountChange(filteredContacts.length);
  };

  useEffect(() => {
    calculateEstimate(rules);
  }, [contacts, metrics]);

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          Advanced Segmentation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rules.map((rule, index) => (
            <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
              <Select
                value={rule.field}
                onValueChange={(value) => updateRule(index, 'field', value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fieldOptions.map((field) => (
                    <SelectItem key={field.value} value={field.value}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={rule.operator}
                onValueChange={(value) => updateRule(index, 'operator', value)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(operatorsByType[fieldOptions.find(f => f.value === rule.field)?.type] || ['equals']).map((op) => (
                    <SelectItem key={op} value={op}>
                      {op.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {rule.field === 'status' ? (
                <Select
                  value={rule.value}
                  onValueChange={(value) => updateRule(index, 'value', value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (rule.field === 'opened_email' || rule.field === 'clicked_link' || rule.field === 'bounced_email') ? (
                <div className="flex-1 px-3 py-2 text-sm text-gray-500 bg-white rounded border">
                  Any campaign
                </div>
              ) : (
                <Input
                  placeholder="Enter value"
                  value={rule.value}
                  onChange={(e) => updateRule(index, 'value', e.target.value)}
                  className="flex-1"
                  type={fieldOptions.find(f => f.value === rule.field)?.type === 'number' ? 'number' : 'text'}
                />
              )}

              {rules.length > 1 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeRule(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}

          <Button onClick={addRule} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Rule
          </Button>

          <div className="pt-3 border-t">
            <p className="text-sm text-gray-600">
              All rules must match (AND logic)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}