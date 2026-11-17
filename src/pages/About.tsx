import React, { useState } from 'react';
import {
  Info,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Smartphone,
  Upload,
  Send,
  HelpCircle,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const About: React.FC = () => {
  const { setActiveTab } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const steps = [
    {
      num: '01',
      title: 'Import or Paste Your Recipient List',
      icon: <Upload className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      desc: 'Paste up to 10,000 email addresses into the box or upload a .csv / .txt file. EstechScoutier will automatically deduplicate and validate each entry.',
    },
    {
      num: '02',
      title: 'Personalize with {name} Placeholders',
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      desc: 'Craft your subject line and email body. Insert {name} anywhere—the app smartly detects real names or guesses them from email handles.',
    },
    {
      num: '03',
      title: 'Generate in Background Web Worker',
      icon: <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      desc: 'Hit Generate Emails. The high-performance Web Worker formats thousands of personal links in milliseconds without freezing your browser.',
    },
    {
      num: '04',
      title: '1-Tap Client Dispatch & Verification',
      icon: <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      desc: 'Tap each email or press "Next Email". It opens pre-filled directly in your preferred email app (Gmail, Outlook, or native Mail) ready to send.',
    },
  ];

  const faqs = [
    {
      q: 'Does EstechScoutier send emails from its own servers?',
      a: 'No. EstechScoutier has no email backend server. It constructs pre-filled compose URLs (Gmail app intent, iOS scheme, Gmail web, Outlook web, or mailto) and launches them directly into your verified email client on your phone or laptop.',
    },
    {
      q: 'Why is client-side sending superior to bulk SMTP servers?',
      a: 'Bulk SMTP servers and shared marketing IP pools are frequently blocked or routed into the Spam or Promotions tab. By sending directly through your personal, authenticated email client, your messages come from your real corporate/personal IP address with 100% DKIM and SPF integrity.',
    },
    {
      q: 'Is my recipient data uploaded to any cloud service?',
      a: 'Never. All recipient parsing, template management, and contact records stay strictly inside your local browser via localStorage and IndexedDB. You can work completely offline.',
    },
    {
      q: 'How does {name} smart personalization work?',
      a: 'If you upload a CSV with a "Name" column, it uses that exact name. If only email is provided (e.g. john.smith@company.com), it extracts and capitalizes "John". If the address is generic, it uses your custom fallback word (e.g. "there").',
    },
    {
      q: 'Can I stop someone from being emailed again?',
      a: 'Yes! You can add any recipient to the "Do Not Contact" list in Preferences or via the quick menu on any generated row. Any future generation will automatically suppress those addresses.',
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#2F6B2F] to-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold mb-3 backdrop-blur-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            100% Serverless &bull; Privacy First
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            What is EstechScoutier?
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed mb-5">
            EstechScoutier is a mobile-first, high-throughput email outreach companion. It transforms bulk recipient lists into sequenced, one-tap pre-filled compose links for your favorite email client—giving you 100% control over every send without triggering spam filters.
          </p>
          <button
            onClick={() => setActiveTab('home')}
            className="px-5 py-2.5 rounded-xl bg-white text-[#2F6B2F] font-bold text-xs sm:text-sm hover:bg-emerald-50 active:scale-95 transition-all shadow-md inline-flex items-center gap-2"
          >
            <span>Start Outreach Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step by Step Guide */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-[#2F6B2F] dark:text-emerald-400" />
          <span>How It Works: Step-by-Step</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {steps.map((step) => (
            <div
              key={step.num}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 relative"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                  {step.icon}
                </div>
                <span className="font-mono text-2xl font-black text-slate-300 dark:text-slate-700">
                  {step.num}
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                {step.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Core Architectural Guarantees */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Why Outreach Pros Love EstechScoutier
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-slate-700 dark:text-slate-300 space-y-1.5">
            <div className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
              0% Spam Folder Risk
            </div>
            <p>
              By sending through your real mail client, your outbound message inherits your email account's reputation and DKIM signatures.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 text-slate-700 dark:text-slate-300 space-y-1.5">
            <div className="font-bold text-purple-800 dark:text-purple-300 text-sm">
              10,000 Email Capacity
            </div>
            <p>
              Dedicated Web Worker threading processes 10,000 lines in background batches with virtualized list rendering for zero UI freeze.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-slate-700 dark:text-slate-300 space-y-1.5">
            <div className="font-bold text-blue-800 dark:text-blue-300 text-sm">
              100% Offline PWA
            </div>
            <p>
              Install EstechScoutier on Android, iOS, Windows, or Mac. Operates completely without internet connection once installed.
            </p>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#2F6B2F] dark:text-emerald-400" />
          <span>Frequently Asked Questions</span>
        </h2>

        <div className="space-y-2.5">
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-3.5 text-left bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-180 text-emerald-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="p-3.5 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200/60 dark:border-slate-800 animate-in fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

