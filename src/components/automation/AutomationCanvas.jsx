import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, Mail, Clock, GitBranch, Tag, UserCheck, RefreshCw, DollarSign, 
  MoveRight, Plus, X, Settings, Play, MousePointer, AlertCircle,
  MessageSquare, Phone, Bell, Star, Webhook, FileText, Calendar,
  BookOpen, Gift, Trash2, ExternalLink, Users, StickyNote, CheckSquare,
  ShoppingCart, Link, Send
} from 'lucide-react';
import NodeConfigPanel from './NodeConfigPanel';
import { validateNode, validateWorkflow, runWorkflow } from './automationEngine';

const TRIGGER_CATEGORIES = [
  {
    label: 'Contact',
    triggers: [
      { id: 'contact_created', label: 'Contact Created', icon: UserCheck, color: 'from-blue-500 to-blue-600' },
      { id: 'contact_changed', label: 'Contact Changed', icon: RefreshCw, color: 'from-cyan-500 to-cyan-600' },
      { id: 'tag_added', label: 'Tag Added', icon: Tag, color: 'from-teal-500 to-teal-600' },
      { id: 'tag_removed', label: 'Tag Removed', icon: Tag, color: 'from-red-500 to-red-600' },
      { id: 'birthday_reminder', label: 'Birthday Reminder', icon: Gift, color: 'from-pink-500 to-pink-600' },
      { id: 'custom_date_reminder', label: 'Custom Date Reminder', icon: Calendar, color: 'from-rose-500 to-rose-600' },
      { id: 'note_added', label: 'Note Added / Changed', icon: StickyNote, color: 'from-amber-500 to-amber-600' },
      { id: 'task_added', label: 'Task Added', icon: CheckSquare, color: 'from-lime-500 to-lime-600' },
      { id: 'task_completed', label: 'Task Completed', icon: CheckSquare, color: 'from-green-500 to-green-600' },
    ],
  },
  {
    label: 'Appointment',
    triggers: [
      { id: 'appointment_status', label: 'Appointment Status Changed', icon: Calendar, color: 'from-violet-500 to-violet-600' },
      { id: 'customer_booked', label: 'Customer Booked Appointment', icon: Calendar, color: 'from-purple-500 to-purple-600' },
    ],
  },
  {
    label: 'Forms & Submissions',
    triggers: [
      { id: 'form_submission', label: 'Form Submitted', icon: FileText, color: 'from-indigo-500 to-indigo-600' },
      { id: 'survey_submitted', label: 'Survey Submitted', icon: FileText, color: 'from-blue-500 to-blue-600' },
      { id: 'order_form_submission', label: 'Order Form Submission', icon: ShoppingCart, color: 'from-emerald-500 to-emerald-600' },
    ],
  },
  {
    label: 'Communication',
    triggers: [
      { id: 'email_opened', label: 'Email Opened', icon: Mail, color: 'from-green-500 to-green-600' },
      { id: 'email_clicked', label: 'Link Clicked', icon: MousePointer, color: 'from-lime-500 to-lime-600' },
      { id: 'trigger_link_clicked', label: 'Trigger Link Clicked', icon: Link, color: 'from-yellow-500 to-yellow-600' },
      { id: 'customer_replied', label: 'Customer Replied', icon: MessageSquare, color: 'from-orange-500 to-orange-600' },
      { id: 'call_event', label: 'Call / Email Event', icon: Phone, color: 'from-red-500 to-red-600' },
      { id: 'no_response', label: 'No Response After X Days', icon: AlertCircle, color: 'from-orange-500 to-orange-600' },
    ],
  },
  {
    label: 'Opportunity',
    triggers: [
      { id: 'opportunity_created', label: 'Opportunity Created', icon: DollarSign, color: 'from-purple-500 to-purple-600' },
      { id: 'opportunity_stage_changed', label: 'Opportunity Stage Changed', icon: GitBranch, color: 'from-pink-500 to-pink-600' },
      { id: 'contact_status_changed', label: 'Contact Status Changed', icon: RefreshCw, color: 'from-fuchsia-500 to-fuchsia-600' },
    ],
  },
  {
    label: 'Membership / Courses',
    triggers: [
      { id: 'membership_signup', label: 'Membership Signup', icon: BookOpen, color: 'from-sky-500 to-sky-600' },
      { id: 'category_completed', label: 'Category / Product Completed', icon: BookOpen, color: 'from-teal-500 to-teal-600' },
      { id: 'offer_access_granted', label: 'Offer Access Granted', icon: Gift, color: 'from-green-500 to-green-600' },
      { id: 'offer_access_removed', label: 'Offer Access Removed', icon: Gift, color: 'from-red-500 to-red-600' },
    ],
  },
  {
    label: 'Advanced',
    triggers: [
      { id: 'inbound_webhook', label: 'Inbound Webhook', icon: Webhook, color: 'from-gray-600 to-gray-700' },
      { id: 'document_event', label: 'Document / Contract Event', icon: FileText, color: 'from-slate-500 to-slate-600' },
      { id: 'manual', label: 'Manual Start', icon: Play, color: 'from-gray-500 to-gray-600' },
    ],
  },
];

