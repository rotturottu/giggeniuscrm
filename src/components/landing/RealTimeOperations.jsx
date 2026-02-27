import { motion } from 'framer-motion';
import { Clock, DollarSign, MapPin, Navigation, Truck, Zap } from 'lucide-react';

const operations = [
  {
    icon: MapPin,
    title: 'GPS Check-Ins',
    description: 'Real-time location tracking for field teams with automated check-in/check-out.',
    stat: '99.9%',
    statLabel: 'Uptime',
  },
  {
    icon: Truck,
    title: 'Logistics Tracking',
    description: 'Monitor deliveries, installations, and service calls with live updates.',
    stat: '2.5s',
    statLabel: 'Update Speed',
  },
  {
    icon: DollarSign,
    title: 'Instant Payouts',
    description: 'Pay contractors immediately upon job completion. No more waiting.',
    stat: '<60s',
    statLabel: 'Payout Time',
  },
];

export default function RealTimeOperations() {
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
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-blue-100 to-pink-100 border border-blue-300 backdrop-blur-sm mb-6">
            <Zap className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-700 tracking-wide font-semibold">REAL-TIME OPERATIONS</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
              Operate at the
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
              Speed of Light
            </span>
          </h2>
          <p className="text-xl text-black max-w-3xl mx-auto">
            Track every movement, transaction, and milestone in real-time. Your entire operation visible at a glance.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {operations.map((operation, index) => {
            const Icon = operation.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-200/50 to-pink-200/50 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
                
                <div className="relative h-full p-8 rounded-3xl bg-white border border-gray-200 shadow-xl group-hover:border-blue-300 transition-all duration-300">
                  <div className="mb-6">
                    <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-pink-600 shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300">
                      <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent mb-3">
                    {operation.title}
                  </h3>
                  
                  <p className="text-black leading-relaxed mb-6">
                    {operation.description}
                  </p>

                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                        {operation.stat}
                      </span>
                      <span className="text-black font-medium">
                        {operation.statLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Live Operations Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-200/50 to-pink-200/50 rounded-3xl blur-3xl" />
          
          <div className="relative p-8 md:p-12 rounded-3xl bg-white border-2 border-blue-200 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent mb-2">Live Operations Dashboard</h3>
                <p className="text-black">Monitor your entire operation in real-time</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-300">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-blue-700 text-sm font-semibold">LIVE</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-2xl bg-blue-50 border border-blue-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Navigation className="w-5 h-5 text-blue-600" />
                  <span className="text-black text-sm">Active Teams</span>
                </div>
                <p className="text-3xl font-black text-black">127</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-2xl bg-pink-50 border border-pink-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-5 h-5 text-pink-600" />
                  <span className="text-black text-sm">Jobs Today</span>
                </div>
                <p className="text-3xl font-black text-black">342</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-2xl bg-blue-50 border border-blue-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <span className="text-black text-sm">Revenue 24h</span>
                </div>
                <p className="text-3xl font-black text-black">$89K</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-2xl bg-pink-50 border border-pink-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-5 h-5 text-pink-600" />
                  <span className="text-black text-sm">Avg Response</span>
                </div>
                <p className="text-3xl font-black text-black">1.2s</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}