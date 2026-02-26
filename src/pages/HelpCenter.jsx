import { Input } from '@/components/ui/input';
import { AnimatePresence, motion } from 'framer-motion';
import {
    BarChart3,
    BookOpen,
    ChevronDown, ChevronUp,
    Code2,
    DollarSign,
    Globe,
    HelpCircle,
    Layers,
    Mail,
    MessageSquare,
    Search,
    Share2,
    Target,
    UserCog,
    Users,
    Zap
} from 'lucide-react';
import { useState } from 'react';

const features = [
  { icon: MessageSquare, title: 'Unified Inbox', desc: 'Manage all conversations from Gmail, Outlook, Facebook, LinkedIn, and Instagram in one central hub.', color: 'from-blue-400 to-cyan-400' },
  { icon: Target, title: 'Sales Pipeline', desc: 'Visual drag-and-drop deal tracking with lead scoring, contact management, and automated task assignments.', color: 'from-purple-400 to-pink-400' },
  { icon: DollarSign, title: 'Payments & Invoicing', desc: 'Create invoices, estimates, proposals, and contracts. Accept payments via Stripe, PayPal, or manual methods.', color: 'from-green-400 to-emerald-400' },
  { icon: Layers, title: 'Project Management', desc: 'Organize tasks with lists, subtasks, attachments, assignments, deadlines, and recurring task automation.', color: 'from-amber-400 to-orange-400' },
  { icon: BarChart3, title: 'Advanced Analytics', desc: 'Real-time dashboards with custom reports, lead metrics, conversion tracking, and social media insights.', color: 'from-indigo-400 to-blue-400' },
  { icon: Mail, title: 'Email Campaigns', desc: 'Visual email builder, campaign automation, audience segmentation, and deliverability monitoring.', color: 'from-pink-400 to-rose-400' },
  { icon: Share2, title: 'Social Media', desc: 'Schedule posts across multiple platforms, track engagement metrics, and manage all social accounts.', color: 'from-cyan-400 to-teal-400' },
  { icon: Zap, title: 'Workflow Automation', desc: 'Build powerful automations with triggers, conditions, and actions. Set up email sequences and workflows.', color: 'from-violet-400 to-purple-400' },
  { icon: Users, title: 'Team Management', desc: 'Manage staff access, configure calendars, set roles, and track team member activity and permissions.', color: 'from-emerald-400 to-green-400' },
  { icon: Globe, title: 'Sites & Funnels', desc: 'Build websites, landing pages, blogs, courses, and community portals — all from one platform.', color: 'from-blue-400 to-indigo-400' },
  { icon: UserCog, title: 'HR Suite', desc: 'Full HR management with employee records, payroll, leave tracking, onboarding, and performance reviews.', color: 'from-rose-400 to-pink-400' },
];

