import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, Edit, Plus, Server } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function SMTPSettings() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    host: '',
    port: 587,
    username: '',
    password: '',
    from_email: '',
    from_name: '',
    encryption: 'tls',
    daily_limit: 1000,
  });

  const queryClient = useQueryClient();

  const { data: configs = [] } = useQuery({
    queryKey: ['smtp-configs'],
    queryFn: () => base44.entities.SMTPConfig.list('-created_date'),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingConfig) {
        return base44.entities.SMTPConfig.update(editingConfig.id, data);
      }
      return base44.entities.SMTPConfig.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smtp-configs'] });
      setShowDialog(false);
      setEditingConfig(null);
      resetForm();
      toast.success('SMTP configuration saved');
    },
  });

  const setActiveMutation = useMutation({
    mutationFn: async (id) => {
      // Deactivate all others first
      const updates = configs
        .filter(c => c.id !== id)
        .map(c => base44.entities.SMTPConfig.update(c.id, { is_active: false }));
      
      await Promise.all(updates);
      
      // Activate selected
      return base44.entities.SMTPConfig.update(id, { is_active: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smtp-configs'] });
      toast.success('SMTP configuration activated');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      host: '',
      port: 587,
      username: '',
      password: '',
      from_email: '',
      from_name: '',
      encryption: 'tls',
      daily_limit: 1000,
    });
  };

  const handleEdit = (config) => {
    setEditingConfig(config);
    setFormData({
      name: config.name,
      host: config.host,
      port: config.port,
      username: config.username || '',
      password: '',
      from_email: config.from_email,
      from_name: config.from_name || '',
      encryption: config.encryption,
      daily_limit: config.daily_limit || 1000,
    });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.host || !formData.from_email) {
      toast.error('Please fill in required fields');
      return;
    }
    saveMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            resetForm();
            setEditingConfig(null);
            setShowDialog(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add SMTP Config
        </Button>
      </div>

      {configs.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No SMTP configurations yet</p>
            <p className="text-sm text-gray-500">
              Add an SMTP server to start sending email campaigns
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {configs.map((config) => (
            <Card key={config.id} className={`border-2 ${config.is_active ? 'border-green-300 bg-green-50/50' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-blue-600" />
                    {config.name}
                  </CardTitle>
                  {config.is_active && (
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Host:</span>
                      <div className="font-medium">{config.host}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Port:</span>
                      <div className="font-medium">{config.port}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">From Email:</span>
                      <div className="font-medium">{config.from_email}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Encryption:</span>
                      <div className="font-medium uppercase">{config.encryption}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm pt-2 border-t">
                    {config.verified ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        Verified
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-orange-600">
                        <AlertCircle className="w-4 h-4" />
                        Not Verified
                      </div>
                    )}
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">
                      {config.emails_sent_today || 0} / {config.daily_limit} sent today
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    {!config.is_active && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveMutation.mutate(config.id)}
                        className="flex-1"
                      >
                        Set Active
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(config)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingConfig ? 'Edit' : 'Add'} SMTP Configuration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <Label>Configuration Name *</Label>
              <Input
                placeholder="e.g., Primary SMTP"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>SMTP Host *</Label>
                <Input
                  placeholder="smtp.gmail.com"
                  value={formData.host}
                  onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Port *</Label>
                <Input
                  type="number"
                  placeholder="587"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Username</Label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1"
                  placeholder={editingConfig ? '(leave blank to keep existing)' : ''}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>From Email *</Label>
                <Input
                  type="email"
                  placeholder="noreply@yourdomain.com"
                  value={formData.from_email}
                  onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>From Name</Label>
                <Input
                  placeholder="Your Company"
                  value={formData.from_name}
                  onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Encryption</Label>
                <Select value={formData.encryption} onValueChange={(value) => setFormData({ ...formData, encryption: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="ssl">SSL</SelectItem>
                    <SelectItem value="tls">TLS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Daily Sending Limit</Label>
                <Input
                  type="number"
                  value={formData.daily_limit}
                  onChange={(e) => setFormData({ ...formData, daily_limit: parseInt(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saveMutation.isPending}>
                {editingConfig ? 'Update' : 'Add'} Configuration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}