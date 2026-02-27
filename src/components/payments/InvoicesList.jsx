import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar, FileText, Plus } from 'lucide-react';
import { useState } from 'react';

export default function InvoicesList({ onCreateNew }) {
  const [typeFilter, setTypeFilter] = useState('invoice');

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices', typeFilter],
    queryFn: () => base44.entities.Invoice.filter({ type: typeFilter }, '-created_date'),
  });

  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    viewed: 'bg-purple-100 text-purple-700',
    paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-500',
  };

  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);

  const pendingAmount = invoices
    .filter(inv => ['sent', 'viewed'].includes(inv.status))
    .reduce((sum, inv) => sum + inv.total, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
            <div className="text-2xl font-bold text-green-600">
              ${totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Pending Payment</div>
            <div className="text-2xl font-bold text-blue-600">
              ${pendingAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Total Documents</div>
            <div className="text-2xl font-bold text-purple-600">{invoices.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Documents</CardTitle>
            <Button onClick={onCreateNew} className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={typeFilter} onValueChange={setTypeFilter}>
            <TabsList className="mb-4">
              <TabsTrigger value="invoice">Invoices</TabsTrigger>
              <TabsTrigger value="estimate">Estimates</TabsTrigger>
              <TabsTrigger value="proposal">Proposals</TabsTrigger>
              <TabsTrigger value="contract">Contracts</TabsTrigger>
              <TabsTrigger value="receipt">Receipts</TabsTrigger>
            </TabsList>

            <div className="space-y-3">
              {invoices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No {typeFilter}s found. Create your first one!
                </div>
              ) : (
                invoices.map((invoice) => (
                  <Card key={invoice.id} className="hover:shadow-md transition-all">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-semibold">{invoice.invoice_number}</p>
                              <p className="text-sm text-gray-600">{invoice.client_name}</p>
                            </div>
                          </div>
                          <div className="flex gap-4 text-sm text-gray-600">
                            {invoice.issue_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(invoice.issue_date), 'MMM d, yyyy')}
                              </div>
                            )}
                            {invoice.due_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Due: {format(new Date(invoice.due_date), 'MMM d, yyyy')}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={statusColors[invoice.status]}>
                            {invoice.status}
                          </Badge>
                          <p className="text-2xl font-bold text-green-600 mt-2">
                            ${invoice.total.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}