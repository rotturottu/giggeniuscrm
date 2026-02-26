import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Settings, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import EmailTemplateBuilder from '../email/EmailTemplateBuilder';

export default function NodeConfigPanel({ node, typeDef, onUpdate, onClose }) {
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const { data: templates = [] } = useQuery({
    queryKey: ['email-templates-auto'],
    queryFn: () => base44.entities.EmailTemplate.list('-created_date', 100),
  });
  const { data: users = [] } = useQuery({
    queryKey: ['users-auto'],
    queryFn: () => base44.entities.User.list(),
  });
  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns-auto'],
    queryFn: () => base44.entities.EmailCampaign.list('-created_date', 100),
  });

  const cfg = node.config || {};
  const set = (field, val) => onUpdate({ [field]: val });

  const renderFields = () => {
    switch (node.type) {
      case 'send_email': {
        const selectedTpl = templates.find(t => t.id === cfg.template_id);
        const isCustom = !cfg.template_id;
        return (
          <>
            <div>
              <Label className="text-xs text-gray-500">Email Source</Label>
              <Select value={cfg.template_id || '__custom'} onValueChange={v => {
                if (v === '__custom') {
                  onUpdate({ template_id: '', subject: cfg.subject || '', body: cfg.body || '' });
                } else {
                  const tpl = templates.find(t => t.id === v);
                  onUpdate({ template_id: v, subject: tpl?.subject || '', body: tpl?.body || '' });
                }
              }}>
                <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue placeholder="Select template" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__custom">✏️ Write Custom Email</SelectItem>
                  {templates.length > 0 && templates.map(t => <SelectItem key={t.id} value={t.id}>📧 {t.name}</SelectItem>)}
                  {templates.length === 0 && <SelectItem value="__none" disabled>No templates — create one below</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 w-full text-xs gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50"
              onClick={() => setShowTemplateBuilder(true)}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {templates.length === 0 ? 'Create New Template' : 'Create / Manage Templates'}
            </Button>
            {selectedTpl && (
              <div className="mt-2 border rounded overflow-hidden">
                <div className="text-xs bg-gray-50 px-2 py-1 font-medium text-gray-600 border-b">Subject: {selectedTpl.subject}</div>
                {selectedTpl.visual_blocks?.length > 0
                  ? <iframe srcDoc={selectedTpl.body} title="preview" className="w-full border-0" style={{ height: '150px' }} sandbox="allow-same-origin" />
                  : <div className="p-2 text-xs text-gray-500 max-h-24 overflow-y-auto whitespace-pre-wrap">{selectedTpl.body?.slice(0, 300)}{selectedTpl.body?.length > 300 ? '...' : ''}</div>
                }
              </div>
            )}
            {isCustom && (
              <>
                <div>
                  <Label className="text-xs text-gray-500">Subject</Label>
                  <Input value={cfg.subject || ''} onChange={e => set('subject', e.target.value)} placeholder="Email subject..." className="mt-1 h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Body</Label>
                  <Textarea value={cfg.body || ''} onChange={e => set('body', e.target.value)} placeholder="Email body... Use {{first_name}}" rows={4} className="mt-1 text-sm resize-none" />
                </div>
                <div className="flex flex-wrap gap-1">
                  {['{{first_name}}','{{company}}','{{lead_email}}','{{current_date}}'].map(v => (
                    <button key={v} onClick={() => set('body', (cfg.body || '') + v)}
                      className="px-1.5 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100">{v}</button>
                  ))}
                </div>
              </>
            )}
          </>
        );
      }

      case 'wait':
        return (
          <>
            <div>
              <Label className="text-xs text-gray-500">Wait for</Label>
              <div className="flex gap-2 mt-1">
                <Input type="number" min="1" value={cfg.wait_days || 1} onChange={e => set('wait_days', Number(e.target.value))} className="h-8 text-sm w-20" />
                <Select value={cfg.wait_unit || 'days'} onValueChange={v => set('wait_unit', v)}>
                  <SelectTrigger className="h-8 text-sm flex-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Send time (optional)</Label>
              <Input type="time" value={cfg.send_at_time || ''} onChange={e => set('send_at_time', e.target.value)} className="mt-1 h-8 text-sm" />
            </div>
          </>
        );

      case 'condition':
        return (
          <>
            <div>
              <Label className="text-xs text-gray-500">Condition Type</Label>
              <Select value={cfg.condition_type || ''} onValueChange={v => set('condition_type', v)}>
                <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue placeholder="Select condition" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email_opened">Email Was Opened</SelectItem>
                  <SelectItem value="link_clicked">Link Was Clicked</SelectItem>
                  <SelectItem value="no_response">No Response</SelectItem>
                  <SelectItem value="has_tag">Has Tag</SelectItem>
                  <SelectItem value="opp_value_gt">Opportunity Value &gt; X</SelectItem>
                  <SelectItem value="contact_status">Contact Status Is</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {cfg.condition_type === 'has_tag' && (
              <div>
                <Label className="text-xs text-gray-500">Tag name</Label>
                <Input value={cfg.tag || ''} onChange={e => set('tag', e.target.value)} placeholder="e.g. Lead" className="mt-1 h-8 text-sm" />
              </div>
            )}
            {cfg.condition_type === 'opp_value_gt' && (
              <div>
                <Label className="text-xs text-gray-500">Value ($)</Label>
                <Input type="number" value={cfg.opp_value || ''} onChange={e => set('opp_value', e.target.value)} className="mt-1 h-8 text-sm" />
              </div>
            )}
            {cfg.condition_type === 'no_response' && (
              <div>
                <Label className="text-xs text-gray-500">After how many days?</Label>
                <Input type="number" value={cfg.no_response_days || 3} onChange={e => set('no_response_days', e.target.value)} className="mt-1 h-8 text-sm" />
              </div>
            )}
            {cfg.condition_type === 'contact_status' && (
              <div>
                <Label className="text-xs text-gray-500">Status</Label>
                <Select value={cfg.contact_status || ''} onValueChange={v => set('contact_status', v)}>
                  <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subscribed">Subscribed</SelectItem>
                    <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <p className="text-xs text-blue-500 bg-blue-50 p-2 rounded">YES branch continues down, NO branch goes to next node after condition.</p>
          </>
        );

      case 'add_tag':
      case 'remove_tag':
        return (
          <div>
            <Label className="text-xs text-gray-500">Tag</Label>
            <Input value={cfg.tag || ''} onChange={e => set('tag', e.target.value)} placeholder="Tag name" className="mt-1 h-8 text-sm" />
          </div>
        );

      case 'assign_salesperson':
        return (
          <div>
            <Label className="text-xs text-gray-500">Salesperson</Label>
            <Select value={cfg.salesperson || ''} onValueChange={v => set('salesperson', v)}>
              <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {users.map(u => <SelectItem key={u.email} value={u.email}>{u.full_name || u.email}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        );

      case 'move_to_campaign':
        return (
          <div>
            <Label className="text-xs text-gray-500">Campaign</Label>
            <Select value={cfg.campaign_id || ''} onValueChange={v => set('campaign_id', v)}>
              <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue placeholder="Select campaign" /></SelectTrigger>
              <SelectContent>
                {campaigns.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        );

      case 'change_status':
        return (
          <div>
            <Label className="text-xs text-gray-500">New Status</Label>
            <Select value={cfg.new_status || ''} onValueChange={v => set('new_status', v)}>
              <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="subscribed">Subscribed</SelectItem>
                <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'create_opportunity':
        return (
          <>
            <div>
              <Label className="text-xs text-gray-500">Pipeline</Label>
              <Input value={cfg.pipeline || ''} onChange={e => set('pipeline', e.target.value)} placeholder="Pipeline name" className="mt-1 h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Stage</Label>
              <Select value={cfg.stage || ''} onValueChange={v => set('stage', v)}>
                <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['prospecting','qualification','proposal','negotiation','closed_won','closed_lost'].map(s => (
                    <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Value ($)</Label>
              <Input type="number" value={cfg.value || ''} onChange={e => set('value', e.target.value)} className="mt-1 h-8 text-sm" />
            </div>
          </>
        );

      case 'update_opportunity':
        return (
          <>
            <div>
              <Label className="text-xs text-gray-500">Update Stage To</Label>
              <Select value={cfg.stage || ''} onValueChange={v => set('stage', v)}>
                <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue placeholder="No change" /></SelectTrigger>
                <SelectContent>
                  {['prospecting','qualification','proposal','negotiation','closed_won','closed_lost'].map(s => (
                    <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Update Status To</Label>
              <Select value={cfg.status || ''} onValueChange={v => set('status', v)}>
                <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue placeholder="No change" /></SelectTrigger>
                <SelectContent>
                  {['active','on_hold','won','lost'].map(s => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Note (optional)</Label>
              <Textarea value={cfg.note || ''} onChange={e => set('note', e.target.value)} rows={2} className="mt-1 text-sm resize-none" />
            </div>
          </>
        );

      case 'update_contact':
        return (
          <>
            <div>
              <Label className="text-xs text-gray-500">Field to Update</Label>
              <Select value={cfg.field || ''} onValueChange={v => set('field', v)}>
                <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue placeholder="Select field" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="contact_type">Contact Type</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="campaign_name">Campaign</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="source">Source</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-500">New Value</Label>
              <Input value={cfg.field_value || ''} onChange={e => set('field_value', e.target.value)} className="mt-1 h-8 text-sm" />
            </div>
          </>
        );

      case 'send_sms':
        return (
          <div>
            <Label className="text-xs text-gray-500">SMS Message</Label>
            <Textarea value={cfg.body || ''} onChange={e => set('body', e.target.value)} placeholder="Message text... Use {{first_name}}" rows={3} className="mt-1 text-sm resize-none" />
            <div className="flex flex-wrap gap-1 mt-1">
              {['{{first_name}}','{{company}}','{{lead_email}}'].map(v => (
                <button key={v} onClick={() => set('body', (cfg.body || '') + v)} className="px-1.5 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100">{v}</button>
              ))}
            </div>
          </div>
        );

      case 'send_voicemail':
        return (
          <>
            <div>
              <Label className="text-xs text-gray-500">Voicemail Script</Label>
              <Textarea value={cfg.script || ''} onChange={e => set('script', e.target.value)} placeholder="What should the call/voicemail say..." rows={3} className="mt-1 text-sm resize-none" />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Type</Label>
              <Select value={cfg.call_type || 'voicemail'} onValueChange={v => set('call_type', v)}>
                <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="voicemail">Voicemail Drop</SelectItem>
                  <SelectItem value="outbound_call">Outbound Call</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'send_dm':
        return (
          <>
            <div>
              <Label className="text-xs text-gray-500">Platform</Label>
              <Select value={cfg.platform || 'facebook'} onValueChange={v => set('platform', v)}>
                <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="facebook">Facebook Messenger</SelectItem>
                  <SelectItem value="instagram">Instagram DM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Message</Label>
              <Textarea value={cfg.body || ''} onChange={e => set('body', e.target.value)} placeholder="DM message..." rows={3} className="mt-1 text-sm resize-none" />
            </div>
          </>
        );

      case 'add_note':
        return (
          <div>
            <Label className="text-xs text-gray-500">Note</Label>
            <Textarea value={cfg.note || ''} onChange={e => set('note', e.target.value)} placeholder="Note content..." rows={3} className="mt-1 text-sm resize-none" />
          </div>
        );

      case 'add_task':
        return (
          <>
            <div>
              <Label className="text-xs text-gray-500">Task Title</Label>
              <Input value={cfg.title || ''} onChange={e => set('title', e.target.value)} placeholder="Task title" className="mt-1 h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Due (days from now)</Label>
              <Input type="number" min="0" value={cfg.due_days || 1} onChange={e => set('due_days', Number(e.target.value))} className="mt-1 h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Priority</Label>
              <Select value={cfg.priority || 'medium'} onValueChange={v => set('priority', v)}>
                <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'send_notification':
        return (
          <>
            <div>
              <Label className="text-xs text-gray-500">Notify User</Label>
              <Select value={cfg.notify_user || ''} onValueChange={v => set('notify_user', v)}>
                <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue placeholder="Select user" /></SelectTrigger>
                <SelectContent>
                  {users.map(u => <SelectItem key={u.email} value={u.email}>{u.full_name || u.email}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Message</Label>
              <Textarea value={cfg.message || ''} onChange={e => set('message', e.target.value)} placeholder="Notification message..." rows={2} className="mt-1 text-sm resize-none" />
            </div>
          </>
        );

      case 'send_review_request':
        return (
          <div>
            <Label className="text-xs text-gray-500">Review Message (optional)</Label>
            <Textarea value={cfg.message || ''} onChange={e => set('message', e.target.value)} placeholder="Hi {{first_name}}, we'd love your feedback..." rows={3} className="mt-1 text-sm resize-none" />
          </div>
        );

      case 'add_to_workflow':
        return (
          <div>
            <Label className="text-xs text-gray-500">Workflow Name</Label>
            <Input value={cfg.workflow_name || ''} onChange={e => set('workflow_name', e.target.value)} placeholder="Name of the workflow to add to" className="mt-1 h-8 text-sm" />
          </div>
        );

      case 'remove_from_workflow':
        return (
          <div>
            <Label className="text-xs text-gray-500">Remove from</Label>
            <Select value={cfg.scope || 'current'} onValueChange={v => set('scope', v)}>
              <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="current">This Workflow</SelectItem>
                <SelectItem value="all">All Active Workflows</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'custom_webhook':
        return (
          <>
            <div>
              <Label className="text-xs text-gray-500">Webhook URL</Label>
              <Input value={cfg.url || ''} onChange={e => set('url', e.target.value)} placeholder="https://your-endpoint.com/hook" className="mt-1 h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Method</Label>
              <Select value={cfg.method || 'POST'} onValueChange={v => set('method', v)}>
                <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'stripe_charge':
        return (
          <>
            <div>
              <Label className="text-xs text-gray-500">Amount ($)</Label>
              <Input type="number" min="0.50" step="0.01" value={cfg.amount || ''} onChange={e => set('amount', e.target.value)} placeholder="e.g. 49.00" className="mt-1 h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Description</Label>
              <Input value={cfg.description || ''} onChange={e => set('description', e.target.value)} placeholder="Charge description" className="mt-1 h-8 text-sm" />
            </div>
          </>
        );

      case 'google_sheets':
        return (
          <>
            <div>
              <Label className="text-xs text-gray-500">Action</Label>
              <Select value={cfg.sheets_action || 'add_row'} onValueChange={v => set('sheets_action', v)}>
                <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="add_row">Add Row</SelectItem>
                  <SelectItem value="lookup_row">Lookup Row</SelectItem>
                  <SelectItem value="delete_row">Delete Row</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Sheet URL / ID</Label>
              <Input value={cfg.sheet_id || ''} onChange={e => set('sheet_id', e.target.value)} placeholder="Google Sheet URL or ID" className="mt-1 h-8 text-sm" />
            </div>
          </>
        );

      default:
        return <p className="text-sm text-gray-400 italic">No configuration needed for this node.</p>;
    }
  };

  return (
    <>
      <div className="bg-white border rounded-xl shadow-sm h-full overflow-y-auto">
        <div className="flex items-center justify-between p-3 border-b bg-gray-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">{typeDef?.label || 'Configure Node'}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-3 space-y-3">
          {renderFields()}
        </div>
      </div>
      <EmailTemplateBuilder
        open={showTemplateBuilder}
        onClose={() => setShowTemplateBuilder(false)}
        template={null}
      />
    </>
  );
}