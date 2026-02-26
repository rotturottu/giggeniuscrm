import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Ticket } from 'lucide-react';
import { useState } from 'react';

const CATEGORIES = [
  'Billing & Payments',
  'Technical Issue',
  'Account Access',
  'Feature Request',
  'Flagged User / Fraud',
  'CRM Issue',
  'Marketplace Issue',
  'Compliance / Legal',
  'Other',
];

const PLATFORMS = ['GigGenius CRM', 'GigGenius Freelance Marketplace', 'Both'];
const USER_TYPES = ['Client', 'Freelancer', 'Business Owner', 'Other'];
const PRIORITIES = [
  { value: 'low', label: 'Low – General inquiry' },
  { value: 'medium', label: 'Medium – Needs attention soon' },
  { value: 'high', label: 'High – Impacting work' },
  { value: 'urgent', label: 'Urgent – Critical / Platform down' },
];

function generateTicketNumber() {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `GG-${num}`;
}

export default function ContactUs() {
  const [form, setForm] = useState({
    submitter_name: '',
    submitter_email: '',
    platform: '',
    user_type: '',
    category: '',
    priority: 'medium',
    subject: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState('');

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.submitter_name || !form.submitter_email || !form.platform || !form.user_type || !form.category || !form.subject || !form.description) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    const ticket_number = generateTicketNumber();
    const ticket = await base44.entities.Ticket.create({ ...form, ticket_number, status: 'open' });

    // Send email notification
    await base44.integrations.Core.SendEmail({
      to: 'support@gig-genius.io',
      subject: `[${ticket_number}] New Support Ticket: ${form.subject}`,
      body: `
<h2>New Support Ticket Received</h2>
<table style="border-collapse:collapse;width:100%">
  <tr><td style="padding:8px;font-weight:bold;background:#f3f4f6">Ticket #</td><td style="padding:8px">${ticket_number}</td></tr>
  <tr><td style="padding:8px;font-weight:bold;background:#f3f4f6">Subject</td><td style="padding:8px">${form.subject}</td></tr>
  <tr><td style="padding:8px;font-weight:bold;background:#f3f4f6">Name</td><td style="padding:8px">${form.submitter_name}</td></tr>
  <tr><td style="padding:8px;font-weight:bold;background:#f3f4f6">Email</td><td style="padding:8px">${form.submitter_email}</td></tr>
  <tr><td style="padding:8px;font-weight:bold;background:#f3f4f6">Platform</td><td style="padding:8px">${form.platform}</td></tr>
  <tr><td style="padding:8px;font-weight:bold;background:#f3f4f6">User Type</td><td style="padding:8px">${form.user_type}</td></tr>
  <tr><td style="padding:8px;font-weight:bold;background:#f3f4f6">Category</td><td style="padding:8px">${form.category}</td></tr>
  <tr><td style="padding:8px;font-weight:bold;background:#f3f4f6">Priority</td><td style="padding:8px;text-transform:uppercase;color:${form.priority === 'urgent' ? '#dc2626' : form.priority === 'high' ? '#ea580c' : '#2563eb'}">${form.priority}</td></tr>
  <tr><td style="padding:8px;font-weight:bold;background:#f3f4f6">Description</td><td style="padding:8px">${form.description.replace(/\n/g, '<br/>')}</td></tr>
</table>
<p style="margin-top:16px;color:#6b7280;font-size:12px">This ticket was automatically created in the GigGenius CRM support system.</p>
      `,
    });

    // Send confirmation to submitter
    await base44.integrations.Core.SendEmail({
      to: form.submitter_email,
      from_name: 'GigGenius Support',
      subject: `[${ticket_number}] We received your support request`,
      body: `
<h2>Hi ${form.submitter_name},</h2>
<p>Thank you for reaching out! We've received your support request and will get back to you shortly.</p>
<p><strong>Your Ticket Number: ${ticket_number}</strong></p>
<p><strong>Subject:</strong> ${form.subject}</p>
<p><strong>Priority:</strong> ${form.priority.charAt(0).toUpperCase() + form.priority.slice(1)}</p>
<p>Our support team is reviewing your request. For urgent matters, you can reply to this email directly.</p>
<br/>
<p>Best regards,<br/>GigGenius Support Team</p>
      `,
    });

    setSubmitted({ ticket_number, subject: form.subject });
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Ticket Submitted!</h2>
          <p className="text-gray-500 mb-6">We've received your request and sent a confirmation to your email.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Your Ticket Number</p>
            <p className="text-3xl font-black text-blue-600">{submitted.ticket_number}</p>
            <p className="text-sm text-gray-600 mt-1">{submitted.subject}</p>
          </div>
          <p className="text-sm text-gray-500">
            Our team will review your ticket and respond shortly. Average response time is under 24 hours.
          </p>
          <Button onClick={() => { setSubmitted(null); setForm({ submitter_name: '', submitter_email: '', platform: '', user_type: '', category: '', priority: 'medium', subject: '', description: '' }); }} className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            Submit Another Ticket
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 py-16 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-4">
            <Ticket className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-semibold">Support Ticketing System</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">How can we help you?</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">Submit a support ticket and our team will get back to you. All tickets are tracked and prioritized.</p>
        </motion.div>
      </div>

      {/* Info cards */}
      <div className="max-w-5xl mx-auto px-4 -mt-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { emoji: '⚡', title: 'Urgent Issues', desc: 'Responded within 2 hours' },
            { emoji: '📋', title: 'Ticket Tracking', desc: 'Track your ticket status via email' },
            { emoji: '📧', title: 'Email Support', desc: 'Get help via email support' },
          ].map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white rounded-2xl shadow-md p-5 flex items-center gap-4 border border-gray-100">
              <span className="text-3xl">{c.emoji}</span>
              <div>
                <p className="font-bold text-gray-900">{c.title}</p>
                <p className="text-sm text-gray-500">{c.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Submit a Support Ticket</h2>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label className="mb-1.5 block">Full Name <span className="text-red-500">*</span></Label>
                <Input value={form.submitter_name} onChange={e => set('submitter_name', e.target.value)} placeholder="John Doe" />
              </div>
              <div>
                <Label className="mb-1.5 block">Email Address <span className="text-red-500">*</span></Label>
                <Input type="email" value={form.submitter_email} onChange={e => set('submitter_email', e.target.value)} placeholder="john@example.com" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label className="mb-1.5 block">Platform <span className="text-red-500">*</span></Label>
                <Select value={form.platform} onValueChange={v => set('platform', v)}>
                  <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">I am a... <span className="text-red-500">*</span></Label>
                <Select value={form.user_type} onValueChange={v => set('user_type', v)}>
                  <SelectTrigger><SelectValue placeholder="Select user type" /></SelectTrigger>
                  <SelectContent>
                    {USER_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label className="mb-1.5 block">Category <span className="text-red-500">*</span></Label>
                <Select value={form.category} onValueChange={v => set('category', v)}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">Priority <span className="text-red-500">*</span></Label>
                <Select value={form.priority} onValueChange={v => set('priority', v)}>
                  <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="mb-1.5 block">Subject <span className="text-red-500">*</span></Label>
              <Input value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="Brief summary of your issue" />
            </div>

            <div>
              <Label className="mb-1.5 block">Description <span className="text-red-500">*</span></Label>
              <Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={6}
                placeholder="Please describe your issue in detail. Include any error messages, steps to reproduce, or relevant information." />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-sm text-yellow-800">
              <strong>⚠️ Urgent issues?</strong> Please select "Urgent" priority above. Our team monitors urgent tickets 24/7.
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl">
              {loading ? 'Submitting...' : 'Submit Support Ticket'}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}