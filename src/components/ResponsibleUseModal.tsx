import React from 'react';
import { ShieldCheck, Check, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ResponsibleUseModal: React.FC = () => {
  const {
    showResponsibleUseModal,
    setShowResponsibleUseModal,
    updateSettings,
    addToast,
  } = useApp();

  if (!showResponsibleUseModal) return null;

  const handleAccept = () => {
    updateSettings({ responsibleUseAccepted: true });
    setShowResponsibleUseModal(false);
    addToast('success', 'Responsible outreach guidelines acknowledged.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-[#2F6B2F] dark:text-emerald-400 flex items-center justify-center mb-4">
          <ShieldCheck className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Responsible Outreach Commitment
        </h3>

        <div className="text-sm text-slate-600 dark:text-slate-300 space-y-3 mb-6">
          <p>
            Welcome to <strong>EstechScoutier</strong>. This tool is built to streamline 1-on-1 personal email communications directly from your own mail client.
          </p>
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/60 text-xs space-y-2 text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Legitimate Consent & Relevance:</strong> Only reach out to individuals who have consented to hear from you or are bona fide business contacts.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Clear Identity:</strong> Always state your true identity, business purpose, and valid contact details.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Easy Opt-Out:</strong> Honor unsubscribe requests immediately. EstechScoutier automatically includes an opt-out line and maintains your local Do-Not-Contact list.
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            Note: EstechScoutier never sends automated bulk emails from a server; you remain in direct control of every message sent from your own email application.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleAccept}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#2F6B2F] hover:bg-emerald-800 text-white font-semibold text-sm transition-all shadow-md active:scale-95"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};

