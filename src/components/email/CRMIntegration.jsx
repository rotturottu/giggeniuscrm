import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Download, ExternalLink, RefreshCw, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function CRMIntegration() {
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [importCRM, setImportCRM] = useState('salesforce');
  const [exportCRM, setExportCRM] = useState('salesforce');
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const queryClient = useQueryClient();

  const { data: campaigns = [] } = useQuery({
    queryKey: ['email-campaigns'],
    queryFn: () => base44.entities.EmailCampaign.filter({ status: 'sent' }),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list(),
  });

  const handleImportFromCRM = async () => {
    setImporting(true);
    try {
      const response = await base44.functions.invoke('importFromCRM', {
        crm_type: importCRM,
      });

      if (response.data.success) {
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
        toast.success(`Imported ${response.data.imported_count} contacts from ${importCRM}`);
        setShowImportDialog(false);
      } else {
        toast.error(response.data.error || 'Import failed');
      }
    } catch (error) {
      toast.error('Failed to import: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  const handleExportToCRM = async () => {
    if (!selectedCampaign) {
      toast.error('Please select a campaign');
      return;
    }

    setExporting(true);
    try {
      const response = await base44.functions.invoke('exportToCRM', {
        crm_type: exportCRM,
        campaign_id: selectedCampaign,
      });

      if (response.data.success) {
        toast.success(`Exported ${response.data.exported_count} engagement records to ${exportCRM}`);
        setShowExportDialog(false);
      } else {
        toast.error(response.data.error || 'Export failed');
      }
    } catch (error) {
      toast.error('Failed to export: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  const crmOptions = [
    { value: 'salesforce', label: 'Salesforce', icon: '☁️' },
    { value: 'hubspot', label: 'HubSpot', icon: '🔶' },
    { value: 'pipedrive', label: 'Pipedrive', icon: '🎯' },
    { value: 'zoho', label: 'Zoho CRM', icon: '📊' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              Import from CRM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Import leads and contacts from your external CRM system to expand your contact database.
            </p>
            <Button
              onClick={() => setShowImportDialog(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Contacts
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-green-600" />
              Export to CRM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Export campaign engagement data (opens, clicks, bounces) back to your CRM for better insights.
            </p>
            <Button
              onClick={() => setShowExportDialog(true)}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Engagement Data
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {crmOptions.map((crm) => (
              <div key={crm.value} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{crm.icon}</span>
                  <span className="font-semibold">{crm.label}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Ready
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Sync Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium">Contact Import</div>
                  <div className="text-sm text-gray-500">Last synced: {new Date().toLocaleDateString()}</div>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700">Success</Badge>
            </div>
            <div className="text-center py-8 text-gray-500 text-sm">
              No recent sync activity. Start by importing or exporting data.
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Contacts from CRM</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select CRM System</Label>
              <Select value={importCRM} onValueChange={setImportCRM}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {crmOptions.map((crm) => (
                    <SelectItem key={crm.value} value={crm.value}>
                      {crm.icon} {crm.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> This will import all contacts and leads from your {importCRM} account. 
                Existing contacts will be updated based on email address.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleImportFromCRM} disabled={importing}>
                {importing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Engagement Data to CRM</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select CRM System</Label>
              <Select value={exportCRM} onValueChange={setExportCRM}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {crmOptions.map((crm) => (
                    <SelectItem key={crm.value} value={crm.value}>
                      {crm.icon} {crm.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Select Campaign</Label>
              <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a campaign" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-900">
                <strong>What will be exported:</strong> Email opens, clicks, bounces, and unsubscribes 
                will be synced to the contact/lead records in your {exportCRM} account.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleExportToCRM} disabled={exporting || !selectedCampaign}>
                {exporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}