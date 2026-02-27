import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Check, Crown, Rocket, Zap } from 'lucide-react';

const plans = [
  {
    name: 'Free Starter',
    icon: Zap,
    price: '0',
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
    cta: 'Start Free',
    popular: false,
    gradient: 'from-blue-500 to-cyan-500',
    glowColor: 'rgba(59, 130, 246, 0.3)',
  },
  {
    name: 'Pro',
    icon: Rocket,
    price: '39',
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
    cta: 'Get Started',
    popular: true,
    gradient: 'from-purple-500 to-pink-500',
    glowColor: 'rgba(168, 85, 247, 0.5)',
  },
  {
    name: 'Elite',
    icon: Crown,
    price: '99',
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
    cta: 'Go Elite',
    popular: false,
    gradient: 'from-amber-500 to-orange-500',
    glowColor: 'rgba(251, 191, 36, 0.3)',
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="relative py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Choose Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
              Perfect Plan
            </span>
          </h2>
          <p className="text-xl text-black max-w-2xl mx-auto">
            Select the perfect plan to launch your sales success. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ y: -12, scale: 1.02 }}
                className={`relative group ${plan.popular ? 'md:scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                    <div className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg">
                      <span className="text-sm font-bold text-white">Most Popular</span>
                    </div>
                  </div>
                )}

                <div 
                  className="absolute inset-0 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-30"
                  style={{ background: `linear-gradient(135deg, ${plan.glowColor}, transparent)` }}
                />

                <div className={`relative h-full p-8 rounded-3xl bg-white border-2 shadow-xl group-hover:shadow-2xl transition-all duration-300 ${
                  plan.popular ? 'border-blue-400' : 'border-gray-200 group-hover:border-blue-300'
                }`}>
                  <div className="mb-6">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${plan.gradient} shadow-lg mb-4`}>
                      <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-black">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-2">
                      {plan.price !== 'Custom' && (
                        <span className="text-5xl font-black text-gray-900">
                          ${plan.price}
                        </span>
                      )}
                      {plan.price === 'Custom' && (
                        <span className="text-5xl font-black bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
                          {plan.price}
                        </span>
                      )}
                      {plan.price !== 'Custom' && (
                        <span className="text-black">/month</span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className={`mt-0.5 p-1 rounded-full bg-gradient-to-br ${plan.gradient} flex-shrink-0`}>
                          <Check className="w-4 h-4 text-white" strokeWidth={3} />
                        </div>
                        <span className="text-black text-sm leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    size="lg"
                    onClick={() => {
                      if (plan.name === 'Free Starter') {
                        base44.auth.redirectToLogin();
                      } else {
                        base44.auth.redirectToLogin(createPageUrl('AccountSettings') + '?tab=billing');
                      }
                    }}
                    className={`w-full font-semibold text-lg py-6 rounded-xl transition-all duration-300 ${
                      plan.popular
                        ? `bg-gradient-to-r ${plan.gradient} text-white shadow-xl hover:shadow-2xl`
                        : 'bg-gray-100 hover:bg-blue-50 text-gray-900 border-2 border-gray-200 hover:border-blue-400'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Money-back guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-blue-50 border border-blue-300">
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-blue-700 font-semibold">
              30-day money-back guarantee • No questions asked
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}