const faqs = [
  {
    q: 'What is GigGenius CRM?',
    a: 'GigGenius CRM is an all-in-one business management platform designed for business owners who use the GigGenius Freelance Marketplace. It combines CRM, email marketing, HR management, project management, social media scheduling, and more into a single powerful suite.'
  },
  {
    q: 'Is GigGenius CRM free?',
    a: 'Yes! Active GigGenius Freelance Marketplace business owners receive free Pro Plan access. The Pro Plan includes up to 5,000 contacts, 10,000 campaign sends/month, unlimited team members, advanced automations, full project management, and priority support.'
  },
  {
    q: 'What plans are available?',
    a: 'We offer three plans: Free Starter (up to 100 contacts, 3 team members, basic analytics), Pro ($39/mo — up to 5,000 contacts, 10,000 campaign sends, unlimited team members, full suite), and Elite ($99/mo — up to 20,000 contacts, 30,000 campaign sends, site builder, HR management up to 30 employees, and more).'
  },
  {
    q: 'Can I manage my HR team inside GigGenius?',
    a: 'Yes! The Elite plan includes a full HR suite with employee records, department management, leave requests, payroll tracking, onboarding checklists, performance reviews, time tracking, and team management with role-based access control.'
  },
  {
    q: 'How does the email campaign feature work?',
    a: 'You can create campaigns using our visual drag-and-drop email builder or start from a template. Set up audience segments, schedule sends, track open rates, clicks, deliverability, and run automated email sequences — all from one place.'
  },
  {
    q: 'What social media platforms are supported?',
    a: 'GigGenius CRM supports Facebook, LinkedIn, Google Business, Instagram, and Threads. You can schedule posts, manage accounts, and view engagement metrics all from the Social Media tab.'
  },
  {
    q: 'Can I build a website using GigGenius?',
    a: 'Yes! The Elite plan includes a site and funnel builder with support for up to 30 websites. You can create blogs, course portals, community pages, client portals, contact forms, quizzes, and payment pages.'
  },
  {
    q: 'How does lead scoring work?',
    a: 'You can set up custom lead scoring rules based on attributes like company size, deal value, lead source, or activity. The system automatically calculates and assigns score grades (A through F) to help your team prioritize the most promising leads.'
  },
  {
    q: 'Is there workflow automation?',
    a: 'Yes! You can build automated workflows triggered by lead scores, status changes, deal values, user signups, or inactivity. Actions include sending emails, assigning leads, creating tasks, updating statuses, adding tags, and more.'
  },
  {
    q: 'Some features seem to not be working. Why?',
    a: 'GigGenius CRM is a new platform and some features may still be in rollout. We are actively working to ensure full functionality across all modules. If you encounter issues, please reach out via our Contact page and we\'ll address it promptly.'
  },
  {
    q: 'How do I get support?',
    a: 'You can reach us at https://www.gig-genius.io/contact_us. Pro and Elite plan users receive priority support. We are committed to fast response times and continuous improvement.'
  },
  {
    q: 'Can I add extra contacts or campaign sends beyond my plan limit?',
    a: 'Yes! Both Pro and Elite plans support add-ons: +$5 per 1,000 extra contacts and +$5 per 2,000 extra campaign sends. Elite also supports +$5/mo per extra website or employee beyond the plan limits.'
  },
];

const apiEndpoints = [
  { method: 'GET', path: '/contacts', desc: 'List all contacts with optional filters' },
  { method: 'POST', path: '/contacts', desc: 'Create a new contact' },
  { method: 'GET', path: '/leads', desc: 'Retrieve all leads with scoring data' },
  { method: 'POST', path: '/campaigns/send', desc: 'Trigger an email campaign' },
  { method: 'GET', path: '/analytics/overview', desc: 'Fetch dashboard analytics summary' },
  { method: 'POST', path: '/workflows/trigger', desc: 'Manually trigger a workflow' },
];

