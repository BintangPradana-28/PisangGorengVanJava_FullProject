import { EventEmitter } from 'events';

// Create a global singleton for EventEmitter so it persists across HMR in dev
const globalForEventEmitter = globalThis as unknown as {
  sseEmitter: EventEmitter | undefined;
};

export const sseEmitter = globalForEventEmitter.sseEmitter ?? new EventEmitter();

if (process.env.NODE_ENV !== 'production') {
  globalForEventEmitter.sseEmitter = sseEmitter;
}
