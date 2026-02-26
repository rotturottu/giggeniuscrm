import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Save, Zap, BarChart3, FileText, Cloud, CloudOff } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import AutomationCanvas from './AutomationCanvas';
import AutomationAnalytics from './AutomationAnalytics';
import { validateWorkflow } from './automationEngine';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';

export default function AutomationBuilder({ open, onClose, automation }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [trigger, setTrigger] = useState({});
  const [autoSave, setAutoSave] = useState(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState(null); // 'saving' | 'saved' | null
  const autoSaveTimerRef = useRef(null);
  const savedAutomationIdRef = useRef(null);
  const queryClient = useQueryClient();

  const isDraft = !automation || automation.status === 'draft';
  const autoSaveEnabled = autoSave && isDraft;

  useEffect(() => {
    savedAutomationIdRef.current = automation?.id || null;
    if (automation) {
      setName(automation.name || '');
      setDescription(automation.description || '');
      setNodes(automation.nodes || []);
      setEdges(automation.edges || []);
      setTrigger(automation.trigger || {});
    } else {
      // Default: Welcome Email Sequence triggered by form submission
      setName('Welcome Email Sequence');
      setDescription('Automatically sends a welcome email when a contact submits a form');
      setTrigger({ type: 'form_submission', label: 'Form Submission' });
      setNodes([
        { id: 'wait-1', type: 'wait', label: 'Wait 1 minute', config: { wait_days: 1, wait_unit: 'minutes' }, position: { x: 180, y: 140 } },
        { id: 'email-1', type: 'send_email', label: 'Send Welcome Email', config: { subject: 'Welcome! Here\'s what\'s next 🎉', body: 'Hi {{first_name}}, thanks for reaching out. We\'ll be in touch shortly!' }, position: { x: 180, y: 260 } },
        { id: 'wait-2', type: 'wait', label: 'Wait 2 days', config: { wait_days: 2, wait_unit: 'days' }, position: { x: 180, y: 380 } },
        { id: 'email-2', type: 'send_email', label: 'Send Follow-up Email', config: { subject: 'Just checking in...', body: 'Hi {{first_name}}, we wanted to follow up and see if you had any questions.' }, position: { x: 180, y: 500 } },
      ]);
      setEdges([
        { id: 'e1', source: 'wait-1', target: 'email-1' },
        { id: 'e2', source: 'email-1', target: 'wait-2' },
        { id: 'e3', source: 'wait-2', target: 'email-2' },
      ]);
    }
  }, [automation, open]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const id = savedAutomationIdRef.current;
      return id
        ? base44.entities.CampaignAutomation.update(id, data)
        : base44.entities.CampaignAutomation.create(data);
    },
    onSuccess: (result, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-automations'] });
      if (result?.id) savedAutomationIdRef.current = result.id;
    },
  });

  const autoSaveMutation = useMutation({
    mutationFn: (data) => {
      const id = savedAutomationIdRef.current;
      return id
        ? base44.entities.CampaignAutomation.update(id, data)
        : base44.entities.CampaignAutomation.create(data);
    },
    onSuccess: (result) => {
      if (result?.id) savedAutomationIdRef.current = result.id;
      setAutoSaveStatus('saved');
    },
    onError: () => setAutoSaveStatus(null),
  });

  // Auto-save effect: triggers 2s after any change
  useEffect(() => {
    if (!autoSaveEnabled || !name) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    setAutoSaveStatus('saving');
    autoSaveTimerRef.current = setTimeout(() => {
      autoSaveMutation.mutate({ name, description, trigger, nodes, edges, status: 'draft' });
    }, 2000);
    return () => clearTimeout(autoSaveTimerRef.current);
  }, [name, description, trigger, nodes, edges, autoSaveEnabled]);

  const handleSave = () => {
    if (!name) { toast.error('Automation name is required'); return; }
    const issues = validateWorkflow(trigger, nodes);
    if (issues.length > 0) {
      toast.error(issues[0].message);
      return;
    }
    saveMutation.mutate(
      { name, description, trigger, nodes, edges, status: automation?.status || 'draft' },
      {
        onSuccess: () => {
          toast.success(`Automation ${savedAutomationIdRef.current && !automation ? 'created' : 'updated'}`);
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-500" />
            {automation ? 'Edit Automation' : 'New Automation'}
          </DialogTitle>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <Label className="text-xs text-gray-500">Automation Name *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Welcome Sequence" className="mt-1 h-8" />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Description</Label>
              <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description" className="mt-1 h-8" />
            </div>
          </div>
          {/* Auto Save Toggle */}
          <div className="flex items-center justify-between mt-3 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-center gap-2">
              {autoSaveEnabled ? <Cloud className="w-4 h-4 text-blue-500" /> : <CloudOff className="w-4 h-4 text-gray-400" />}
              <div>
                <p className="text-xs font-medium text-gray-700">
                  Auto Save
                  {!isDraft && <span className="ml-2 text-gray-400 font-normal">(only available for drafts)</span>}
                </p>
                {autoSaveEnabled && autoSaveStatus === 'saving' && <p className="text-xs text-blue-500">Saving…</p>}
                {autoSaveEnabled && autoSaveStatus === 'saved' && <p className="text-xs text-green-600">All changes saved</p>}
                {autoSaveEnabled && !autoSaveStatus && <p className="text-xs text-gray-400">Changes auto-saved as you work</p>}
              </div>
            </div>
            <Switch
              checked={autoSaveEnabled}
              onCheckedChange={isDraft ? setAutoSave : undefined}
              disabled={!isDraft}
            />
          </div>
        </DialogHeader>

        <Tabs defaultValue="builder" className="flex-1">
          <TabsList className="mx-6 mt-4">
            <TabsTrigger value="builder" className="gap-1.5"><Zap className="w-3.5 h-3.5" /> Flow Builder</TabsTrigger>
            {automation && <TabsTrigger value="analytics" className="gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> Analytics</TabsTrigger>}
            {automation && <TabsTrigger value="logs" className="gap-1.5"><FileText className="w-3.5 h-3.5" /> Logs</TabsTrigger>}
          </TabsList>

          <TabsContent value="builder" className="px-6 py-4">
            <p className="text-xs text-gray-500 mb-3">Build your automation flow below. Start by setting a trigger, then add actions.</p>
            <AutomationCanvas
              nodes={nodes}
              edges={edges}
              trigger={trigger}
              onNodesChange={setNodes}
              onEdgesChange={setEdges}
              onTriggerChange={setTrigger}
            />
          </TabsContent>

          {automation && (
            <TabsContent value="analytics" className="px-6 py-4">
              <AutomationAnalytics automationId={automation.id} />
            </TabsContent>
          )}

          {automation && (
            <TabsContent value="logs" className="px-6 py-4">
              <AutomationLogs automationId={automation.id} />
            </TabsContent>
          )}
        </Tabs>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose} size="sm">Cancel</Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending} size="sm"
            className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Save className="w-4 h-4 mr-1.5" />
            {automation ? 'Update' : 'Save'} Automation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AutomationLogs({ automationId }) {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['automation-logs', automationId],
    queryFn: () => base44.entities.AutomationLog.filter({ automation_id: automationId }, '-executed_at', 100),
  });

  if (isLoading) return <div className="text-center py-8 text-gray-400">Loading logs...</div>;
  if (logs.length === 0) return <div className="text-center py-8 text-gray-400">No logs yet for this automation.</div>;

  const STATUS_COLORS = { success: 'text-green-600', failed: 'text-red-500', skipped: 'text-yellow-500', waiting: 'text-blue-500' };

  return (
    <div className="space-y-2 max-h-80 overflow-y-auto">
      {logs.map(log => (
        <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg text-sm border">
          <span className={`font-semibold flex-shrink-0 ${STATUS_COLORS[log.status]}`}>{log.status}</span>
          <div className="flex-1 min-w-0">
            <span className="font-medium text-gray-700">{log.node_type?.replace(/_/g, ' ')}</span>
            <span className="text-gray-400 mx-2">—</span>
            <span className="text-gray-600 truncate">{log.contact_email}</span>
            {log.message && <p className="text-gray-400 text-xs mt-0.5">{log.message}</p>}
          </div>
          {log.executed_at && (
            <span className="text-xs text-gray-400 flex-shrink-0">{new Date(log.executed_at).toLocaleString()}</span>
          )}
        </div>
      ))}
    </div>
  );
}