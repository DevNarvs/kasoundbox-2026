import { createHash, timingSafeEqual } from 'node:crypto';

// Constant-time string compare; hashing first hides the length of either input.
export function safeEqual(a: string, b: string): boolean {
  const digest = (s: string) => createHash('sha256').update(s).digest();
  return timingSafeEqual(digest(a), digest(b));
}
