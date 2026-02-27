import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, CheckCircle, Sparkles } from 'lucide-react';

export default function BusinessPromoSection() {
  return (
    <section className="relative py-32 px-4 bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Decorative background elements */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-br from-blue-300/20 to-pink-300/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-gradient-to-br from-pink-300/20 to-purple-300/20 rounded-full blur-3xl" />
          
          <div className="relative bg-white rounded-3xl border-2 border-blue-200 shadow-2xl overflow-hidden">
            {/* Top gradient bar */}
            <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
            
            <div className="p-12 md:p-16">
              <div className="flex flex-col lg:flex-row items-center gap-12">
                {/* Left side - Icon & Badge */}
                <div className="flex-shrink-0">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true }}
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-pink-400 rounded-3xl blur-2xl opacity-40" />
                      <div className="relative w-32 h-32 bg-gradient-to-br from-blue-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-xl">
                        <Briefcase className="w-16 h-16 text-white" strokeWidth={2} />
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-pink-100 border border-blue-300"
                  >
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-bold text-blue-700">Limited Time Offer</span>
                  </motion.div>
                </div>

                {/* Right side - Content */}
                <div className="flex-1 text-center lg:text-left">
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-5xl font-black mb-6"
                  >
                    <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Free CRM Pro Plan
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
                      For GigGenius Marketplace Users
                    </span>
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="text-lg md:text-xl text-black mb-8 leading-relaxed max-w-2xl"
                  >
                    Business owners <span className="font-bold text-blue-600">actively using GigGenius Freelance Marketplace</span> receive <span className="font-bold text-pink-600">free Pro Plan access</span> to manage clients, leads, and operations seamlessly. Scale your business with enterprise-grade tools at no cost.
                  </motion.p>

                  {/* Benefits list */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    viewport={{ once: true }}
                    className="grid sm:grid-cols-2 gap-4 mb-8"
                  >
                    {[
                      'Up to 5,000 Contacts',
                      'Advanced AI Matching',
                      'Full CRM Suite Access',
                      'Priority Support Included'
                    ].map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" strokeWidth={3} />
                        </div>
                        <span className="text-black font-medium">{benefit}</span>
                      </div>
                    ))}
                  </motion.div>

                  {/* CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    viewport={{ once: true }}
                  >
                      <Button
                        size="lg"
                        onClick={() => base44.auth.redirectToLogin()}
                        className="group px-10 py-7 text-lg font-bold bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
                      >
                        Apply For Free Access
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    <p className="mt-4 text-sm text-gray-500">
                      For active GigGenius Freelance Marketplace business owners • No payment required
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Bottom decorative pattern */}
            <div className="h-2 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600" />
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-wrap justify-center gap-8 text-gray-600"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-sm font-medium">Trusted by 10,000+ businesses</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-pink-500" />
            <span className="text-sm font-medium">No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-sm font-medium">Setup in under 5 minutes</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}