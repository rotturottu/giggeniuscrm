import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

const testimonials = [
  {
    quote: "GigGenius CRM skyrocketed our sales by 300% in just 6 months. It's out of this world! The AI matching is phenomenal.",
    author: "Sarah Mitchell",
    role: "VP of Sales",
    company: "TechNova",
    avatar: "SM",
    rating: 5,
  },
  {
    quote: "The gamification features turned our team into competitive superstars. Revenue has never been higher!",
    author: "Marcus Chen",
    role: "Founder & CEO",
    company: "GrowthLab",
    avatar: "MC",
    rating: 5,
  },
  {
    quote: "From onboarding to closing deals, GigGenius CRM streamlined everything. Best investment we've made this year.",
    author: "Elena Rodriguez",
    role: "Sales Director",
    company: "Nexus Solutions",
    avatar: "ER",
    rating: 5,
  },
  {
    quote: "The OKR tracking and real-time analytics give us crystal-clear visibility into performance. Game-changer!",
    author: "David Park",
    role: "Head of Operations",
    company: "Quantum Ventures",
    avatar: "DP",
    rating: 5,
  },
];

export default function TestimonialsSection() {
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
              Loved by
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
              Business Owners Everywhere
            </span>
          </h2>
          <p className="text-xl text-black max-w-2xl mx-auto">
            Join thousands of startups already achieving stellar results with GigGenius CRM
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-200/50 to-pink-200/50 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
              
              <div className="relative h-full p-8 rounded-3xl bg-white border border-gray-200 shadow-lg group-hover:border-blue-300 transition-all duration-300">
                <div className="flex items-start justify-between mb-6">
                  <Quote className="w-10 h-10 text-blue-400/40" strokeWidth={1.5} />
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-pink-500 text-pink-500" />
                    ))}
                  </div>
                </div>

                <p className="text-lg text-black leading-relaxed mb-8">
                  "{testimonial.quote}"
                </p>

                <div className="flex items-center gap-4">
                  <motion.div
                    className="relative w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-pink-600 flex items-center justify-center shadow-lg flex-shrink-0"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <span className="text-white font-bold text-lg">
                      {testimonial.avatar}
                    </span>
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-white/30"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    />
                  </motion.div>

                  <div>
                    <p className="font-semibold text-black">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-gray-600">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-8 px-8 py-4 rounded-full bg-white border-2 border-gray-200 shadow-lg">
            <div>
              <p className="text-3xl font-black bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
                10K+
              </p>
              <p className="text-sm text-black">Active Users</p>
            </div>
            <div className="w-px h-12 bg-gray-200" />
            <div>
              <p className="text-3xl font-black bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                $2B+
              </p>
              <p className="text-sm text-black">Revenue Generated</p>
            </div>
            <div className="w-px h-12 bg-gray-200" />
            <div>
              <p className="text-3xl font-black bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
                98%
              </p>
              <p className="text-sm text-black">Satisfaction Rate</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}