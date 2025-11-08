// engine/EventBus.ts - Event system for hooking into engine events

import type { EngineEvent } from './types';

type EventCallback = (event: EngineEvent) => void;

/**
 * Event bus for subscribing to and emitting engine events
 * Allows game logic to hook into engine operations
 */
export class EventBus {
  private listeners: Map<string, EventCallback[]> = new Map();

  /**
   * Subscribe to an event type
   * @returns Unsubscribe function
   */
  on(eventType: EngineEvent['type'], callback: EventCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);

    // Return unsubscribe function
    return () => this.off(eventType, callback);
  }

  /**
   * Unsubscribe from an event type
   */
  off(eventType: EngineEvent['type'], callback: EventCallback): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    }
  }

  /**
   * Emit an event to all subscribers
   */
  emit(event: EngineEvent): void {
    const callbacks = this.listeners.get(event.type);
    if (callbacks) {
      callbacks.forEach(callback => callback(event));
    }
  }

  /**
   * Clear all event listeners
   */
  clear(): void {
    this.listeners.clear();
  }
}
