import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, ExternalLink, CreditCard, AlertCircle, Zap, RefreshCw } from 'lucide-react';

const providers = [
  {
    id: 'stripe',
    name: 'Stripe',
    logo: '💳',
    color: 'from-indigo-500 to-purple-600',
    description: 'Accept credit cards, debit cards, and local payment methods. Stripe processes payments directly in your account.',
    features: ['Credit & Debit Cards', 'Apple Pay / Google Pay', 'Subscription Billing', 'Stripe Elements embed'],
    connectUrl: 'https://connect.stripe.com/oauth/authorize?response_type=code&client_id=YOUR_STRIPE_CLIENT_ID&scope=read_write',
    docsUrl: 'https://stripe.com/docs/connect',
    note: 'Stripe Connect — all payments go directly to your Stripe account.',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    logo: '🅿️',
    color: 'from-blue-500 to-cyan-500',
    description: 'Accept PayPal, Venmo, and card payments. PayPal Smart Buttons are embedded client-side.',
    features: ['PayPal Wallet', 'Venmo (US)', 'Credit & Debit Cards', 'PayPal Smart Buttons'],
    connectUrl: 'https://www.paypal.com/connect?flowEntry=static&client_id=YOUR_PAYPAL_CLIENT_ID&scope=openid profile email',
    docsUrl: 'https://developer.paypal.com/docs/connect-with-paypal/',
    note: 'PayPal Commerce Platform — payments go directly to your PayPal business account.',
  },
  {
    id: 'payoneer',
    name: 'Payoneer',
    logo: '🌐',
    color: 'from-orange-500 to-amber-500',
    description: 'Accept global payments in 150+ currencies. Ideal for international clients and marketplaces.',
    features: ['150+ Currencies', 'Bank Transfers', 'Card Payments', 'Marketplace Payouts'],
    connectUrl: 'https://www.payoneer.com/partners/',
    docsUrl: 'https://developer.payoneer.com/',
    note: 'Payoneer Partner API — all payouts go directly to your Payoneer account.',
  },
];

const webhookEvents = [
  { event: 'payment.success', desc: 'Payment completed successfully', action: 'Updates contact, triggers automation' },
  { event: 'payment.failed', desc: 'Payment attempt failed', action: 'Logs failure, notifies user' },
  { event: 'payment.refunded', desc: 'Refund issued to customer', action: 'Updates order status' },
  { event: 'payment.chargeback', desc: 'Chargeback/dispute opened', action: 'Flags contact, alerts admin' },
  { event: 'subscription.renewed', desc: 'Recurring subscription renewed', action: 'Extends access, updates CRM' },
  { event: 'subscription.cancelled', desc: 'Subscription cancelled', action: 'Revokes access, updates contact' },
];

