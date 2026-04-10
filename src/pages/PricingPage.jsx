import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { billingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import useScrollReveal from '../hooks/useScrollReveal';

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
      'Smart meter data via N3RGY - works with any UK supplier',
      'Automated half-hourly consumption data (no switching required)',
      'CSV import as fallback',
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
    tagline: 'Zone-level monitoring with real-time IoT sensors',
    color: 'emerald',
    features: [
      'Everything in Core',
      'IoT device data ingestion (real-time)',
      'Zone-level monitoring - kitchens, floors, equipment',
      'Equipment-level anomaly alerts (pre-failure detection)',
      'Unlimited team members',
      'AI forecasting & anomaly detection',
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
    a: 'Yes - all new accounts get a 30-day free trial with full Core-level access. No credit card required. Connect your smart meter in minutes or upload data via CSV and explore the complete dashboard from day one.',
  },
  {
    q: 'What\'s the difference between Core and Pro?',
    a: 'Core connects directly to your existing smart meter via N3RGY - it works with any UK energy supplier, no hardware needed and no switching required. You authorise access once and we pull half-hourly consumption data automatically. Pro adds real-time IoT sensors for zone-level monitoring inside your premises (kitchens, equipment, floors), plus unlimited team members.',
  },
  {
    q: 'Who is Enterprise for?',
    a: 'Enterprise is built for businesses managing multiple sites - hotel groups, restaurant chains, retail portfolios. You get a single dashboard across all properties, cross-site benchmarking, a dedicated account manager, and invoiced billing.',
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

// Plan rank — higher = more expensive
const PLAN_RANK = { free: 0, core: 1, pro: 2, enterprise: 3 };

export default function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  useScrollReveal();

  const currentPlan = user?.organization_plan ?? null; // "free"|"core"|"pro"|"enterprise"|null

  // Determine button label and whether it's disabled for a given plan card
  const getPlanMeta = (planKey) => {
    if (!user) {
      return { label: planKey === 'enterprise' ? 'Contact us' : `Start with ${planKey === 'core' ? 'Core' : 'Pro'}`, disabled: false, style: 'normal' };
    }
    if (planKey === 'enterprise') {
      if (currentPlan === 'enterprise') return { label: 'Current plan', disabled: true, style: 'current' };
      return { label: 'Contact us', disabled: false, style: 'enterprise' };
    }
    if (planKey === currentPlan || (planKey === 'core' && currentPlan === 'free')) {
      // free users see Core as their "current" trial
      if (currentPlan === 'free' && planKey === 'core') {
        return { label: 'Start with Core', disabled: false, style: 'normal' };
      }
      return { label: 'Current plan', disabled: true, style: 'current' };
    }
    const targetRank = PLAN_RANK[planKey] ?? 0;
    const currentRank = PLAN_RANK[currentPlan] ?? 0;
    if (targetRank > currentRank) {
      return { label: `Upgrade to ${planKey === 'core' ? 'Core' : 'Pro'}`, disabled: false, style: 'upgrade' };
    }
    return { label: `Switch to ${planKey === 'core' ? 'Core' : 'Pro'}`, disabled: false, style: 'downgrade' };
  };

  const handlePlanClick = async (plan) => {
    if (plan === 'enterprise') {
      navigate('/contact');
      return;
    }
    if (!user) {
      navigate(`/register?plan=${plan}`);
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
      <div className="reveal text-center pt-16 pb-12 px-6">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <i className="fa-solid fa-tag text-xs"></i>
          Simple, transparent pricing
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          Plans for every business
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          {currentPlan && currentPlan !== 'free'
            ? `You're currently on the ${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} plan. Upgrade or switch any time.`
            : 'Start your 30-day free trial - no credit card required. Upgrade when you\'re ready.'}
        </p>
      </div>

      {/* Plan cards */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {PLANS.map((plan) => {
            const meta = getPlanMeta(plan.key);
            const isCurrent = meta.style === 'current';
            const isDowngrade = meta.style === 'downgrade';

            return (
              <div
                key={plan.key}
                className={`reveal card-hover relative rounded-2xl border-2 p-8 flex flex-col ${
                  isCurrent
                    ? 'border-emerald-500 shadow-xl shadow-emerald-100'
                    : plan.highlight && !isCurrent
                    ? 'border-emerald-500 shadow-xl shadow-emerald-100'
                    : 'border-gray-200'
                }`}
              >
                {/* Badge: Current plan takes priority over "Most popular" */}
                {isCurrent ? (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-emerald-600 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5">
                      <i className="fa-solid fa-circle-check text-xs"></i> Your plan
                    </span>
                  </div>
                ) : plan.highlight ? (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                      Most popular
                    </span>
                  </div>
                ) : null}

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
                  onClick={() => !meta.disabled && handlePlanClick(plan.key)}
                  disabled={meta.disabled || loading === plan.key}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-default ${
                    meta.disabled
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                      : meta.style === 'upgrade' || plan.highlight
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : plan.key === 'enterprise'
                      ? 'bg-gray-900 hover:bg-gray-800 text-white'
                      : isDowngrade
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-500'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  {loading === plan.key ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fa-solid fa-circle-notch fa-spin text-xs"></i>
                      Redirecting…
                    </span>
                  ) : (
                    meta.label
                  )}
                </button>
              </div>
            );
          })}
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

      <Footer />
    </div>
  );
}
