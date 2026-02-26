import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, FileText, Target, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';
import ContactsTab from '../components/deals/ContactsTab';
import DealsPipeline from '../components/deals/DealsPipeline';
import LeadScoringTab from '../components/deals/LeadScoringTab';
import CreateInvoice from '../components/payments/CreateInvoice';
import InvoicesList from '../components/payments/InvoicesList';
import PaymentSettings from '../components/payments/PaymentSettings';

export default function Sales() {
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Sales & Payments
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Manage pipeline, contacts, invoices, and payments</p>
        </div>

        <Tabs defaultValue="pipeline" className="space-y-4 sm:space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-5 w-full">
            <TabsTrigger value="pipeline" className="text-xs sm:text-sm">
              <Target className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Deals</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="text-xs sm:text-sm">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Contacts</span>
            </TabsTrigger>
            <TabsTrigger value="scoring" className="text-xs sm:text-sm">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Scoring</span>
            </TabsTrigger>
            <TabsTrigger value="invoices" className="text-xs sm:text-sm">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Invoices</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="text-xs sm:text-sm">
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline">
            <DealsPipeline />
          </TabsContent>

          <TabsContent value="contacts">
            <ContactsTab />
          </TabsContent>

          <TabsContent value="scoring">
            <LeadScoringTab />
          </TabsContent>

          <TabsContent value="invoices">
            <InvoicesList onCreateNew={() => setShowCreateInvoice(true)} />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentSettings />
          </TabsContent>
        </Tabs>

        <CreateInvoice
          open={showCreateInvoice}
          onClose={() => setShowCreateInvoice(false)}
        />
      </div>
    </div>
  );
}