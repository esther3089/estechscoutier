import { EmailItem } from '../types';

export interface WorkerInputMessage {
  type: 'process';
  rawRecipients: string;
  parsedPairs?: Array<{ email: string; name?: string }>;
  subjectTemplate: string;
  bodyTemplate: string;
  fallbackName: string;
  doNotContactList: string[];
  enableOptOutFooter: boolean;
  optOutText: string;
}

export interface WorkerProgressMessage {
  type: 'progress';
  progress: number; // 0 to 100
  processed: number;
  total: number;
}

export interface WorkerSuccessMessage {
  type: 'complete';
  items: EmailItem[];
  stats: {
    totalInput: number;
    validCount: number;
    invalidCount: number;
    duplicateCount: number;
    doNotContactSkipped: number;
  };
}

export interface WorkerErrorMessage {
  type: 'error';
  message: string;
}

export type WorkerOutputMessage =
  | WorkerProgressMessage
  | WorkerSuccessMessage
  | WorkerErrorMessage;

// Email regex pattern meeting RFC 5322 pragmatic rules
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function extractNameFromEmail(email: string, fallback: string): string {
  try {
    const localPart = email.split('@')[0];
    if (!localPart) return fallback;

    // Remove numbers and clean common separators (dots, underscores, plus, hyphen)
    const cleaned = localPart.replace(/[0-9+]/g, '');
    const tokens = cleaned.split(/[._-]/).filter((t) => t.length > 0);

    if (tokens.length > 0 && tokens[0].length >= 2) {
      const first = tokens[0];
      return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// In worker context
self.onmessage = async (e: MessageEvent<WorkerInputMessage>) => {
  const { data } = e;

  if (data.type !== 'process') {
    return;
  }

  try {
    const {
      rawRecipients,
      parsedPairs,
      subjectTemplate,
      bodyTemplate,
      fallbackName,
      doNotContactList,
      enableOptOutFooter,
      optOutText,
    } = data;

    const dncSet = new Set(
      (doNotContactList || []).map((addr) => addr.trim().toLowerCase())
    );

    // Collect pairs of { email, explicitName }
    const inputEntries: Array<{ email: string; name?: string }> = [];

    if (parsedPairs && parsedPairs.length > 0) {
      for (const pair of parsedPairs) {
        if (pair.email) {
          inputEntries.push({
            email: pair.email.trim(),
            name: pair.name ? pair.name.trim() : undefined,
          });
        }
      }
    } else {
      const lines = rawRecipients.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed) {
          // Check if formatted like "Name <email@domain.com>" or "email, name"
          const matchWithBrackets = trimmed.match(/^([^<]+)<([^>]+)>$/);
          if (matchWithBrackets) {
            inputEntries.push({
              name: matchWithBrackets[1].trim(),
              email: matchWithBrackets[2].trim(),
            });
          } else if (trimmed.includes(',')) {
            const parts = trimmed.split(',');
            // Check which part is the email
            const p0 = parts[0].trim();
            const p1 = parts[1].trim();
            if (EMAIL_REGEX.test(p0)) {
              inputEntries.push({ email: p0, name: p1 || undefined });
            } else if (EMAIL_REGEX.test(p1)) {
              inputEntries.push({ email: p1, name: p0 || undefined });
            } else {
              inputEntries.push({ email: p0 });
            }
          } else {
            inputEntries.push({ email: trimmed });
          }
        }
      }
    }

    const totalInput = inputEntries.length;
    if (totalInput > 10000) {
      self.postMessage({
        type: 'error',
        message: `Too many recipients (${totalInput.toLocaleString()}). The maximum allowed limit is 10,000 emails per campaign.`,
      } as WorkerErrorMessage);
      return;
    }

    const seenEmails = new Set<string>();
    const validUniqueEntries: Array<{ email: string; name?: string }> = [];
    let invalidCount = 0;
    let duplicateCount = 0;
    let doNotContactSkipped = 0;

    for (const entry of inputEntries) {
      const lowerEmail = entry.email.toLowerCase();

      if (!EMAIL_REGEX.test(entry.email)) {
        invalidCount++;
        continue;
      }

      if (dncSet.has(lowerEmail)) {
        doNotContactSkipped++;
        continue;
      }

      if (seenEmails.has(lowerEmail)) {
        duplicateCount++;
        continue;
      }

      seenEmails.add(lowerEmail);
      validUniqueEntries.push(entry);
    }

    const totalToProcess = validUniqueEntries.length;
    const items: EmailItem[] = [];

    // Process in chunks to report smooth progress and yield event loop
    const CHUNK_SIZE = 500;
    for (let i = 0; i < totalToProcess; i += CHUNK_SIZE) {
      const chunkEnd = Math.min(i + CHUNK_SIZE, totalToProcess);

      for (let j = i; j < chunkEnd; j++) {
        const entry = validUniqueEntries[j];
        const email = entry.email;

        // Determine name
        let recipientName = fallbackName || 'there';
        if (entry.name && entry.name.trim().length > 0) {
          recipientName = capitalize(entry.name.trim());
        } else {
          recipientName = extractNameFromEmail(email, fallbackName || 'there');
        }

        // Apply personalization
        const personalizedSubject = subjectTemplate.replace(/\{name\}/gi, recipientName);
        let personalizedBody = bodyTemplate.replace(/\{name\}/gi, recipientName);

        if (enableOptOutFooter && optOutText && optOutText.trim()) {
          personalizedBody = `${personalizedBody}\n\n---\n${optOutText.trim()}`;
        }

        items.push({
          id: `email_${Date.now()}_${j + 1}_${Math.random().toString(36).substring(2, 7)}`,
          index: j + 1,
          email,
          name: recipientName,
          subject: personalizedSubject,
          body: personalizedBody,
          status: 'pending',
        });
      }

      const progress = Math.round((chunkEnd / totalToProcess) * 100);
      self.postMessage({
        type: 'progress',
        progress: totalToProcess === 0 ? 100 : progress,
        processed: chunkEnd,
        total: totalToProcess,
      } as WorkerProgressMessage);

      // Brief yield
      if (chunkEnd < totalToProcess) {
        await new Promise((r) => setTimeout(r, 0));
      }
    }

    self.postMessage({
      type: 'complete',
      items,
      stats: {
        totalInput,
        validCount: validUniqueEntries.length,
        invalidCount,
        duplicateCount,
        doNotContactSkipped,
      },
    } as WorkerSuccessMessage);
  } catch (err: unknown) {
    self.postMessage({
      type: 'error',
      message: err instanceof Error ? err.message : 'Unknown list processing error occurred.',
    } as WorkerErrorMessage);
  }
};

