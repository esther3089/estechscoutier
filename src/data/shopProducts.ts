import { ShopProduct } from '../types';

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: 'starter-free',
    name: 'EstechScoutier Community',
    price: '$0',
    period: 'forever',
    description: 'Everything you need for individual solo outreach and small-batch networking.',
    features: [
      'Up to 10,000 emails per campaign',
      'High-speed Web Worker batch processing',
      'Smart {name} auto-extraction & fallback',
      'Device-optimized mail app launcher',
      'Local IndexedDB offline storage',
      'Built-in & custom template library'
    ],
    ctaText: 'Current Active Plan',
    ctaType: 'buy',
    highlighted: false,
  },
  {
    id: 'pro-templates-pack',
    name: 'High-Converting Template Vault',
    price: '$29',
    period: 'one-time',
    badge: 'Popular',
    description: '150+ battle-tested outreach templates for sales, sponsorships, PR, and recruiters.',
    features: [
      '150+ categorized response-tested email scripts',
      'Follow-up sequences with 45%+ reply benchmarks',
      'Direct import file into EstechScoutier',
      'Lifetime updates & quarterly new releases',
      'Subject line formula swipe file'
    ],
    ctaText: 'Get Template Pack',
    ctaType: 'buy',
    highlighted: true,
  },
  {
    id: 'custom-enterprise-setup',
    name: 'Corporate Custom Integration',
    price: '$199',
    period: 'custom',
    badge: 'Bespoke',
    description: 'White-label deployment, private CRM integrations, and custom workflow coaching.',
    features: [
      'Custom branded PWA domain & branding',
      'Direct CSV sync from HubSpot / Salesforce / Sheets',
      'Internal team training session (60 mins)',
      'Dedicated deliverability & setup consultant',
      'Custom regex & lead validation rules'
    ],
    ctaText: 'Contact Enterprise Sales',
    ctaType: 'contact',
    highlighted: false,
  },
  {
    id: 'deliverability-audit',
    name: '1-on-1 Deliverability Audit',
    price: '$79',
    period: 'single session',
    description: 'Deep-dive review of your domain records, copy, and inbox placement optimization.',
    features: [
      'Full SPF, DKIM, DMARC, and MX record inspection',
      'Spam word analysis on your top 5 templates',
      'Custom recommendations for sender domain health',
      'Actionable checklist to prevent Gmail clipping'
    ],
    ctaText: 'Book Audit Consultation',
    ctaType: 'contact',
    highlighted: false,
  }
];

