/**
 * Generate a unique seed for deterministic mock data generation.
 * Combines browser fingerprint with timestamp for uniqueness.
 * Same browser will get different seed on each first visit.
 */
export function generateSeed(): string {
  // Browser fingerprint components
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth.toString(),
    screen.width.toString(),
    screen.height.toString(),
    new Date().getTimezoneOffset().toString(),
    navigator.hardwareConcurrency?.toString() || '0',
  ].join('|');

  // Add timestamp for uniqueness across visits
  const timestamp = Date.now().toString();

  // Combine and encode
  const combined = fingerprint + timestamp;

  // Create base64 encoded seed
  const seed = btoa(combined).slice(0, 16);

  return seed;
}
