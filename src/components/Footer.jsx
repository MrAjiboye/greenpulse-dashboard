import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">

        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <i className="fa-solid fa-leaf text-white text-xs" />
              </div>
              <span className="text-lg font-bold text-white">GreenPulse</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Sustainability analytics for modern hospitality businesses. Cut costs, reduce emissions, and track your net zero journey.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://linkedin.com/company/greenpulse-analytics-uk"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-emerald-500 flex items-center justify-center transition-colors duration-200"
              >
                <i className="fa-brands fa-linkedin-in text-xs text-gray-400 hover:text-white" />
              </a>
              <a
                href="https://x.com/GreenPulseUK"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-emerald-500 flex items-center justify-center transition-colors duration-200"
              >
                <i className="fa-brands fa-x-twitter text-xs text-gray-400 hover:text-white" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-emerald-400 font-semibold mb-5 text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-3">
              {[
                { label: 'Energy Monitor',    to: '/register' },
                { label: 'Waste Management',  to: '/register' },
                { label: 'AI Insights',       to: '/register' },
                { label: 'Carbon Footprint',  to: '/register' },
                { label: 'Pricing',           to: '/pricing'  },
                { label: 'How it works',      to: '/how-it-works' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-gray-400 hover:text-emerald-400 text-sm transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-emerald-400 font-semibold mb-5 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              {[
                { label: 'About us',   to: '/about'   },
                { label: 'Blog',       to: '/blog'    },
                { label: 'Stories',    to: '/stories' },
                { label: 'Careers',    to: '/careers' },
                { label: 'Glossary',   to: '/glossary'},
                { label: 'Contact',    to: '/contact' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-gray-400 hover:text-emerald-400 text-sm transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-emerald-400 font-semibold mb-5 text-sm uppercase tracking-wider">Get in touch</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:info@greenpulseanalytics.com"
                  className="text-gray-400 hover:text-emerald-400 text-sm transition-colors duration-200 flex items-start gap-2"
                >
                  <i className="fa-solid fa-envelope mt-0.5 text-xs" />
                  info@greenpulseanalytics.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+447961790837"
                  className="text-gray-400 hover:text-emerald-400 text-sm transition-colors duration-200 flex items-start gap-2"
                >
                  <i className="fa-solid fa-phone mt-0.5 text-xs" />
                  07961 790837
                </a>
              </li>
              <li className="flex items-start gap-2 text-gray-500 text-sm">
                <i className="fa-solid fa-location-dot mt-0.5 text-xs" />
                Scotland, United Kingdom
              </li>
            </ul>

            <div className="mt-6">
              <Link
                to="/demo"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
              >
                <i className="fa-solid fa-calendar-check text-xs" />
                Book a demo
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom strip */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© 2026 GreenPulse Analytics. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/terms"   className="text-xs text-gray-500 hover:text-emerald-400 transition-colors duration-200">Terms</Link>
            <Link to="/privacy" className="text-xs text-gray-500 hover:text-emerald-400 transition-colors duration-200">Privacy</Link>
            <Link to="/cookies" className="text-xs text-gray-500 hover:text-emerald-400 transition-colors duration-200">Cookies</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
