import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Send,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Eye,
  Info,
  Loader2,
  Copy,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import {
  WorkerInputMessage,
  WorkerOutputMessage,
  extractNameFromEmail,
  processEmailList,
  ProcessListResult,
  EMAIL_REGEX,
} from '../../utils/listProcessor';
import ListProcessorWorker from '../../workers/listProcessor.worker?worker';

export const BulkMailForm: React.FC = () => {
  const {
    draft,
    setDraftField,
    applyGeneratedList,
    settings,
    isGenerating,
    setIsGenerating,
    generationProgress,
    setGenerationProgress,
    addToast,
  } = useApp();

  const [validationStats, setValidationStats] = useState<{
    valid: number;
    invalid: number;
    total: number;
    duplicates: number;
    sampleEmail?: string;
  }>({ valid: 0, invalid: 0, total: 0, duplicates: 0 });

  const workerRef = useRef<Worker | null>(null);

  // Debounced input validation
  useEffect(() => {
    const timer = setTimeout(() => {
      const lines = draft.recipients.split(/\r?\n/);
      let total = 0;
      let valid = 0;
      let invalid = 0;
      let duplicates = 0;
      const seen = new Set<string>();
      let firstEmail: string | undefined = undefined;

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        total++;

        // Extract pure email address from potential formatted string
        let rawEmail = trimmed;
        const matchWithBrackets = trimmed.match(/^([^<]+)<([^>]+)>$/);
        if (matchWithBrackets) {
          rawEmail = matchWithBrackets[2].trim();
        } else if (trimmed.includes(',')) {
          const parts = trimmed.split(',');
          if (EMAIL_REGEX.test(parts[0].trim())) {
            rawEmail = parts[0].trim();
          } else if (EMAIL_REGEX.test(parts[1]?.trim() || '')) {
            rawEmail = parts[1].trim();
          }
        }

        const lower = rawEmail.toLowerCase();
        if (EMAIL_REGEX.test(rawEmail)) {
          if (seen.has(lower)) {
            duplicates++;
          } else {
            seen.add(lower);
            valid++;
            if (!firstEmail) {
              firstEmail = rawEmail;
            }
          }
        } else {
          invalid++;
        }
      }

      setValidationStats({
        valid,
        invalid,
        total,
        duplicates,
        sampleEmail: firstEmail,
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [draft.recipients]);

  // Quick fill subjects
  const fillSubject = (text: string) => {
    setDraftField('subject', text);
  };

  // Quick fill bodies
  const fillBody = (text: string) => {
    setDraftField('body', text);
  };

  // Preview first email calculation
  const previewEmail = useMemo(() => {
    if (!validationStats.sampleEmail) return null;
    const sample = validationStats.sampleEmail;
    const name = extractNameFromEmail(sample, settings.fallbackName || 'there');
    const subj = (draft.subject || 'Your Subject Line').replace(/\{name\}/gi, name);
    let body = (draft.body || 'Your email body will appear here...').replace(
      /\{name\}/gi,
      name
    );

    if (settings.enableOptOutFooter && settings.optOutText.trim()) {
      body = `${body}\n\n---\n${settings.optOutText.trim()}`;
    }

    return { to: sample, subject: subj, body };
  }, [
    validationStats.sampleEmail,
    draft.subject,
    draft.body,
    settings.fallbackName,
    settings.enableOptOutFooter,
    settings.optOutText,
  ]);

  const handleGenerate = async () => {
    if (validationStats.total > 10000) {
      addToast(
        'error',
        `Maximum 10,000 recipients allowed. You have ${validationStats.total.toLocaleString()} lines.`
      );
      return;
    }

    if (validationStats.valid === 0) {
      addToast('error', 'Please enter at least one valid recipient email.');
      return;
    }

    if (!draft.subject.trim()) {
      addToast('error', 'Please enter an email subject line.');
      return;
    }

    if (!draft.body.trim()) {
      addToast('error', 'Please enter a message body.');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(5);

    const onComplete = (result: ProcessListResult) => {
      setGenerationProgress(100);
      applyGeneratedList(result.items);
      setIsGenerating(false);

      // Confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#2F6B2F', '#5B21B6', '#14B8A6', '#F59E0B'],
        });
      } catch (e) {
        console.warn('Confetti trigger failed:', e);
      }

      const dupNotice =
        result.stats.duplicateCount > 0
          ? ` (${result.stats.duplicateCount} duplicate${
              result.stats.duplicateCount > 1 ? 's' : ''
            } removed)`
          : '';
      const dncNotice =
        result.stats.doNotContactSkipped > 0
          ? ` (${result.stats.doNotContactSkipped} suppressed)`
          : '';

      addToast(
        'success',
        `Generated ${result.items.length.toLocaleString()} ready-to-send emails!${dupNotice}${dncNotice}`
      );

      // Scroll to generated list
      setTimeout(() => {
        const listElem = document.getElementById('generated-emails-card');
        if (listElem) {
          listElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    };

    const runMainThreadProcessing = async () => {
      try {
        const result = await processEmailList({
          rawRecipients: draft.recipients,
          subjectTemplate: draft.subject,
          bodyTemplate: draft.body,
          fallbackName: settings.fallbackName || 'there',
          doNotContactList: settings.doNotContactList,
          enableOptOutFooter: settings.enableOptOutFooter,
          optOutText: settings.optOutText,
          onProgress: (progress) => {
            setGenerationProgress(progress);
          },
        });
        onComplete(result);
      } catch (err: unknown) {
        setIsGenerating(false);
        addToast(
          'error',
          err instanceof Error
            ? err.message
            : 'An error occurred during list processing.'
        );
      }
    };

    // Terminate existing worker if any
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }

    // Try processing in Web Worker first for best UI responsiveness
    let worker: Worker | null = null;
    try {
      worker = new ListProcessorWorker();
      workerRef.current = worker;
    } catch (e) {
      console.warn('Could not initialize Web Worker, falling back to main thread:', e);
      await runMainThreadProcessing();
      return;
    }

    worker.onmessage = (e: MessageEvent<WorkerOutputMessage>) => {
      const msg = e.data;
      if (!msg) return;

      if (msg.type === 'progress') {
        setGenerationProgress(msg.progress);
      } else if (msg.type === 'complete') {
        onComplete({ items: msg.items, stats: msg.stats });
        if (workerRef.current) {
          workerRef.current.terminate();
          workerRef.current = null;
        }
      } else if (msg.type === 'error') {
        setIsGenerating(false);
        addToast('error', msg.message);
        if (workerRef.current) {
          workerRef.current.terminate();
          workerRef.current = null;
        }
      }
    };

    worker.onerror = async (err) => {
      console.warn('Worker execution failed, seamlessly falling back to main thread:', err);
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      // Seamlessly process on the main thread so user experiences no disruption
      await runMainThreadProcessing();
    };

    const workerPayload: WorkerInputMessage = {
      type: 'process',
      rawRecipients: draft.recipients,
      subjectTemplate: draft.subject,
      bodyTemplate: draft.body,
      fallbackName: settings.fallbackName || 'there',
      doNotContactList: settings.doNotContactList,
      enableOptOutFooter: settings.enableOptOutFooter,
      optOutText: settings.optOutText,
    };

    try {
      worker.postMessage(workerPayload);
    } catch (postErr) {
      console.warn('postMessage failed, running fallback:', postErr);
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      await runMainThreadProcessing();
    }
  };

  return (
    <div
      id="bulk-mail-form-card"
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-6 mb-6 transition-all"
    >
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-[#5B21B6] dark:text-purple-400 flex items-center justify-center font-bold">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-base sm:text-lg text-[#2F6B2F] dark:text-emerald-400">
              Bulk Mail Send
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Prepare personalized emails with one-tap client dispatch
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Recipients Textarea */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
              Recipients Email (Max 10,000)
            </label>
            <span
              className={`text-xs font-medium ${
                validationStats.total > 10000
                  ? 'text-rose-600 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {validationStats.total.toLocaleString()} / 10,000
            </span>
          </div>

          <textarea
            rows={5}
            value={draft.recipients}
            onChange={(e) => setDraftField('recipients', e.target.value)}
            placeholder="Enter each email on a new line&#10;e.g.&#10;alex@company.com&#10;Sarah Connor <sarah@domain.com>&#10;john.smith@tech.org"
            className={`w-full p-3 rounded-xl border text-xs sm:text-sm font-mono transition-all bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 ${
              validationStats.total > 10000
                ? 'border-rose-500 focus:ring-rose-500'
                : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500'
            }`}
          />

          {/* Over-limit Warning */}
          {validationStats.total > 10000 && (
            <div className="mt-1.5 p-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>
                List exceeds maximum limit of 10,000 emails. Please remove{' '}
                {(validationStats.total - 10000).toLocaleString()} entries.
              </span>
            </div>
          )}

          {/* Live Validation Counters */}
          <div className="mt-2 flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Valid: <strong className="text-emerald-700 dark:text-emerald-400">{validationStats.valid}</strong>
              </span>
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                Invalid: <strong className="text-rose-600 dark:text-rose-400">{validationStats.invalid}</strong>
              </span>
              <span>
                Total Lines: <strong className="text-slate-800 dark:text-slate-200">{validationStats.total}</strong>
              </span>
            </div>

            {validationStats.duplicates > 0 && (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                {validationStats.duplicates} duplicate{validationStats.duplicates > 1 ? 's' : ''} auto-removed
              </span>
            )}
          </div>
        </div>

        {/* Subject Line */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
              Subject Line (Max 200 characters)
            </label>
            <span
              className={`text-xs font-medium ${
                draft.subject.length > 200 ? 'text-rose-600' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {draft.subject.length}/200
            </span>
          </div>

          <input
            type="text"
            maxLength={200}
            value={draft.subject}
            onChange={(e) => setDraftField('subject', e.target.value)}
            placeholder="e.g. Quick question for {name} regarding outreach"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />

          {/* Quick-fill chips */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Quick fill:</span>
            <button
              type="button"
              onClick={() => fillSubject('Quick question for {name}')}
              className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
            >
              Quick question
            </button>
            <button
              type="button"
              onClick={() => fillSubject('Partnership exploration with {name}')}
              className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
            >
              Partnership
            </button>
            <button
              type="button"
              onClick={() => fillSubject('Exclusive seasonal offer for {name}')}
              className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
            >
              Exclusive offer
            </button>
          </div>
        </div>

        {/* Message Body */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-1.5">
              <label className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                Message Body (Max 2000 characters)
              </label>
              <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                Use {'{name}'} for smart personalization
              </span>
            </div>
            <span
              className={`text-xs font-medium ${
                draft.body.length > 2000 ? 'text-rose-600' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {draft.body.length}/2000
            </span>
          </div>

          <textarea
            rows={6}
            maxLength={2000}
            value={draft.body}
            onChange={(e) => setDraftField('body', e.target.value)}
            placeholder="Hi {name},&#10;&#10;I noticed your recent milestone and wanted to reach out...&#10;&#10;Best regards,&#10;Your Name"
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-sans"
          />

          {/* Quick-fill message chips */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Quick fill:</span>
            <button
              type="button"
              onClick={() =>
                fillBody(
                  'Hi {name},\n\nI came across your work and wanted to connect briefly. Would you be open to a quick 5-minute chat next week?\n\nBest regards,\nOutreach Specialist'
                )
              }
              className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
            >
              Basic intro
            </button>
            <button
              type="button"
              onClick={() =>
                fillBody(
                  'Hi {name},\n\nI was reviewing your company recent developments and noticed strong synergies with our new workflow platform.\n\nCould we explore if this could benefit your team?\n\nWarm regards,\nLead Consultant'
                )
              }
              className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
            >
              Personalized intro
            </button>
            <button
              type="button"
              onClick={() =>
                fillBody(
                  'Hi {name},\n\nWe would love to invite you as an early beta reviewer for our upcoming release. Your feedback would be invaluable!\n\nLet me know if you would like me to share access.\n\nCheers,\nProduct Team'
                )
              }
              className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
            >
              Invitation
            </button>
          </div>
        </div>

        {/* Live Preview of First Email */}
        {previewEmail && (
          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
              <Eye className="w-4 h-4 text-[#2F6B2F] dark:text-emerald-400" />
              <span>Live First Email Preview</span>
              <span className="text-[10px] font-normal text-slate-500">
                (Personalized for {previewEmail.to})
              </span>
            </div>
            <div className="space-y-1 text-slate-700 dark:text-slate-300">
              <div>
                <strong className="text-slate-500 dark:text-slate-400">To:</strong> {previewEmail.to}
              </div>
              <div>
                <strong className="text-slate-500 dark:text-slate-400">Subject:</strong> {previewEmail.subject}
              </div>
              <div className="mt-2 p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 whitespace-pre-line text-slate-800 dark:text-slate-200 text-xs font-sans">
                {previewEmail.body}
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar (during worker processing) */}
        {isGenerating && (
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-semibold text-purple-700 dark:text-purple-400">
              <span>Processing emails in Web Worker...</span>
              <span>{generationProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-[#5B21B6] h-2.5 rounded-full transition-all duration-150"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Generate Button (Purple #5B21B6) */}
        <button
          type="button"
          disabled={isGenerating || validationStats.total > 10000}
          onClick={handleGenerate}
          className="w-full py-3.5 px-4 rounded-xl bg-[#5B21B6] hover:bg-[#4C1D95] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base shadow-lg shadow-purple-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing Emails... ({generationProgress}%)</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Emails ({validationStats.valid.toLocaleString()} Valid)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

