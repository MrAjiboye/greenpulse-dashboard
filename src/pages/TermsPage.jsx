import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Each section may have:
 *   title       string
 *   intro       string?
 *   content     string?
 *   bullets     string[]?
 *   subsections { subtitle, content?, bullets? }[]?
 *   note        string?
 *   table       { head, rows }?
 */
const sections = [
  // ─────────────────────────────────────────────────────────────────────
  {
    title: '1. About GreenPulse and these Terms',
    intro:
      'GreenPulse Analytics ("GreenPulse", "we", "us", "our") provides a cloud based sustainability analytics and energy management platform ' +
      '("the Service") for hospitality and food service businesses. These Terms of Service ("Terms") form a legally binding agreement between ' +
      'GreenPulse Analytics and the individual or organisation accessing or using the Service ("you", "Customer", "User").',
    subsections: [
      {
        subtitle: 'Who these Terms apply to',
        content:
          'These Terms apply to all users of the platform, whether you access it as an individual, as an employee or representative of a business, ' +
          'or through an admin or manager account provisioned by your employer. ' +
          'If you are accepting on behalf of an organisation, you represent that you have authority to bind that organisation to these Terms.',
      },
      {
        subtitle: 'Related policies',
        bullets: [
          'Privacy Policy: how we collect, use, and protect personal data.',
          'Cookies Policy: how we use cookies and tracking technologies.',
          'Data Processing Agreement (DPA), incorporated into these Terms; sets out our obligations as your data processor under UK GDPR.',
          'Acceptable Use Policy: additional rules for use of the platform (set out in Section 9).',
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '2. Definitions',
    table: {
      head: ['Term', 'Meaning'],
      rows: [
        ['"Service"', 'The GreenPulse web application, APIs, AI features, and any associated software or documentation.'],
        ['"Account"', 'Your registered user profile and associated access credentials.'],
        ['"Customer Data"', 'Any data, including energy readings, waste logs, and operational records, that you upload to or generate within the Service.'],
        ['"Subscription"', 'Your paid or free-tier licence to access the Service.'],
        ['"Authorised User"', 'An individual granted access to the Service under your Subscription.'],
        ['"Confidential Information"', 'Non-public information either party discloses to the other in connection with the Service.'],
        ['"AI Features"', 'Machine learning models that generate anomaly alerts, consumption forecasts, and cost-saving recommendations.'],
        ['"Intellectual Property Rights"', 'Patents, trademarks, copyright, trade secrets, database rights, and all similar rights worldwide.'],
        ['"Fees"', 'All amounts payable for the Subscription as set out on our pricing page or a written order form.'],
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '3. Accepting these Terms',
    intro:
      'By creating an Account, clicking "Get Started" or "Sign Up", or using any part of the Service, ' +
      'you confirm that you have read, understood, and agree to be bound by these Terms and all policies incorporated by reference.',
    note:
      'If you do not agree to these Terms, you must not access or use the Service. ' +
      'If you are under 18 years of age, you may not create an Account or use the Service.',
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '4. Account registration and security',
    bullets: [
      'You must provide accurate, current, and complete information when creating an Account and keep it updated.',
      'You are responsible for maintaining the confidentiality of your login credentials (email, password, OAuth tokens).',
      'You must not share your Account with any other person or allow any third party to access the Service through your Account.',
      'You are responsible for all activity that occurs under your Account, whether or not authorised by you.',
      'You must notify us immediately at info@greenpulseanalytics.com if you suspect any unauthorised access to or use of your Account.',
      'We reserve the right to suspend or terminate Accounts found to be sharing access beyond licensed Authorised Users.',
      'Accounts created via Google or Microsoft OAuth ("Sign in with Google/Microsoft") are subject to those providers\' terms in addition to ours.',
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '5. Subscription plans, fees, and payment',
    subsections: [
      {
        subtitle: 'Plans',
        content:
          'The Service is available under a free tier (with limited features) and paid subscription plans as described on our pricing page at greenpulseanalytics.com. ' +
          'Features, usage limits, and support levels differ by plan. We reserve the right to change plan features on 30 days\' notice.',
      },
      {
        subtitle: 'Fees and invoicing',
        content:
          'Paid Subscriptions are charged in advance on a monthly or annual basis as specified at checkout. ' +
          'All fees are quoted exclusive of VAT. UK VAT will be added at the applicable rate. ' +
          'You authorise us to charge your chosen payment method on each billing date.',
      },
      {
        subtitle: 'Late payment',
        content:
          'If payment is not received within 14 days of the due date, we may suspend access to the Service until the outstanding balance is paid. ' +
          'We reserve the right to charge statutory interest on overdue amounts under the Late Payment of Commercial Debts (Interest) Act 1998.',
      },
      {
        subtitle: 'Price changes',
        content:
          'We may change Subscription fees on 30 days\' written notice. ' +
          'Continued use of the Service after the price change takes effect constitutes acceptance. ' +
          'If you do not accept a price increase, you may cancel before the new price applies.',
      },
      {
        subtitle: 'Refunds',
        content:
          'Monthly subscriptions cancelled before the next billing date will not be refunded for the current period. ' +
          'Annual subscriptions cancelled within 14 days of payment ("cooling off period") may receive a pro-rated refund at our discretion. ' +
          'We do not offer refunds after 14 days of an annual payment.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '6. Free trial',
    intro:
      'We may offer a free trial period. If you start a free trial:',
    bullets: [
      'Full features may be available during the trial period at no charge.',
      'At the end of the trial, you must provide payment details to continue; otherwise access will revert to the free tier or be terminated.',
      'We will not charge you without giving you advance notice that the trial is ending.',
      'We reserve the right to modify or withdraw free trial offers at any time.',
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '7. Auto-renewal and cancellation',
    subsections: [
      {
        subtitle: 'Auto-renewal',
        content:
          'Subscriptions renew automatically at the end of each billing period unless you cancel before the renewal date. ' +
          'We will send a reminder email at least 7 days before renewal.',
      },
      {
        subtitle: 'How to cancel',
        content:
          'You can cancel your Subscription at any time by emailing info@greenpulseanalytics.com or through the account settings in the platform. ' +
          'Cancellation takes effect at the end of the current billing period. ' +
          'You retain access until the period ends.',
      },
      {
        subtitle: 'Effect of cancellation',
        content:
          'After cancellation, your Account will revert to the free tier or be deactivated as applicable. ' +
          'You may export your Customer Data before cancellation takes effect. ' +
          'We will delete Customer Data in accordance with our Privacy Policy (Section 8 of the Privacy Policy).',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '8. Permitted use of the Service',
    intro:
      'Subject to these Terms and payment of applicable Fees, we grant you a limited, non exclusive, non transferable, revocable licence to access and use the Service ' +
      'for your internal business purposes during the Subscription term.',
    bullets: [
      'You may allow Authorised Users within your organisation to access the Service.',
      'You may connect compatible devices and data sources to the Service.',
      'You may download and use reports and exports generated by the Service for your own internal purposes.',
      'You may use AI generated recommendations as advisory inputs into your operational decisions.',
    ],
    note:
      'Nothing in these Terms grants you any rights in or to the Service\'s source code, underlying models, or GreenPulse\'s Intellectual Property Rights.',
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '9. Prohibited conduct',
    intro: 'You must not, and must not allow any third party to:',
    bullets: [
      'Use the Service in any way that violates applicable UK law or regulation, or any law in your jurisdiction.',
      'Use the Service to process data relating to individuals without a lawful basis under UK GDPR.',
      'Attempt to probe, scan, or test the vulnerability of GreenPulse systems, or circumvent authentication or security measures.',
      'Upload or transmit malicious code, viruses, or any other material designed to damage or interfere with the Service.',
      'Scrape, crawl, or harvest data from the Service by automated means without our prior written consent.',
      'Reverse engineer, decompile, disassemble, or otherwise attempt to derive the source code of the Service.',
      'Reproduce, redistribute, sublicense, sell, or commercially exploit the Service or any part of it without our written consent.',
      'Use the Service to store or transmit infringing, defamatory, or otherwise unlawful content.',
      'Impersonate any person or entity, or misrepresent your affiliation with any person or entity.',
      'Use the Service in a way that could overburden, disable, or impair our infrastructure (denial of service or similar attacks).',
      'Access any account or data belonging to another user without authorisation.',
      'Use AI generated outputs as professional energy, legal, or financial advice without independent verification.',
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '10. Your Customer Data',
    subsections: [
      {
        subtitle: 'Ownership',
        content:
          'You retain full ownership of all Customer Data you upload to, generate within, or transmit through the Service. ' +
          'GreenPulse makes no claim to intellectual property rights over your Customer Data.',
      },
      {
        subtitle: 'Licence to process',
        content:
          'By uploading Customer Data, you grant GreenPulse a limited, non exclusive, worldwide licence to host, store, process, ' +
          'and use that data solely to provide and improve the Service and as described in our Privacy Policy. ' +
          'This licence terminates when you delete the data or close your Account.',
      },
      {
        subtitle: 'Your responsibility',
        content:
          'You are solely responsible for: (a) ensuring Customer Data is accurate, lawful, and does not infringe any third-party rights; ' +
          '(b) maintaining independent backups of Customer Data; and (c) obtaining any necessary consents to submit Customer Data ' +
          '(including personal data of employees or customers) to the Service.',
      },
      {
        subtitle: 'Data export',
        content:
          'You may export your Customer Data at any time in CSV or JSON format via the platform. ' +
          'We recommend exporting data before cancelling your Subscription. ' +
          'After Account termination, data is retained for 90 days during which you may request an export, then permanently deleted.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '11. AI and machine learning features',
    subsections: [
      {
        subtitle: 'Advisory nature of recommendations',
        content:
          'AI generated recommendations, anomaly alerts, energy forecasts, and cost estimates provided by the Service are advisory outputs based on statistical models. ' +
          'They are not professional energy consultancy, financial, legal, or environmental advice. ' +
          'You should apply your own judgement before acting on any recommendation. ' +
          'GreenPulse accepts no liability for losses arising from reliance on AI generated outputs without independent verification.',
      },
      {
        subtitle: 'Accuracy and limitations',
        content:
          'The accuracy of AI outputs depends on the quality, completeness, and frequency of the Customer Data you provide. ' +
          'Anomaly detection and forecasting models may produce false positives or miss genuine anomalies. ' +
          'We will work to improve model accuracy but cannot guarantee specific error rates.',
      },
      {
        subtitle: 'Model training',
        content:
          'We may use aggregated, anonymised patterns derived from Customer Data to train and improve our models. ' +
          'We will not use identifiable Customer Data for training purposes without your consent. ' +
          'See Section 5 of the Privacy Policy for your right to opt out.',
      },
    ],
    note:
      'GreenPulse AI features are tools to help your team, not substitutes for professional advice. ' +
      'Any decisions made based on platform outputs remain your responsibility.',
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '12. Data processing and UK GDPR',
    subsections: [
      {
        subtitle: 'Data Processing Agreement',
        content:
          'Where you submit personal data (such as employee usage data or IoT device data linked to individuals) to the Service, ' +
          'GreenPulse acts as your data processor and you act as the data controller for that personal data. ' +
          'Our Data Processing Agreement (DPA), which is incorporated into these Terms by reference, sets out our obligations as processor under UK GDPR Article 28.',
      },
      {
        subtitle: 'Your controller obligations',
        content:
          'As data controller, you are responsible for ensuring that your use of the Service — ' +
          'including the personal data you submit, complies with applicable data protection law. ' +
          'This includes providing a lawful basis for processing and informing data subjects (e.g. employees) about their data rights.',
      },
      {
        subtitle: 'Security incidents',
        content:
          'In the event of a personal data breach involving Customer Data, we will notify you without undue delay and in any event within 72 hours of becoming aware, ' +
          'to enable you to meet your own ICO notification obligations.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '13. Intellectual property rights',
    subsections: [
      {
        subtitle: 'GreenPulse IP',
        content:
          'The Service, including all software, algorithms, ML models, designs, user interfaces, documentation, and GreenPulse brand materials, ' +
          'is owned by or licensed to GreenPulse Analytics. ' +
          'All Intellectual Property Rights in the Service remain with GreenPulse and its licensors. ' +
          'No rights are transferred to you other than the limited licence in Section 8.',
      },
      {
        subtitle: 'Feedback',
        content:
          'If you provide feedback, suggestions, or ideas about the Service, you grant GreenPulse an irrevocable, royalty-free, worldwide licence to use that feedback ' +
          'without restriction or compensation to you.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '14. Confidentiality',
    intro:
      'Each party agrees to keep the other\'s Confidential Information confidential and not to disclose it to any third party ' +
      'without prior written consent, except as required by law or to professional advisers under a duty of confidentiality.',
    bullets: [
      'GreenPulse will treat your Customer Data as Confidential Information.',
      'You will treat GreenPulse pricing, product roadmap information, and technical architecture shared with you as Confidential Information.',
      'This obligation survives termination of these Terms for a period of three years.',
      'Neither party is obliged to treat as confidential any information that is publicly available, was already known to the recipient, or is independently developed.',
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '15. Service availability and support',
    subsections: [
      {
        subtitle: 'Target availability',
        content:
          'We aim to maintain the Service\'s availability at 99% or higher, measured monthly, excluding scheduled maintenance windows. ' +
          'However, this target is not a guarantee, and we do not offer a service level agreement (SLA) on free tier accounts.',
      },
      {
        subtitle: 'Maintenance windows',
        content:
          'We will endeavour to carry out planned maintenance outside of UK business hours (09:00–18:00 GMT/BST, Monday–Friday) ' +
          'and will provide at least 48 hours\' notice of significant maintenance where practicable.',
      },
      {
        subtitle: 'Support',
        content:
          'Support is available by email at support@greenpulseanalytics.com. ' +
          'We aim to respond to support enquiries within 2 business days. ' +
          'Priority support response times may differ based on your Subscription plan.',
      },
      {
        subtitle: 'Third-party dependencies',
        content:
          'The Service depends on third-party infrastructure (cloud hosting, APIs, OAuth providers). ' +
          'We are not responsible for interruptions caused by third-party outages beyond our reasonable control.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '16. Disclaimer of warranties',
    intro:
      'To the maximum extent permitted by applicable law, the Service is provided "as is" and "as available". GreenPulse expressly disclaims all warranties, ' +
      'whether express, implied, or statutory, including:',
    bullets: [
      'Implied warranties of merchantability, fitness for a particular purpose, and non-infringement.',
      'Any warranty that the Service will be uninterrupted, error-free, or secure.',
      'Any warranty regarding the accuracy, reliability, or completeness of AI generated outputs, energy forecasts, or cost estimates.',
      'Any warranty that defects will be corrected.',
    ],
    note:
      'Some jurisdictions do not allow the exclusion of implied warranties. In those jurisdictions, the above exclusions apply to the fullest extent permitted by law.',
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '17. Limitation of liability',
    subsections: [
      {
        subtitle: 'Exclusion of consequential loss',
        content:
          'To the maximum extent permitted by UK law, GreenPulse Analytics shall not be liable to you for any indirect, incidental, special, ' +
          'consequential, or punitive damages arising from or related to your use of the Service, including (without limitation): ' +
          'loss of profits, loss of business, loss of revenue, loss of data, or loss of goodwill, even if we have been advised of the possibility of such loss.',
      },
      {
        subtitle: 'Cap on direct liability',
        content:
          'GreenPulse\'s total aggregate liability to you for any and all claims arising under or in connection with these Terms — whether in contract, tort, ' +
          'statute, or otherwise, shall not exceed the greater of: (a) the total Fees paid by you to GreenPulse in the three calendar months immediately preceding ' +
          'the event giving rise to the claim; or (b) £100 GBP.',
      },
      {
        subtitle: 'Exceptions',
        content:
          'Nothing in these Terms limits or excludes our liability for: (a) death or personal injury caused by our negligence; ' +
          '(b) fraud or fraudulent misrepresentation; (c) any other liability that cannot be excluded or limited by UK law.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '18. Indemnification',
    content:
      'You agree to indemnify, defend, and hold harmless GreenPulse Analytics and its officers, directors, employees, and agents from and against ' +
      'any claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising from: ' +
      '(a) your breach of these Terms; (b) Customer Data you submit to the Service infringing third-party rights or violating applicable law; ' +
      'or (c) your failure to comply with your obligations as a data controller under UK GDPR.',
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '19. Force majeure',
    content:
      'Neither party shall be liable for any failure or delay in performing its obligations under these Terms to the extent that such failure or delay is caused by ' +
      'circumstances beyond that party\'s reasonable control, including acts of God, natural disasters, war, terrorism, strikes, industrial action, ' +
      'government actions, pandemic, telecommunications or power failure, or failure of third-party suppliers. ' +
      'The affected party must notify the other promptly and use reasonable endeavours to mitigate the impact.',
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '20. Term and termination',
    subsections: [
      {
        subtitle: 'Term',
        content:
          'These Terms take effect when you create an Account or first use the Service and continue until your Subscription is terminated or your Account is closed.',
      },
      {
        subtitle: 'Termination by you',
        content:
          'You may terminate these Terms at any time by cancelling your Subscription (see Section 7) and deleting your Account. ' +
          'Termination does not entitle you to a refund of pre-paid Fees except as set out in Section 5.',
      },
      {
        subtitle: 'Termination or suspension by GreenPulse',
        content:
          'We may suspend or terminate your access to the Service immediately and without liability to you if: ' +
          '(a) you breach these Terms and, if the breach is capable of remedy, fail to remedy it within 14 days of written notice; ' +
          '(b) you fail to pay Fees when due and do not remedy the non-payment within 14 days of notice; ' +
          '(c) you become insolvent, enter administration, or cease trading; ' +
          '(d) we are required to do so by law or a regulatory authority; or ' +
          '(e) continued provision of the Service poses a legal, reputational, or security risk to GreenPulse or other users.',
      },
      {
        subtitle: 'Effect of termination',
        content:
          'On termination: the licence granted in Section 8 ceases immediately; you must stop using the Service; ' +
          'you may export Customer Data within 90 days (after which it is deleted); ' +
          'outstanding Fees become immediately due and payable; ' +
          'Sections 10 (ownership), 13 (IP), 14 (confidentiality), 16, 17, 18 and 22 survive termination.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '21. Changes to the Service and these Terms',
    subsections: [
      {
        subtitle: 'Changes to the Service',
        content:
          'We may update, modify, add to, or remove features of the Service at any time. ' +
          'We will provide reasonable notice of material changes that reduce functionality. ' +
          'If a change materially and adversely affects your use, you may terminate your Subscription within 30 days and receive a pro-rated refund of unused Fees.',
      },
      {
        subtitle: 'Changes to these Terms',
        content:
          'We may update these Terms from time to time. For material changes, we will notify you by email and/or in-platform notice at least 30 days before the changes take effect. ' +
          'Your continued use of the Service after the effective date constitutes acceptance of the updated Terms. ' +
          'If you do not accept the changes, you must stop using the Service and cancel your Subscription before the effective date.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '22. Governing law and disputes',
    subsections: [
      {
        subtitle: 'Governing law',
        content:
          'These Terms and any dispute or claim arising out of or in connection with them (including non-contractual disputes or claims) ' +
          'shall be governed by and construed in accordance with the laws of Scotland and the United Kingdom.',
      },
      {
        subtitle: 'Dispute resolution',
        content:
          'In the event of a dispute, the parties shall first attempt to resolve it through good-faith negotiation for a period of 30 days. ' +
          'If the dispute is not resolved within that period, either party may pursue it in accordance with the jurisdiction clause below.',
      },
      {
        subtitle: 'Jurisdiction',
        content:
          'Each party irrevocably submits to the exclusive jurisdiction of the courts of Scotland to settle any dispute or claim arising out of or in connection with these Terms, ' +
          'although GreenPulse retains the right to bring proceedings against you in any other jurisdiction where you are resident or carry on business.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '23. General provisions',
    subsections: [
      {
        subtitle: 'Entire agreement',
        content:
          'These Terms, together with the Privacy Policy, Cookies Policy, and DPA, constitute the entire agreement between you and GreenPulse regarding the Service ' +
          'and supersede all prior agreements, representations, and understandings (whether oral or written) relating to the same subject matter.',
      },
      {
        subtitle: 'No waiver',
        content:
          'Failure by either party to enforce any provision of these Terms does not constitute a waiver of the right to enforce it subsequently.',
      },
      {
        subtitle: 'Severability',
        content:
          'If any provision of these Terms is found by a court of competent jurisdiction to be invalid, illegal, or unenforceable, ' +
          'that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall continue in full force and effect.',
      },
      {
        subtitle: 'Assignment',
        content:
          'You may not assign, transfer, or sublicense your rights or obligations under these Terms without our prior written consent. ' +
          'GreenPulse may assign these Terms or any rights hereunder to a successor entity in connection with a merger, acquisition, or sale of all or substantially all of its assets, ' +
          'provided the successor assumes our obligations under these Terms.',
      },
      {
        subtitle: 'Electronic communications',
        content:
          'You agree that communications sent electronically (including by email and in-platform notifications) satisfy any legal requirement for such communications to be in writing.',
      },
      {
        subtitle: 'Third-party rights',
        content:
          'These Terms do not confer any rights on third parties under the Contracts (Rights of Third Parties) Act 1999.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  {
    title: '24. Contact us',
    intro: 'For questions about these Terms, billing, or your account:',
    bullets: [
      'Email: info@greenpulseanalytics.com',
      'Legal/compliance: privacy@greenpulseanalytics.com',
      'Phone: 07961 790837',
      'Address: GreenPulse Analytics, Scotland, United Kingdom',
    ],
    note:
      'These Terms were last updated on 2 March 2026. Previous versions are available on request.',
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
        <strong className="font-semibold">Important: </strong>{s.note}
      </div>
    )}
  </div>
);

const TOC = () => (
  <nav className="mb-12 p-5 bg-gray-50 rounded-xl border border-gray-200">
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contents</p>
    <ol className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
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

const TermsPage = () => {
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
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <span className="bg-white/10 text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20">Legal</span>
          <h1 className="text-4xl font-bold text-white mt-4 mb-2">Terms of Service</h1>
          <p className="text-gray-400 text-sm">Last updated: 2 March 2026</p>
          <p className="text-gray-300 text-base leading-relaxed mt-4 max-w-2xl">
            Please read these Terms carefully. They form a binding agreement between you and GreenPulse Analytics
            governing your access to and use of the GreenPulse platform.
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
        <div className="mt-16 p-6 bg-gray-50 border border-gray-200 rounded-xl text-center">
          <p className="text-sm font-semibold text-gray-800 mb-1">Questions about our Terms?</p>
          <p className="text-sm text-gray-500 mb-4">We&apos;re happy to explain anything in plain English.</p>
          <a href="mailto:info@greenpulseanalytics.com" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-colors">
            <i className="fa-solid fa-envelope"></i>
            info@greenpulseanalytics.com
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

export default TermsPage;
