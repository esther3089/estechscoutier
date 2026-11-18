import {
  WorkerInputMessage,
  WorkerProgressMessage,
  WorkerSuccessMessage,
  WorkerErrorMessage,
  processEmailList,
} from '../utils/listProcessor';

// Dedicated Worker entrypoint
self.onmessage = async (e: MessageEvent<WorkerInputMessage>) => {
  const { data } = e;

  if (!data || data.type !== 'process') {
    return;
  }

  try {
    const result = await processEmailList({
      rawRecipients: data.rawRecipients,
      parsedPairs: data.parsedPairs,
      subjectTemplate: data.subjectTemplate,
      bodyTemplate: data.bodyTemplate,
      fallbackName: data.fallbackName,
      doNotContactList: data.doNotContactList,
      enableOptOutFooter: data.enableOptOutFooter,
      optOutText: data.optOutText,
      onProgress: (progress, processed, total) => {
        self.postMessage({
          type: 'progress',
          progress,
          processed,
          total,
        } as WorkerProgressMessage);
      },
    });

    self.postMessage({
      type: 'complete',
      items: result.items,
      stats: result.stats,
    } as WorkerSuccessMessage);
  } catch (err: unknown) {
    self.postMessage({
      type: 'error',
      message:
        err instanceof Error
          ? err.message
          : 'Unknown list processing error occurred.',
    } as WorkerErrorMessage);
  }
};
