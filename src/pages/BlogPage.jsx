import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import useScrollReveal from '../hooks/useScrollReveal';

const posts = [
  {
    id: 1,
    image: 'https://i.postimg.cc/5NfgPVtc/6c667f38_c318_492c_9f17_d465887096e3.jpg',
    alt: 'Energy analytics dashboard',
    category: 'Energy Savings',
    date: '8 Jan 2026',
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
    date: '3 Feb 2026',
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
    date: '5 Mar 2026',
    readTime: '4 min read',
    title: "Scotland's 2030 Net Zero Target: What Small Hotels Need to Do",
    excerpt:
      "The deadline is closer than you think. Here's what compliance looks like for independent hospitality businesses, without the corporate jargon.",
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=600&auto=format&fit=crop&q=80',
    alt: 'Energy meter and data',
    category: 'Energy Savings',
    date: '24 Mar 2026',
    readTime: '7 min read',
    title: "Why Your Smart Meter Isn't Actually Saving You Money",
    excerpt:
      'The UK rolled out 32 million smart meters. Energy bills barely moved. Here\'s the gap between what smart meters promise and what hospitality businesses actually need.',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format&fit=crop&q=80',
    alt: 'Restaurant kitchen operations',
    category: 'Operations',
    date: '1 Apr 2026',
    readTime: '5 min read',
    title: 'The Hidden Cost of "We\'ve Always Done It That Way"',
    excerpt:
      'Most energy waste in hospitality isn\'t caused by broken equipment. It\'s caused by habits that made sense five years ago and nobody ever changed.',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1467987506553-8f3916508521?w=600&auto=format&fit=crop&q=80',
    alt: 'Small hotel exterior',
    category: 'Sustainability',
    date: '10 Apr 2026',
    readTime: '6 min read',
    title: 'What Does "Net Zero" Actually Mean for a 20-Room Hotel?',
    excerpt:
      'Strip out the corporate language. Here\'s what net zero looks like in practice for an independent hotel — what to measure, what to reduce, and what "good enough" really means.',
  },
];

const BlogPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  useScrollReveal();

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
              className="reveal card-hover bg-white rounded-2xl overflow-hidden shadow-md cursor-pointer border border-gray-100 flex flex-col"
            >
              <img
                src={post.image}
                alt={post.alt}
                className="w-full h-56 object-cover"
                loading="lazy"
              />
              <div className="p-7 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="bg-emerald-50 text-emerald-600 text-xs font-semibold px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-400">{post.readTime}</span>
                  <span className="text-xs text-gray-400 ml-auto">{post.date}</span>
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
      <Footer />

    </div>
  );
};

export default BlogPage;