function FAQItem({ faq, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      viewport={{ once: true }}
      className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
        {open ? <ChevronUp className="w-5 h-5 text-blue-500 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-gray-600 leading-relaxed">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function HelpCenter() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('features');

  const filteredFaqs = faqs.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { id: 'features', label: 'Features', icon: Zap },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'docs', label: 'Documentation', icon: BookOpen },
    { id: 'api', label: 'API Reference', icon: Code2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 py-20 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">Help Center</h1>
          <p className="text-blue-100 text-xl mb-8 max-w-2xl mx-auto">Find answers, explore features, and learn how to get the most out of GigGenius CRM.</p>
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search help articles..."
              value={search}
              onChange={e => { setSearch(e.target.value); setActiveTab('faq'); }}
              className="pl-12 py-6 text-base rounded-2xl bg-white border-0 shadow-xl"
            />
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-2 flex-wrap mb-10">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Features Tab */}
        {activeTab === 'features' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Platform Features</h2>
            <p className="text-gray-600 mb-8">Everything included in your GigGenius CRM subscription.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300"
                  >
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${f.color} shadow-md mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Frequently Asked Questions</h2>
            <p className="text-gray-600 mb-8">Quick answers to the most common questions about GigGenius CRM.</p>
            <div className="space-y-3">
              {(search ? filteredFaqs : faqs).map((faq, i) => (
                <FAQItem key={i} faq={faq} index={i} />
              ))}
              {search && filteredFaqs.length === 0 && (
                <p className="text-center text-gray-500 py-12">No results found for "{search}"</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Documentation Tab */}
        {activeTab === 'docs' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Documentation</h2>
            <p className="text-gray-600 mb-8">Step-by-step guides to help you get started and go deeper.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Getting Started', desc: 'Create your account, connect your tools, and set up your first pipeline in minutes.', steps: ['Sign up or log in', 'Connect email & social accounts', 'Import your contacts', 'Set up your sales pipeline', 'Invite your team members'] },
                { title: 'Email Campaigns', desc: 'Build and send targeted email campaigns to your contact lists.', steps: ['Navigate to Campaigns tab', 'Create a new campaign or template', 'Segment your audience', 'Schedule or send immediately', 'Monitor open rates and clicks'] },
                { title: 'HR Management', desc: 'Manage your employees, leave requests, payroll, and performance reviews.', steps: ['Go to the HR tab', 'Add employee records', 'Set up departments', 'Configure leave policies', 'Run payroll and track time'] },
                { title: 'Workflow Automation', desc: 'Automate repetitive tasks with triggers, conditions, and actions.', steps: ['Navigate to the Automations section', 'Choose a trigger type', 'Add conditions if needed', 'Define actions to execute', 'Activate your workflow'] },
                { title: 'Social Media Scheduling', desc: 'Schedule posts and track engagement across all platforms.', steps: ['Go to Social Media tab', 'Connect your accounts', 'Create a new post', 'Select platforms and schedule', 'View analytics on published posts'] },
                { title: 'Team Management', desc: 'Set roles, configure permissions, and manage calendar access for your team.', steps: ['Go to HR > Team Management', 'Invite team members', 'Assign roles (Admin, HR Manager, etc.)', 'Configure calendar access', 'Review activity logs'] },
              ].map((doc, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
                >
                  <h3 className="font-bold text-gray-900 text-xl mb-2">{doc.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{doc.desc}</p>
                  <ol className="space-y-2">
                    {doc.steps.map((step, si) => (
                      <li key={si} className="flex items-start gap-3 text-sm text-gray-700">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs flex items-center justify-center font-bold">
                          {si + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* API Reference Tab */}
        {activeTab === 'api' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <h2 className="text-3xl font-black text-gray-900 mb-2">API Reference</h2>
            <p className="text-gray-600 mb-2">Integrate GigGenius CRM with your existing tools using our REST API.</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-8 text-yellow-800 text-sm">
              ⚠️ The GigGenius API is currently in early access. Endpoints may change. Contact us for API key access.
            </div>
            <div className="bg-gray-900 rounded-2xl p-6 mb-8">
              <p className="text-gray-400 text-sm mb-2">Base URL</p>
              <p className="text-green-400 font-mono text-lg">https://api.gig-genius.io/v1</p>
            </div>
            <div className="space-y-4">
              {apiEndpoints.map((ep, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.07 }}
                  className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm"
                >
                  <span className={`flex-shrink-0 px-3 py-1 rounded-lg text-xs font-black font-mono ${
                    ep.method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {ep.method}
                  </span>
                  <code className="text-gray-900 font-mono text-sm font-semibold flex-shrink-0">{ep.path}</code>
                  <span className="text-gray-500 text-sm">{ep.desc}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 bg-gray-900 rounded-2xl p-6">
              <p className="text-gray-400 text-sm mb-3">Example Request</p>
              <pre className="text-green-400 font-mono text-sm overflow-x-auto whitespace-pre-wrap">{`curl -X GET \\
  https://api.gig-genius.io/v1/contacts \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</pre>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="text-center py-16 px-4">
        <p className="text-gray-600 mb-4">Still have questions?</p>
        <a
          href="https://www.gig-genius.io/contact_us"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}