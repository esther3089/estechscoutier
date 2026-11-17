import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Mail,
  Copy,
  Download,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  Inbox,
  ArrowUp,
  ChevronRight,
  ShieldBan,
  MoreHorizontal,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmailItem } from '../../types';
import { openEmailCompose } from '../../services/mailer';
import { clearSentHistory } from '../../services/db';

const ITEM_HEIGHT = 62; // pixels per row
const OVERSCAN = 12;

export const GeneratedEmailsCard: React.FC = () => {
  const {
    emails,
    filteredEmails,
    markAsSent,
    resetAllSent,
    settings,
    updateSettings,
    addToast,
    scrollToForm,
    refreshStats,
  } = useApp();

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(480);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportScope, setExportScope] = useState<'all' | 'remaining' | 'sent'>('all');
  const [exportFormat, setExportFormat] = useState<'csv' | 'txt'>('csv');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Resize observer to track height
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.height > 0) {
          setContainerHeight(entry.contentRect.height);
        }
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Find next pending email
  const nextPendingEmail = useMemo(() => {
    return emails.find((item) => item.status === 'pending');
  }, [emails]);

  // Virtualization calculations
  const totalCount = filteredEmails.length;
  const totalHeight = totalCount * ITEM_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(
    totalCount,
    Math.floor((scrollTop + containerHeight) / ITEM_HEIGHT) + OVERSCAN
  );

  const visibleItems = useMemo(() => {
    return filteredEmails.slice(startIndex, endIndex).map((item, idx) => ({
      item,
      virtualIndex: startIndex + idx,
      top: (startIndex + idx) * ITEM_HEIGHT,
    }));
  }, [filteredEmails, startIndex, endIndex]);

  // Handle open email compose
  const handleOpenEmail = useCallback(
    async (item: EmailItem) => {
      openEmailCompose(
        item.email,
        item.subject,
        item.body,
        settings.preferredClient
      );
      await markAsSent(item.id);
      addToast('success', `Opened email for ${item.email}`);
    },
    [settings.preferredClient, markAsSent, addToast]
  );

  // Next email handler
  const handleNextEmail = async () => {
    if (!nextPendingEmail) {
      addToast('info', 'All emails in this campaign have been opened and sent!');
      return;
    }
    await handleOpenEmail(nextPendingEmail);

    // Scroll to the item in list
    const index = filteredEmails.findIndex((e) => e.id === nextPendingEmail.id);
    if (index !== -1 && containerRef.current) {
      containerRef.current.scrollTo({
        top: Math.max(0, index * ITEM_HEIGHT - 60),
        behavior: 'smooth',
      });
    }
  };

  // Copy All Emails
  const handleCopyAll = () => {
    if (emails.length === 0) return;
    const list = emails.map((e) => e.email).join('\n');
    navigator.clipboard.writeText(list);
    addToast('success', `Copied ${emails.length.toLocaleString()} email addresses to clipboard!`);
  };

  // Open Export Modal
  const openExport = (scope: 'all' | 'remaining' | 'sent') => {
    setExportScope(scope);
    setExportModalOpen(true);
  };

  // Execute export
  const handleExecuteExport = () => {
    let targetList = emails;
    if (exportScope === 'remaining') {
      targetList = emails.filter((e) => e.status === 'pending');
    } else if (exportScope === 'sent') {
      targetList = emails.filter((e) => e.status === 'sent');
    }

    if (targetList.length === 0) {
      addToast('info', 'No emails match the selected export filter.');
      setExportModalOpen(false);
      return;
    }

    let fileContent = '';
    let mimeType = 'text/plain';
    const dateStr = new Date().toISOString().slice(0, 10);
    let filename = `estechscoutier_${exportScope}_${dateStr}`;

    if (exportFormat === 'csv') {
      mimeType = 'text/csv;charset=utf-8;';
      filename += '.csv';
      const rows = [
        ['Index', 'Email', 'Name', 'Status', 'Sent At', 'Subject', 'Message Body'],
        ...targetList.map((e) => [
          e.index.toString(),
          `"${e.email.replace(/"/g, '""')}"`,
          `"${e.name.replace(/"/g, '""')}"`,
          e.status,
          e.sentAt ? new Date(e.sentAt).toISOString() : '',
          `"${e.subject.replace(/"/g, '""')}"`,
          `"${e.body.replace(/"/g, '""')}"`,
        ]),
      ];
      fileContent = rows.map((r) => r.join(',')).join('\n');
    } else {
      mimeType = 'text/plain;charset=utf-8;';
      filename += '.txt';
      fileContent = targetList.map((e) => `${e.index}. ${e.email}`).join('\n');
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast('success', `Exported ${targetList.length.toLocaleString()} emails as ${exportFormat.toUpperCase()}!`);
    setExportModalOpen(false);
  };

  // Clear Sent History
  const handleClearSentHistory = async () => {
    await clearSentHistory();
    await resetAllSent();
    await refreshStats();
    addToast('info', 'Sent history and sent markers reset.');
  };

  const handleAddToDnc = (email: string) => {
    const clean = email.trim().toLowerCase();
    if (!settings.doNotContactList.includes(clean)) {
      updateSettings({
        doNotContactList: [clean, ...settings.doNotContactList],
      });
      addToast('success', `Added ${clean} to Do Not Contact list.`);
    } else {
      addToast('info', `${clean} is already in the Do Not Contact list.`);
    }
    setActiveMenuId(null);
  };

  return (
    <div
      id="generated-emails-card"
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-6 mb-6 transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-[#5B21B6] dark:text-purple-400 flex items-center justify-center font-bold">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-base sm:text-lg text-[#2F6B2F] dark:text-emerald-400">
              Generated Emails ({emails.length.toLocaleString()})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Numbered sequence with 1-tap client launcher
            </p>
          </div>
        </div>

        {/* Quick Next Email Button */}
        {nextPendingEmail && (
          <button
            onClick={handleNextEmail}
            className="self-start sm:self-auto px-4 py-2 bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <span>Next Email (#{nextPendingEmail.index})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {emails.length === 0 ? (
        /* Empty State */
        <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-slate-800 text-[#2F6B2F] dark:text-emerald-400 flex items-center justify-center mb-3 border border-emerald-100 dark:border-slate-700">
            <Inbox className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100 mb-1">
            No Emails Generated
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-4">
            Add recipients and tap <strong>Generate Emails</strong> to create your email links.
          </p>
          <button
            onClick={scrollToForm}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#2F6B2F] dark:text-emerald-400 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
          >
            <ArrowUp className="w-4 h-4" />
            <span>Go to Email Form</span>
          </button>
        </div>
      ) : (
        <>
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <button
              onClick={handleCopyAll}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Copy all emails to clipboard"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy All</span>
            </button>

            <button
              onClick={() => openExport('all')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export All</span>
            </button>

            <button
              onClick={() => openExport('remaining')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Remaining</span>
            </button>

            <button
              onClick={() => openExport('sent')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Sent</span>
            </button>

            <button
              onClick={handleClearSentHistory}
              className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors ml-auto"
              title="Reset status of all rows back to pending"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Sent History</span>
            </button>
          </div>

          {/* Hint banner */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span>
              Tap an email to open it in your mail app. <strong>Orange = already opened.</strong>
            </span>
          </div>

          {/* Virtualized Email List Container */}
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="relative h-96 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/40 dark:bg-slate-950/40"
          >
            <div style={{ height: totalHeight, position: 'relative' }}>
              {visibleItems.map(({ item, top }) => {
                const isSent = item.status === 'sent';
                return (
                  <div
                    key={item.id}
                    style={{
                      position: 'absolute',
                      top: `${top}px`,
                      height: `${ITEM_HEIGHT}px`,
                      left: 0,
                      right: 0,
                    }}
                    className="p-1 px-2"
                  >
                    <div
                      className={`h-full flex items-center justify-between px-3 rounded-xl border transition-all cursor-pointer ${
                        isSent
                          ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300/70 dark:border-amber-800/60 text-amber-950 dark:text-amber-100'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/70 text-slate-800 dark:text-slate-100 shadow-sm'
                      }`}
                      onClick={() => handleOpenEmail(item)}
                    >
                      {/* Left: Number, Email, Name */}
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <span className="font-mono text-xs font-bold text-slate-400 shrink-0 w-8">
                          {item.index}.
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-medium truncate">
                              {item.email}
                            </span>
                            {item.name && item.name !== 'there' && (
                              <span className="hidden xs:inline-block px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 font-sans">
                                {item.name}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-xs">
                            {item.subject}
                          </div>
                        </div>
                      </div>

                      {/* Right: Badge, Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isSent ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-sm">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Sent</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                            <Clock className="w-3 h-3" />
                            <span>Pending</span>
                          </span>
                        )}

                        {/* Row Quick Menu */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === item.id ? null : item.id);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5"
                            title="Row options"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {activeMenuId === item.id && (
                            <div
                              className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-30 text-xs animate-in fade-in"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => handleOpenEmail(item)}
                                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Open in Mail App</span>
                              </button>
                              <button
                                onClick={() => handleAddToDnc(item.email)}
                                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400"
                              >
                                <ShieldBan className="w-3.5 h-3.5" />
                                <span>Do Not Contact</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Export Options Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setExportModalOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl z-10 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Export {exportScope.toUpperCase()} Emails
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Choose Format
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setExportFormat('csv')}
                  className={`py-2 rounded-xl border text-center transition-all ${
                    exportFormat === 'csv'
                      ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                      : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  CSV (Full Spreadsheet)
                </button>
                <button
                  type="button"
                  onClick={() => setExportFormat('txt')}
                  className={`py-2 rounded-xl border text-center transition-all ${
                    exportFormat === 'txt'
                      ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                      : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  TXT (Plain List)
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setExportModalOpen(false)}
                className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteExport}
                className="px-4 py-2 rounded-xl bg-[#2F6B2F] hover:bg-emerald-800 text-white shadow-md"
              >
                Download File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

