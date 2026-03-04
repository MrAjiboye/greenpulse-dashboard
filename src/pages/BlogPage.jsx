import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const posts = [
  {
    id: 1,
    image: 'https://i.postimg.cc/5NfgPVtc/6c667f38_c318_492c_9f17_d465887096e3.jpg',
    alt: 'Energy analytics dashboard',
    category: 'Energy Savings',
    readTime: '5 min read',
    title: "Your Restaurant is Bleeding Money. Here's Where.",
    excerpt:
      'Most independent restaurants waste 20-30% of their energy budget without knowing it. We found the three biggest culprits after analyzing hundreds of UK hospitality businesses.',
  },
  {
    id: 2,
    image: 'https://i.postimg.cc/0NLRmQPq/pexels_anna_nekrashevich_6801648.jpg',
    alt: 'Business analytics charts',
    category: 'Analytics',
    readTime: '6 min read',
    title: 'Foot Traffic Data is Useless Without This',
    excerpt:
      'Counting customers is easy. Knowing what to do with that data is hard. How smart hospitality operators turn foot traffic patterns into profit.',
  },
  {
    id: 3,
    image: 'https://i.postimg.cc/pd9Mp8Nc/graph.jpg',
    alt: 'Data visualization',
    category: 'Sustainability',
    readTime: '4 min read',
    title: "Scotland's 2030 Net-Zero Target: What Small Hotels Need to Do",
    excerpt:
      "The deadline is closer than you think. Here's what compliance looks like for independent hospitality businesses, without the corporate jargon.",
  },
];

const BlogPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-white text-gray-700 antialiased">

      {/* ── Header ── */}
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center shadow-sm">
              <i className="fa-solid fa-leaf text-white text-sm"></i>
            </div>
            <span className="text-xl font-bold text-gray-900">GreenPulse</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-10">
            <a href="/#features" className="text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-all duration-200">
              Features
            </a>
            <Link to="/about" className="text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-all duration-200">
              About
            </Link>
            <Link to="/blog" className="text-sm font-semibold text-emerald-600">
              Blog
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/signin')}
              className="text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-gray-100 px-3 py-2 rounded-lg transition-all duration-200"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-200"
            >
              Get Started
            </button>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`block h-0.5 bg-gray-700 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
              <span className={`block h-0.5 bg-gray-700 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 bg-gray-700 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[9px]' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-white border-b border-gray-100 shadow-lg px-6 py-4 flex flex-col gap-1">
            <a href="/#features" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-2 py-2.5 rounded-lg transition-all duration-200">Features</a>
            <Link to="/about" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-2 py-2.5 rounded-lg transition-all duration-200">About</Link>
            <Link to="/blog" onClick={() => setMenuOpen(false)} className="text-sm font-semibold text-emerald-600 py-2.5">Blog</Link>
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2 mt-1">
              <button onClick={() => { setMenuOpen(false); navigate('/signin'); }} className="text-sm font-medium text-gray-700 hover:text-emerald-600 py-2 text-left rounded-lg transition-all duration-200">Sign In</button>
              <button onClick={() => { setMenuOpen(false); navigate('/register'); }} className="w-full text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-lg transition-all duration-200">Get Started</button>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 text-center px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Insights for Hospitality</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Energy tips, industry trends, and practical advice for independent restaurants, cafés, and small hotels across the UK.
        </p>
      </section>

      {/* ── Blog grid ── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {posts.map(post => (
            <article
              key={post.id}
              onClick={() => navigate(`/blog/${post.id}`)}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-gray-100 flex flex-col"
            >
              <img
                src={post.image}
                alt={post.alt}
                className="w-full h-56 object-cover"
                loading="lazy"
              />
              <div className="p-7 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-emerald-50 text-emerald-600 text-xs font-semibold px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-400">{post.readTime}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-3 leading-snug">{post.title}</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">{post.excerpt}</p>
                <Link
                  to={`/blog/${post.id}`}
                  onClick={e => e.stopPropagation()}
                  className="text-emerald-600 font-semibold text-sm inline-flex items-center gap-1 hover:gap-2.5 transition-all self-start"
                >
                  Read full article <span>→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-white pt-16 pb-8 mt-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

            {/* Brand */}
            <div className="md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <i className="fa-solid fa-leaf text-white text-xs"></i>
                </div>
                <span className="text-lg font-bold text-white">GreenPulse</span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed">Sustainability analytics for modern hospitality businesses.</p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-emerald-400 font-semibold mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="/#features" className="text-gray-400 hover:text-emerald-400 text-sm transition-all duration-200">Features</a></li>
                <li><a href="/register" className="text-gray-400 hover:text-emerald-400 text-sm transition-all duration-200">Pricing</a></li>
                <li><a href="/register" className="text-gray-400 hover:text-emerald-400 text-sm transition-all duration-200">Sign Up</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-emerald-400 font-semibold mb-4">Company</h4>
              <ul className="space-y-3">
                <li><Link to="/about" className="text-gray-400 hover:text-emerald-400 text-sm transition-all duration-200">About</Link></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-emerald-400 text-sm transition-all duration-200">Blog</Link></li>
                <li><Link to="/careers" className="text-gray-400 hover:text-emerald-400 text-sm transition-all duration-200">Careers</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-emerald-400 font-semibold mb-4">Contact</h4>
              <ul className="space-y-3">
                <li><a href="mailto:info@greenpulseanalytics.com" className="text-gray-400 hover:text-emerald-400 text-sm transition-all duration-200">info@greenpulseanalytics.com</a></li>
                <li><a href="tel:+447961790837" className="text-gray-400 hover:text-emerald-400 text-sm transition-all duration-200">07961 790837</a></li>
                <li><p className="text-gray-500 text-sm">Based in Scotland, UK</p></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">&copy; 2025 GreenPulse Analytics. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/terms" className="text-xs text-gray-500 hover:text-emerald-400 transition-all duration-200">Terms</Link>
              <Link to="/privacy" className="text-xs text-gray-500 hover:text-emerald-400 transition-all duration-200">Privacy</Link>
              <Link to="/cookies" className="text-xs text-gray-500 hover:text-emerald-400 transition-all duration-200">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default BlogPage;