export default function SitesPayments() {
  const [connections, setConnections] = useState({ stripe: false, paypal: false, payoneer: false });
  const [activeProvider, setActiveProvider] = useState(null);
  const [publishableKey, setPublishableKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');

  const handleConnect = (providerId) => {
    const provider = providers.find(p => p.id === providerId);
    // In production this would redirect to OAuth flow
    window.open(provider.connectUrl, '_blank');
    // Simulate connection for demo
    setConnections(prev => ({ ...prev, [providerId]: true }));
  };

  const handleDisconnect = (providerId) => {
    setConnections(prev => ({ ...prev, [providerId]: false }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Integration</h2>
          <p className="text-gray-500 mt-1">Connect your own merchant accounts. All payments go directly to you — we never handle transactions.</p>
        </div>
        <Badge className="bg-amber-100 text-amber-800 border-amber-300 gap-1 px-3 py-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          We are not a payment processor
        </Badge>
      </div>

      {/* PCI Compliance Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-800 text-sm">PCI Compliant by Design</p>
          <p className="text-blue-700 text-xs mt-1">We never store or process card details. All payment data is handled by Stripe, PayPal, or Payoneer on their servers. We only receive webhook notifications for payment status updates.</p>
        </div>
      </div>

      {/* Payment Providers */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Connect Your Payment Account</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {providers.map((provider) => {
            const isConnected = connections[provider.id];
            return (
              <Card key={provider.id} className={`border-2 transition-all ${isConnected ? 'border-green-300 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`text-3xl w-12 h-12 rounded-xl bg-gradient-to-br ${provider.color} flex items-center justify-center`}>
                      {provider.logo}
                    </div>
                    {isConnected ? (
                      <Badge className="bg-green-100 text-green-800 border-green-300 gap-1">
                        <CheckCircle className="w-3 h-3" /> Connected
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">Not connected</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{provider.name}</CardTitle>
                  <CardDescription className="text-xs">{provider.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-1">
                    {provider.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-400 italic border-t pt-3">{provider.note}</p>
                  <div className="flex gap-2">
                    {isConnected ? (
                      <>
                        <Button size="sm" variant="outline" className="flex-1 text-xs gap-1" onClick={() => setActiveProvider(provider.id)}>
                          <RefreshCw className="w-3 h-3" /> Settings
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDisconnect(provider.id)}>
                          <XCircle className="w-3 h-3" />
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" className={`flex-1 text-xs gap-1 bg-gradient-to-r ${provider.color} text-white border-0`} onClick={() => handleConnect(provider.id)}>
                        <ExternalLink className="w-3 h-3" />
                        Connect {provider.name}
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-xs px-2" onClick={() => window.open(provider.docsUrl, '_blank')}>
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Embed Settings (shown when a provider is connected) */}
      {Object.values(connections).some(Boolean) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Checkout Embed Settings</h3>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-gray-600">Configure how checkout is embedded on your websites and funnels. All payment processing uses the provider's client-side SDK — no card data touches our servers.</p>
              {connections.stripe && (
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Stripe Publishable Key</Label>
                  <Input
                    placeholder="pk_live_..."
                    value={publishableKey}
                    onChange={e => setPublishableKey(e.target.value)}
                    className="text-sm font-mono"
                  />
                  <p className="text-xs text-gray-400 mt-1">Used for Stripe Elements (client-side only). Never enter your secret key here.</p>
                </div>
              )}
              {connections.stripe && (
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Stripe Webhook Secret</Label>
                  <Input
                    placeholder="whsec_..."
                    value={webhookSecret}
                    onChange={e => setWebhookSecret(e.target.value)}
                    className="text-sm font-mono"
                    type="password"
                  />
                  <p className="text-xs text-gray-400 mt-1">Used to verify webhook signatures from Stripe.</p>
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-700 mb-2">Your Webhook Endpoint</p>
                <code className="text-xs text-violet-700 bg-violet-50 px-3 py-2 rounded block font-mono">
                  https://your-app.base44.app/functions/paymentWebhook
                </code>
                <p className="text-xs text-gray-400 mt-2">Register this URL in your Stripe/PayPal/Payoneer dashboard to receive payment events.</p>
              </div>
              <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white">Save Settings</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Webhook Event Handling */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Webhook Events Handled</h3>
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-gray-500 uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Event</th>
                    <th className="text-left pb-3 font-medium">Description</th>
                    <th className="text-left pb-3 font-medium">What Happens</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {webhookEvents.map(ev => (
                    <tr key={ev.event}>
                      <td className="py-3 pr-4">
                        <code className="text-xs bg-gray-100 text-violet-700 px-2 py-0.5 rounded font-mono">{ev.event}</code>
                      </td>
                      <td className="py-3 pr-4 text-gray-600 text-xs">{ev.desc}</td>
                      <td className="py-3 text-xs text-gray-500 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500" /> {ev.action}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Checkout Block Info */}
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-5">
        <div className="flex gap-3">
          <CreditCard className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-violet-800 text-sm">Add a Checkout Block to Your Site</p>
            <p className="text-violet-700 text-xs mt-1">Once connected, go to the <strong>Builder</strong> tab and drag a <strong>Checkout</strong> or <strong>Pricing Table</strong> block onto your page. Select your connected payment provider — the checkout form will embed using Stripe Elements, PayPal Smart Buttons, or Payoneer's hosted page.</p>
          </div>
        </div>
      </div>
    </div>
  );
}