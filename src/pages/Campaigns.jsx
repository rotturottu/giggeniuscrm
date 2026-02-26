import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Zap } from 'lucide-react';
import { useState } from 'react';
import AutomationBuilder from '../components/automation/AutomationBuilder';
import AutomationList from '../components/automation/AutomationList';
import ContactList from '../components/contacts/ContactList';
import SmartLists from '../components/contacts/SmartLists';
import CampaignBuilder from '../components/email/CampaignBuilder';
import CampaignList from '../components/email/CampaignList';
import DeliverabilityMonitor from '../components/email/DeliverabilityMonitor';
import DomainVerification from '../components/email/DomainVerification';
import EmailTemplateBuilder from '../components/email/EmailTemplateBuilder';
import EmailTemplateList from '../components/email/EmailTemplateList';
import SMTPSettings from '../components/email/SMTPSettings';

export default function Campaigns() {
  const [selectedSmartListId, setSelectedSmartListId] = useState(null);
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [showCampaignBuilder, setShowCampaignBuilder] = useState(false);
  const [showAutomationBuilder, setShowAutomationBuilder] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [editingAutomation, setEditingAutomation] = useState(null);

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setShowTemplateBuilder(true);
  };

  const handleEditCampaign = (campaign) => {
    setEditingCampaign(campaign);
    setShowCampaignBuilder(true);
  };

  const handleCloseTemplateBuilder = () => {
    setShowTemplateBuilder(false);
    setEditingTemplate(null);
  };

  const handleCloseCampaignBuilder = () => {
    setShowCampaignBuilder(false);
    setEditingCampaign(null);
  };

  const handleEditAutomation = (auto) => { setEditingAutomation(auto); setShowAutomationBuilder(true); };
  const handleCloseAutomationBuilder = () => { setShowAutomationBuilder(false); setEditingAutomation(null); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Marketing
            </h1>
            <p className="text-gray-600">Manage contacts, create campaigns, and automate delivery at scale</p>
          </div>
        </div>

        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="automations" className="gap-1.5"><Zap className="w-3.5 h-3.5" />Automations</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="deliverability">Deliverability</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns">
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => setShowCampaignBuilder(true)}
                className="bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </div>
            <CampaignList onEdit={handleEditCampaign} />
          </TabsContent>

          <TabsContent value="automations">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setShowAutomationBuilder(true)} className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Plus className="w-4 h-4 mr-2" /> New Automation
              </Button>
            </div>
            <AutomationList onEdit={handleEditAutomation} onCreate={() => setShowAutomationBuilder(true)} />
          </TabsContent>

          <TabsContent value="contacts">
            <div className="flex gap-0 border rounded-xl overflow-hidden bg-white min-h-[500px]">
              <SmartLists onSelectList={setSelectedSmartListId} selectedListId={selectedSmartListId} />
              <div className="flex-1 p-4 overflow-auto">
                <ContactList smartListId={selectedSmartListId} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => setShowTemplateBuilder(true)}
                className="bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
            <EmailTemplateList onEdit={handleEditTemplate} />
          </TabsContent>

          <TabsContent value="deliverability">
            <DeliverabilityMonitor />
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <SMTPSettings />
              <DomainVerification />
            </div>
          </TabsContent>
        </Tabs>

        <EmailTemplateBuilder
          open={showTemplateBuilder}
          onClose={handleCloseTemplateBuilder}
          template={editingTemplate}
        />

        <CampaignBuilder
          open={showCampaignBuilder}
          onClose={handleCloseCampaignBuilder}
          campaign={editingCampaign}
        />

        <AutomationBuilder
          open={showAutomationBuilder}
          onClose={handleCloseAutomationBuilder}
          automation={editingAutomation}
        />
      </div>
    </div>
  );
}