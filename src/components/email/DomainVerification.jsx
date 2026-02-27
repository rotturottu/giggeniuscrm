import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Copy, Plus, RefreshCw, Shield, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function DomainVerification() {
  const [showDialog, setShowDialog] = useState(false);
  const [domain, setDomain] = useState('');
  const [selectedDomain, setSelectedDomain] = useState(null);

  const queryClient = useQueryClient();

  const { data: domains = [] } = useQuery({
    queryKey: ['email-domains'],
    queryFn: () => base44.entities.EmailDomain.list('-created_date'),
  });

  const addDomainMutation = useMutation({
    mutationFn: (domainName) => {
      const dkimSelector = `giggenius${Date.now()}`;
      return base44.entities.EmailDomain.create({
        domain: domainName,
        dkim_selector: dkimSelector,
        spf_record: `v=spf1 include:_spf.giggenius.io ~all`,
        dmarc_record: `v=DMARC1; p=quarantine; rua=mailto:dmarc@${domainName}`,
        verification_status: 'pending',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-domains'] });
      setShowDialog(false);
      setDomain('');
      toast.success('Domain added. Please configure DNS records.');
    },
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: XCircle },
      verified: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      failed: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
    };
    const style = styles[status] || styles.pending;
    const Icon = style.icon;
    return (
      <Badge className={`${style.bg} ${style.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          onClick={() => setShowDialog(true)}
          className="bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Domain
        </Button>
      </div>

      {domains.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No domains configured</p>
            <p className="text-sm text-gray-500">
              Add your sending domain and verify DNS records for better deliverability
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {domains.map((d) => (
            <Card key={d.id} className="border-2">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    {d.domain}
                  </CardTitle>
                  {getStatusBadge(d.verification_status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* SPF Record */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">SPF Record</span>
                        {d.spf_verified ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(d.spf_record)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="text-gray-600">Type: <span className="font-mono">TXT</span></div>
                      <div className="text-gray-600">Name: <span className="font-mono">@</span></div>
                      <div className="text-gray-600">Value:</div>
                      <code className="block p-2 bg-white rounded text-xs overflow-x-auto">
                        {d.spf_record}
                      </code>
                    </div>
                  </div>

                  {/* DKIM Record */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">DKIM Record</span>
                        {d.dkim_verified ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(`${d.dkim_selector}._domainkey`)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="text-gray-600">Type: <span className="font-mono">TXT</span></div>
                      <div className="text-gray-600">Name: <span className="font-mono">{d.dkim_selector}._domainkey</span></div>
                      <div className="text-gray-600">Value:</div>
                      <code className="block p-2 bg-white rounded text-xs">
                        v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
                      </code>
                      <p className="text-xs text-gray-500 mt-2">
                        Contact support for your unique DKIM key
                      </p>
                    </div>
                  </div>

                  {/* DMARC Record */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">DMARC Record</span>
                        {d.dmarc_verified ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(d.dmarc_record)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="text-gray-600">Type: <span className="font-mono">TXT</span></div>
                      <div className="text-gray-600">Name: <span className="font-mono">_dmarc</span></div>
                      <div className="text-gray-600">Value:</div>
                      <code className="block p-2 bg-white rounded text-xs overflow-x-auto">
                        {d.dmarc_record}
                      </code>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Button size="sm" variant="outline" className="flex-1">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Verify Records
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Domain for Verification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Domain Name</Label>
              <Input
                placeholder="yourdomain.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your domain without http:// or www
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => addDomainMutation.mutate(domain)}
                disabled={!domain || addDomainMutation.isPending}
              >
                Add Domain
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}