const TRIGGER_TYPES = TRIGGER_CATEGORIES.flatMap(c => c.triggers);

const ACTION_TYPES = [
  // Messaging
  { id: 'send_email', label: 'Send Email', icon: Mail, color: 'from-blue-400 to-blue-500', category: 'Communication' },
  { id: 'send_sms', label: 'Send SMS', icon: MessageSquare, color: 'from-green-400 to-green-500', category: 'Communication' },
  { id: 'send_voicemail', label: 'Call / Voicemail', icon: Phone, color: 'from-teal-400 to-teal-500', category: 'Communication' },
  { id: 'send_dm', label: 'Messenger / Instagram DM', icon: Send, color: 'from-pink-400 to-pink-500', category: 'Communication' },
  // Contact
  { id: 'add_tag', label: 'Add Tag', icon: Tag, color: 'from-green-400 to-green-500', category: 'Contact' },
  { id: 'remove_tag', label: 'Remove Tag', icon: Tag, color: 'from-red-400 to-red-500', category: 'Contact' },
  { id: 'update_contact', label: 'Update Contact', icon: UserCheck, color: 'from-purple-400 to-purple-500', category: 'Contact' },
  { id: 'assign_salesperson', label: 'Assign / Reassign Contact', icon: Users, color: 'from-indigo-400 to-indigo-500', category: 'Contact' },
  { id: 'move_to_campaign', label: 'Move to Campaign', icon: MoveRight, color: 'from-pink-400 to-pink-500', category: 'Contact' },
  { id: 'change_status', label: 'Change Status', icon: RefreshCw, color: 'from-orange-400 to-orange-500', category: 'Contact' },
  { id: 'add_note', label: 'Add Note', icon: StickyNote, color: 'from-yellow-400 to-yellow-500', category: 'Contact' },
  // Opportunity
  { id: 'create_opportunity', label: 'Create Opportunity', icon: DollarSign, color: 'from-emerald-400 to-emerald-500', category: 'Opportunity' },
  { id: 'update_opportunity', label: 'Update Opportunity', icon: DollarSign, color: 'from-teal-400 to-teal-500', category: 'Opportunity' },
  // Tasks & Notifications
  { id: 'add_task', label: 'Add Task', icon: CheckSquare, color: 'from-violet-400 to-violet-500', category: 'Tasks & Notifications' },
  { id: 'send_notification', label: 'Send Internal Notification', icon: Bell, color: 'from-amber-400 to-amber-500', category: 'Tasks & Notifications' },
  { id: 'send_review_request', label: 'Send Review Request', icon: Star, color: 'from-yellow-400 to-yellow-500', category: 'Tasks & Notifications' },
  // Logic & Control
  { id: 'condition', label: 'If / Else Condition', icon: GitBranch, color: 'from-yellow-400 to-yellow-500', category: 'Logic' },
  { id: 'wait', label: 'Wait / Delay', icon: Clock, color: 'from-gray-400 to-gray-500', category: 'Logic' },
  { id: 'add_to_workflow', label: 'Add to Workflow', icon: Zap, color: 'from-blue-400 to-blue-500', category: 'Logic' },
  { id: 'remove_from_workflow', label: 'Remove from Workflow', icon: Trash2, color: 'from-red-400 to-red-500', category: 'Logic' },
  // External
  { id: 'custom_webhook', label: 'Custom Webhook', icon: Webhook, color: 'from-gray-500 to-gray-600', category: 'Integrations' },
  { id: 'stripe_charge', label: 'Stripe Charge', icon: DollarSign, color: 'from-purple-500 to-purple-600', category: 'Integrations' },
  { id: 'google_sheets', label: 'Google Sheets', icon: FileText, color: 'from-green-500 to-green-600', category: 'Integrations' },
];

