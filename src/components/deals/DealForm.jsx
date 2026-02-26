import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save } from 'lucide-react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function DealForm({ open, onClose, deal }) {
  const [name, setName] = useState('');
  const [contactId, setContactId] = useState('');
  const [leadId, setLeadId] = useState('');
  const [stage, setStage] = useState('prospecting');
  const [value, setValue] = useState('');
  const [probability, setProbability] = useState('50');
  const [expectedCloseDate, setExpectedCloseDate] = useState(null);
  const [ownerEmail, setOwnerEmail] = useState('');
  const [source, setSource] = useState('');
  const [notes, setNotes] = useState('');

  const queryClient = useQueryClient();

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts-for-deal'],
    queryFn: () => base44.entities.Contact.list('-created_date', 100),
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['leads-for-deal'],
    queryFn: () => base44.entities.Lead.list('-created_date', 100),
  });

  useEffect(() => {
    if (deal) {
      setName(deal.name);
      setContactId(deal.contact_id || '');
      setLeadId(deal.lead_id || '');
      setStage(deal.stage);
      setValue(deal.value?.toString() || '');
      setProbability(deal.probability?.toString() || '50');
      setExpectedCloseDate(deal.expected_close_date ? new Date(deal.expected_close_date) : null);
      setOwnerEmail(deal.owner_email || '');
      setSource(deal.source || '');
      setNotes(deal.notes || '');
    } else {
      setName('');
      setContactId('');
      setLeadId('');
      setStage('prospecting');
      setValue('');
      setProbability('50');
      setExpectedCloseDate(null);
      setOwnerEmail('');
      setSource('');
      setNotes('');
    }
  }, [deal, open]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (deal) {
        return base44.entities.Deal.update(deal.id, data);
      }
      return base44.entities.Deal.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      onClose();
    },
  });

  const handleSave = () => {
    if (!name || !value || !stage) return;

    saveMutation.mutate({
      name,
      contact_id: contactId || null,
      lead_id: leadId || null,
      stage,
      value: parseFloat(value),
      probability: parseInt(probability),
      expected_close_date: expectedCloseDate ? expectedCloseDate.toISOString() : null,
      owner_email: ownerEmail || null,
      source: source || null,
      notes: notes || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{deal ? 'Edit Deal' : 'Create New Deal'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Deal Name *</Label>
            <Input
              placeholder="e.g., Acme Corp - Enterprise Plan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Contact</Label>
              <Select value={contactId} onValueChange={setContactId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>None</SelectItem>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.email} {contact.first_name && `(${contact.first_name})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Lead</Label>
              <Select value={leadId} onValueChange={setLeadId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select lead" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>None</SelectItem>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.name} - {lead.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Deal Value ($) *</Label>
              <Input
                type="number"
                placeholder="10000"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Probability (%) *</Label>
              <Input
                type="number"
                min="0"
                max="100"
                placeholder="50"
                value={probability}
                onChange={(e) => setProbability(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Stage *</Label>
              <Select value={stage} onValueChange={setStage}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospecting">Prospecting</SelectItem>
                  <SelectItem value="qualification">Qualification</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="closed_won">Closed Won</SelectItem>
                  <SelectItem value="closed_lost">Closed Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Expected Close Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full mt-1 justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expectedCloseDate ? format(expectedCloseDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={expectedCloseDate}
                    onSelect={setExpectedCloseDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Owner Email</Label>
              <Input
                type="email"
                placeholder="owner@company.com"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Source</Label>
              <Input
                placeholder="e.g., Website, Referral"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              placeholder="Additional notes about this deal..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name || !value || !stage || saveMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {deal ? 'Update' : 'Create'} Deal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}