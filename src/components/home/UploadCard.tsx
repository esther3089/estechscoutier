import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertTriangle, CheckCircle, FileSpreadsheet } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const EMAIL_REGEX = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+/g;

export const UploadCard: React.FC = () => {
  const { draft, setDraftField, addToast } = useApp();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'csv' && ext !== 'txt') {
        addToast('error', 'Only .csv and .txt files are supported.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      addToast('error', 'Please choose a .csv or .txt file first.');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const ext = selectedFile.name.split('.').pop()?.toLowerCase();

        const extractedLines: string[] = [];
        let detectedNamesCount = 0;

        if (ext === 'csv') {
          // Parse CSV
          const rawLines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
          if (rawLines.length > 0) {
            // Check headers
            const headerRow = rawLines[0].split(',').map((h) => h.trim().toLowerCase().replace(/["']/g, ''));
            let emailColIdx = headerRow.findIndex((h) => h.includes('email') || h.includes('mail') || h === 'to');
            let nameColIdx = headerRow.findIndex(
              (h) => h.includes('first') || h.includes('name') || h === 'contact' || h === 'lead'
            );

            const startIdx = (emailColIdx !== -1 || nameColIdx !== -1) ? 1 : 0;

            for (let i = startIdx; i < rawLines.length; i++) {
              const line = rawLines[i];
              // Basic CSV row tokenizer considering possible quotes
              const cols = line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));

              let email = '';
              let name = '';

              if (emailColIdx !== -1 && cols[emailColIdx]) {
                const matches = cols[emailColIdx].match(EMAIL_REGEX);
                if (matches && matches.length > 0) email = matches[0];
              }

              // Fallback: search all cols for email if colIdx failed
              if (!email) {
                for (const col of cols) {
                  const m = col.match(EMAIL_REGEX);
                  if (m && m.length > 0) {
                    email = m[0];
                    break;
                  }
                }
              }

              if (nameColIdx !== -1 && cols[nameColIdx]) {
                name = cols[nameColIdx];
              }

              if (email) {
                if (name && name.length > 1) {
                  extractedLines.push(`${name} <${email}>`);
                  detectedNamesCount++;
                } else {
                  extractedLines.push(email);
                }
              }
            }
          }
        } else {
          // Plain TXT: extract all emails via regex
          const matches = text.match(EMAIL_REGEX) || [];
          for (const m of matches) {
            extractedLines.push(m);
          }
        }

        if (extractedLines.length === 0) {
          addToast('error', 'No valid email addresses found in the uploaded file.');
          setIsProcessing(false);
          return;
        }

        // Append to existing recipients (or replace if empty)
        const current = draft.recipients.trim();
        const combined = current ? `${current}\n${extractedLines.join('\n')}` : extractedLines.join('\n');

        setDraftField('recipients', combined);

        const nameMsg = detectedNamesCount > 0 ? ` (${detectedNamesCount} with personalized names)` : '';
        addToast('success', `Added ${extractedLines.length.toLocaleString()} emails from ${selectedFile.name}${nameMsg}!`);

        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        console.error(err);
        addToast('error', 'Error reading uploaded file.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      addToast('error', 'Failed to read file.');
      setIsProcessing(false);
    };

    reader.readAsText(selectedFile);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-6 mb-6 transition-all">
      <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-[#2F6B2F] dark:text-emerald-400 flex items-center justify-center font-bold">
          <Upload className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-bold text-base sm:text-lg text-[#2F6B2F] dark:text-emerald-400">
            Upload CSV or TXT
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload a file containing email addresses (Max. 10,000)
          </p>
        </div>
      </div>

      {/* Yellow Tip Box */}
      <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <p>
          <strong>Pro Tip:</strong> Split a list with over 10,000 emails into smaller parts to avoid lag or crashes.
          If your CSV includes a "Name" column, EstechScoutier will automatically use real names for {'{name}'} personalization!
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Choose File input & label */}
        <div className="flex-1 flex items-center gap-2 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
          <label className="shrink-0 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-800 dark:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors shadow-sm">
            Choose File
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <span className="text-xs text-slate-600 dark:text-slate-300 truncate font-mono">
            {selectedFile ? selectedFile.name : 'No file selected (.csv or .txt)'}
          </span>
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isProcessing}
          className="px-5 py-2.5 rounded-xl bg-[#2F6B2F] hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          <span>Upload List</span>
        </button>
      </div>
    </div>
  );
};

