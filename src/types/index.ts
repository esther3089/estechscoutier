export type MailClientPreference =
  | 'auto'
  | 'gmail_app'
  | 'gmail_web'
  | 'outlook_web'
  | 'default_app';

export type TemplateCategory =
  | 'Sales'
  | 'Marketing'
  | 'Business'
  | 'Relationship'
  | 'Other';

export interface EmailTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  subject: string;
  body: string;
  isCustom?: boolean;
  createdAt?: number;
}

export interface EmailItem {
  id: string;
  index: number;
  email: string;
  name: string;
  subject: string;
  body: string;
  status: 'pending' | 'sent';
  sentAt?: number;
}

export interface AppSettings {
  theme: 'system' | 'light' | 'dark';
  preferredClient: MailClientPreference;
  fallbackName: string;
  enableOptOutFooter: boolean;
  optOutText: string;
  doNotContactList: string[];
  analyticsConsent: boolean;
  responsibleUseAccepted: boolean;
}

export interface ScheduleConfig {
  enabled: boolean;
  scheduledTime: string | null; // ISO string
}

export interface CampaignStats {
  totalGenerated: number;
  sent: number;
  remaining: number;
  sent24h: number;
  completionRate: number;
}

export interface BlogArticle {
  id: string;
  title: string;
  category: string;
  readTime: string;
  summary: string;
  content: string;
  date: string;
}

export interface ShopProduct {
  id: string;
  name: string;
  badge?: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaType: 'buy' | 'contact';
  highlighted?: boolean;
}

export interface TutorialVideo {
  id: string;
  title: string;
  duration: string;
  category: string;
  youtubeId: string;
  description: string;
}

