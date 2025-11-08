// engine/EventBus.ts

import type { EngineEvent } from './types';

type EventCallback = (event: EngineEvent) => void;

export class EventBus {
  private listeners: Map<string, EventCallback[]> = new Map();

  on(eventType: EngineEvent['type'], callback: EventCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);

    // Return unsubscribe function
    return () => this.off(eventType, callback);
  }

  off(eventType: EngineEvent['type'], callback: EventCallback): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    }
  }

  emit(event: EngineEvent): void {
    const callbacks = this.listeners.get(event.type);
    if (callbacks) {
      callbacks.forEach(callback => callback(event));
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}
