import { motion } from 'framer-motion';
import { Brain, FileText, MapPin, Sparkles, Target, Users } from 'lucide-react';

const aiFeatures = [
  {
    icon: Target,
    title: 'Lead Scoring',
    description: 'AI analyzes thousands of data points to rank leads by conversion probability.',
  },
  {
    icon: Users,
    title: 'Candidate Screening',
    description: 'Automated resume parsing and skill matching finds perfect talent instantly.',
  },
  {
    icon: FileText,
    title: 'Sales Script Generation',
    description: 'Dynamic scripts tailored to each prospect based on their profile and behavior.',
  },
  {
    icon: MapPin,
    title: 'Territory Matching',
    description: 'Optimal sales territory assignments based on geography, capacity, and performance.',
  },
  {
    icon: Brain,
    title: 'Project Estimation',
    description: 'AI-powered cost and timeline predictions using historical project data.',
  },
  {
    icon: Sparkles,
    title: 'Predictive Insights',
    description: 'Forecast revenue, identify risks, and discover opportunities before they happen.',
  },
];

export default function AIFeatures() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-blue-100 to-pink-100 border border-blue-300 backdrop-blur-sm mb-6">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-700 tracking-wide font-semibold">POWERED BY ARTIFICIAL INTELLIGENCE</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
              AI That Works
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
              While You Sleep
            </span>
          </h2>
          <p className="text-xl text-black max-w-3xl mx-auto">
            Our AI engine handles the heavy lifting: scoring leads, screening candidates, generating scripts, and optimizing operations 24/7.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {aiFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                
                <div className="relative h-full p-6 rounded-2xl bg-white border border-gray-200 shadow-lg group-hover:border-blue-300 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-pink-600 shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 flex-shrink-0">
                      <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-black leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* AI Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-200/50 via-pink-200/50 to-blue-200/50 rounded-3xl blur-2xl" />
          
          <div className="relative p-8 md:p-12 rounded-3xl bg-white border-2 border-blue-200 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <p className="text-5xl font-black bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
                    99.2%
                  </p>
                  <p className="text-black font-medium">Lead Scoring Accuracy</p>
                </motion.div>
              </div>
              <div>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  viewport={{ once: true }}
                >
                  <p className="text-5xl font-black bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    75%
                  </p>
                  <p className="text-black font-medium">Time Saved on Admin</p>
                </motion.div>
              </div>
              <div>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  viewport={{ once: true }}
                >
                  <p className="text-5xl font-black bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
                    3x
                  </p>
                  <p className="text-black font-medium">Faster Hiring Process</p>
                </motion.div>
              </div>
              <div>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  viewport={{ once: true }}
                >
                  <p className="text-5xl font-black bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    40%
                  </p>
                  <p className="text-black font-medium">Higher Conversion Rates</p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}