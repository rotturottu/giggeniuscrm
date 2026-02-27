import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, Paperclip, Plus, X } from 'lucide-react';
import { useState } from 'react';

export default function AdvancedEmailOptions({ options = {}, onChange }) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (key, value) => onChange({ ...options, [key]: value });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const current = options.attachments || [];
    set('attachments', [...current, { name: file.name, url: file_url }]);
    setUploading(false);
    e.target.value = '';
  };

  const removeAttachment = (idx) => {
    const updated = (options.attachments || []).filter((_, i) => i !== idx);
    set('attachments', updated);
  };

  const addCcEmail = () => {
    const current = options.cc || [];
    set('cc', [...current, '']);
  };

  const updateCc = (idx, val) => {
    const updated = (options.cc || []).map((e, i) => i === idx ? val : e);
    set('cc', updated);
  };

  const removeCc = (idx) => {
    set('cc', (options.cc || []).filter((_, i) => i !== idx));
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-semibold text-gray-700"
      >
        <span className="flex items-center gap-2">
          ⚙️ Advanced Options
          {(options.reply_to || options.reply_from || (options.attachments?.length > 0) || (options.cc?.length > 0)) && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">configured</Badge>
          )}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {open && (
        <div className="px-4 py-5 space-y-5 bg-white">

          {/* Reply-To / Reply-From */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Reply-To Address</Label>
              <Input
                type="email"
                placeholder="replies@yourdomain.com"
                value={options.reply_to || ''}
                onChange={e => set('reply_to', e.target.value)}
                className="h-9 text-sm"
              />
              <p className="text-xs text-gray-400">Replies from recipients will go to this address.</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">From Name Override</Label>
              <Input
                placeholder="e.g., The GigGenius Team"
                value={options.reply_from || ''}
                onChange={e => set('reply_from', e.target.value)}
                className="h-9 text-sm"
              />
              <p className="text-xs text-gray-400">Overrides the sender display name for this email.</p>
            </div>
          </div>

          {/* CC */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">CC Recipients</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addCcEmail} className="h-7 text-xs text-blue-600 hover:bg-blue-50">
                <Plus className="w-3 h-3 mr-1" />Add CC
              </Button>
            </div>
            {(options.cc || []).length === 0 && (
              <p className="text-xs text-gray-400">No CC addresses added.</p>
            )}
            {(options.cc || []).map((email, idx) => (
              <div key={idx} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="cc@example.com"
                  value={email}
                  onChange={e => updateCc(idx, e.target.value)}
                  className="h-8 text-sm"
                />
                <button type="button" onClick={() => removeCc(idx)} className="p-1 text-gray-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Unsubscribe / Tracking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preheader Text</Label>
              <Input
                placeholder="Short preview text after subject line..."
                value={options.preheader || ''}
                onChange={e => set('preheader', e.target.value)}
                className="h-9 text-sm"
              />
              <p className="text-xs text-gray-400">Shown in inbox preview (after the subject line).</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Send Priority</Label>
              <select
                value={options.priority || 'normal'}
                onChange={e => set('priority', e.target.value)}
                className="w-full h-9 text-sm border border-input rounded-md px-3 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Attachments</Label>
            {(options.attachments || []).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {options.attachments.map((att, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-full px-3 py-1">
                    <Paperclip className="w-3 h-3" />
                    <span className="max-w-[140px] truncate">{att.name}</span>
                    <button type="button" onClick={() => removeAttachment(idx)} className="hover:text-red-500 ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="inline-flex items-center gap-2 cursor-pointer px-3 py-2 text-xs border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
              <Paperclip className="w-3.5 h-3.5" />
              {uploading ? 'Uploading...' : 'Attach a file'}
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            </label>
            <p className="text-xs text-gray-400">Files are uploaded and attached to all emails in this campaign.</p>
          </div>

          {/* Custom Headers */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Custom List-Unsubscribe URL</Label>
            <Input
              placeholder="https://yourdomain.com/unsubscribe?id={{lead_email}}"
              value={options.unsubscribe_url || ''}
              onChange={e => set('unsubscribe_url', e.target.value)}
              className="h-9 text-sm"
            />
            <p className="text-xs text-gray-400">Overrides the default unsubscribe link in the email footer.</p>
          </div>

        </div>
      )}
    </div>
  );
}