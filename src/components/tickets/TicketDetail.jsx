import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Ticket, RefreshCw, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import AITicketAssistant from './AITicketAssistant';

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700 font-bold' },
};

const STATUS_CONFIG = {
  open: { label: 'Open', color: 'bg-blue-100 text-blue-700', icon: Ticket },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700', icon: RefreshCw },
  waiting_on_client: { label: 'Waiting on Client', color: 'bg-purple-100 text-purple-700', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-600', icon: CheckCircle2 },
};

export default function TicketDetail({ ticket, allTickets = [], onClose, onUpdate }) {
  const [notes, setNotes] = useState(ticket.internal_notes || '');
  const [resolution, setResolution] = useState(ticket.resolution_notes || '');
  const [assignee, setAssignee] = useState(ticket.assigned_to || '');
  const [assigneeName, setAssigneeName] = useState(ticket.assigned_to_name || '');
  const [status, setStatus] = useState(ticket.status);
  const [priority, setPriority] = useState(ticket.priority);
  const [saving, setSaving] = useState(false);
  const [showAI, setShowAI] = useState(true);

  const resolvedTickets = allTickets.filter(t => t.status === 'resolved' || t.status === 'closed');

  const handleSave = async () => {
    setSaving(true);
    const updates = {
      internal_notes: notes,
      resolution_notes: resolution,
      assigned_to: assignee,
      assigned_to_name: assigneeName,
      status,
      priority,
    };

    const becomingResolved = (status === 'resolved' || status === 'closed') &&
      ticket.status !== 'resolved' && ticket.status !== 'closed';

    if (becomingResolved) {
      updates.resolved_at = new Date().toISOString();

      // Create a feedback record first to get its ID
      const feedback = await base44.entities.TicketFeedback.create({
        ticket_id: ticket.id,
        ticket_number: ticket.ticket_number,
        submitter_email: ticket.submitter_email,
        submitter_name: ticket.submitter_name,
        survey_sent_at: new Date().toISOString(),
      });

      // Build survey URL
      const surveyUrl = `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '')}/SurveyResponse?ticket_id=${ticket.id}&ticket_number=${encodeURIComponent(ticket.ticket_number)}&email=${encodeURIComponent(ticket.submitter_email)}&name=${encodeURIComponent(ticket.submitter_name)}&feedback_id=${feedback.id}`;

      // Send the survey email
      await base44.integrations.Core.SendEmail({
        to: ticket.submitter_email,
        subject: `How did we do? Your feedback on ticket ${ticket.ticket_number}`,
        body: `<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px">
  <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6949094a978d5bae592b599f/645b25c34_GigGeniusLogo.png" alt="GigGenius" style="width:48px;height:48px;border-radius:12px;margin-bottom:16px" />
  <h2 style="color:#1e293b;margin-bottom:8px">Hi ${ticket.submitter_name}, your ticket has been ${status}!</h2>
  <p style="color:#64748b">Your support ticket <strong style="color:#2563eb">${ticket.ticket_number}</strong> — "${ticket.subject}" — has been marked as <strong>${status}</strong>.</p>
  <p style="color:#64748b">We'd love to hear about your experience. It only takes 10 seconds!</p>
  <a href="${surveyUrl}" style="display:inline-block;margin-top:16px;padding:12px 28px;background:linear-gradient(to right,#2563eb,#7c3aed);color:white;border-radius:10px;text-decoration:none;font-weight:600">Rate Your Experience ⭐</a>
  <p style="color:#94a3b8;font-size:12px;margin-top:24px">GigGenius Support Team · gig-genius.io</p>
</div>`,
      });
    }

    await onUpdate(ticket.id, updates);
    setSaving(false);
    onClose();
  };

  const priorityCfg = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.medium;
  const statusCfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            <span className="text-blue-600 font-mono">{ticket.ticket_number}</span>
            <Badge className={statusCfg.color}>{statusCfg.label}</Badge>
            <Badge className={priorityCfg.color}>{priorityCfg.label}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
          {/* Left: Ticket Detail */}
          <div className="flex-1 px-6 py-5 space-y-5 overflow-y-auto">
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">{ticket.subject}</h3>
              <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                <span>📋 {ticket.category}</span>
                <span>•</span>
                <span>🖥️ {ticket.platform}</span>
                <span>•</span>
                <span>👤 {ticket.user_type}</span>
                <span>•</span>
                <span>🕐 {ticket.created_date ? format(new Date(ticket.created_date), 'MMM d, yyyy HH:mm') : '—'}</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700 mb-1">Submitted by</p>
              <p className="font-semibold text-gray-900">{ticket.submitter_name}</p>
              <p className="text-sm text-gray-500">{ticket.submitter_email}</p>
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Issue Description</p>
              <p className="text-gray-800 whitespace-pre-line text-sm">{ticket.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block text-sm">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                      <SelectItem key={val} value={val}>{cfg.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block text-sm">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_CONFIG).map(([val, cfg]) => (
                      <SelectItem key={val} value={val}>{cfg.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block text-sm">Assign to Agent (Email)</Label>
                <Input value={assignee} onChange={e => setAssignee(e.target.value)} placeholder="agent@gig-genius.io" />
              </div>
              <div>
                <Label className="mb-1.5 block text-sm">Agent Name</Label>
                <Input value={assigneeName} onChange={e => setAssigneeName(e.target.value)} placeholder="Agent Name" />
              </div>
            </div>

            <div>
              <Label className="mb-1.5 block text-sm">Internal Notes (not shared with client)</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Add internal notes for your team..." />
            </div>

            <div>
              <Label className="mb-1.5 block text-sm">Resolution Notes</Label>
              <Textarea value={resolution} onChange={e => setResolution(e.target.value)} rows={3} placeholder="Describe how this was resolved..." />
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            </div>
          </div>

          {/* Right: AI Panel */}
          <div className="lg:w-96 px-6 py-5 bg-gradient-to-b from-purple-50/50 to-white overflow-y-auto">
            <AITicketAssistant
              ticket={ticket}
              resolvedTickets={resolvedTickets}
              onApplySuggestion={(text) => setResolution(text)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}