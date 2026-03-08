import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Each section may have:
 *   title       string
 *   intro       string?           — lead paragraph above bullets/subsections
 *   bullets     string[]?         — top-level bullet list
 *   subsections { subtitle, content?, bullets? }[]?
 *   note        string?           — highlighted callout box
 *   table       { head, rows }?   — two-column table
 */
const sections = [
  // ─────────────────────────────────────────────────────────────────────
  {
    title: '1. Who we are and how to contact us',
    intro:
      'GreenPulse Analytics ("GreenPulse", "we", "us", "our") is a software company registered in Scotland, United Kingdom. ' +
      'We operate the GreenPulse platform — a sustainability analytics and energy management service for hospitality businesses.',
    subsections: [
      {
        subtitle: 'Data Controller',
        content:
          'GreenPulse Analytics is the data controller for personal data you provide directly to us (account registration, profile information, and support communications). ' +
          'Where you connect third-party devices or systems, we act as a data processor on behalf of your organisation. ' +
          'See Section 10 for details on the controller/processor relationship.',
      },
      {
        subtitle: 'Contact details',
        bullets: [
          'Email: privacy@greenpulseanalytics.com',
          'General enquiries: info@greenpulseanalytics.com',
          'Telephone: 07961 790837',
          'Address: GreenPulse Analytics, Scotland, United Kingdom',
        ],
      },
      {
        subtitle: 'ICO registration',
        content:
          'We are registered with the Information Commissioner\'s Office (ICO) as required under UK data protection law. ' +
          'If you have a complaint about our handling of your personal data you have the right to contact the ICO at ico.org.uk or on 0303 123 1113.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '2. What personal data we collect',
    intro:
      'We collect different categories of personal data depending on how you use the platform. ' +
      '"Personal data" means any information that can identify you, directly or in combination with other data.',
    subsections: [
      {
        subtitle: 'Identity and contact data',
        bullets: [
          'First name and last name',
          'Email address',
          'Job title and department',
          'Company / organisation name',
          'Phone number (if you provide it when contacting us)',
          'Profile photograph (if uploaded)',
        ],
      },
      {
        subtitle: 'Account and authentication data',
        bullets: [
          'Hashed password (we never store plain-text passwords)',
          'OAuth provider identifier (if you sign in via Google or Microsoft)',
          'Account role and permissions (Admin, Manager, or Viewer)',
          'Account creation date and last login timestamp',
        ],
      },
      {
        subtitle: 'Energy and operational data',
        bullets: [
          'Electricity consumption readings (kWh) by zone and timestamp — uploaded via smart meter API or manual entry',
          'IoT device identifiers and facility/zone labels you assign',
          'Waste log entries: waste stream, weight, date, and facility',
          'Anomaly flags and AI generated insight scores associated with your energy data',
          'Baseline and threshold values you configure in the platform',
        ],
      },
      {
        subtitle: 'Technical and usage data',
        bullets: [
          'IP address and approximate location (country/region)',
          'Browser type, version, and operating system',
          'Device type and screen resolution',
          'Pages visited, features used, buttons clicked, and time spent on each page',
          'Session identifiers and authentication tokens (stored in your browser)',
          'Error logs and crash reports (anonymised where possible)',
        ],
      },
      {
        subtitle: 'Communications data',
        bullets: [
          'Content of emails and support messages you send us',
          'Records of your responses to surveys or feedback requests',
          'Call recordings (where applicable and with prior notice)',
        ],
      },
    ],
    note:
      'We do not knowingly collect sensitive personal data (special category data such as health, ethnicity, or biometric data) through the platform. ' +
      'Please do not submit such data.',
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '3. How we collect your data',
    subsections: [
      {
        subtitle: 'Data you provide directly',
        content:
          'When you register for an account, update your profile settings, log waste entries manually, or contact our support team.',
      },
      {
        subtitle: 'Data collected automatically',
        content:
          'When you use the platform, we automatically collect technical and usage data through cookies, server logs, and similar tracking technologies. ' +
          'See Section 12 (Cookies) for full details.',
      },
      {
        subtitle: 'Data from connected devices and APIs',
        content:
          'When you connect a smart meter, IoT energy sensor, or third-party data source via our webhook or API integration, ' +
          'readings and device metadata are transmitted to our servers and associated with your account.',
      },
      {
        subtitle: 'Data from third-party sign-in providers',
        content:
          'If you use "Sign in with Google" or "Sign in with Microsoft", we receive your name, email address, and a unique identifier from that provider. ' +
          'We do not receive your password or any other account data held by those providers. ' +
          'Their use of your data is governed by their own privacy policies.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '4. Why we use your data and our legal basis',
    intro:
      'UK GDPR requires us to have a legal basis for every way we use your personal data. ' +
      'The table below sets out our purposes and the basis we rely on.',
    table: {
      head: ['Purpose', 'Legal basis'],
      rows: [
        ['Create and manage your account', 'Performance of a contract'],
        ['Provide the GreenPulse platform and features', 'Performance of a contract'],
        ['Process energy, waste, and operational data you submit', 'Performance of a contract'],
        ['Authenticate your identity and keep your account secure', 'Performance of a contract / Legitimate interests'],
        ['Send service notifications (e.g. system alerts, maintenance)', 'Performance of a contract / Legitimate interests'],
        ['Generate AI powered recommendations and anomaly alerts', 'Performance of a contract'],
        ['Improve and develop the platform (e.g. usage analytics)', 'Legitimate interests'],
        ['Fraud detection, abuse prevention, and platform security', 'Legitimate interests / Legal obligation'],
        ['Send marketing emails and product updates', 'Consent (you can withdraw at any time)'],
        ['Respond to your enquiries and support requests', 'Legitimate interests / Performance of a contract'],
        ['Comply with legal or regulatory obligations', 'Legal obligation'],
        ['Exercise or defend legal claims', 'Legitimate interests / Legal obligation'],
      ],
    },
    note:
      'Where we rely on legitimate interests, we have carried out a balancing test and concluded that our interests do not override your rights and freedoms. ' +
      'You may object to processing on this basis — see Section 9.',
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '5. Automated decision-making and AI features',
    intro:
      'GreenPulse uses machine learning models to analyse your energy and waste data and generate recommendations, anomaly alerts, and forecasts. ' +
      'Here is how that works and what rights you have.',
    subsections: [
      {
        subtitle: 'How our AI works',
        content:
          'Our models are trained on anonymised energy and operational data patterns. ' +
          'When applied to your data, they identify consumption anomalies, predict future demand, and suggest cost-saving measures. ' +
          'All recommendations are presented as advisory suggestions — a human (you or your team) makes the final decision on whether to act.',
      },
      {
        subtitle: 'No solely automated decisions with legal effect',
        content:
          'We do not make any decisions that produce legal effects or similarly significant consequences for you through solely automated processing. ' +
          'Anomaly alerts and recommendations require a human to review and act on them.',
      },
      {
        subtitle: 'Training data and your right to opt out',
        content:
          'We may use aggregated, anonymised patterns derived from your energy data to improve our AI models. ' +
          'This processed data cannot be reverse-engineered to identify your business. ' +
          'If you do not wish your data to contribute to model training, you can object by emailing privacy@greenpulseanalytics.com. ' +
          'This will not affect service quality.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '6. Who we share your personal data with',
    intro:
      'We do not sell your personal data. We share data only in the circumstances described below, and only with parties who are contractually required to protect it.',
    subsections: [
      {
        subtitle: 'Cloud infrastructure and hosting',
        content:
          'Our platform is hosted on cloud infrastructure (currently Railway and/or similar providers). ' +
          'Servers may be located in the UK or EEA. Where data is transferred outside the UK, we ensure appropriate safeguards are in place (see Section 7).',
      },
      {
        subtitle: 'Analytics and monitoring services',
        content:
          'We use third-party tools to monitor platform performance, detect errors, and understand how features are used. ' +
          'These providers receive anonymised or pseudonymised technical data only.',
      },
      {
        subtitle: 'Authentication providers',
        content:
          'If you use Google or Microsoft sign-in, those providers receive confirmation that authentication was successful. ' +
          'We do not share your GreenPulse data with them.',
      },
      {
        subtitle: 'Payment processors',
        content:
          'Subscription payments are processed by a PCI-DSS compliant payment provider. ' +
          'We do not store full payment card details on our servers.',
      },
      {
        subtitle: 'Legal and regulatory authorities',
        content:
          'We may disclose personal data to law enforcement, regulators, or courts when required by law, or to protect our legal rights.',
      },
      {
        subtitle: 'Business transfers',
        content:
          'In the event of a merger, acquisition, or sale of assets, personal data may be transferred to the acquiring entity. ' +
          'We will notify you before your data is transferred and becomes subject to a different privacy policy.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '7. International transfers of personal data',
    intro:
      'GreenPulse is based in the UK. Some of our service providers and infrastructure operate in other countries, including the EEA and the United States.',
    subsections: [
      {
        subtitle: 'UK to EEA',
        content:
          'The UK has recognised EEA countries as providing adequate data protection. ' +
          'Transfers to EEA-based providers are therefore permitted without additional safeguards.',
      },
      {
        subtitle: 'UK to other countries',
        content:
          'For transfers to countries without a UK adequacy decision (e.g. the US), we rely on the UK International Data Transfer Agreement (IDTA) or Standard Contractual Clauses (SCCs) ' +
          'approved by the ICO, and/or the provider\'s certification under an approved framework such as the UK Extension to the EU-US Data Privacy Framework.',
      },
    ],
    note:
      'You may request a copy of the relevant transfer mechanism by emailing privacy@greenpulseanalytics.com.',
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '8. How long we keep your data',
    intro:
      'We do not keep your data longer than necessary. The following retention periods apply:',
    table: {
      head: ['Data type', 'Retention period'],
      rows: [
        ['Account and profile data', 'Duration of account + 90 days after closure'],
        ['Energy and operational readings', '2 years from collection date'],
        ['AI generated insights and recommendations', '1 year from generation date'],
        ['Waste log entries', '2 years from entry date'],
        ['Authentication and security logs', '12 months'],
        ['Support correspondence', '3 years from last interaction'],
        ['Payment records', '7 years (statutory accounting requirement)'],
        ['Marketing consent records', 'Until you withdraw consent + 1 year'],
        ['Anonymised / aggregated analytics', 'Indefinite (cannot identify you)'],
      ],
    },
    note:
      'These periods may be extended where we are required by law or where data is necessary to establish, exercise, or defend legal claims.',
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '9. Your rights under UK GDPR',
    intro:
      'You have the following rights over your personal data. To exercise any of them, email privacy@greenpulseanalytics.com. ' +
      'We will respond within one calendar month. In complex cases we may extend this by a further two months and will notify you.',
    subsections: [
      {
        subtitle: 'Right to be informed',
        content:
          'You have the right to be told how your personal data is used — which is what this Privacy Policy provides.',
      },
      {
        subtitle: 'Right of access',
        content:
          'You can request a copy of all personal data we hold about you. This is known as a Subject Access Request (SAR). We will provide it free of charge in a commonly used electronic format.',
      },
      {
        subtitle: 'Right to rectification',
        content:
          'If any data we hold about you is inaccurate or incomplete, you can ask us to correct it. You can update most profile data yourself in Settings.',
      },
      {
        subtitle: 'Right to erasure ("right to be forgotten")',
        content:
          'You can ask us to delete your personal data where there is no compelling reason for us to continue processing it. ' +
          'This right is not absolute — we may need to retain some data for legal compliance. We will tell you if that is the case.',
      },
      {
        subtitle: 'Right to restriction of processing',
        content:
          'You can ask us to suspend processing of your data — for example, while you contest its accuracy or object to us using it.',
      },
      {
        subtitle: 'Right to data portability',
        content:
          'You can ask for your personal data in a structured, machine readable format (CSV or JSON) so you can transfer it to another service. ' +
          'This right applies to data you provided to us which we process by automated means on a contractual or consent basis.',
      },
      {
        subtitle: 'Right to object',
        content:
          'You can object to processing based on legitimate interests (including direct marketing). ' +
          'We must stop unless we can demonstrate compelling legitimate grounds that override your interests.',
      },
      {
        subtitle: 'Rights related to automated decision-making',
        content:
          'You have the right not to be subject to solely automated decisions that produce significant effects. ' +
          'As noted in Section 5, GreenPulse\'s AI recommendations always require human review.',
      },
    ],
    note:
      'You also have the right to lodge a complaint with the ICO at ico.org.uk if you believe we have not handled your data lawfully.',
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '10. Data processing for business customers',
    intro:
      'If you use GreenPulse on behalf of a business (as is typical), your organisation is the data controller for the operational data ' +
      '(energy readings, waste logs, staff usage) and GreenPulse acts as your data processor.',
    subsections: [
      {
        subtitle: 'Data Processing Agreement (DPA)',
        content:
          'Our Terms of Service incorporate a Data Processing Agreement that meets the requirements of UK GDPR Article 28. ' +
          'It sets out the subject matter, duration, nature, and purpose of our processing on your behalf. ' +
          'By accepting the Terms of Service, your organisation accepts this DPA.',
      },
      {
        subtitle: 'Your obligations as controller',
        content:
          'You are responsible for ensuring you have a lawful basis to collect and share with us the personal data of your employees and any individuals whose data is present in the energy or waste records. ' +
          'You must provide privacy information to those individuals under UK GDPR.',
      },
      {
        subtitle: 'Sub-processors',
        content:
          'We engage sub-processors (cloud hosting, monitoring tools) to help deliver the service. ' +
          'We will provide a list of current sub-processors on request and will give 30 days\' notice of any new sub-processor additions that you may object to.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '11. Security',
    intro:
      'We take the security of your data seriously and implement the following measures:',
    bullets: [
      'All data in transit is encrypted using TLS 1.2 or higher (HTTPS).',
      'Passwords are stored using a one way cryptographic hash (bcrypt) — we cannot recover or read your password.',
      'Authentication tokens are time limited and stored only on the client side.',
      'Access to production systems is restricted to authorised personnel and protected by multi factor authentication.',
      'We carry out regular security assessments of our infrastructure and code.',
      'Our admin panel is protected by an additional authentication layer (Cloudflare Access) restricting access to authorised email domains.',
    ],
    note:
      'No internet-based system is completely secure. In the event of a personal data breach that is likely to result in a risk to your rights and freedoms, ' +
      'we will notify the ICO within 72 hours and notify you without undue delay as required by UK GDPR.',
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '12. Cookies and tracking technologies',
    intro:
      'Cookies are small text files stored in your browser. We use them to make the platform work and to understand how it is used.',
    table: {
      head: ['Cookie type', 'Purpose', 'Duration'],
      rows: [
        ['Strictly necessary', 'Authentication tokens, CSRF protection, session management. The platform cannot function without these.', 'Session / up to 30 days'],
        ['Functional', 'Remembering your preferences (e.g. last viewed page, dashboard layout).', 'Up to 12 months'],
        ['Analytics', 'Understanding how features are used, identifying errors, measuring performance. Data is anonymised before processing.', 'Up to 13 months'],
      ],
    },
    note:
      'We do not use advertising or cross site tracking cookies. See our Cookies Policy at greenpulseanalytics.com/cookies for full details and opt-out instructions.',
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '13. Children\'s privacy',
    content:
      'The GreenPulse platform is a business to business service and is not intended for individuals under the age of 18. ' +
      'We do not knowingly collect personal data from anyone under 18. ' +
      'If you believe we have inadvertently collected such data, please contact us immediately at privacy@greenpulseanalytics.com and we will delete it promptly.',
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '14. Third-party links and integrations',
    content:
      'The platform may contain links to third-party websites or integrations with services such as smart meter APIs. ' +
      'We are not responsible for the privacy practices of those third parties. ' +
      'We encourage you to read their privacy policies before sharing data with them.',
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '15. Changes to this privacy policy',
    content:
      'We may update this policy from time to time to reflect changes in our practices, technology, or legal requirements. ' +
      'For significant changes (such as new purposes for processing or new categories of data), we will notify you by email and/or a prominent notice within the platform at least 30 days before the changes take effect. ' +
      'The "Last updated" date at the top of this page will always indicate when the policy was most recently revised. ' +
      'Continued use of the platform after a change takes effect constitutes acceptance of the updated policy.',
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '16. How to contact us',
    intro:
      'For any questions, concerns, or requests relating to your personal data or this policy, please contact us:',
    bullets: [
      'Email (preferred): privacy@greenpulseanalytics.com',
      'General: info@greenpulseanalytics.com',
      'Phone: 07961 790837',
      'Post: GreenPulse Analytics, Scotland, United Kingdom',
    ],
    note:
      'If you are not satisfied with our response, you have the right to make a complaint to the Information Commissioner\'s Office (ICO): ' +
      'ico.org.uk | 0303 123 1113 | Wycliffe House, Water Lane, Wilmslow, Cheshire SK9 5AF.',
  },
];

// ── Renderer ─────────────────────────────────────────────────────────────────
const Section = ({ s }) => (
  <div>
    <h2 className="text-xl font-bold text-gray-900 mb-3">{s.title}</h2>

    {s.intro && <p className="text-gray-600 leading-relaxed mb-4">{s.intro}</p>}
    {s.content && !s.intro && <p className="text-gray-600 leading-relaxed mb-4">{s.content}</p>}

    {s.bullets && (
      <ul className="space-y-2 mb-4">
        {s.bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-3 text-gray-600 leading-relaxed">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
            {b}
          </li>
        ))}
      </ul>
    )}

    {s.table && (
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-emerald-50">
              {s.table.head.map((h, i) => (
                <th key={i} className="px-4 py-2.5 text-left font-semibold text-gray-800 border border-gray-200">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {s.table.rows.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {row.map((cell, ci) => (
                  <td key={ci} className="px-4 py-2.5 text-gray-600 border border-gray-200 leading-relaxed">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {s.subsections && (
      <div className="space-y-5 mb-4">
        {s.subsections.map((sub, i) => (
          <div key={i}>
            <h3 className="text-base font-semibold text-gray-800 mb-1.5">{sub.subtitle}</h3>
            {sub.content && <p className="text-gray-600 leading-relaxed mb-2">{sub.content}</p>}
            {sub.bullets && (
              <ul className="space-y-1.5">
                {sub.bullets.map((b, j) => (
                  <li key={j} className="flex items-start gap-3 text-gray-600 leading-relaxed">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    )}

    {s.note && (
      <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 leading-relaxed">
        <strong className="font-semibold">Note: </strong>{s.note}
      </div>
    )}
  </div>
);

// ── Table of contents ─────────────────────────────────────────────────────────
const TOC = () => (
  <nav className="mb-12 p-5 bg-gray-50 rounded-xl border border-gray-200">
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contents</p>
    <ol className="space-y-1.5">
      {sections.map((s, i) => (
        <li key={i}>
          <a
            href={`#section-${i}`}
            className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            {s.title}
          </a>
        </li>
      ))}
    </ol>
  </nav>
);

const PrivacyPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-white text-gray-700 antialiased">

      {/* ── Header ── */}
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center shadow-sm">
              <i className="fa-solid fa-leaf text-white text-sm"></i>
            </div>
            <span className="text-xl font-bold text-gray-900">GreenPulse</span>
          </Link>
          <nav className="hidden md:flex items-center gap-10">
            <a href="/#features" className="text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-all duration-200">Features</a>
            <Link to="/about" className="text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-all duration-200">About</Link>
            <Link to="/blog" className="text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-all duration-200">Blog</Link>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => navigate('/signin')} className="text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-gray-100 px-3 py-2 rounded-lg transition-all duration-200">Sign In</button>
            <button onClick={() => navigate('/register')} className="text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-200">Get Started</button>
          </div>
          <button onClick={() => setMenuOpen(o => !o)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Toggle menu">
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`block h-0.5 bg-gray-700 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
              <span className={`block h-0.5 bg-gray-700 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 bg-gray-700 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[9px]' : ''}`} />
            </div>
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-white border-b border-gray-100 shadow-lg px-6 py-4 flex flex-col gap-1">
            <a href="/#features" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-2 py-2.5 rounded-lg transition-all duration-200">Features</a>
            <Link to="/about" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-2 py-2.5 rounded-lg transition-all duration-200">About</Link>
            <Link to="/blog" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-2 py-2.5 rounded-lg transition-all duration-200">Blog</Link>
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2 mt-1">
              <button onClick={() => { setMenuOpen(false); navigate('/signin'); }} className="text-sm font-medium text-gray-700 hover:text-emerald-600 py-2 text-left rounded-lg transition-all duration-200">Sign In</button>
              <button onClick={() => { setMenuOpen(false); navigate('/register'); }} className="w-full text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-lg transition-all duration-200">Get Started</button>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/30">Legal</span>
          <h1 className="text-4xl font-bold text-white mt-4 mb-2">Privacy Policy</h1>
          <p className="text-emerald-100 text-sm">Last updated: 2 March 2026</p>
          <p className="text-emerald-50 text-base leading-relaxed mt-4 max-w-2xl">
            We take your privacy seriously and comply with UK GDPR and the UK Data Protection Act 2018.
            This policy explains, in plain English, exactly what data we collect, why, and what rights you have.
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        <TOC />
        <div className="space-y-12">
          {sections.map((s, i) => (
            <div key={i} id={`section-${i}`} className="scroll-mt-24">
              <Section s={s} />
              {i < sections.length - 1 && <hr className="mt-12 border-gray-100" />}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 p-6 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
          <p className="text-sm font-semibold text-gray-800 mb-1">Questions about your privacy?</p>
          <p className="text-sm text-gray-500 mb-4">Our team is happy to help with any data rights requests.</p>
          <a href="mailto:privacy@greenpulseanalytics.com" className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors">
            <i className="fa-solid fa-envelope"></i>
            privacy@greenpulseanalytics.com
          </a>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <i className="fa-solid fa-leaf text-white text-xs"></i>
                </div>
                <span className="text-lg font-bold text-white">GreenPulse</span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed">Sustainability analytics for modern hospitality businesses.</p>
            </div>
            <div>
              <h4 className="text-emerald-400 font-semibold mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="/#features" className="text-gray-400 hover:text-emerald-400 text-sm transition-all duration-200">Features</a></li>
                <li><a href="/register" className="text-gray-400 hover:text-emerald-400 text-sm transition-all duration-200">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-emerald-400 font-semibold mb-4">Company</h4>
              <ul className="space-y-3">
                <li><Link to="/about" className="text-gray-400 hover:text-emerald-400 text-sm transition-all duration-200">About</Link></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-emerald-400 text-sm transition-all duration-200">Blog</Link></li>
                <li><Link to="/careers" className="text-gray-400 hover:text-emerald-400 text-sm transition-all duration-200">Careers</Link></li>
              </ul>
            </div>
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
            <p className="text-gray-500 text-sm">&copy; 2026 GreenPulse Analytics. All rights reserved.</p>
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

export default PrivacyPage;
