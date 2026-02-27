import { motion } from 'framer-motion';
import { BarChart3, DollarSign, Layers, Mail, MessageSquare, Share2, Target, Users, Zap } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'Unified Inbox',
    description: 'Manage all conversations from Gmail, Outlook, Facebook, LinkedIn, and Instagram in one central hub.',
    color: 'from-blue-400 to-cyan-400',
    glow: 'rgba(59, 130, 246, 0.4)',
  },
  {
    icon: Target,
    title: 'Sales Pipeline',
    description: 'Visual drag-and-drop deal tracking with lead scoring, contact management, and automated task assignments.',
    color: 'from-purple-400 to-pink-400',
    glow: 'rgba(168, 85, 247, 0.4)',
  },
  {
    icon: DollarSign,
    title: 'Payments & Invoicing',
    description: 'Create invoices, estimates, proposals, and contracts. Accept payments via Stripe, PayPal, or manual methods.',
    color: 'from-green-400 to-emerald-400',
    glow: 'rgba(74, 222, 128, 0.4)',
  },
  {
    icon: Layers,
    title: 'Project Management',
    description: 'Organize tasks with lists, subtasks, attachments, assignments, deadlines, and recurring task automation.',
    color: 'from-amber-400 to-orange-400',
    glow: 'rgba(251, 191, 36, 0.4)',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Real-time dashboards with custom reports, lead metrics, conversion tracking, and social media insights.',
    color: 'from-indigo-400 to-blue-400',
    glow: 'rgba(99, 102, 241, 0.4)',
  },
  {
    icon: Mail,
    title: 'Email Campaigns',
    description: 'Visual email builder, campaign automation, audience segmentation, and deliverability monitoring.',
    color: 'from-pink-400 to-rose-400',
    glow: 'rgba(236, 72, 153, 0.4)',
  },
  {
    icon: Share2,
    title: 'Social Media',
    description: 'Schedule posts across multiple platforms, track engagement metrics, and manage all social accounts.',
    color: 'from-cyan-400 to-teal-400',
    glow: 'rgba(6, 182, 212, 0.4)',
  },
  {
    icon: Zap,
    title: 'Workflow Automation',
    description: 'Build powerful automations with triggers, conditions, and actions. Set up email sequences and workflows.',
    color: 'from-violet-400 to-purple-400',
    glow: 'rgba(139, 92, 246, 0.4)',
  },
  {
    icon: Users,
    title: 'Team Management',
    description: 'Manage staff access, configure calendars, set roles, and track team member activity and permissions.',
    color: 'from-emerald-400 to-green-400',
    glow: 'rgba(16, 185, 129, 0.4)',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Features That Launch
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
              Your Success
            </span>
          </h2>
          <p className="text-xl text-black max-w-2xl mx-auto">
            Everything you need to build a high-performing sales team in one powerful platform
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-pink-100/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                
                <div className="relative h-full p-8 rounded-3xl bg-white border border-gray-200 shadow-lg group-hover:shadow-2xl group-hover:border-blue-300 transition-all duration-300">
                  <div className="mb-6">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg`}
                         style={{ boxShadow: `0 10px 40px ${feature.glow}` }}>
                      <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-black leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Orbital decoration */}
                  <motion.div
                    className="absolute -right-4 -top-4 w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ 
                      background: `radial-gradient(circle, ${feature.glow}, transparent)`,
                      boxShadow: `0 0 20px ${feature.glow}`
                    }}
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity }
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}