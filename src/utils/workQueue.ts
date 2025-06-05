type QueueItem = {
  execute: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
};

export class RequestQueueManager {
  private static instance: RequestQueueManager;
  private isProcessing: boolean = false;
  private queue: QueueItem[] = [];

  private constructor() {}

  static getInstance(): RequestQueueManager {
    if (!RequestQueueManager.instance) {
      RequestQueueManager.instance = new RequestQueueManager();
    }
    return RequestQueueManager.instance;
  }

  async enqueue<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      console.debug("enqueue: task added to queue");
      this.queue.push({
        execute: task,
        resolve,
        reject,
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const item = this.queue.shift()!;

    try {
      const result = await item.execute();
      console.debug("processQueue: task executed successfully");
      item.resolve(result);
    } catch (error) {
      console.debug("processQueue: task execution failed", error);
      item.reject(error);
    } finally {
      this.isProcessing = false;
      this.processQueue();
    }
  }
}
