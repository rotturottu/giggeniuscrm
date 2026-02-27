import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const availableVariables = [
  '{{first_name}}',
  '{{last_name}}',
  '{{email}}',
  '{{company}}',
  '{{phone}}',
  '{{lead_score}}',
  '{{lead_source}}',
];

export default function TemplateBuilder({ open, onClose, template }) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('custom');
  const [variables, setVariables] = useState([]);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (template) {
      setName(template.name);
      setSubject(template.subject);
      setBody(template.body);
      setCategory(template.category);
      setVariables(template.variables || []);
    } else {
      setName('');
      setSubject('');
      setBody('');
      setCategory('custom');
      setVariables([]);
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
    if (!variables.includes(variable)) {
      setVariables([...variables, variable]);
    }
  };

  const handleSave = () => {
    if (!name || !subject || !body) return;

    saveMutation.mutate({
      name,
      subject,
      body,
      category,
      variables,
      is_active: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
            {template ? 'Edit Template' : 'Create Email Template'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome">Welcome</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                  <SelectItem value="nurture">Nurture</SelectItem>
                  <SelectItem value="promotional">Promotional</SelectItem>
                  <SelectItem value="newsletter">Newsletter</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
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
            <Label className="text-base font-semibold">Email Body</Label>
            <Textarea
              placeholder="Write your email content here... Use variables like {{first_name}}"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="mt-2 min-h-[300px]"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold mb-2 block">Insert Variables</Label>
            <div className="flex flex-wrap gap-2">
              {availableVariables.map((variable) => (
                <Button
                  key={variable}
                  variant="outline"
                  size="sm"
                  onClick={() => insertVariable(variable)}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {variable}
                </Button>
              ))}
            </div>
          </div>

          {variables.length > 0 && (
            <div>
              <Label className="text-sm font-semibold mb-2 block">Used Variables</Label>
              <div className="flex flex-wrap gap-2">
                {variables.map((variable, idx) => (
                  <Badge key={idx} variant="secondary">
                    {variable}
                    <button
                      onClick={() => setVariables(variables.filter((_, i) => i !== idx))}
                      className="ml-2"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

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
        </div>
      </DialogContent>
    </Dialog>
  );
}