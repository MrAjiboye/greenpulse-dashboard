import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { billingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PLANS = [
  {
    key: 'core',
    name: 'Core',
    price: '£49',
    period: '/month',
    tagline: 'Automated data, no hardware required',
    color: 'emerald',
    features: [
      'Full energy & waste dashboard',
      'AI-generated insights',
      'Carbon footprint tracking',
      'Goal setting & tracking',
      'CSV data import',
      'Energy provider API (Octopus, n3rgy) — coming soon',
      'Automated PDF reports',
      'Up to 3 team members',
      'Email support',
    ],
    cta: 'Start with Core',
    highlight: false,
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '£99',
    period: '/month',
    tagline: 'Real-time monitoring with IoT sensors',
    color: 'emerald',
    features: [
      'Everything in Core',
      'IoT device data ingestion (real-time)',
      'Physical sensor support — kitchens, floors, zones',
      'Unlimited team members',
      'Spike anomaly alerts',
      'ML forecasting & anomaly detection',
      'Comparison mode',
      'Priority email support',
      'Early access to new features',
    ],
    cta: 'Start with Pro',
    highlight: true,
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    tagline: 'Multi-site management for hotels, chains & portfolios',
    color: 'gray',
    features: [
      'Everything in Pro',
      'Multi-property dashboard',
      'Cross-site reporting & benchmarking',
      'Dedicated account manager',
      'Custom integrations',
      'SLA-backed uptime',
      'Onboarding & training',
      'Invoice billing',
    ],
    cta: 'Contact us',
    highlight: false,
  },
];

const FAQ = [
  {
    q: 'Is there a free trial?',
    a: 'Yes — all new accounts get a 30-day free trial with full Core-level access. No credit card required. Upload your data via CSV and explore the complete dashboard from day one.',
  },
  {
    q: 'What\'s the difference between Core and Pro?',
    a: 'Core gives you automated data via CSV and energy provider APIs (Octopus Energy, n3rgy) — no hardware needed. Pro adds real-time IoT sensor ingestion for zone-level monitoring inside your premises, plus unlimited team members.',
  },
  {
    q: 'Who is Enterprise for?',
    a: 'Enterprise is built for businesses managing multiple sites — hotel groups, restaurant chains, retail portfolios. You get a single dashboard across all properties, cross-site benchmarking, a dedicated account manager, and invoiced billing.',
  },
  {
    q: 'Can I upgrade or downgrade at any time?',
    a: 'Yes. Upgrades take effect immediately. Downgrades take effect at the end of your current billing cycle.',
  },
  {
    q: 'What happens when my trial ends?',
    a: 'Your data is preserved. You\'ll need to choose a plan to continue. We\'ll email you reminders before your trial expires.',
  },
  {
    q: 'What counts as a "team member"?',
    a: 'Any user invited to your organisation. Core allows up to 3 (including you). Pro and Enterprise have no limit.',
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const handlePlanClick = async (plan) => {
    if (plan === 'enterprise') {
      navigate('/contact');
      return;
    }
    if (!user) {
      navigate('/register');
      return;
    }
    setLoading(plan);
    try {
      const { url } = await billingAPI.createCheckoutSession(plan);
      window.location.href = url;
    } catch {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-leaf text-white text-sm"></i>
            </div>
            <span className="font-bold text-gray-900">GreenPulse</span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/signin" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  Sign in
                </Link>
                <Link to="/register" className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                  Start free trial
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="text-center pt-16 pb-12 px-6">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <i className="fa-solid fa-tag text-xs"></i>
          Simple, transparent pricing
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          Plans for every business
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Start your 30-day free trial — no credit card required. Upgrade when you're ready.
        </p>
      </div>

      {/* Plan cards */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.key}
              className={`relative rounded-2xl border-2 p-8 flex flex-col ${
                plan.highlight
                  ? 'border-emerald-500 shadow-xl shadow-emerald-100'
                  : 'border-gray-200'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                    Most popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h2>
                <p className="text-sm text-gray-500 mb-4">{plan.tagline}</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  {plan.period && (
                    <span className="text-gray-400 mb-1">{plan.period}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <i className="fa-solid fa-check text-emerald-500 mt-0.5 flex-shrink-0 text-xs"></i>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePlanClick(plan.key)}
                disabled={loading === plan.key}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${
                  plan.highlight
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : plan.key === 'enterprise'
                    ? 'bg-gray-900 hover:bg-gray-800 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                } disabled:opacity-60`}
              >
                {loading === plan.key ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fa-solid fa-circle-notch fa-spin text-xs"></i>
                    Redirecting…
                  </span>
                ) : (
                  plan.cta
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Trust line */}
        <p className="text-center text-sm text-gray-400 mt-8">
          Secure payments via Stripe · Cancel anytime · UK business invoices available
        </p>
      </div>

      {/* FAQ */}
      <div className="bg-gray-50 py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-medium text-gray-900 text-sm">{item.q}</span>
                  <i className={`fa-solid fa-chevron-down text-gray-400 text-xs transition-transform ${openFaq === i ? 'rotate-180' : ''}`}></i>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer strip */}
      <div className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span>© 2026 GreenPulse Inc. All rights reserved.</span>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-gray-600 transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-gray-600 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
