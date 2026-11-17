import React, { useState } from 'react';
import {
  X,
  Settings,
  Mail,
  User,
  ShieldBan,
  FileDown,
  FileUp,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MailClientPreference } from '../types';
import {
  getAllEmails,
  getCustomTemplates,
  resetAllIndexedDB,
  saveGeneratedEmails,
  saveCustomTemplate,
} from '../services/db';
import { clearAllLocalStorage, saveSettings } from '../services/storage';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    settings,
    updateSettings,
    addToast,
    refreshStats,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'general' | 'dnc' | 'backup'>('general');
  const [newDncEmail, setNewDncEmail] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isSettingsOpen) return null;

  const handleAddDnc = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newDncEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      addToast('error', 'Please enter a valid email address.');
      return;
    }

    if (settings.doNotContactList.includes(clean)) {
      addToast('info', 'Address is already on the Do Not Contact list.');
      return;
    }

    updateSettings({
      doNotContactList: [clean, ...settings.doNotContactList],
    });
    setNewDncEmail('');
    addToast('success', `Added ${clean} to Do Not Contact list.`);
  };

  const handleRemoveDnc = (emailToRemove: string) => {
    updateSettings({
      doNotContactList: settings.doNotContactList.filter((e) => e !== emailToRemove),
    });
    addToast('info', `Removed ${emailToRemove} from suppression list.`);
  };

  const handleExportBackup = async () => {
    try {
      const emails = await getAllEmails();
      const customTemplates = await getCustomTemplates();
      const backupData = {
        app: 'EstechScoutier',
        version: '1.0',
        exportedAt: new Date().toISOString(),
        settings,
        customTemplates,
        emails,
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `estechscoutier_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast('success', 'Backup exported successfully!');
    } catch (err) {
      console.error(err);
      addToast('error', 'Failed to generate backup export.');
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);

        if (!data.app || data.app !== 'EstechScoutier') {
          addToast('error', 'Invalid EstechScoutier backup file.');
          return;
        }

        if (data.settings) {
          updateSettings(data.settings);
        }

        if (Array.isArray(data.customTemplates)) {
          for (const t of data.customTemplates) {
            await saveCustomTemplate(t);
          }
        }

        if (Array.isArray(data.emails)) {
          await saveGeneratedEmails(data.emails);
        }

        await refreshStats();
        addToast('success', 'Backup restored successfully!');
      } catch (err) {
        console.error(err);
        addToast('error', 'Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handleResetAll = async () => {
    try {
      await resetAllIndexedDB();
      clearAllLocalStorage();
      setConfirmReset(false);
      addToast('info', 'All data reset. Reloading application...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error(err);
      addToast('error', 'Failed to reset data.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
        onClick={() => setIsSettingsOpen(false)}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-[#2F6B2F] dark:text-emerald-400" />
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">
              Preferences & Data
            </h3>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950/40 px-4 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-2.5 px-3 border-b-2 transition-all ${
              activeTab === 'general'
                ? 'border-[#2F6B2F] dark:border-emerald-400 text-[#2F6B2F] dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            General & Sending
          </button>
          <button
            onClick={() => setActiveTab('dnc')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'dnc'
                ? 'border-[#2F6B2F] dark:border-emerald-400 text-[#2F6B2F] dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Do Not Contact
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px]">
              {settings.doNotContactList.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-2.5 px-3 border-b-2 transition-all ${
              activeTab === 'backup'
                ? 'border-[#2F6B2F] dark:border-emerald-400 text-[#2F6B2F] dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Backup & Reset
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-sm">
          {activeTab === 'general' && (
            <div className="space-y-4">
              {/* Preferred Mail Client */}
              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  Preferred Mail App
                </label>
                <select
                  value={settings.preferredClient}
                  onChange={(e) =>
                    updateSettings({
                      preferredClient: e.target.value as MailClientPreference,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  <option value="auto">Auto (Detect device, Gmail app or Web)</option>
                  <option value="gmail_app">Gmail App (Android Intent / iOS Scheme)</option>
                  <option value="gmail_web">Gmail Web Compose (Browser)</option>
                  <option value="outlook_web">Outlook Web Compose (Browser)</option>
                  <option value="default_app">Default Mail App (Standard mailto)</option>
                </select>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  How emails open when tapped in the generated outreach list.
                </p>
              </div>

              {/* Personalization Fallback Name */}
              <div>
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  Personalization Fallback Name
                </label>
                <input
                  type="text"
                  value={settings.fallbackName}
                  onChange={(e) => updateSettings({ fallbackName: e.target.value })}
                  placeholder="e.g. there, friend"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Used in place of <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-emerald-600 dark:text-emerald-400">{'{name}'}</code> when no real name can be parsed.
                </p>
              </div>

              {/* Opt-out Footer Configuration */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800 dark:text-slate-200 text-sm cursor-pointer">
                    Enable Responsible Opt-Out Footer
                  </label>
                  <input
                    type="checkbox"
                    checked={settings.enableOptOutFooter}
                    onChange={(e) => updateSettings({ enableOptOutFooter: e.target.checked })}
                    className="w-4 h-4 rounded text-[#2F6B2F] focus:ring-emerald-500 accent-[#2F6B2F]"
                  />
                </div>
                {settings.enableOptOutFooter && (
                  <div>
                    <input
                      type="text"
                      value={settings.optOutText}
                      onChange={(e) => updateSettings({ optOutText: e.target.value })}
                      placeholder="e.g. Reply STOP if you'd rather not hear from me"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 text-xs"
                    />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Appended automatically at the bottom of generated messages.
                    </p>
                  </div>
                )}
              </div>

              {/* Local Analytics Consent */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                      Anonymous Local Analytics
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Helps track 24h counters locally. No third-party tracking scripts.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.analyticsConsent}
                    onChange={(e) => updateSettings({ analyticsConsent: e.target.checked })}
                    className="w-4 h-4 rounded text-[#2F6B2F] focus:ring-emerald-500 accent-[#2F6B2F]"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dnc' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <ShieldBan className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>
                  Addresses in this list will be strictly skipped during generation so you never accidentally contact unsubscribed recipients.
                </span>
              </div>

              {/* Add form */}
              <form onSubmit={handleAddDnc} className="flex gap-2">
                <input
                  type="email"
                  value={newDncEmail}
                  onChange={(e) => setNewDncEmail(e.target.value)}
                  placeholder="recipient@example.com"
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-[#2F6B2F] hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </form>

              {/* List */}
              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                {settings.doNotContactList.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No addresses on suppression list.
                  </div>
                ) : (
                  settings.doNotContactList.map((addr) => (
                    <div
                      key={addr}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs"
                    >
                      <span className="font-mono text-slate-700 dark:text-slate-300">{addr}</span>
                      <button
                        onClick={() => handleRemoveDnc(addr)}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                        title="Remove from DNC"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-5">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                  Full Browser Storage Backup
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Export all your custom templates, generated campaigns, preferences, and suppression lists into a single portable JSON file.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={handleExportBackup}
                    className="px-3.5 py-2 bg-[#2F6B2F] hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <FileDown className="w-4 h-4" /> Export Backup
                  </button>

                  <label className="px-3.5 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all">
                    <FileUp className="w-4 h-4" /> Restore Backup
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Factory Reset */}
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/50 space-y-2">
                <div className="font-semibold text-rose-800 dark:text-rose-300 text-sm flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Danger Zone: Reset All Data
                </div>
                <p className="text-xs text-rose-700/80 dark:text-rose-300/80">
                  Clears all indexedDB databases, local drafts, campaign lists, and templates permanently.
                </p>
                {confirmReset ? (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleResetAll}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                      Yes, Delete Everything
                    </button>
                    <button
                      onClick={() => setConfirmReset(false)}
                      className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmReset(true)}
                    className="px-3 py-1.5 bg-rose-100 dark:bg-rose-900/50 hover:bg-rose-200 text-rose-700 dark:text-rose-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset All Local Data
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

