import React from 'react';
import { Link } from 'react-router-dom';
import { Bus, ShieldCheck, QrCode, Zap, Clock, Smartphone, CreditCard, Award, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPage: React.FC = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-blue-500/30 text-blue-400 text-sm font-medium mb-8">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>Next-Gen Smart Transit Platform — Instant Pass Activation</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Seamless Commercial <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
              Digital Bus Pass Platform
            </span>
          </h1>

          <p className="mt-6 text-xl text-slate-400 max-w-2xl mx-auto font-normal">
            Book monthly, quarterly, and annual bus passes online with instant QR generation, real-time tracking, secure Razorpay/Stripe payments, and automated verification.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/book" className="glass-btn-primary text-lg px-8 py-4 flex items-center gap-2">
              Book Bus Pass Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/routes" className="glass-btn-secondary text-lg px-8 py-4">
              Explore Bus Routes
            </Link>
          </div>
        </motion.div>

        {/* Feature Badges */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          {[
            { icon: QrCode, title: 'HMAC QR Security', desc: 'Tamper-proof digital passes' },
            { icon: CreditCard, title: 'Multi-Gateway', desc: 'UPI, Cards, Net Banking' },
            { icon: Clock, title: 'Instant Approval', desc: 'Auto-verify student & employee IDs' },
            { icon: Smartphone, title: 'Mobile Ready', desc: 'Wallet-enabled digital passes' }
          ].map((item, idx) => (
            <div key={idx} className="glass-panel p-6 hover:border-blue-500/50 transition-all">
              <item.icon className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-lg font-bold text-white">{item.title}</h3>
              <p className="text-sm text-slate-400 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing / Pass Duration Section */}
      <section className="py-20 bg-slate-900/30 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Choose Your Pass Duration</h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">
            Flexible pass plans customized for daily commuters, students, and corporate staff.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { name: 'Monthly', days: '30 Days', discount: 'Base Fare', price: '₹1,200', tag: 'Standard' },
              { name: 'Quarterly', days: '90 Days', discount: '10% Discount', price: '₹3,240', tag: 'Popular' },
              { name: 'Half-Yearly', days: '180 Days', discount: '15% Discount', price: '₹6,120', tag: 'Best Value' },
              { name: 'Yearly', days: '365 Days', discount: '20% Discount', price: '₹11,520', tag: 'Maximum Savings' }
            ].map((plan, idx) => (
              <div key={idx} className="glass-panel p-8 relative flex flex-col justify-between hover:scale-105 transition-transform">
                {idx === 1 && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {plan.tag}
                  </span>
                )}
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name} Pass</h3>
                  <div className="text-3xl font-extrabold text-blue-400 mt-4">{plan.price}</div>
                  <p className="text-xs text-slate-400 mt-1">{plan.days} validity</p>
                  <span className="inline-block mt-3 px-3 py-1 rounded-md bg-slate-800 text-emerald-400 text-xs font-semibold">
                    {plan.discount}
                  </span>
                </div>
                <Link to="/book" className="glass-btn-primary w-full mt-8 text-center">
                  Select Plan
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
