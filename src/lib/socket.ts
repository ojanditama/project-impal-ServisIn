/**
 * Real-time Event Hub (Socket.IO / WebSocket simulation bus)
 * Broadcasts GPS coordinates, live orders, and dispatch updates across tabs/clients
 */

type EventHandler = (payload: any) => void;

class RealtimeEventHub {
  private listeners: Map<string, Set<EventHandler>> = new Map();

  public on(event: string, handler: EventHandler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  public emit(event: string, payload: any) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((fn) => {
        try {
          fn(payload);
        } catch (e) {
          console.error(`Error in event handler for ${event}:`, e);
        }
      });
    }

    // Also support browser-wide BroadcastChannel if available
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel("servisin_realtime");
        bc.postMessage({ event, payload });
      } catch (err) {
        // broadcast channel optional
      }
    }
  }

  public initBroadcastListener() {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel("servisin_realtime");
        bc.onmessage = (msg) => {
          const { event, payload } = msg.data;
          const handlers = this.listeners.get(event);
          if (handlers) {
            handlers.forEach((fn) => fn(payload));
          }
        };
      } catch (err) {
        // ignore
      }
    }
  }
}

export const realtimeHub = new RealtimeEventHub();
if (typeof window !== "undefined") {
  realtimeHub.initBroadcastListener();
}
