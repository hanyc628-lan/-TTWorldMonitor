interface CircuitState {
  failures: number;
  lastFailure: number;
  isOpen: boolean;
}

const states = new Map<string, CircuitState>();

const FAILURE_THRESHOLD = 3;
const RESET_TIMEOUT_MS = 30_000;

export class CircuitBreaker {
  constructor(private readonly name: string) {}

  canRequest(): boolean {
    const state = states.get(this.name);
    if (!state?.isOpen) return true;
    if (Date.now() - state.lastFailure > RESET_TIMEOUT_MS) {
      states.set(this.name, { failures: 0, lastFailure: 0, isOpen: false });
      return true;
    }
    return false;
  }

  recordSuccess(): void {
    states.set(this.name, { failures: 0, lastFailure: 0, isOpen: false });
  }

  recordFailure(): void {
    const state = states.get(this.name) ?? { failures: 0, lastFailure: 0, isOpen: false };
    state.failures++;
    state.lastFailure = Date.now();
    state.isOpen = state.failures >= FAILURE_THRESHOLD;
    states.set(this.name, state);
  }

  async execute<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
    if (!this.canRequest()) return fallback;
    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch {
      this.recordFailure();
      return fallback;
    }
  }
}

export const breakers = {
  tpi: new CircuitBreaker('tpi'),
  signals: new CircuitBreaker('signals'),
  liveMatches: new CircuitBreaker('liveMatches'),
  bootstrap: new CircuitBreaker('bootstrap'),
};
