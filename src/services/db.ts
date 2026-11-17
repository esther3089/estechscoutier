import { EmailItem, EmailTemplate } from '../types';

const DB_NAME = 'estech_scoutier_db';
const DB_VERSION = 1;

export interface SentHistoryRecord {
  id: string;
  email: string;
  timestamp: number;
}

let dbInstance: IDBDatabase | null = null;

export async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('emails')) {
        const emailStore = db.createObjectStore('emails', { keyPath: 'id' });
        emailStore.createIndex('status', 'status', { unique: false });
        emailStore.createIndex('index', 'index', { unique: false });
      }

      if (!db.objectStoreNames.contains('sentHistory')) {
        const historyStore = db.createObjectStore('sentHistory', { keyPath: 'id' });
        historyStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains('customTemplates')) {
        db.createObjectStore('customTemplates', { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

// Emails store operations
export async function saveGeneratedEmails(emails: EmailItem[]): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('emails', 'readwrite');
    const store = tx.objectStore('emails');
    store.clear(); // Clear existing list for the current campaign

    // Batch insert
    for (const email of emails) {
      store.put(email);
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllEmails(): Promise<EmailItem[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('emails', 'readonly');
    const store = tx.objectStore('emails');
    const request = store.getAll();

    request.onsuccess = () => {
      const results: EmailItem[] = request.result || [];
      results.sort((a, b) => a.index - b.index);
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function updateEmailStatus(id: string, status: 'pending' | 'sent', sentAt?: number): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['emails', 'sentHistory'], 'readwrite');
    const emailStore = tx.objectStore('emails');
    const historyStore = tx.objectStore('sentHistory');

    const getReq = emailStore.get(id);
    getReq.onsuccess = () => {
      const item: EmailItem = getReq.result;
      if (item) {
        item.status = status;
        if (sentAt) item.sentAt = sentAt;
        emailStore.put(item);

        if (status === 'sent' && sentAt) {
          historyStore.put({
            id: `${id}_${sentAt}`,
            email: item.email,
            timestamp: sentAt
          });
        }
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearAllEmails(): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('emails', 'readwrite');
    tx.objectStore('emails').clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function resetSentStatus(): Promise<void> {
  const db = await getDB();
  const emails = await getAllEmails();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('emails', 'readwrite');
    const store = tx.objectStore('emails');
    for (const item of emails) {
      item.status = 'pending';
      delete item.sentAt;
      store.put(item);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Sent History (for 24h counters)
export async function getSentCountLast24h(): Promise<number> {
  const db = await getDB();
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sentHistory', 'readonly');
    const store = tx.objectStore('sentHistory');
    const index = store.index('timestamp');
    const range = IDBKeyRange.lowerBound(cutoff);
    const request = index.count(range);

    request.onsuccess = () => resolve(request.result || 0);
    request.onerror = () => reject(request.error);
  });
}

export async function clearSentHistory(): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sentHistory', 'readwrite');
    tx.objectStore('sentHistory').clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Custom Templates
export async function getCustomTemplates(): Promise<EmailTemplate[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('customTemplates', 'readonly');
    const store = tx.objectStore('customTemplates');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function saveCustomTemplate(template: EmailTemplate): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('customTemplates', 'readwrite');
    tx.objectStore('customTemplates').put(template);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteCustomTemplate(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('customTemplates', 'readwrite');
    tx.objectStore('customTemplates').delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function resetAllIndexedDB(): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['emails', 'sentHistory', 'customTemplates'], 'readwrite');
    tx.objectStore('emails').clear();
    tx.objectStore('sentHistory').clear();
    tx.objectStore('customTemplates').clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

