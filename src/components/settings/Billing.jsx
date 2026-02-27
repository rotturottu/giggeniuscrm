import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, CheckCircle2, ExternalLink, Sparkles, Zap, Crown, PlusCircle } from 'lucide-react';

const plans = [
  {
    id: 'starter',
    name: 'Free Starter',
    price: '$0',
    period: '/mo',
    description: 'Perfect for testing the cosmic waters',
    features: [
      'Up to 100 contacts',
      '1 connected email account',
      '3 team members',
      'Basic analytics',
      'Email support',
      '14-day full feature trial',
      'Social media scheduling (basic)',
    ],
    current: true,
    color: 'green',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$39',
    period: '/mo',
    description: 'For growing teams ready to scale',
    features: [
      'Up to 5,000 contacts',
      '10,000 campaign sends/month',
      'Multiple email accounts',
      'Unlimited team members',
      'Advanced automation workflows',
      'Full project management & time tracking',
      'Priority support',
      'Custom reports & dashboards',
      'Payment integrations (Stripe, PayPal)',
      'Email campaigns & sequences',
      'Full marketing suite',
      '+$5 per 1,000 extra contacts',
      '+$5 per 2,000 extra campaign sends',
    ],
    current: false,
    color: 'blue',
    popular: true,
    icon: Zap,
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '$99',
    period: '/mo',
    description: 'For ambitious businesses that want it all',
    features: [
      'Up to 20,000 contacts',
      '30,000 campaign sends/month',
      'Everything in Pro',
      'Site & funnel builder (up to 30)',
      'Blog, courses & community portal',
      'Client portal & quizzes',
      'HR Management (up to 30 employees)',
      'Payroll, leave & time tracking',
      'Performance reviews & onboarding',
      'Dedicated success manager',
      'Priority support & SLA guarantees',
      '+$5/mo per extra website or employee',
      '+$5 per 1,000 extra contacts',
      '+$5 per 2,000 extra campaign sends',
    ],
    current: false,
    color: 'violet',
    icon: Crown,
  },
];

export default function Billing() {
  const [currentPlan] = useState('starter');

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-600" />
                Free Access for GigGenius Users
              </CardTitle>
              <CardDescription className="mt-2">
                Your access to this platform is completely free as an active user of GigGenius Freelance Marketplace
              </CardDescription>
            </div>
            <Badge className="bg-green-100 text-green-700">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {['Full access to all CRM features', 'Unlimited contacts and deals', 'Email campaigns and automation', 'Analytics and reporting', 'Social media management'].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>{f}</span>
              </div>
            ))}
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-3">
                Continue using <span className="font-semibold">GigGenius Freelance Marketplace</span> to maintain your free access.
              </p>
              <Button variant="outline" className="w-full" onClick={() => window.open('https://giggenius.com', '_blank')}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit GigGenius Marketplace
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Plans */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">Upgrade Your Plan</h3>
        <p className="text-sm text-gray-500 mb-4">Unlock more contacts, campaigns, Site Builder, and HR Management by upgrading.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map(plan => {
            const Icon = plan.icon;
            const isCurrent = plan.id === currentPlan;
            const borderColor = plan.color === 'green' ? 'border-green-300' : plan.color === 'blue' ? 'border-blue-300' : 'border-violet-400';
            const badgeColor = plan.color === 'green' ? 'bg-green-100 text-green-700' : plan.color === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700';
            const btnColor = plan.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : plan.color === 'violet' ? 'bg-violet-600 hover:bg-violet-700' : '';

            return (
              <Card key={plan.id} className={`relative border-2 ${borderColor} ${plan.popular ? 'shadow-lg' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-violet-600 text-white text-xs px-3">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className={`w-4 h-4 ${plan.color === 'blue' ? 'text-blue-600' : 'text-violet-600'}`} />}
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period && <span className="text-sm text-gray-500 mb-1">{plan.period}</span>}
                  </div>
                  <CardDescription className="text-xs">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-start gap-2 text-xs text-gray-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                  <div className="pt-2">
                    {isCurrent ? (
                      <Badge className={`w-full justify-center py-1.5 text-xs ${badgeColor}`}>Current Plan</Badge>
                    ) : (
                      <Button className={`w-full text-xs text-white ${btnColor}`} size="sm">
                        Upgrade to {plan.name}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Top Up Credits */}
      <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                Top Up Credits
              </CardTitle>
              <CardDescription className="mt-1">
                Purchase extra contacts, campaign sends, or add-ons without changing your plan.
              </CardDescription>
            </div>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <PlusCircle className="w-4 h-4 mr-2" /> Buy Credits
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: '+1,000 Contacts', price: '$5' },
              { label: '+2,000 Campaign Sends', price: '$5' },
              { label: '+1 Website / Employee', price: '$5/mo' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                <span className="text-sm text-gray-700">{item.label}</span>
                <span className="text-sm font-semibold text-blue-600">{item.price}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Payment Method
          </CardTitle>
          <CardDescription>Add a card to upgrade to Pro or Elite</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm">No payment method on file.</p>
            <p className="text-xs text-gray-400 mt-1">Required only when upgrading to a paid plan.</p>
            <Button variant="outline" size="sm" className="mt-4">
              <CreditCard className="w-4 h-4 mr-2" /> Add Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Your past invoices and subscription payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No billing history</p>
            <p className="text-xs text-gray-400 mt-1">Your account is on a complimentary plan</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}