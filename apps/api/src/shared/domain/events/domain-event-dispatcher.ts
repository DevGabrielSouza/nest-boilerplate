import { Injectable } from '@nestjs/common';
import { DomainEvent } from './domain-event.base';

@Injectable()
export class DomainEventDispatcher {
  private handlers = new Map<
    string,
    Array<(event: DomainEvent) => void | Promise<void>>
  >();

  register(
    eventName: string,
    handler: (event: DomainEvent) => void | Promise<void>
  ): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler);
  }

  async dispatch(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventName) || [];

    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Error handling event ${event.eventName}:`, error);
      }
    }
  }

  async dispatchAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.dispatch(event);
    }
  }

  clearHandlers(eventName: string): void {
    this.handlers.delete(eventName);
  }

  clearAllHandlers(): void {
    this.handlers.clear();
  }
}
