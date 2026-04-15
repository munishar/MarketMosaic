import { useEffect, useRef } from 'react';
import { eventBus } from '@/lib/event-bus';

/** Subscribe to an event bus event; auto-unsubscribes on unmount. Uses a ref to avoid re-subscribing on handler changes. */
export function useEventBus(event: string, handler: (...args: unknown[]) => void) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const stableHandler = (...args: unknown[]) => handlerRef.current(...args);
    const unsub = eventBus.on(event, stableHandler);
    return unsub;
  }, [event]);
}
