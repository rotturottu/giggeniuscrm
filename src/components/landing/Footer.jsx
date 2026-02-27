import { createPageUrl } from '@/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Github, Linkedin, Twitter, X, Youtube } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

function StatusModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚧</span>
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-3">Platform Status</h3>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-full mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-yellow-700 font-semibold text-sm">New Platform — Early Access</span>
          </div>
          <p className="text-gray-600 leading-relaxed">
            GigGenius CRM is a brand-new platform and some features may not be fully working yet. We're actively building and improving every day. Thank you for your patience and for being an early adopter! 🙏
          </p>
          <p className="text-sm text-gray-400 mt-4">
            For urgent issues, please <a href="https://www.gig-genius.io/contact_us" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">contact us</a>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function Footer() {
  const [showStatus, setShowStatus] = useState(false);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <AnimatePresence>
        {showStatus && <StatusModal onClose={() => setShowStatus(false)} />}
      </AnimatePresence>

      <footer className="relative border-t border-gray-200 py-16 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6949094a978d5bae592b599f/645b25c34_GigGeniusLogo.png"
                  alt="GigGenius"
                  className="w-10 h-10 rounded-lg"
                />
                <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">GigGenius</span>
              </div>
              <p className="text-black text-sm leading-relaxed mb-4">
                The AI-powered business management platform for ambitious owners.
              </p>
              <div className="flex gap-3">
                {[Twitter, Linkedin, Github, Youtube].map((Icon, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    whileHover={{ y: -3 }}
                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-blue-100 border border-gray-200 hover:border-blue-300 flex items-center justify-center transition-all duration-300"
                  >
                    <Icon className="w-5 h-5 text-gray-600 hover:text-blue-600" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-gray-900 font-bold mb-4">Product</h4>
              <ul className="space-y-3">
                <li>
                  <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-blue-600 transition-colors duration-300 text-sm text-left">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('pricing')} className="text-gray-600 hover:text-blue-600 transition-colors duration-300 text-sm text-left">
                    Pricing
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('roadmap')} className="text-gray-600 hover:text-blue-600 transition-colors duration-300 text-sm text-left">
                    Roadmap
                  </button>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-gray-900 font-bold mb-4">Company</h4>
              <ul className="space-y-3">
                <li>
                  <a href="https://www.gig-genius.io/about_us" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors duration-300 text-sm">
                    About
                  </a>
                </li>
                <li>
                  <a href="https://www.gig-genius.io/contact_us" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors duration-300 text-sm">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-gray-900 font-bold mb-4">Support</h4>
              <ul className="space-y-3">
                <li>
                  <Link to={createPageUrl('HelpCenter')} className="text-gray-600 hover:text-blue-600 transition-colors duration-300 text-sm">
                    Help Center
                  </Link>
                </li>
                <li>
                  <button onClick={() => setShowStatus(true)} className="text-gray-600 hover:text-blue-600 transition-colors duration-300 text-sm text-left">
                    Status
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">
              © 2026 GigGenius. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">Privacy Policy</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">Terms of Service</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}