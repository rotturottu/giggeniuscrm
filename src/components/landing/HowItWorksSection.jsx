import { motion } from 'framer-motion';
import { BarChart3, Filter, Sparkles, TrendingUp, Upload, UserPlus } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Connect Accounts',
    description: 'Link your email, social media, and payment accounts to centralize operations.',
    step: '01',
  },
  {
    icon: Filter,
    title: 'Import Contacts & Leads',
    description: 'Import existing contacts and leads or start capturing new ones automatically.',
    step: '02',
  },
  {
    icon: Sparkles,
    title: 'Build Your Pipeline',
    description: 'Create your sales pipeline stages and start tracking deals through each phase.',
    step: '03',
  },
  {
    icon: UserPlus,
    title: 'Set Up Automation',
    description: 'Configure workflows, email sequences, and automated tasks to save time.',
    step: '04',
  },
  {
    icon: BarChart3,
    title: 'Track & Optimize',
    description: 'Monitor performance with analytics dashboards and custom reports.',
    step: '05',
  },
  {
    icon: TrendingUp,
    title: 'Scale & Grow',
    description: 'Add team members, expand operations, and watch your business thrive.',
    step: '06',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="roadmap" className="relative py-32 px-4">
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
              Your Journey to
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
              Sales Excellence
            </span>
          </h2>
          <p className="text-xl text-black max-w-2xl mx-auto">
            Six simple steps to transform your sales operation into a revenue-generating powerhouse
          </p>
        </motion.div>

        {/* Desktop Timeline */}
        <div className="hidden lg:block relative">
          {/* Constellation line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent -translate-y-1/2" />
          
          <div className="grid grid-cols-6 gap-4 relative">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: isEven ? 30 : -30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className={`flex flex-col ${isEven ? 'items-start pt-20' : 'items-start pb-20 flex-col-reverse'}`}>
                    {/* Content card */}
                    <motion.div
                      whileHover={{ scale: 1.05, y: isEven ? -5 : 5 }}
                      className="group w-full"
                    >
                      <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-lg group-hover:border-blue-300 transition-all duration-300">
                        <div className="mb-4 inline-flex p-3 rounded-xl bg-gradient-to-br from-blue-600 to-pink-600 shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300">
                          <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                        </div>
                        <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent mb-2">
                          {step.title}
                        </h3>
                        <p className="text-sm text-black leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </motion.div>

                    {/* Node on timeline */}
                    <div className="relative flex items-center justify-center my-4">
                      <motion.div
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.5)] relative z-10"
                        whileHover={{ scale: 1.2 }}
                        animate={{ 
                          boxShadow: [
                            '0 0 30px rgba(139,92,246,0.5)',
                            '0 0 50px rgba(139,92,246,0.8)',
                            '0 0 30px rgba(139,92,246,0.5)',
                          ]
                        }}
                        transition={{ 
                          boxShadow: { duration: 2, repeat: Infinity }
                        }}
                      >
                        <span className="text-white font-black text-lg">
                          {step.step}
                        </span>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile/Tablet Vertical Timeline */}
        <div className="lg:hidden space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex gap-4"
              >
                {/* Step number */}
                <div className="flex flex-col items-center">
                  <motion.div
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.5)] relative z-10 flex-shrink-0"
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-white font-black text-sm">
                      {step.step}
                    </span>
                  </motion.div>
                  {index < steps.length - 1 && (
                    <div className="w-0.5 h-full bg-gradient-to-b from-purple-500/50 to-transparent mt-2" />
                  )}
                </div>

                {/* Content */}
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex-1 pb-8"
                >
                  <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-lg hover:border-blue-300 transition-all duration-300">
                    <div className="mb-4 inline-flex p-3 rounded-xl bg-gradient-to-br from-blue-600 to-pink-600 shadow-lg">
                      <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent mb-2">
                      {step.title}
                    </h3>
                    <p className="text-black leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}