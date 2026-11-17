import { MailClientPreference } from '../types';

export function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent);
}

export function isIOS(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function isMobile(): boolean {
  return isAndroid() || isIOS() || /Mobi|Tablet/i.test(navigator.userAgent);
}

export function buildMailtoUrl(to: string, subject: string, body: string): string {
  const encTo = encodeURIComponent(to);
  const encSubject = encodeURIComponent(subject);
  const encBody = encodeURIComponent(body);
  return `mailto:${encTo}?subject=${encSubject}&body=${encBody}`;
}

export function buildGmailWebUrl(to: string, subject: string, body: string): string {
  const encTo = encodeURIComponent(to);
  const encSubject = encodeURIComponent(subject);
  const encBody = encodeURIComponent(body);
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encTo}&su=${encSubject}&body=${encBody}`;
}

export function buildOutlookWebUrl(to: string, subject: string, body: string): string {
  const encTo = encodeURIComponent(to);
  const encSubject = encodeURIComponent(subject);
  const encBody = encodeURIComponent(body);
  return `https://outlook.live.com/mail/0/deeplink/compose?to=${encTo}&subject=${encSubject}&body=${encBody}`;
}

export function buildIosGmailUrl(to: string, subject: string, body: string): string {
  const encTo = encodeURIComponent(to);
  const encSubject = encodeURIComponent(subject);
  const encBody = encodeURIComponent(body);
  return `googlegmail:///co?to=${encTo}&subject=${encSubject}&body=${encBody}`;
}

export function buildAndroidGmailIntentUrl(to: string, subject: string, body: string): string {
  const encTo = encodeURIComponent(to);
  const encSubject = encodeURIComponent(subject);
  const encBody = encodeURIComponent(body);
  // Standard Android intent syntax for Gmail
  return `intent://co?to=${encTo}&subject=${encSubject}&body=${encBody}#Intent;scheme=mailto;package=com.google.android.gm;end`;
}

/**
 * Opens email compose window with fallback mechanism
 * Prevents double launches and respects chosen client preference.
 */
export function openEmailCompose(
  to: string,
  subject: string,
  body: string,
  preference: MailClientPreference = 'auto'
): void {
  // 1. Explicit Gmail Web
  if (preference === 'gmail_web') {
    window.open(buildGmailWebUrl(to, subject, body), '_blank', 'noopener,noreferrer');
    return;
  }

  // 2. Explicit Outlook Web
  if (preference === 'outlook_web') {
    window.open(buildOutlookWebUrl(to, subject, body), '_blank', 'noopener,noreferrer');
    return;
  }

  // 3. Explicit Default Mail App
  if (preference === 'default_app') {
    window.location.href = buildMailtoUrl(to, subject, body);
    return;
  }

  // 4. Gmail App
  if (preference === 'gmail_app') {
    if (isAndroid()) {
      window.location.href = buildAndroidGmailIntentUrl(to, subject, body);
      return;
    }
    if (isIOS()) {
      launchWithFallback(
        buildIosGmailUrl(to, subject, body),
        buildMailtoUrl(to, subject, body),
        800
      );
      return;
    }
    // On desktop, fallback to web Gmail
    window.open(buildGmailWebUrl(to, subject, body), '_blank', 'noopener,noreferrer');
    return;
  }

  // 5. 'auto' preference: detect best route based on device
  if (isAndroid()) {
    // Try android intent, or direct intent
    window.location.href = buildAndroidGmailIntentUrl(to, subject, body);
    return;
  }

  if (isIOS()) {
    launchWithFallback(
      buildIosGmailUrl(to, subject, body),
      buildMailtoUrl(to, subject, body),
      800
    );
    return;
  }

  // Desktop auto: Use Gmail web compose in a new tab for seamless outreach
  window.open(buildGmailWebUrl(to, subject, body), '_blank', 'noopener,noreferrer');
}

/**
 * Tries custom URL scheme (e.g., iOS Gmail), falls back to mailto if app didn't take over focus
 */
function launchWithFallback(primaryUrl: string, fallbackUrl: string, timeoutMs: number = 800): void {
  let hasLeftPage = false;

  const onBlurOrVisibilityChange = () => {
    hasLeftPage = true;
    cleanup();
  };

  const cleanup = () => {
    window.removeEventListener('blur', onBlurOrVisibilityChange);
    document.removeEventListener('visibilitychange', onBlurOrVisibilityChange);
  };

  window.addEventListener('blur', onBlurOrVisibilityChange);
  document.addEventListener('visibilitychange', onBlurOrVisibilityChange);

  // Trigger primary custom scheme
  window.location.href = primaryUrl;

  setTimeout(() => {
    cleanup();
    // If user is still on the page, the custom app protocol failed to launch
    if (!hasLeftPage && document.visibilityState === 'visible') {
      window.location.href = fallbackUrl;
    }
  }, timeoutMs);
}

