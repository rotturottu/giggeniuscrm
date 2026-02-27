import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import AIContentTools from './AIContentTools';
import AIEmailAssistant from './AIEmailAssistant';
import VisualEmailBuilder from './VisualEmailBuilder';

const variableOptions = [
  '{{lead_name}}',
  '{{lead_email}}',
  '{{company}}',
  '{{lead_status}}',
  '{{lead_score}}',
  '{{sales_rep_name}}',
  '{{current_date}}',
];

export default function EmailTemplateBuilder({ open, onClose, template }) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('other');
  const [visualBlocks, setVisualBlocks] = useState([]);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (template) {
      setName(template.name);
      setSubject(template.subject);
      setBody(template.body);
      setCategory(template.category || 'other');
      setVisualBlocks(template.visual_blocks || []);
    } else {
      setName('Welcome Email');
      setSubject('Welcome to {{company}}, {{lead_name}}! 🎉');
      setBody(`Hi {{lead_name}},

Welcome to {{company}}! We're so excited to have you on board.

Here's what you can expect from us:
• Helpful tips and resources to get you started
• Exclusive updates and offers just for you
• Dedicated support whenever you need it

If you have any questions, simply reply to this email — we're always happy to help.

Talk soon,
The {{company}} Team

---
You received this email because you signed up at {{company}}.`);
      setCategory('welcome');
      setVisualBlocks([
        { id: '1', type: 'header', props: { text: 'Welcome!', backgroundColor: '#2563eb', textColor: '#ffffff', fontSize: 28, align: 'center', padding: 32 } },
        { id: '2', type: 'heading', props: { text: "Hi {{lead_name}}, we're glad you're here", fontSize: 22, align: 'center', color: '#1e293b', padding: 16 } },
        { id: '3', type: 'text', props: { text: "Thank you for joining us. We're excited to help you grow your business. Feel free to reply to this email with any questions — we're here to help!", fontSize: 15, align: 'center', color: '#475569', padding: 12 } },
        { id: '4', type: 'button', props: { text: 'Get Started', url: '#', backgroundColor: '#2563eb', textColor: '#ffffff', borderRadius: 8, align: 'center', padding: 16 } },
        { id: '5', type: 'divider', props: { color: '#e2e8f0', thickness: 1, padding: 16 } },
        { id: '6', type: 'footer', props: { text: '© {{company}} · You received this because you signed up. Unsubscribe', backgroundColor: '#f8fafc', textColor: '#94a3b8', fontSize: 12, align: 'center', padding: 20 } },
      ]);
    }
  }, [template, open]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (template) {
        return base44.entities.EmailTemplate.update(template.id, data);
      }
      return base44.entities.EmailTemplate.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      onClose();
    },
  });

  const insertVariable = (variable) => {
    setBody(body + ' ' + variable);
  };

  const handleApplySuggestion = (field, value) => {
    if (field === 'subject') {
      setSubject(value);
    } else if (field === 'body') {
      setBody(value);
    }
  };

  const extractVariables = (text) => {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = text.match(regex);
    return matches ? [...new Set(matches)] : [];
  };

  const handleSave = () => {
    if (!name || !subject) return;

    // If no body yet but we have visual blocks, body will be empty until a block is interacted with
    // Generate body from visual blocks if body is empty
    const effectiveBody = body || (visualBlocks.length > 0 ? '(visual template)' : '');
    if (!effectiveBody) return;

    const variables = [...new Set([
      ...extractVariables(subject),
      ...extractVariables(effectiveBody),
    ])];

    saveMutation.mutate({
      name,
      subject,
      body: effectiveBody,
      category,
      variables,
      visual_blocks: visualBlocks,
      is_active: true,
    });
  };

  const handleVisualContentChange = (htmlContent, blocks) => {
    setBody(htmlContent);
    setVisualBlocks(blocks);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            {template ? 'Edit Template' : 'Create Email Template'}
            <Sparkles className="w-5 h-5 text-purple-600" />
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="visual" className="space-y-4">
          <TabsList>
            <TabsTrigger value="visual">Visual Builder</TabsTrigger>
            <TabsTrigger value="code">Code Editor</TabsTrigger>
            <TabsTrigger value="ai"><Sparkles className="w-3.5 h-3.5 mr-1" />AI Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="visual" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-base font-semibold">Template Name</Label>
                <Input
                  placeholder="e.g., Welcome Email"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-base font-semibold">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome</SelectItem>
                    <SelectItem value="follow_up">Follow Up</SelectItem>
                    <SelectItem value="nurture">Nurture</SelectItem>
                    <SelectItem value="promotional">Promotional</SelectItem>
                    <SelectItem value="transactional">Transactional</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold">Subject Line</Label>
              <Input
                placeholder="Email subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-base font-semibold mb-2 block">Email Content (Drag & Drop)</Label>
              <VisualEmailBuilder 
                onContentChange={handleVisualContentChange}
                initialBlocks={visualBlocks}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
               <Button variant="outline" onClick={onClose}>
                 Cancel
               </Button>
               <Button
                 onClick={handleSave}
                 disabled={!name || !subject || (!body && visualBlocks.length === 0) || saveMutation.isPending}
                 className="bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700"
               >
                 <Save className="w-4 h-4 mr-2" />
                 {saveMutation.isPending ? 'Saving...' : (template ? 'Update' : 'Create') + ' Template'}
               </Button>
             </div>
            </TabsContent>

          <TabsContent value="code" className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-base font-semibold">Template Name</Label>
              <Input
                placeholder="e.g., Welcome Email"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-base font-semibold">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome">Welcome</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                  <SelectItem value="nurture">Nurture</SelectItem>
                  <SelectItem value="promotional">Promotional</SelectItem>
                  <SelectItem value="transactional">Transactional</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold">Subject Line</Label>
            <Input
              placeholder="Email subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-base font-semibold mb-2 block">Email Body</Label>
            <div className="mb-2 flex flex-wrap gap-2">
              <span className="text-xs text-gray-600">Insert variables:</span>
              {variableOptions.map((variable) => (
                <Badge
                  key={variable}
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-100"
                  onClick={() => insertVariable(variable)}
                >
                  {variable}
                </Badge>
              ))}
            </div>
            <Textarea
              placeholder="Write your email content here... Use variables like {{lead_name}} for personalization."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Label className="text-sm font-semibold mb-2 block">Preview Variables</Label>
            <div className="flex flex-wrap gap-2">
              {[...extractVariables(subject), ...extractVariables(body)].map((variable, idx) => (
                <Badge key={idx} variant="secondary">{variable}</Badge>
              ))}
              {extractVariables(subject).length === 0 && extractVariables(body).length === 0 && (
                <span className="text-sm text-gray-500">No variables used</span>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name || !subject || !body || saveMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {template ? 'Update' : 'Create'} Template
            </Button>
          </div>
          </TabsContent>

          <TabsContent value="ai">
            <AIEmailAssistant onApplySuggestion={handleApplySuggestion} />
            <AIContentTools
              currentSubject={subject}
              currentBody={body}
              onApply={(field, value) => {
                if (field === 'subject') setSubject(value);
                if (field === 'body') setBody(value);
              }}
              onInsertToken={(token) => setBody(prev => prev + ' ' + token)}
            />
          </TabsContent>
          </Tabs>
          </DialogContent>
          </Dialog>
          );
}