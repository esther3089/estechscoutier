import React from 'react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { setShowResponsibleUseModal, setIsSettingsOpen } = useApp();

  return (
    <footer className="mt-12 mb-20 lg:mb-8 pt-8 pb-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-md mx-auto space-y-3 px-4">
        <div className="flex items-center justify-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
          <div className="w-5 h-5 rounded bg-[#2F6B2F] text-white flex items-center justify-center font-bold text-[10px]">
            ES
          </div>
          <span>EstechScoutier Bulk Outreach Helper</span>
        </div>

        <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
          Client-side outreach utility. All processing executes securely in your local browser sandbox.
          No backend email sending server.
        </p>

        <div className="flex items-center justify-center gap-4 text-[11px]">
          <button
            onClick={() => setShowResponsibleUseModal(true)}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 underline underline-offset-2 transition-colors"
          >
            Responsible Use
          </button>
          <span>&bull;</span>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 underline underline-offset-2 transition-colors"
          >
            Preferences
          </button>
          <span>&bull;</span>
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 underline underline-offset-2 transition-colors"
          >
            Back to Top
          </a>
        </div>

        <div className="pt-2 text-[11px] text-slate-400 dark:text-slate-500">
          &copy; 2026 EstechScoutier. All rights reserved. Developed with pride by Estech Scoutier Engineering.
        </div>
      </div>
    </footer>
  );
};
