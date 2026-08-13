type RefreshCallback = () => void | Promise<void>;

interface RefreshTask {
  id: string;
  intervalMs: number;
  callback: RefreshCallback;
  condition?: () => boolean;
  inFlight: boolean;
  backoffMultiplier: number;
  timerId: ReturnType<typeof setInterval> | null;
}

/** Smart poll loop — mirrors World Monitor refresh-scheduler.ts */
export class RefreshScheduler {
  private tasks = new Map<string, RefreshTask>();
  private paused = false;

  register(
    id: string,
    intervalMs: number,
    callback: RefreshCallback,
    condition?: () => boolean,
  ): void {
    if (this.tasks.has(id)) this.unregister(id);
    const task: RefreshTask = {
      id,
      intervalMs,
      callback,
      condition,
      inFlight: false,
      backoffMultiplier: 1,
      timerId: null,
    };
    this.tasks.set(id, task);
    this.startTask(task);
  }

  unregister(id: string): void {
    const task = this.tasks.get(id);
    if (task?.timerId) clearInterval(task.timerId);
    this.tasks.delete(id);
  }

  private startTask(task: RefreshTask): void {
    const tick = async () => {
      if (this.paused) return;
      if (task.condition && !task.condition()) return;
      if (task.inFlight) return;

      task.inFlight = true;
      try {
        await task.callback();
        task.backoffMultiplier = 1;
      } catch {
        task.backoffMultiplier = Math.min(4, task.backoffMultiplier * 2);
      } finally {
        task.inFlight = false;
      }
    };

    const interval = task.intervalMs * task.backoffMultiplier;
    task.timerId = setInterval(tick, interval);
    void tick();
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
  }

  flushAll(): void {
    for (const task of this.tasks.values()) {
      if (!task.inFlight) void task.callback();
    }
  }

  destroy(): void {
    for (const task of this.tasks.values()) {
      if (task.timerId) clearInterval(task.timerId);
    }
    this.tasks.clear();
  }
}

export const refreshScheduler = new RefreshScheduler();

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      refreshScheduler.pause();
    } else {
      refreshScheduler.resume();
      setTimeout(() => refreshScheduler.flushAll(), 100);
    }
  });
}
