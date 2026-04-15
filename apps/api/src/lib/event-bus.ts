import { EventMap, EventName, EventHandler } from '@marketmosaic/shared';

class EventBus {
  private listeners: Map<string, Set<EventHandler<EventName>>> = new Map();

  on<E extends EventName>(event: E, handler: EventHandler<E>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as EventHandler<EventName>);
  }

  off<E extends EventName>(event: E, handler: EventHandler<E>): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler as EventHandler<EventName>);
    }
  }

  async emit<E extends EventName>(event: E, payload: EventMap[E]): Promise<void> {
    const handlers = this.listeners.get(event);
    if (!handlers) return;
    const promises = Array.from(handlers).map((handler) => {
      try {
        return Promise.resolve(handler(payload));
      } catch (error) {
        console.error(`Event handler error for ${event}:`, error);
        return Promise.resolve();
      }
    });
    await Promise.allSettled(promises);
  }

  removeAllListeners(event?: EventName): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

export const eventBus = new EventBus();
export { EventBus };
