import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventBus } from '../event-bus';

describe('EventBus', () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
  });

  it('should call handler when event is emitted', async () => {
    const handler = vi.fn();
    bus.on('client:created', handler);

    await bus.emit('client:created', { client_id: 'c1', created_by: 'u1' });

    expect(handler).toHaveBeenCalledWith({ client_id: 'c1', created_by: 'u1' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should call multiple handlers for same event', async () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    bus.on('client:created', handler1);
    bus.on('client:created', handler2);

    await bus.emit('client:created', { client_id: 'c1', created_by: 'u1' });

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('should not call handler after off()', async () => {
    const handler = vi.fn();
    bus.on('client:created', handler);
    bus.off('client:created', handler);

    await bus.emit('client:created', { client_id: 'c1', created_by: 'u1' });

    expect(handler).not.toHaveBeenCalled();
  });

  it('should handle events with no listeners', async () => {
    await expect(bus.emit('client:created', { client_id: 'c1', created_by: 'u1' })).resolves.toBeUndefined();
  });

  it('should remove all listeners for a specific event', async () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    bus.on('client:created', handler1);
    bus.on('client:updated', handler2);

    bus.removeAllListeners('client:created');

    await bus.emit('client:created', { client_id: 'c1', created_by: 'u1' });
    await bus.emit('client:updated', { client_id: 'c1', updated_by: 'u1' });

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('should remove all listeners when no event specified', async () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    bus.on('client:created', handler1);
    bus.on('client:updated', handler2);

    bus.removeAllListeners();

    await bus.emit('client:created', { client_id: 'c1', created_by: 'u1' });
    await bus.emit('client:updated', { client_id: 'c1', updated_by: 'u1' });

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });

  it('should handle async handlers', async () => {
    const results: string[] = [];
    bus.on('client:created', async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      results.push('done');
    });

    await bus.emit('client:created', { client_id: 'c1', created_by: 'u1' });

    expect(results).toEqual(['done']);
  });

  it('should not throw if a handler throws', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const goodHandler = vi.fn();

    bus.on('client:created', () => {
      throw new Error('handler error');
    });
    bus.on('client:created', goodHandler);

    await expect(bus.emit('client:created', { client_id: 'c1', created_by: 'u1' })).resolves.toBeUndefined();
    expect(goodHandler).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
