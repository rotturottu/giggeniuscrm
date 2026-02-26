import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Save, Upload, Plus, X, ChevronDown, ChevronRight, Building2, Tag, Briefcase } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const PIPELINE_STAGES = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
const OPP_STATUSES = ['active', 'on_hold', 'won', 'lost'];

const COUNTRY_CODES = [
  { code: '+1', country: 'US/CA', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+61', country: 'AU', flag: '🇦🇺' },
  { code: '+65', country: 'SG', flag: '🇸🇬' },
  { code: '+60', country: 'MY', flag: '🇲🇾' },
  { code: '+63', country: 'PH', flag: '🇵🇭' },
  { code: '+62', country: 'ID', flag: '🇮🇩' },
  { code: '+66', country: 'TH', flag: '🇹🇭' },
  { code: '+84', country: 'VN', flag: '🇻🇳' },
  { code: '+91', country: 'IN', flag: '🇮🇳' },
  { code: '+86', country: 'CN', flag: '🇨🇳' },
  { code: '+81', country: 'JP', flag: '🇯🇵' },
  { code: '+82', country: 'KR', flag: '🇰🇷' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+966', country: 'SA', flag: '🇸🇦' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+33', country: 'FR', flag: '🇫🇷' },
  { code: '+39', country: 'IT', flag: '🇮🇹' },
  { code: '+34', country: 'ES', flag: '🇪🇸' },
  { code: '+55', country: 'BR', flag: '🇧🇷' },
  { code: '+52', country: 'MX', flag: '🇲🇽' },
  { code: '+27', country: 'ZA', flag: '🇿🇦' },
  { code: '+234', country: 'NG', flag: '🇳🇬' },
  { code: '+254', country: 'KE', flag: '🇰🇪' },
  { code: '+64', country: 'NZ', flag: '🇳🇿' },
  { code: '+7', country: 'RU', flag: '🇷🇺' },
  { code: '+90', country: 'TR', flag: '🇹🇷' },
  { code: '+31', country: 'NL', flag: '🇳🇱' },
  { code: '+46', country: 'SE', flag: '🇸🇪' },
  { code: '+47', country: 'NO', flag: '🇳🇴' },
];

function Section({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          {Icon && <Icon className="w-4 h-4 text-gray-500" />}
          {title}
        </span>
        {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-4 py-4 space-y-4">{children}</div>}
    </div>
  );
}

function TagInput({ tags, onChange }) {
  const [input, setInput] = useState('');
  const add = () => {
    const t = input.trim();
    if (!t || tags.includes(t)) return;
    onChange([...tags, t]);
    setInput('');
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Add tag..." className="h-8 text-sm"
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())} />
        <Button type="button" variant="outline" size="sm" onClick={add} className="h-8 px-2 flex-shrink-0"><Plus className="w-4 h-4" /></Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t, i) => (
          <Badge key={i} variant="outline" className="text-xs gap-1 pr-1">
            {t}
            <button type="button" onClick={() => onChange(tags.filter((_, idx) => idx !== i))}><X className="w-2.5 h-2.5" /></button>
          </Badge>
        ))}
      </div>
    </div>
  );
}

const defaultForm = () => ({
  first_name: '', last_name: '', email: '', company: '',
  phone: '', phone_type: 'mobile', phone_country_code: '+1', other_phone: '', other_phone_country_code: '+1',
  contact_type: 'lead', tags: [], campaign_id: '', campaign_name: '',
  logo_url: '', business_name: '', business_address: '',
  status: 'subscribed',
  opportunity_assignee_team: '', opportunity_salesperson: '',
  opportunity_pipeline: '', opportunity_stage: '', opportunity_status: 'active',
  opportunity_value: '', opportunity_concern: '',
});