function NodeCard({ node, selected, onClick, onDelete, isFirst }) {
  const allTypes = [...TRIGGER_TYPES, ...ACTION_TYPES];
  const typeDef = allTypes.find(t => t.id === node.type) || { label: node.type, icon: Zap, color: 'from-gray-400 to-gray-500' };
  const Icon = typeDef.icon;
  const errors = validateNode(node);
  const hasErrors = errors.length > 0;

  return (
    <div
      onClick={onClick}
      className={`relative group cursor-pointer bg-white rounded-xl border-2 shadow-sm hover:shadow-md transition-all w-56 ${
        selected ? 'border-blue-500 shadow-blue-100' : hasErrors ? 'border-red-300' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {!isFirst && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-gray-300" />
      )}
      <div className={`bg-gradient-to-r ${typeDef.color} p-3 rounded-t-xl flex items-center gap-2`}>
        <Icon className="w-4 h-4 text-white flex-shrink-0" />
        <span className="text-white text-sm font-semibold truncate">{typeDef.label}</span>
        {hasErrors && <AlertCircle className="w-3.5 h-3.5 text-red-200 ml-auto flex-shrink-0" />}
      </div>
      <div className="p-3">
        {node.config?.subject && <p className="text-xs text-gray-500 truncate">📧 {node.config.subject}</p>}
        {node.config?.wait_days && <p className="text-xs text-gray-500">⏱ Wait {node.config.wait_days} {node.config.wait_unit || 'day(s)'}</p>}
        {node.config?.tag && <p className="text-xs text-gray-500">🏷 {node.config.tag}</p>}
        {node.config?.condition_type && <p className="text-xs text-gray-500">❓ {node.config.condition_type.replace(/_/g,' ')}</p>}
        {node.config?.new_status && <p className="text-xs text-gray-500">→ {node.config.new_status}</p>}
        {node.config?.salesperson && <p className="text-xs text-gray-500 truncate">👤 {node.config.salesperson}</p>}
        {!node.config?.subject && !node.config?.wait_days && !node.config?.tag && !node.config?.condition_type && !node.config?.new_status && !node.config?.salesperson && (
          <p className="text-xs text-gray-400 italic">Click to configure</p>
        )}
        {hasErrors && (
          <p className="text-xs text-red-500 mt-1 font-medium">⚠ {errors[0]}</p>
        )}
      </div>
      <button
        onClick={e => { e.stopPropagation(); onDelete(node.id); }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-white/70 hover:text-white transition-opacity"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      {node.type === 'condition' && (
        <div className="border-t px-3 pb-2 pt-1.5 flex justify-between text-xs text-gray-400">
          <span className="text-green-600 font-medium">YES ↓</span>
          <span className="text-red-500 font-medium">NO →</span>
        </div>
      )}
    </div>
  );
}

function AddNodeButton({ onAdd }) {
  const [open, setOpen] = useState(false);
  const categories = [...new Set(ACTION_TYPES.map(a => a.category))];

  return (
    <div className="relative flex justify-center">
      <div className="w-0.5 h-5 bg-gray-300 mx-auto" />
      <div className="absolute top-1">
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 rounded-full p-0 border-dashed border-blue-300 text-blue-500 hover:bg-blue-50"
          onClick={() => setOpen(!open)}
        >
          <Plus className="w-4 h-4" />
        </Button>
        {open && (
          <div className="absolute left-1/2 -translate-x-1/2 top-8 z-20 bg-white border rounded-xl shadow-xl w-64 p-2 space-y-1">
            {categories.map(cat => (
              <div key={cat}>
                <p className="text-xs font-semibold text-gray-400 uppercase px-2 pt-2 pb-1">{cat}</p>
                {ACTION_TYPES.filter(a => a.category === cat).map(action => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={() => { onAdd(action.id); setOpen(false); }}
                    >
                      <div className={`w-5 h-5 rounded bg-gradient-to-r ${action.color} flex items-center justify-center`}>
                        <Icon className="w-3 h-3 text-white" />
                      </div>
                      {action.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AutomationCanvas({ nodes, edges, trigger, onNodesChange, onEdgesChange, onTriggerChange }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [showTriggerPicker, setShowTriggerPicker] = useState(!trigger?.type);
  const [testResult, setTestResult] = useState(null);
  const [showTestPanel, setShowTestPanel] = useState(false);

  const addNode = (type) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type,
      config: {},
    };
    onNodesChange([...nodes, newNode]);
  };

  const deleteNode = (id) => {
    onNodesChange(nodes.filter(n => n.id !== id));
    if (selectedNode?.id === id) setSelectedNode(null);
  };

  const updateNodeConfig = (nodeId, config) => {
    onNodesChange(nodes.map(n => n.id === nodeId ? { ...n, config: { ...n.config, ...config } } : n));
    setSelectedNode(prev => prev?.id === nodeId ? { ...prev, config: { ...prev.config, ...config } } : prev);
  };

  const handleTestRun = () => {
    const samplePayload = {
      id: 'contact_demo',
      email: 'jane@example.com',
      first_name: 'Jane',
      name: 'Jane Smith',
      company: 'Acme Corp',
      status: 'subscribed',
      contact_type: 'lead',
      tags: ['prospect'],
      opportunity_stage: 'qualification',
      opportunity_value: 2500,
    };
    const result = runWorkflow(trigger, nodes, samplePayload);
    setTestResult(result);
    setShowTestPanel(true);
  };

  const validationIssues = validateWorkflow(trigger, nodes);
  const selectedNodeDef = selectedNode ? [...ACTION_TYPES, ...TRIGGER_TYPES].find(t => t.id === selectedNode.type) : null;

  return (
    <div className="flex flex-col h-full min-h-[500px] gap-3">
      {/* Validation Banner */}
      {validationIssues.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex flex-wrap gap-2 items-start">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-xs text-red-700 space-y-0.5">
            {validationIssues.map((issue, i) => <div key={i}>• {issue.message}</div>)}
          </div>
        </div>
      )}

      {/* Test Run Button */}
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-purple-600 border-purple-200 hover:bg-purple-50 h-7 text-xs"
          onClick={handleTestRun}
          disabled={validationIssues.length > 0}
        >
          <Play className="w-3 h-3" /> Test Run
        </Button>
      </div>

      <div className="flex flex-1 gap-4">
      {/* Canvas */}
      <div className="flex-1 bg-gray-50 rounded-xl border overflow-auto p-8">
        <div className="flex flex-col items-center space-y-0 min-h-full">
          {/* Trigger */}
          {!trigger?.type ? (
            <div
              className="w-56 border-2 border-dashed border-blue-300 rounded-xl p-4 text-center cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => setShowTriggerPicker(true)}
            >
              <Zap className="w-6 h-6 text-blue-400 mx-auto mb-1" />
              <p className="text-sm text-blue-500 font-medium">Click to set trigger</p>
            </div>
          ) : (
            <div
              className="w-56 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-3 cursor-pointer text-white shadow-md"
              onClick={() => setShowTriggerPicker(true)}
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-semibold">Trigger</span>
              </div>
              <p className="text-xs text-white/80 mt-1">{TRIGGER_TYPES.find(t => t.id === trigger.type)?.label || trigger.type}</p>
              {trigger.condition && <p className="text-xs text-white/60 mt-0.5 truncate">{JSON.stringify(trigger.condition)}</p>}
            </div>
          )}

          {/* Trigger Picker Dropdown */}
          {showTriggerPicker && (
            <div className="w-80 bg-white border rounded-xl shadow-xl z-20 p-3 mt-2 max-h-96 overflow-y-auto">
              <p className="text-xs font-semibold text-gray-400 uppercase px-2 pb-2">Select a Trigger</p>
              {TRIGGER_CATEGORIES.map(cat => (
                <div key={cat.label}>
                  <p className="text-xs font-bold text-gray-500 uppercase px-2 pt-2 pb-1 border-t first:border-t-0">{cat.label}</p>
                  {cat.triggers.map(t => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                        onClick={() => { onTriggerChange({ type: t.id, condition: {} }); setShowTriggerPicker(false); }}
                      >
                        <div className={`w-6 h-6 rounded bg-gradient-to-r ${t.color} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full mt-2 text-gray-400" onClick={() => setShowTriggerPicker(false)}>Cancel</Button>
            </div>
          )}

          {/* Nodes */}
          {nodes.map((node, idx) => (
            <React.Fragment key={node.id}>
              <AddNodeButton onAdd={addNode} />
              <NodeCard
                node={node}
                selected={selectedNode?.id === node.id}
                isFirst={false}
                onClick={() => setSelectedNode(node)}
                onDelete={deleteNode}
              />
            </React.Fragment>
          ))}

          {/* Add first/next node */}
          {trigger?.type && <AddNodeButton onAdd={addNode} />}
        </div>
      </div>

      {/* Config Panel or Test Result Panel */}
      {(selectedNode || showTestPanel) && (
        <div className="w-72 flex-shrink-0">
          {showTestPanel && testResult ? (
            <TestResultPanel result={testResult} onClose={() => setShowTestPanel(false)} />
          ) : selectedNode ? (
            <NodeConfigPanel
              node={selectedNode}
              typeDef={selectedNodeDef}
              onUpdate={(config) => updateNodeConfig(selectedNode.id, config)}
              onClose={() => setSelectedNode(null)}
            />
          ) : null}
        </div>
      )}
      </div>
    </div>
  );
}

