/**
 * Logger — custom logging wrapper equivalent to Android's custom log/ module.
 * In release builds, only errors are printed. In dev, all levels are printed.
 */

const isDev = process.env.NODE_ENV !== 'production';

export class Logger {
  private readonly tag: string;

  constructor(tag: string) {
    this.tag = tag;
  }

  debug(message: string, ...args: unknown[]): void {
    if (isDev) {
      console.log(`[${this.tag}] DEBUG: ${message}`, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (isDev) {
      console.info(`[${this.tag}] INFO: ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(`[${this.tag}] WARN: ${message}`, ...args);
  }

  error(message: string, error?: unknown): void {
    console.error(`[${this.tag}] ERROR: ${message}`, error);
  }
}

/** Factory helper — equivalent to Android's `private val log = Logger(TAG)` idiom */
export function createLogger(tag: string): Logger {
  return new Logger(tag);
}
