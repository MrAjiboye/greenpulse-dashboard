import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM',
];

// Minimum date = tomorrow
function minDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

// Max date = 60 days from now
function maxDate() {
  const d = new Date();
  d.setDate(d.getDate() + 60);
  return d.toISOString().split('T')[0];
}

export default function BookDemoPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    business_name: '',
    email: '',
    phone: '',
    preferred_date: '',
    preferred_time: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'Required';
    if (!form.business_name.trim()) e.business_name = 'Required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!form.preferred_date) e.preferred_date = 'Please pick a date';
    if (!form.preferred_time) e.preferred_time = 'Please pick a time';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      // Send via mailto as the primary mechanism — backend email optional later
      const subject = encodeURIComponent(`Demo request - ${form.business_name}`);
      const body = encodeURIComponent(
        `Name: ${form.full_name}\nBusiness: ${form.business_name}\nEmail: ${form.email}\nPhone: ${form.phone}\nPreferred date: ${form.preferred_date}\nPreferred time: ${form.preferred_time}\nMessage: ${form.message || 'N/A'}`
      );
      window.open(`mailto:info@greenpulseanalytics.com?subject=${subject}&body=${body}`, '_blank');
      setSubmitted(true);
    } finally {
      setSubmitting(false);
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
            <Link to="/signin" className="text-sm font-medium text-gray-600 hover:text-gray-900">Sign in</Link>
            <Link to="/register" className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              Start free trial
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">

          {/* Left — pitch */}
          <div className="lg:col-span-2">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <i className="fa-solid fa-calendar-check text-xs"></i>
              Free 30-minute demo
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
              See GreenPulse working on your kind of business
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Book a live walkthrough with our team. We'll show you the dashboard using real restaurant or hotel data, answer your questions, and help you figure out if GreenPulse is the right fit.
            </p>

            <div className="space-y-4">
              {[
                { icon: 'fa-bolt', title: 'Live AI insights demo', desc: 'See how GreenPulse automatically spots energy anomalies and generates ranked savings recommendations.' },
                { icon: 'fa-chart-line', title: 'Your data, your numbers', desc: 'Upload a CSV of your existing bills - we\'ll show you your carbon footprint and waste breakdown instantly.' },
                { icon: 'fa-users', title: 'No pressure', desc: '30 minutes. No sales scripts. Cancel or reschedule any time.' },
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className={`fa-solid ${item.icon} text-emerald-600 text-xs`}></i>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-3">Preferred contact</p>
              <div className="flex flex-col gap-2 text-sm text-gray-600">
                <a href="mailto:info@greenpulseanalytics.com" className="flex items-center gap-2 hover:text-emerald-600 transition-colors">
                  <i className="fa-solid fa-envelope text-xs text-gray-400"></i>
                  info@greenpulseanalytics.com
                </a>
                <a href="tel:+447961790837" className="flex items-center gap-2 hover:text-emerald-600 transition-colors">
                  <i className="fa-solid fa-phone text-xs text-gray-400"></i>
                  07961 790837
                </a>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                  <i className="fa-solid fa-circle-check text-emerald-600 text-3xl"></i>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Request sent!</h2>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                  We've received your demo request for <strong>{form.preferred_date}</strong> at <strong>{form.preferred_time}</strong>.
                  Our team will confirm within one business day.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => navigate('/register')}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Start free trial in the meantime
                  </button>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ full_name: '', business_name: '', email: '', phone: '', preferred_date: '', preferred_time: '', message: '' }); }}
                    className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Submit another
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 shadow-sm p-8 space-y-5">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Book your demo</h2>
                <p className="text-sm text-gray-500 -mt-2 mb-5">All times are UK (GMT/BST). Mon – Fri only.</p>

                {/* Name + Business */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Full name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.full_name}
                      onChange={set('full_name')}
                      placeholder="Jane Smith"
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 ${errors.full_name ? 'border-red-300' : 'border-gray-300'}`}
                    />
                    {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Business name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.business_name}
                      onChange={set('business_name')}
                      placeholder="The Green Plate Ltd"
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 ${errors.business_name ? 'border-red-300' : 'border-gray-300'}`}
                    />
                    {errors.business_name && <p className="text-xs text-red-500 mt-1">{errors.business_name}</p>}
                  </div>
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Email address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      placeholder="jane@greenpulse.com"
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Phone number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={set('phone')}
                      placeholder="07700 900000"
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                </div>

                {/* Date + Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Preferred date <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.preferred_date}
                      onChange={set('preferred_date')}
                      min={minDate()}
                      max={maxDate()}
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 ${errors.preferred_date ? 'border-red-300' : 'border-gray-300'}`}
                    />
                    {errors.preferred_date && <p className="text-xs text-red-500 mt-1">{errors.preferred_date}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Preferred time <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={form.preferred_time}
                      onChange={set('preferred_time')}
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white ${errors.preferred_time ? 'border-red-300' : 'border-gray-300'}`}
                    >
                      <option value="">Select a time…</option>
                      {TIME_SLOTS.map((t) => (
                        <option key={t} value={t}>{t} (GMT)</option>
                      ))}
                    </select>
                    {errors.preferred_time && <p className="text-xs text-red-500 mt-1">{errors.preferred_time}</p>}
                  </div>
                </div>

                {/* Optional message */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Anything you'd like us to focus on? <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={form.message}
                    onChange={set('message')}
                    rows={3}
                    placeholder="e.g. We run 3 restaurants in Edinburgh, interested in energy cost reduction…"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><i className="fa-solid fa-circle-notch fa-spin text-xs"></i> Sending…</>
                  ) : (
                    <><i className="fa-solid fa-calendar-check text-xs"></i> Request demo</>
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  We'll confirm within one business day · Mon – Fri, 9 AM – 5 PM GMT
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer strip */}
      <div className="border-t border-gray-100 py-8 px-6 mt-8">
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
