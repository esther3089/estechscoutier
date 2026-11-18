import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  EmailItem,
  EmailTemplate,
  AppSettings,
  ScheduleConfig,
  CampaignStats,
} from '../types';
import {
  loadSettings,
  saveSettings,
  loadDraft,
  saveDraft,
  loadSchedule,
  saveSchedule,
  DraftState,
  DEFAULT_SETTINGS,
} from '../services/storage';
import {
  getAllEmails,
  saveGeneratedEmails,
  updateEmailStatus,
  clearAllEmails,
  resetSentStatus as dbResetSentStatus,
  getSentCountLast24h,
  getCustomTemplates,
  saveCustomTemplate,
  deleteCustomTemplate as dbDeleteCustomTemplate,
  clearSentHistory,
} from '../services/db';
import { BUILTIN_TEMPLATES } from '../data/defaultTemplates';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export type NavTab = 'home' | 'about' | 'blog' | 'shop' | 'videos';

interface AppContextValue {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  draft: DraftState;
  setDraftField: (field: keyof DraftState, value: string) => void;
  schedule: ScheduleConfig;
  updateSchedule: (partial: Partial<ScheduleConfig>) => void;
  emails: EmailItem[];
  filteredEmails: EmailItem[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: 'all' | 'sent' | 'pending';
  setStatusFilter: (f: 'all' | 'sent' | 'pending') => void;
  stats: CampaignStats;
  templates: EmailTemplate[];
  addCustomTemplate: (template: Omit<EmailTemplate, 'id' | 'isCustom' | 'createdAt'>) => Promise<void>;
  updateCustomTemplate: (template: EmailTemplate) => Promise<void>;
  removeCustomTemplate: (id: string) => Promise<void>;
  markAsSent: (id: string) => Promise<void>;
  resetAllSent: () => Promise<void>;
  clearCampaign: () => Promise<void>;
  applyGeneratedList: (items: EmailItem[]) => Promise<void>;
  isGenerating: boolean;
  setIsGenerating: (g: boolean) => void;
  generationProgress: number;
  setGenerationProgress: (p: number) => void;
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
  removeToast: (id: string) => void;
  refreshStats: () => Promise<void>;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  showResponsibleUseModal: boolean;
  setShowResponsibleUseModal: (show: boolean) => void;
  scrollToForm: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  installApp: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const VALID_TABS: NavTab[] = ['home', 'about', 'blog', 'shop', 'videos'];

function getInitialTab(): NavTab {
  try {
    const hash = window.location.hash.replace('#/', '').replace('#', '').toLowerCase();
    if (VALID_TABS.includes(hash as NavTab)) {
      return hash as NavTab;
    }
  } catch {}
  return 'home';
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<NavTab>(getInitialTab);

  const setActiveTab = useCallback((tab: NavTab) => {
    setActiveTabState(tab);
    window.location.hash = '/' + tab;
  }, []);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '').toLowerCase();
      if (VALID_TABS.includes(hash as NavTab)) {
        setActiveTabState(hash as NavTab);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);
  const [settings, setSettingsState] = useState<AppSettings>(loadSettings);
  const [draft, setDraftState] = useState<DraftState>(loadDraft);
  const [schedule, setScheduleState] = useState<ScheduleConfig>(loadSchedule);
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [customTemplates, setCustomTemplates] = useState<EmailTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'sent' | 'pending'>('all');
  const [sent24h, setSent24h] = useState(0);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showResponsibleUseModal, setShowResponsibleUseModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as unknown as { standalone?: boolean }).standalone === true
      );
    }
    return false;
  });

  // Initialize theme on HTML root element
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Responsible use first-time prompt check
  useEffect(() => {
    if (!settings.responsibleUseAccepted) {
      setShowResponsibleUseModal(true);
    }
  }, [settings.responsibleUseAccepted]);

  // Load emails & custom templates from IndexedDB on startup
  useEffect(() => {
    getAllEmails().then(setEmails).catch(console.error);
    getCustomTemplates().then(setCustomTemplates).catch(console.error);
    getSentCountLast24h().then(setSent24h).catch(console.error);

    // Refresh 24h sent count every minute as required by prompt
    const interval = setInterval(() => {
      getSentCountLast24h().then(setSent24h).catch(console.error);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const addToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);

    // Auto dismiss after 3.8s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Listen for PWA installation prompts
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      addToast('success', 'EScoutier was installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [addToast]);

  const installApp = useCallback(async () => {
    if (!deferredPrompt) {
      addToast('info', 'To install on this device, open your browser menu and choose "Install App" or "Add to Home Screen".');
      return;
    }
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult && choiceResult.outcome === 'accepted') {
        addToast('success', 'Installing EScoutier...');
        setDeferredPrompt(null);
      } else {
        addToast('info', 'Installation was cancelled');
      }
    } catch (err) {
      console.error('PWA install error:', err);
    }
  }, [deferredPrompt, addToast]);

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...partial };
      saveSettings(next);
      return next;
    });
  }, []);

  const setDraftField = useCallback((field: keyof DraftState, value: string) => {
    setDraftState((prev) => {
      const next = { ...prev, [field]: value };
      saveDraft(next);
      return next;
    });
  }, []);

  const updateSchedule = useCallback((partial: Partial<ScheduleConfig>) => {
    setScheduleState((prev) => {
      const next = { ...prev, ...partial };
      saveSchedule(next);
      return next;
    });
  }, []);

  const refreshStats = useCallback(async () => {
    const freshEmails = await getAllEmails();
    setEmails(freshEmails);
    const count24h = await getSentCountLast24h();
    setSent24h(count24h);
  }, []);

  const markAsSent = useCallback(async (id: string) => {
    const now = Date.now();
    await updateEmailStatus(id, 'sent', now);
    setEmails((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'sent', sentAt: now } : item))
    );
    const count24h = await getSentCountLast24h();
    setSent24h(count24h);
  }, []);

  const resetAllSent = useCallback(async () => {
    await dbResetSentStatus();
    setEmails((prev) => prev.map((item) => ({ ...item, status: 'pending', sentAt: undefined })));
    addToast('info', 'All emails marked as pending.');
  }, [addToast]);

  const clearCampaign = useCallback(async () => {
    await clearAllEmails();
    setEmails([]);
    addToast('info', 'Campaign list cleared.');
  }, [addToast]);

  const applyGeneratedList = useCallback(
    async (items: EmailItem[]) => {
      await saveGeneratedEmails(items);
      setEmails(items);
    },
    []
  );

  const addCustomTemplate = useCallback(
    async (template: Omit<EmailTemplate, 'id' | 'isCustom' | 'createdAt'>) => {
      const newTemplate: EmailTemplate = {
        ...template,
        id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        isCustom: true,
        createdAt: Date.now(),
      };
      await saveCustomTemplate(newTemplate);
      setCustomTemplates((prev) => [newTemplate, ...prev]);
      addToast('success', `Template "${newTemplate.name}" created!`);
    },
    [addToast]
  );

  const updateCustomTemplate = useCallback(
    async (template: EmailTemplate) => {
      await saveCustomTemplate(template);
      setCustomTemplates((prev) =>
        prev.map((t) => (t.id === template.id ? template : t))
      );
      addToast('success', `Template "${template.name}" updated!`);
    },
    [addToast]
  );

  const removeCustomTemplate = useCallback(
    async (id: string) => {
      await dbDeleteCustomTemplate(id);
      setCustomTemplates((prev) => prev.filter((t) => t.id !== id));
      addToast('info', 'Template deleted.');
    },
    [addToast]
  );

  // Filtered emails based on search query & status filter
  const filteredEmails = useMemo(() => {
    let result = emails;

    if (statusFilter !== 'all') {
      result = result.filter((item) => item.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(
        (item) =>
          item.email.toLowerCase().includes(query) ||
          item.name.toLowerCase().includes(query) ||
          item.status.toLowerCase().includes(query)
      );
    }

    return result;
  }, [emails, statusFilter, searchQuery]);

  // Live Campaign Stats calculation
  const stats: CampaignStats = useMemo(() => {
    const totalGenerated = emails.length;
    const sent = emails.filter((e) => e.status === 'sent').length;
    const remaining = Math.max(0, totalGenerated - sent);
    const completionRate =
      totalGenerated > 0 ? Math.round((sent / totalGenerated) * 100) : 0;

    return {
      totalGenerated,
      sent,
      remaining,
      sent24h,
      completionRate,
    };
  }, [emails, sent24h]);

  const allTemplates = useMemo(() => {
    return [...customTemplates, ...BUILTIN_TEMPLATES];
  }, [customTemplates]);

  const scrollToForm = useCallback(() => {
    const element = document.getElementById('bulk-mail-form-card');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const value: AppContextValue = {
    activeTab,
    setActiveTab,
    settings,
    updateSettings,
    draft,
    setDraftField,
    schedule,
    updateSchedule,
    emails,
    filteredEmails,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    stats,
    templates: allTemplates,
    addCustomTemplate,
    updateCustomTemplate,
    removeCustomTemplate,
    markAsSent,
    resetAllSent,
    clearCampaign,
    applyGeneratedList,
    isGenerating,
    setIsGenerating,
    generationProgress,
    setGenerationProgress,
    toasts,
    addToast,
    removeToast,
    refreshStats,
    isDrawerOpen,
    setIsDrawerOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    showResponsibleUseModal,
    setShowResponsibleUseModal,
    scrollToForm,
    isInstallable: !!deferredPrompt && !isInstalled,
    isInstalled,
    installApp,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

