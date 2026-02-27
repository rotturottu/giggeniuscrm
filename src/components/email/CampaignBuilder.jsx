import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
    AlertCircle,
    BarChart2,
    CalendarIcon,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Eye,
    FileUp,
    Filter, Mail,
    Plus,
    Save,
    Send,
    Upload, UserPlus,
    Users, Wand2,
    X
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import AdvancedEmailOptions from './AdvancedEmailOptions';
import AIContentTools from './AIContentTools';
import EnhancedSegmentBuilder from './EnhancedSegmentBuilder';
import VisualEmailBuilder from './VisualEmailBuilder';

const STEPS = [
  { id: 'details',    label: 'Details',    icon: Mail },
  { id: 'recipients', label: 'Recipients', icon: Users },
  { id: 'content',    label: 'Content',    icon: Wand2 },
  { id: 'schedule',   label: 'Schedule',   icon: Clock },
  { id: 'review',     label: 'Review',     icon: Eye },
];

export default function CampaignBuilder({ open, onClose, campaign }) {
  const [step, setStep] = useState(0);

  // Step 1 – Details
  const [name, setName] = useState('');
  const [campaignType, setCampaignType] = useState('broadcast'); // broadcast | drip | ab_test
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [preheader, setPreheader] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Step 2 – Recipients
  const [recipientMode, setRecipientMode] = useState('segment'); // segment | manual | import | smartlist
  const [segmentCriteria, setSegmentCriteria] = useState({});
  const [estimatedRecipients, setEstimatedRecipients] = useState(0);
  const [manualEmails, setManualEmails] = useState('');
  const [importedContacts, setImportedContacts] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [selectedSmartList, setSelectedSmartList] = useState('');
  const [excludeUnsubscribed, setExcludeUnsubscribed] = useState(true);
  const [excludeBounced, setExcludeBounced] = useState(true);
  const fileInputRef = useRef(null);

  // Step 3 – Content
  const [templateId, setTemplateId] = useState('');
  const [useCustomContent, setUseCustomContent] = useState(false);
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [customBlocks, setCustomBlocks] = useState([]);
  const [advancedOptions, setAdvancedOptions] = useState({});

  // Step 4 – Schedule
  const [sendMode, setSendMode] = useState('immediate'); // immediate | scheduled | timezone_optimized
  const [scheduledDate, setScheduledDate] = useState(null);
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [trackOpens, setTrackOpens] = useState(true);
  const [trackClicks, setTrackClicks] = useState(true);
  const [enableGoogleAnalytics, setEnableGoogleAnalytics] = useState(false);
  const [utmSource, setUtmSource] = useState('email');
  const [utmMedium, setUtmMedium] = useState('campaign');

  const queryClient = useQueryClient();

  const { data: templates = [] } = useQuery({
    queryKey: ['email-templates'],
    queryFn: () => base44.entities.EmailTemplate.filter({ is_active: true }),
  });

  const { data: smartLists = [] } = useQuery({
    queryKey: ['smart-lists'],
    queryFn: () => base44.entities.SmartList.list(),
  });

  const { data: smtpConfigs = [] } = useQuery({
    queryKey: ['smtp-configs'],
    queryFn: () => base44.entities.SMTPConfig.filter({ is_active: true }),
  });

  useEffect(() => {
    if (!open) return;
    if (campaign) {
      setName(campaign.name || '');
      setTemplateId(campaign.template_id || '');
      setUseCustomContent(!!campaign.custom_content);
      setCustomSubject(campaign.custom_content?.subject || '');
      setCustomBody(campaign.custom_content?.body || '');
      setCustomBlocks(campaign.custom_content?.blocks || []);
      setSegmentCriteria(campaign.segment_criteria || {});
      const d = campaign.scheduled_date ? new Date(campaign.scheduled_date) : null;
      setScheduledDate(d);
      if (d) { setSendMode('scheduled'); setScheduledTime(format(d, 'HH:mm')); }
      setAdvancedOptions(campaign.advanced_options || {});
      setFromName(campaign.from_name || '');
      setFromEmail(campaign.from_email || '');
      setReplyTo(campaign.reply_to || '');
      setPreheader(campaign.preheader || '');
      setTags(campaign.tags || []);
      setTrackOpens(campaign.track_opens !== false);
      setTrackClicks(campaign.track_clicks !== false);
    } else {
      // defaults
      setName(''); setCampaignType('broadcast'); setFromName(''); setFromEmail('');
      setReplyTo(''); setPreheader(''); setTags([]); setTagInput('');
      setRecipientMode('segment'); setSegmentCriteria({}); setEstimatedRecipients(0);
      setManualEmails(''); setImportedContacts([]); setImportError('');
      setSelectedSmartList(''); setExcludeUnsubscribed(true); setExcludeBounced(true);
      setTemplateId(''); setUseCustomContent(false); setCustomSubject('');
      setCustomBody(''); setCustomBlocks([]); setAdvancedOptions({});
      setSendMode('immediate'); setScheduledDate(null); setScheduledTime('09:00');
      setTrackOpens(true); setTrackClicks(true); setEnableGoogleAnalytics(false);
      setUtmSource('email'); setUtmMedium('campaign');
    }
    setStep(0);
  }, [campaign, open]);

  // Prefill from active SMTP
  useEffect(() => {
    if (smtpConfigs.length > 0 && !campaign) {
      const cfg = smtpConfigs[0];
      if (!fromEmail) setFromEmail(cfg.from_email || '');
      if (!fromName) setFromName(cfg.from_name || '');
    }
  }, [smtpConfigs]);

  const saveMutation = useMutation({
    mutationFn: (data) => campaign
      ? base44.entities.EmailCampaign.update(campaign.id, data)
      : base44.entities.EmailCampaign.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      onClose();
    },
  });

  const handleFileImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportError('');
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: 'object',
        properties: {
          contacts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                email: { type: 'string' },
                first_name: { type: 'string' },
                last_name: { type: 'string' },
              }
            }
          }
        }
      }
    });
    if (result.status === 'success' && result.output?.contacts) {
      setImportedContacts(result.output.contacts.filter(c => c.email));
    } else {
      setImportError('Could not extract emails. Make sure file has an "email" column.');
    }
    setImporting(false);
    e.target.value = '';
  };

  const recipientCount = recipientMode === 'manual'
    ? manualEmails.split(/[\n,;]/).map(e => e.trim()).filter(e => e.includes('@')).length
    : recipientMode === 'import'
    ? importedContacts.length
    : estimatedRecipients;

  const selectedTemplate = templates.find(t => t.id === templateId);

  const isStepValid = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return recipientCount > 0;
    if (step === 2) return (templateId || (useCustomContent && customSubject && customBody));
    if (step === 3) return sendMode === 'immediate' || scheduledDate;
    return true;
  };

  const handleSave = (status = 'draft') => {
    let scheduled = null;
    if (sendMode === 'scheduled' && scheduledDate) {
      const [h, m] = scheduledTime.split(':').map(Number);
      const d = new Date(scheduledDate);
      d.setHours(h, m, 0, 0);
      scheduled = d.toISOString();
    }

    const manualList = recipientMode === 'manual'
      ? manualEmails.split(/[\n,;]/).map(e => e.trim()).filter(e => e.includes('@'))
      : [];

    const data = {
      name, campaign_type: campaignType,
      from_name: fromName, from_email: fromEmail, reply_to: replyTo, preheader,
      tags, status: scheduled ? 'scheduled' : status,
      segment_criteria: recipientMode === 'segment' ? segmentCriteria : {},
      recipient_smart_list: recipientMode === 'smartlist' ? selectedSmartList : null,
      manual_recipients: manualList,
      imported_recipients: recipientMode === 'import' ? importedContacts.map(c => c.email) : [],
      exclude_unsubscribed: excludeUnsubscribed,
      exclude_bounced: excludeBounced,
      recipients_count: recipientCount,
      scheduled_date: scheduled,
      track_opens: trackOpens, track_clicks: trackClicks,
      utm_source: enableGoogleAnalytics ? utmSource : null,
      utm_medium: enableGoogleAnalytics ? utmMedium : null,
      advanced_options: advancedOptions,
    };

    if (useCustomContent) {
      data.custom_content = { subject: customSubject, body: customBody, blocks: customBlocks };
      data.template_id = null;
    } else {
      data.template_id = templateId;
      data.custom_content = null;
    }

    saveMutation.mutate(data);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
            {campaign ? 'Edit Campaign' : 'Create Email Campaign'}
          </DialogTitle>
          {/* Step progress */}
          <div className="flex items-center gap-1 mt-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = i < step;
              const active = i === step;
              return (
                <React.Fragment key={s.id}>
                  <button
                    onClick={() => i < step && setStep(i)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      active ? 'bg-blue-600 text-white' :
                      done ? 'bg-blue-100 text-blue-700 cursor-pointer hover:bg-blue-200' :
                      'bg-gray-100 text-gray-400 cursor-default'
                    }`}
                  >
                    {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                  {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-blue-300' : 'bg-gray-200'}`} />}
                </React.Fragment>
              );
            })}
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* ── STEP 0: Details ── */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <Label className="font-semibold">Campaign Name <span className="text-red-500">*</span></Label>
                <Input placeholder="e.g., Q1 Lead Nurture Campaign" value={name} onChange={e => setName(e.target.value)} className="mt-1.5" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Campaign Type</Label>
                  <Select value={campaignType} onValueChange={setCampaignType}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="broadcast">📢 Broadcast (one-time)</SelectItem>
                      <SelectItem value="drip">💧 Drip (sequence)</SelectItem>
                      <SelectItem value="ab_test">🧪 A/B Test</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-semibold">Preheader Text</Label>
                  <Input placeholder="Short preview after subject…" value={preheader} onChange={e => setPreheader(e.target.value)} className="mt-1.5" />
                  <p className="text-xs text-gray-400 mt-1">Shown after subject in inbox preview.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">From Name</Label>
                  <Input placeholder="Your Name / Company" value={fromName} onChange={e => setFromName(e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label className="font-semibold">From Email</Label>
                  <Input type="email" placeholder="hello@yourdomain.com" value={fromEmail} onChange={e => setFromEmail(e.target.value)} className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label className="font-semibold">Reply-To Address</Label>
                <Input type="email" placeholder="replies@yourdomain.com (optional)" value={replyTo} onChange={e => setReplyTo(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label className="font-semibold">Campaign Tags</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input placeholder="Add tag…" value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} className="flex-1" />
                  <Button variant="outline" size="sm" onClick={addTag}><Plus className="w-4 h-4" /></Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map(t => (
                      <Badge key={t} variant="secondary" className="gap-1">
                        {t}
                        <button onClick={() => setTags(tags.filter(x => x !== t))}><X className="w-3 h-3" /></button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 1: Recipients ── */}
          {step === 1 && (
            <div className="space-y-5">
              <Tabs value={recipientMode} onValueChange={setRecipientMode}>
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="segment"><Filter className="w-3.5 h-3.5 mr-1" />Segment</TabsTrigger>
                  <TabsTrigger value="smartlist"><Users className="w-3.5 h-3.5 mr-1" />Smart List</TabsTrigger>
                  <TabsTrigger value="manual"><UserPlus className="w-3.5 h-3.5 mr-1" />Manual</TabsTrigger>
                  <TabsTrigger value="import"><FileUp className="w-3.5 h-3.5 mr-1" />Import</TabsTrigger>
                </TabsList>

                <TabsContent value="segment" className="mt-4">
                  <EnhancedSegmentBuilder criteria={segmentCriteria} onChange={setSegmentCriteria} onEstimatedCountChange={setEstimatedRecipients} />
                </TabsContent>

                <TabsContent value="smartlist" className="mt-4 space-y-3">
                  <Label className="font-semibold">Select Smart List</Label>
                  {smartLists.length === 0 ? (
                    <p className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">No smart lists found. Create one in Contacts → Smart Lists.</p>
                  ) : (
                    <div className="grid gap-2">
                      {smartLists.map(sl => (
                        <button key={sl.id} onClick={() => setSelectedSmartList(sl.id)}
                          className={`flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${
                            selectedSmartList === sl.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: sl.color || '#3b82f6' }}>
                              {sl.name[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{sl.name}</p>
                              <p className="text-xs text-gray-500">{sl.contact_count || 0} contacts · {sl.filter_type}</p>
                            </div>
                          </div>
                          {selectedSmartList === sl.id && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="manual" className="mt-4 space-y-3">
                  <Label className="font-semibold">Enter Email Addresses</Label>
                  <Textarea
                    placeholder="Enter emails separated by commas, semicolons, or newlines&#10;john@example.com&#10;jane@company.com, bob@org.net"
                    value={manualEmails}
                    onChange={e => setManualEmails(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    {manualEmails.split(/[\n,;]/).map(e => e.trim()).filter(e => e.includes('@')).length} valid emails detected
                  </p>
                </TabsContent>

                <TabsContent value="import" className="mt-4 space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-700">Click to upload CSV or Excel file</p>
                    <p className="text-xs text-gray-400 mt-1">File must contain an "email" column (and optionally first_name, last_name)</p>
                    <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileImport} />
                  </div>
                  {importing && <p className="text-sm text-blue-600 text-center animate-pulse">Processing file…</p>}
                  {importError && (
                    <div className="flex items-center gap-2 text-red-600 text-sm p-3 bg-red-50 rounded-lg">
                      <AlertCircle className="w-4 h-4 shrink-0" />{importError}
                    </div>
                  )}
                  {importedContacts.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-green-50 border-b px-4 py-2 flex items-center gap-2 text-green-700 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        {importedContacts.length} contacts imported successfully
                      </div>
                      <div className="max-h-40 overflow-y-auto">
                        {importedContacts.slice(0, 50).map((c, i) => (
                          <div key={i} className="flex items-center gap-3 px-4 py-2 border-b last:border-0 text-sm hover:bg-gray-50">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                              {(c.first_name || c.email)[0].toUpperCase()}
                            </div>
                            <span className="text-gray-700">{c.first_name} {c.last_name}</span>
                            <span className="text-gray-400 text-xs">{c.email}</span>
                            <button className="ml-auto text-gray-400 hover:text-red-500" onClick={() => setImportedContacts(importedContacts.filter((_, j) => j !== i))}>
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        {importedContacts.length > 50 && <div className="px-4 py-2 text-xs text-gray-400">+{importedContacts.length - 50} more…</div>}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Suppression options */}
              <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
                <p className="text-sm font-semibold text-gray-700">Suppression Rules</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Exclude unsubscribed contacts</p>
                    <p className="text-xs text-gray-400">Contacts who opted out won't receive this email</p>
                  </div>
                  <Switch checked={excludeUnsubscribed} onCheckedChange={setExcludeUnsubscribed} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Exclude bounced contacts</p>
                    <p className="text-xs text-gray-400">Contacts with hard bounces will be skipped</p>
                  </div>
                  <Switch checked={excludeBounced} onCheckedChange={setExcludeBounced} />
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Content ── */}
          {step === 2 && (
            <div className="space-y-5">
              <Tabs value={useCustomContent ? 'custom' : 'template'} onValueChange={v => setUseCustomContent(v === 'custom')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="template">Use Template</TabsTrigger>
                  <TabsTrigger value="custom"><Wand2 className="w-4 h-4 mr-1" />Build Custom</TabsTrigger>
                </TabsList>

                <TabsContent value="template" className="mt-4 space-y-3">
                  {templates.length === 0 ? (
                    <p className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">No templates found. Create one in the Templates tab first.</p>
                  ) : (
                    <div className="grid gap-2">
                      {templates.map(tpl => (
                        <button key={tpl.id} onClick={() => setTemplateId(tpl.id)}
                          className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                            templateId === tpl.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Mail className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{tpl.name}</p>
                            <p className="text-xs text-gray-500 truncate">{tpl.subject}</p>
                          </div>
                          <Badge variant="outline" className="text-xs shrink-0">{tpl.category}</Badge>
                          {templateId === tpl.id && <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedTemplate && (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="px-3 py-2 bg-gray-50 border-b text-sm font-medium text-gray-700">Preview: {selectedTemplate.name}</div>
                      <div className="p-4 text-sm text-gray-600 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">{selectedTemplate.body}</div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="custom" className="mt-4 space-y-4">
                  <div>
                    <Label className="font-semibold">Subject Line <span className="text-red-500">*</span></Label>
                    <Input placeholder="Email subject…" value={customSubject} onChange={e => setCustomSubject(e.target.value)} className="mt-1.5" />
                    <p className="text-xs text-gray-400 mt-1">Tip: Use variables like {`{{first_name}}`} for personalisation.</p>
                  </div>
                  <div>
                    <Label className="font-semibold mb-2 block">Email Body <span className="text-red-500">*</span></Label>
                    <VisualEmailBuilder onContentChange={(html, blocks) => { setCustomBody(html); setCustomBlocks(blocks); }} initialBlocks={customBlocks} />
                  </div>
                  <AIContentTools
                    currentSubject={customSubject}
                    currentBody={customBody}
                    onApply={(field, value) => {
                      if (field === 'subject') setCustomSubject(value);
                      if (field === 'body') setCustomBody(value);
                    }}
                    onInsertToken={(token) => setCustomSubject(prev => prev + ' ' + token)}
                  />
                </TabsContent>
              </Tabs>

              <AdvancedEmailOptions options={advancedOptions} onChange={setAdvancedOptions} />
            </div>
          )}

          {/* ── STEP 3: Schedule & Tracking ── */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <Label className="font-semibold mb-3 block">When to send</Label>
                <div className="grid gap-3">
                  {[
                    { id: 'immediate', icon: Send, title: 'Send immediately', desc: 'Deliver right after saving' },
                    { id: 'scheduled', icon: CalendarIcon, title: 'Schedule for later', desc: 'Pick a date and time' },
                    { id: 'timezone_optimized', icon: Clock, title: 'Timezone-optimized (coming soon)', desc: 'Send at the best time per contact timezone', disabled: true },
                  ].map(opt => (
                    <button key={opt.id} disabled={opt.disabled}
                      onClick={() => setSendMode(opt.id)}
                      className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-colors ${
                        sendMode === opt.id ? 'border-blue-500 bg-blue-50' :
                        opt.disabled ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed' :
                        'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <opt.icon className={`w-5 h-5 shrink-0 ${sendMode === opt.id ? 'text-blue-600' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{opt.title}</p>
                        <p className="text-xs text-gray-500">{opt.desc}</p>
                      </div>
                      {sendMode === opt.id && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {sendMode === 'scheduled' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold mb-2 block">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {scheduledDate ? format(scheduledDate, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={scheduledDate} onSelect={setScheduledDate} initialFocus fromDate={new Date()} />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label className="font-semibold mb-2 block">Time</Label>
                    <Input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} />
                  </div>
                </div>
              )}

              {/* Tracking */}
              <div className="border rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart2 className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-sm">Tracking & Analytics</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm font-medium">Track opens</p><p className="text-xs text-gray-400">Records when recipients open the email</p></div>
                    <Switch checked={trackOpens} onCheckedChange={setTrackOpens} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm font-medium">Track link clicks</p><p className="text-xs text-gray-400">Records when recipients click links</p></div>
                    <Switch checked={trackClicks} onCheckedChange={setTrackClicks} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm font-medium">Google Analytics UTM tags</p><p className="text-xs text-gray-400">Append UTM parameters to all links</p></div>
                    <Switch checked={enableGoogleAnalytics} onCheckedChange={setEnableGoogleAnalytics} />
                  </div>
                  {enableGoogleAnalytics && (
                    <div className="grid grid-cols-2 gap-3 pt-1 pl-4 border-l-2 border-purple-200">
                      <div><Label className="text-xs">UTM Source</Label><Input value={utmSource} onChange={e => setUtmSource(e.target.value)} className="mt-1 h-8 text-sm" /></div>
                      <div><Label className="text-xs">UTM Medium</Label><Input value={utmMedium} onChange={e => setUtmMedium(e.target.value)} className="mt-1 h-8 text-sm" /></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: Review ── */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Campaign Name', value: name },
                  { label: 'Type', value: campaignType },
                  { label: 'From', value: `${fromName} <${fromEmail}>` || '—' },
                  { label: 'Reply-To', value: replyTo || '—' },
                ].map(r => (
                  <div key={r.label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{r.label}</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5 truncate">{r.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <Users className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-blue-700">{recipientCount}</p>
                  <p className="text-xs text-blue-600">Recipients</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                  <Mail className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                  <p className="text-sm font-semibold text-purple-700 truncate">{useCustomContent ? customSubject : selectedTemplate?.subject || '—'}</p>
                  <p className="text-xs text-purple-600">Subject Line</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <Clock className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-sm font-semibold text-green-700">
                    {sendMode === 'immediate' ? 'Immediately' : scheduledDate ? format(scheduledDate, 'MMM d, yyyy') + ' ' + scheduledTime : '—'}
                  </p>
                  <p className="text-xs text-green-600">Send Time</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Tracking</p>
                <div className="flex gap-4 flex-wrap">
                  <span className={`flex items-center gap-1.5 text-xs ${trackOpens ? 'text-green-700' : 'text-gray-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Open tracking {trackOpens ? 'on' : 'off'}
                  </span>
                  <span className={`flex items-center gap-1.5 text-xs ${trackClicks ? 'text-green-700' : 'text-gray-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Click tracking {trackClicks ? 'on' : 'off'}
                  </span>
                  {enableGoogleAnalytics && (
                    <span className="flex items-center gap-1.5 text-xs text-green-700">
                      <CheckCircle2 className="w-3.5 h-3.5" /> UTM tags on
                    </span>
                  )}
                </div>
              </div>

              {recipientCount === 0 && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  No recipients selected. Go back to step 2 to add recipients.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t shrink-0 flex items-center justify-between gap-3 bg-gray-50">
          <Button variant="outline" onClick={step === 0 ? onClose : () => setStep(s => s - 1)}>
            {step === 0 ? 'Cancel' : <><ChevronLeft className="w-4 h-4 mr-1" />Back</>}
          </Button>

          <div className="flex gap-2">
            {step === STEPS.length - 1 ? (
              <>
                <Button variant="outline" onClick={() => handleSave('draft')} disabled={saveMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" /> Save as Draft
                </Button>
                <Button
                  onClick={() => handleSave(sendMode === 'immediate' ? 'sending' : 'scheduled')}
                  disabled={saveMutation.isPending || recipientCount === 0}
                  className="bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700"
                >
                  {sendMode === 'immediate' ? <><Send className="w-4 h-4 mr-2" />Send Now</> : <><CalendarIcon className="w-4 h-4 mr-2" />Schedule</>}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setStep(s => s + 1)}
                disabled={!isStepValid()}
                className="bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}