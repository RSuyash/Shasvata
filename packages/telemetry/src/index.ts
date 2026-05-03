export interface Logger {
  info: (message: string, metadata?: Record<string, unknown>) => void;
  error: (message: string, metadata?: Record<string, unknown>) => void;
}

export function createRequestId(prefix = "req"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createLogger(service: string): Logger {
  return {
    info(message, metadata = {}) {
      console.log(JSON.stringify({ level: "info", service, message, ...metadata }));
    },
    error(message, metadata = {}) {
      console.error(JSON.stringify({ level: "error", service, message, ...metadata }));
    }
  };
}

export function logEvent(logger: Logger, event: string, metadata: Record<string, unknown> = {}) {
  logger.info(event, metadata);
}

export function logError(logger: Logger, error: unknown, metadata: Record<string, unknown> = {}) {
  const message = error instanceof Error ? error.message : "Unknown error";
  logger.error(message, metadata);
}
