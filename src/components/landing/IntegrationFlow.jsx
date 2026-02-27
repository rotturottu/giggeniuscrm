import { motion } from 'framer-motion';
import { ArrowRight, Database, DollarSign, FolderKanban, Globe, Users, Wrench } from 'lucide-react';
import React from 'react';

const flowSteps = [
  { icon: Database, label: 'CRM', color: 'from-blue-500 to-cyan-500' },
  { icon: Users, label: 'HR', color: 'from-purple-500 to-pink-500' },
  { icon: FolderKanban, label: 'Project Mgmt', color: 'from-amber-500 to-orange-500' },
  { icon: Wrench, label: 'Installation', color: 'from-green-500 to-emerald-500' },
  { icon: DollarSign, label: 'Payroll', color: 'from-red-500 to-rose-500' },
  { icon: Globe, label: 'Customer Portal', color: 'from-indigo-500 to-blue-500' },
];

export default function IntegrationFlow() {
  return (
    <section className="relative py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
              One Platform,
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
              Infinite Possibilities
            </span>
          </h2>
          <p className="text-xl text-black max-w-3xl mx-auto">
            GigGenius CRM's vertical integration brings your entire business ecosystem into a single, seamless platform. From first contact to final payment, we've got you covered.
          </p>
        </motion.div>

        {/* Desktop Flow */}
        <div className="hidden lg:flex items-center justify-center gap-4 mb-20">
          {flowSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={index}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.1, y: -5 }}
                  className="relative group"
                >
                  <div 
                    className="absolute inset-0 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(135deg, ${step.color.split(' ')[1]}, transparent)` }}
                  />
                  <div className={`relative w-32 h-32 rounded-2xl bg-gradient-to-br ${step.color} flex flex-col items-center justify-center shadow-2xl border-2 border-white/20`}>
                    <Icon className="w-10 h-10 text-white mb-2" strokeWidth={2.5} />
                    <span className="text-white font-bold text-sm text-center px-2">
                      {step.label}
                    </span>
                  </div>
                </motion.div>

                {index < flowSteps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.15 + 0.1 }}
                    viewport={{ once: true }}
                  >
                    <ArrowRight className="w-8 h-8 text-purple-400" strokeWidth={3} />
                  </motion.div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile/Tablet Flow */}
        <div className="lg:hidden grid grid-cols-2 md:grid-cols-3 gap-6 mb-20">
          {flowSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div 
                  className="absolute inset-0 rounded-2xl blur-xl opacity-50"
                  style={{ background: `linear-gradient(135deg, ${step.color.split(' ')[1]}, transparent)` }}
                />
                <div className={`relative aspect-square rounded-2xl bg-gradient-to-br ${step.color} flex flex-col items-center justify-center shadow-xl border-2 border-white/20`}>
                  <Icon className="w-10 h-10 text-white mb-2" strokeWidth={2.5} />
                  <span className="text-white font-bold text-sm text-center px-2">
                    {step.label}
                  </span>
                </div>
                {index < flowSteps.length - 1 && index % 2 === 0 && (
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 md:hidden">
                    <ArrowRight className="w-6 h-6 text-purple-400" strokeWidth={3} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Key Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-white border border-gray-200 shadow-lg"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-pink-600 flex items-center justify-center mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent mb-3">No More Silos</h3>
            <p className="text-black leading-relaxed">
              Data flows seamlessly between departments. What happens in CRM automatically updates HR, project management, and beyond.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-white border border-gray-200 shadow-lg"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-600 to-blue-600 flex items-center justify-center mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent mb-3">Single Source of Truth</h3>
            <p className="text-black leading-relaxed">
              One unified database means everyone sees the same real-time data. No more conflicting reports or outdated spreadsheets.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-white border border-gray-200 shadow-lg"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-pink-600 flex items-center justify-center mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent mb-3">Massive Cost Savings</h3>
            <p className="text-black leading-relaxed">
              Replace 10+ separate tools with one powerful platform. Lower costs, faster onboarding, zero integration headaches.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}