function TestResultPanel({ result, onClose }) {
  const STATUS_ICON = { success: '✅', error: '❌', pending: '⏳' };
  return (
    <div className="bg-white border rounded-xl shadow-sm h-full overflow-y-auto">
      <div className="flex items-center justify-between p-3 border-b bg-gray-50 rounded-t-xl">
        <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          {result.success ? '✅' : '❌'} Test Run Result
        </span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-3 space-y-3">
        {!result.success && result.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-700">
            <p><strong>Failed at node:</strong> {result.error.failing_node_id}</p>
            <p>{result.error.message}</p>
          </div>
        )}
        {result.success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-xs text-green-700">
            All nodes executed successfully end-to-end.
          </div>
        )}
        <div className="space-y-1.5">
          {result.steps.map((step, i) => (
            <div key={step.node_id} className={`border rounded-lg p-2 text-xs ${step.status === 'error' ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
              <div className="flex items-center gap-1.5 font-medium text-gray-700">
                <span>{STATUS_ICON[step.status] || '⚙️'}</span>
                <span>{step.index}. {step.node_type.replace(/_/g,' ')}</span>
                {step.branch_taken && <span className={`ml-auto font-semibold ${step.branch_taken === 'YES' ? 'text-green-600' : 'text-red-500'}`}>{step.branch_taken}</span>}
              </div>
              {step.output && typeof step.output === 'string' && (
                <p className="text-gray-500 mt-0.5 pl-5">{step.output}</p>
              )}
              {step.output && typeof step.output === 'object' && (
                <div className="text-gray-500 mt-0.5 pl-5 space-y-0.5">
                  <p>To: {step.output.to}</p>
                  <p className="truncate">Subject: {step.output.subject}</p>
                </div>
              )}
              {step.error && <p className="text-red-500 mt-0.5 pl-5">{step.error}</p>}
            </div>
          ))}
        </div>
        {result.success && result.final_payload && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Final Contact State</p>
            <div className="bg-gray-50 border rounded p-2 text-xs text-gray-600 space-y-0.5">
              <p>Email: {result.final_payload.contact.email}</p>
              <p>Status: {result.final_payload.contact.status}</p>
              <p>Tags: {(result.final_payload.contact.tags || []).join(', ') || '—'}</p>
              {result.final_payload.contact.assigned_salesperson && <p>Assigned: {result.final_payload.contact.assigned_salesperson}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}