export default function ContactForm({ open, onClose, contact }) {
  const [form, setForm] = useState(defaultForm());
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const queryClient = useQueryClient();

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns-list'],
    queryFn: () => base44.entities.EmailCampaign.list('-created_date', 100),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => base44.entities.User.list(),
  });

  useEffect(() => {
    if (contact) {
      setForm({
        first_name: contact.first_name || '', last_name: contact.last_name || '',
        email: contact.email || '', company: contact.company || '',
        phone: contact.phone || '', phone_type: contact.phone_type || 'mobile',
        phone_country_code: contact.phone_country_code || '+1',
        other_phone: contact.other_phone || '', other_phone_country_code: contact.other_phone_country_code || '+1',
        contact_type: contact.contact_type || 'lead',
        tags: contact.tags || [], campaign_id: contact.campaign_id || '',
        campaign_name: contact.campaign_name || '',
        logo_url: contact.logo_url || '', business_name: contact.business_name || '',
        business_address: contact.business_address || '',
        status: contact.status || 'subscribed',
        opportunity_assignee_team: contact.opportunity_assignee_team || '',
        opportunity_salesperson: contact.opportunity_salesperson || '',
        opportunity_pipeline: contact.opportunity_pipeline || '',
        opportunity_stage: contact.opportunity_stage || '',
        opportunity_status: contact.opportunity_status || 'active',
        opportunity_value: contact.opportunity_value || '',
        opportunity_concern: contact.opportunity_concern || '',
      });
    } else {
      setForm(defaultForm());
    }
  }, [contact, open]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingLogo(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set('logo_url', file_url);
    setUploadingLogo(false);
  };

  const saveMutation = useMutation({
    mutationFn: (data) =>
      contact ? base44.entities.Contact.update(contact.id, data) : base44.entities.Contact.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success(`Contact ${contact ? 'updated' : 'created'}`);
      onClose();
    },
  });

  const handleSave = () => {
    if (!form.email) { toast.error('Email is required'); return; }
    saveMutation.mutate({
      ...form,
      opportunity_value: form.opportunity_value ? Number(form.opportunity_value) : null,
      campaign_id: form.campaign_id || null,
      campaign_name: form.campaign_name || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contact ? 'Edit Contact' : 'Add Contact'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Core Info */}
          <Section title="Contact Info" defaultOpen>
            <div className="flex items-start gap-4">
              {/* Logo */}
              <div className="flex-shrink-0">
                <label className="cursor-pointer block">
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-200 hover:border-blue-300 flex items-center justify-center overflow-hidden bg-gray-50 transition-colors">
                    {form.logo_url
                      ? <img src={form.logo_url} className="w-full h-full object-cover" alt="Logo" />
                      : <Upload className="w-5 h-5 text-gray-300" />
                    }
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
                {uploadingLogo && <p className="text-xs text-center text-gray-400 mt-1">...</p>}
              </div>

              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-500">First Name</Label>
                  <Input value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="First name" className="mt-1 h-9" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Last Name</Label>
                  <Input value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Last name" className="mt-1 h-9" />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-gray-500">Email Address *</Label>
                  <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" className="mt-1 h-9" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Company Name</Label>
                  <Input value={form.company} onChange={e => set('company', e.target.value)} placeholder="Company" className="mt-1 h-9" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Contact Type</Label>
                  <Select value={form.contact_type} onValueChange={v => set('contact_type', v)}>
                    <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                      <SelectItem value="spam_blocked">Spam / Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Phone</Label>
              <div className="flex gap-2">
                <Select value={form.phone_country_code} onValueChange={v => set('phone_country_code', v)}>
                  <SelectTrigger className="w-28 h-9 flex-shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {COUNTRY_CODES.map(c => (
                      <SelectItem key={c.code} value={c.code}>
                        <span className="flex items-center gap-1.5">
                          <span>{c.flag}</span>
                          <span className="text-xs text-gray-500">{c.code}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="555 000 0000" className="h-9 flex-1" />
                <Select value={form.phone_type} onValueChange={v => set('phone_type', v)}>
                  <SelectTrigger className="w-28 h-9 flex-shrink-0"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="landline">Landline</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label className="text-xs text-gray-500 flex items-center gap-1"><Tag className="w-3 h-3" /> Tags</Label>
              <div className="mt-1"><TagInput tags={form.tags} onChange={v => set('tags', v)} /></div>
            </div>

            {/* Campaign */}
            <div>
              <Label className="text-xs text-gray-500">Campaign</Label>
              <Select value={form.campaign_id || '__none'} onValueChange={v => {
                if (v === '__none') { set('campaign_id', ''); set('campaign_name', ''); return; }
                const camp = campaigns.find(c => c.id === v);
                set('campaign_id', v);
                set('campaign_name', camp?.name || '');
              }}>
                <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="No campaign" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">No campaign</SelectItem>
                  {campaigns.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </Section>

          {/* Business Info */}
          <Section title="Business Info" icon={Building2} defaultOpen={false}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-500">Business Name</Label>
                <Input value={form.business_name} onChange={e => set('business_name', e.target.value)} placeholder="Business name" className="mt-1 h-9" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-gray-500">Other Phone</Label>
                <div className="flex gap-2 mt-1">
                  <Select value={form.other_phone_country_code} onValueChange={v => set('other_phone_country_code', v)}>
                    <SelectTrigger className="w-28 h-9 flex-shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {COUNTRY_CODES.map(c => (
                        <SelectItem key={c.code} value={c.code}>
                          <span className="flex items-center gap-1.5">
                            <span>{c.flag}</span>
                            <span className="text-xs text-gray-500">{c.code}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input value={form.other_phone} onChange={e => set('other_phone', e.target.value)} placeholder="555 000 0001" className="h-9 flex-1" />
                </div>
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-gray-500">Business Address</Label>
                <Input value={form.business_address} onChange={e => set('business_address', e.target.value)} placeholder="123 Main St, City, State" className="mt-1 h-9" />
              </div>
            </div>
          </Section>

          {/* Opportunity */}
          <Section title="Opportunity (Sales)" icon={Briefcase} defaultOpen={false}>
            <p className="text-xs text-gray-500">Links to the Sales pipeline and Campaigns page.</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-500">Assignee Team</Label>
                <Input value={form.opportunity_assignee_team} onChange={e => set('opportunity_assignee_team', e.target.value)} placeholder="Team name" className="mt-1 h-9" />
              </div>
              <div>
                <Label className="text-xs text-gray-500">Salesperson</Label>
                <Select value={form.opportunity_salesperson || '__none'} onValueChange={v => set('opportunity_salesperson', v === '__none' ? '' : v)}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">None</SelectItem>
                    {users.map(u => <SelectItem key={u.email} value={u.email}>{u.full_name || u.email}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Pipeline</Label>
                <Input value={form.opportunity_pipeline} onChange={e => set('opportunity_pipeline', e.target.value)} placeholder="Pipeline name" className="mt-1 h-9" />
              </div>
              <div>
                <Label className="text-xs text-gray-500">Stage</Label>
                <Select value={form.opportunity_stage || '__none'} onValueChange={v => set('opportunity_stage', v === '__none' ? '' : v)}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Select stage" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">None</SelectItem>
                    {PIPELINE_STAGES.map(s => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Status</Label>
                <Select value={form.opportunity_status} onValueChange={v => set('opportunity_status', v)}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {OPP_STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Opportunity Value ($)</Label>
                <Input type="number" value={form.opportunity_value} onChange={e => set('opportunity_value', e.target.value)} placeholder="0.00" className="mt-1 h-9" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-gray-500">Concern / Pain Point</Label>
                <Textarea value={form.opportunity_concern} onChange={e => set('opportunity_concern', e.target.value)} placeholder="Describe the main concern or challenge..." rows={2} className="mt-1 resize-none text-sm" />
              </div>
            </div>
          </Section>

          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button variant="outline" onClick={onClose} size="sm">Cancel</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending} size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Save className="w-4 h-4 mr-1.5" />
              {contact ? 'Update' : 'Save'} Contact
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}