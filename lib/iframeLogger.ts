/**
 * Iframe Logger - Pushes all console logs to parent window
 *
 * This utility intercepts console methods (log, error, warn, info, debug)
 * and forwards them to the parent window via postMessage for display
 * in the parent app's log component.
 *
 * Also captures:
 * - Global errors (window.onerror)
 * - Unhandled promise rejections
 * - Network requests (fetch)
 * - Disconnect/visibility events
 */

export type LogLevel = 'log' | 'error' | 'warn' | 'info' | 'debug';

export interface LogMessage {
  source: 'vite-app';
  type: LogLevel | 'network';
  data: unknown[];
  timestamp: string;
}

// Store original methods
const originalConsole = {
  log: console.log.bind(console),
  error: console.error.bind(console),
  warn: console.warn.bind(console),
  info: console.info.bind(console),
  debug: console.debug.bind(console),
};

let originalFetch: typeof fetch | null = null;

// Check if running in iframe
const isInIframe = (): boolean => {
  try {
    return typeof window !== 'undefined' && window.self !== window.top;
  } catch {
    return true; // If we can't access window.top, we're in a cross-origin iframe
  }
};

// Send log to parent window
const sendToParent = (level: LogLevel | 'network', args: unknown[]): void => {
  if (!isInIframe() || typeof window === 'undefined') return;

  try {
    // Format data for parent - serialize objects, handle errors
    const data = args.map(arg => {
      if (arg === null) return 'null';
      if (arg === undefined) return 'undefined';
      if (arg instanceof Error) {
        return { message: arg.message, stack: arg.stack };
      }
      if (typeof arg === 'object') {
        try {
          JSON.stringify(arg); // Test if serializable
          return arg;
        } catch {
          return String(arg);
        }
      }
      return arg;
    });

    const message: LogMessage = {
      source: 'vite-app',
      type: level,
      data,
      timestamp: new Date().toISOString(),
    };

    window.parent.postMessage(message, '*');
  } catch (e) {
    // Silently fail if postMessage fails
    originalConsole.error('Failed to send log to parent:', e);
  }
};

// Create intercepted console method
const createInterceptedMethod = (level: LogLevel) => {
  return (...args: unknown[]): void => {
    // Always call original console method
    originalConsole[level](...args);

    // Send to parent if in iframe
    sendToParent(level, args);
  };
};

// Setup global error handlers
const setupErrorHandlers = (): void => {
  // Capture global errors
  window.addEventListener('error', (event) => {
    sendToParent('error', [
      `Uncaught Error: ${event.message}`,
      `at ${event.filename}:${event.lineno}:${event.colno}`,
      event.error?.stack || ''
    ]);
  });

  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (reason instanceof Error) {
      sendToParent('error', [
        `Unhandled Promise Rejection: ${reason.message}`,
        reason.stack || ''
      ]);
    } else {
      sendToParent('error', [
        'Unhandled Promise Rejection:',
        reason
      ]);
    }
  });
};

// Setup disconnect/visibility handlers
const setupDisconnectHandlers = (): void => {
  // Page is being unloaded
  window.addEventListener('beforeunload', () => {
    sendToParent('warn', ['⚠️ App disconnecting (page unload)']);
  });

  // Page visibility changed (tab hidden/shown)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      sendToParent('info', ['📱 App tab hidden']);
    } else {
      sendToParent('info', ['📱 App tab visible']);
    }
  });

  // Network offline/online - triggers sandbox refresh modal in parent
  window.addEventListener('offline', () => {
    // Send message that parent recognizes to trigger sandbox refresh modal
    sendToParent('error', ['[vite] server connection lost. Polling for restart...']);
    sendToParent('error', ['🔴 Network disconnected (offline)']);
  });

  window.addEventListener('online', () => {
    sendToParent('info', ['🟢 Network reconnected (online)']);
  });

  // Monitor WebSocket connections for HMR disconnect
  monitorWebSocketConnections();
};

