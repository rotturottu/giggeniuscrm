import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Rocket, Sparkles } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      {/* Orbiting planets animation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="absolute w-96 h-96"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}>

          <div className="absolute top-0 left-1/2 w-12 h-12 -ml-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-[0_0_30px_rgba(59,130,246,0.6)]" />
        </motion.div>
        <motion.div
          className="absolute w-[500px] h-[500px]"
          animate={{ rotate: -360 }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}>

          <div className="absolute top-0 left-1/2 w-8 h-8 -ml-4 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 shadow-[0_0_25px_rgba(168,85,247,0.6)]" />
        </motion.div>
        <motion.div
          className="absolute w-[600px] h-[600px]"
          animate={{ rotate: 360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}>

          <div className="absolute top-0 left-1/2 w-10 h-10 -ml-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_0_35px_rgba(251,191,36,0.6)]" />
        </motion.div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}>

          <div className="bg-gradient-to-r mt-10 mb-6 px-4 py-2 rounded-full inline-flex items-center gap-2 from-blue-100 to-pink-100 border border-blue-300 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700 font-semibold tracking-wide">Powered by GigGenius</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-[1.1]">
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-pink-800 bg-clip-text text-transparent">
              GigGenius
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Your True Ally to Success
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-black mb-12 max-w-3xl mx-auto leading-relaxed">
            The complete business management platform. Manage conversations, close deals, get paid, run projects, and automate workflows—all in one powerful system.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => base44.auth.redirectToLogin()}
              className="group relative px-8 py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300">

              <Rocket className="w-5 h-5 mr-2 group-hover:translate-y-[-2px] transition-transform" />
              Get Started Free
            </Button>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-black font-medium">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pink-500" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>);

}