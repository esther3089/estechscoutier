import { AppSettings, ScheduleConfig } from '../types';

const SETTINGS_KEY = 'estech_scoutier_settings';
const DRAFT_KEY = 'estech_scoutier_draft';
const SCHEDULE_KEY = 'estech_scoutier_schedule';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  preferredClient: 'auto',
  fallbackName: 'there',
  enableOptOutFooter: false,
  optOutText: '',
  doNotContactList: [],
  analyticsConsent: false,
  responsibleUseAccepted: false,
};

export interface DraftState {
  recipients: string;
  subject: string;
  body: string;
}

export const DEFAULT_DRAFT: DraftState = {
  recipients: '',
  subject: '',
  body: '',
};

export const DEFAULT_SCHEDULE: ScheduleConfig = {
  enabled: false,
  scheduledTime: null,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);

    // Disable unwanted automated opt-out footer migration
    if (!localStorage.getItem('estech_optout_disabled_v2')) {
      parsed.enableOptOutFooter = false;
      parsed.optOutText = '';
      localStorage.setItem('estech_optout_disabled_v2', 'true');
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...DEFAULT_SETTINGS, ...parsed }));
    }

    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (e) {
    console.error('Failed to load settings:', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function loadDraft(): DraftState {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return DEFAULT_DRAFT;
    return { ...DEFAULT_DRAFT, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load draft:', e);
    return DEFAULT_DRAFT;
  }
}

export function saveDraft(draft: DraftState): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch (e) {
    console.error('Failed to save draft:', e);
  }
}

export function loadSchedule(): ScheduleConfig {
  try {
    const raw = localStorage.getItem(SCHEDULE_KEY);
    if (!raw) return DEFAULT_SCHEDULE;
    return { ...DEFAULT_SCHEDULE, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load schedule:', e);
    return DEFAULT_SCHEDULE;
  }
}

export function saveSchedule(schedule: ScheduleConfig): void {
  try {
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule));
  } catch (e) {
    console.error('Failed to save schedule:', e);
  }
}

export function clearAllLocalStorage(): void {
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(DRAFT_KEY);
  localStorage.removeItem(SCHEDULE_KEY);
}