// Monitor WebSocket connections to detect HMR disconnect
const monitorWebSocketConnections = (): void => {
  if (typeof window === 'undefined') return;

  // Store original WebSocket
  const OriginalWebSocket = window.WebSocket;
  let hmrSocket: WebSocket | null = null;
  let reconnectAttempts = 0;
  const MAX_RECONNECT_LOG = 3;

  // Override WebSocket to intercept HMR connections
  (window as unknown as { WebSocket: typeof WebSocket }).WebSocket = class extends OriginalWebSocket {
    constructor(url: string | URL, protocols?: string | string[]) {
      super(url, protocols);

      const urlStr = url.toString();

      // Detect Next.js HMR WebSocket (usually on /_next/webpack-hmr)
      if (urlStr.includes('/_next/') || urlStr.includes('webpack-hmr') || urlStr.includes('turbopack')) {
        hmrSocket = this;
        reconnectAttempts = 0;

        this.addEventListener('open', () => {
          sendToParent('info', ['🔌 HMR WebSocket connected']);
          reconnectAttempts = 0;
        });

        this.addEventListener('close', (event) => {
          reconnectAttempts++;

          // Send the message that triggers sandbox refresh modal in parent
          sendToParent('error', ['[vite] server connection lost. Polling for restart...']);

          if (reconnectAttempts <= MAX_RECONNECT_LOG) {
            sendToParent('warn', [`🔌 HMR WebSocket disconnected (code: ${event.code}, attempt: ${reconnectAttempts})`]);
          }
        });

        this.addEventListener('error', () => {
          sendToParent('error', ['🔌 HMR WebSocket error']);
        });
      }
    }
  };

  // Also monitor EventSource for Next.js dev server
  if (typeof EventSource !== 'undefined') {
    const OriginalEventSource = EventSource;

    (window as unknown as { EventSource: typeof EventSource }).EventSource = class extends OriginalEventSource {
      constructor(url: string | URL, eventSourceInitDict?: EventSourceInit) {
        super(url, eventSourceInitDict);

        const urlStr = url.toString();

        // Detect Next.js HMR EventSource
        if (urlStr.includes('/_next/') || urlStr.includes('webpack-hmr')) {
          this.addEventListener('open', () => {
            sendToParent('info', ['📡 HMR EventSource connected']);
          });

          this.addEventListener('error', () => {
            // Send the message that triggers sandbox refresh modal in parent
            sendToParent('error', ['[vite] server connection lost. Polling for restart...']);
            sendToParent('error', ['📡 HMR EventSource disconnected']);
          });
        }
      }
    } as typeof EventSource;
  }
};

// Setup fetch interceptor to log network requests
const setupFetchInterceptor = (): void => {
  if (typeof window === 'undefined' || !window.fetch) return;

  originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const method = init?.method || 'GET';
    const startTime = Date.now();

    // Log request
    sendToParent('network', [{
      type: 'request',
      method,
      url,
    }]);

    try {
      const response = await originalFetch!(input, init);
      const duration = Date.now() - startTime;

      // Clone response to read body without consuming it
      const clonedResponse = response.clone();

      // Try to get response body for logging
      let body: unknown = null;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          body = await clonedResponse.json();
        }
      } catch {
        // Ignore body parsing errors
      }

      // Log response
      sendToParent('network', [{
        type: 'response',
        method,
        url,
        status: response.status,
        duration,
        body,
      }]);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log error
      sendToParent('network', [{
        type: 'error',
        method,
        url,
        error: error instanceof Error ? error.message : String(error),
        duration,
      }]);

      throw error;
    }
  };
};

// Initialize the iframe logger
let isInitialized = false;

export const initIframeLogger = (): void => {
  if (isInitialized) return;
  if (typeof window === 'undefined') return;

  // Intercept all console methods
  console.log = createInterceptedMethod('log');
  console.error = createInterceptedMethod('error');
  console.warn = createInterceptedMethod('warn');
  console.info = createInterceptedMethod('info');
  console.debug = createInterceptedMethod('debug');

  // Setup additional handlers
  setupErrorHandlers();
  setupDisconnectHandlers();
  setupFetchInterceptor();

  isInitialized = true;

  // Send initialization message
  if (isInIframe()) {
    window.parent.postMessage({
      source: 'vite-app',
      type: 'info',
      data: ['🚀 Next.js app iframe logger initialized'],
      timestamp: new Date().toISOString(),
    }, '*');
  }
};

// Restore original methods
export const restoreConsole = (): void => {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
  console.info = originalConsole.info;
  console.debug = originalConsole.debug;

  if (originalFetch) {
    window.fetch = originalFetch;
  }

  isInitialized = false;
};

// Manual log send (for cases where you want to send without console)
export const sendLogToParent = (level: LogLevel, ...args: unknown[]): void => {
  sendToParent(level, args);
};

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
  initIframeLogger();
}
