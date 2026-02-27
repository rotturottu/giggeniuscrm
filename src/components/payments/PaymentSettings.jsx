import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, CreditCard, DollarSign } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function PaymentSettings() {
  const [taxId, setTaxId] = useState('');
  const [stripeConnected, setStripeConnected] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Payment Methods
          </CardTitle>
          <CardDescription>Connect payment providers to accept payments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold">Stripe</p>
                <p className="text-sm text-gray-600">Accept credit cards and online payments</p>
              </div>
            </div>
            {stripeConnected ? (
              <Badge className="bg-green-100 text-green-700">Connected</Badge>
            ) : (
              <Button onClick={() => toast.success('Stripe integration coming soon')}>
                Connect
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">PayPal</p>
                <p className="text-sm text-gray-600">Accept PayPal payments</p>
              </div>
            </div>
            <Button onClick={() => toast.success('PayPal integration coming soon')}>
              Connect
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="font-semibold">Manual Payment</p>
                <p className="text-sm text-gray-600">Record cash, check, or bank transfers</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-700">Enabled</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tax Information</CardTitle>
          <CardDescription>Configure your tax details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Tax ID / EIN</Label>
            <Input
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="XX-XXXXXXX"
              className="mt-1"
            />
          </div>
          <Button>Save Tax Information</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Payment Notifications
          </CardTitle>
          <CardDescription>Configure payment notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Payment Received</p>
              <p className="text-sm text-gray-600">Get notified when a payment is received</p>
            </div>
            <Button variant="outline" size="sm">Enabled</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Invoice Overdue</p>
              <p className="text-sm text-gray-600">Get notified when invoices are overdue</p>
            </div>
            <Button variant="outline" size="sm">Enabled</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}