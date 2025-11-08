/**
 * Event bus for game logic hooks
 * Allows external code to react to engine events
 */

import type { EngineEvent } from './types';

type EventCallback = (event: EngineEvent) => void;

export class EventBus {
  private listeners: Map<string, EventCallback[]> = new Map();

  /**
   * Subscribe to an event type
   * Returns an unsubscribe function
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
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event to all listeners
   */
  emit(event: EngineEvent): void {
    const callbacks = this.listeners.get(event.type);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error(`Error in event listener for ${event.type}:`, error);
        }
      });
    }
  }

  /**
   * Remove all listeners
   */
  clear(): void {
    this.listeners.clear();
  }

  /**
   * Get count of listeners for debugging
   */
  getListenerCount(eventType?: EngineEvent['type']): number {
    if (eventType) {
      return this.listeners.get(eventType)?.length || 0;
    }
    return Array.from(this.listeners.values()).reduce(
      (sum, callbacks) => sum + callbacks.length,
      0
    );
  }
}
