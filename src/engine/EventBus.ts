/**
 * Event bus for communication between engine and game logic
 */

import type { EngineEvent } from './types';

type EventCallback = (event: EngineEvent) => void;

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
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event to all subscribers
   */
  emit(event: EngineEvent): void {
    const callbacks = this.listeners.get(event.type);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  /**
   * Subscribe to an event once
   * Automatically unsubscribes after first invocation
   */
  once(eventType: EngineEvent['type'], callback: EventCallback): () => void {
    const wrappedCallback = (event: EngineEvent) => {
      callback(event);
      this.off(eventType, wrappedCallback);
    };

    return this.on(eventType, wrappedCallback);
  }

  /**
   * Clear all listeners for a specific event type
   * If no type specified, clears all listeners
   */
  clear(eventType?: EngineEvent['type']): void {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get count of listeners for an event type
   */
  listenerCount(eventType: EngineEvent['type']): number {
    return this.listeners.get(eventType)?.length || 0;
  }
}
