import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind-safe `className` utility.
 *
 * Uses `clsx` to build conditional class strings, then `tailwind-merge` to
 * de-dupe and resolve conflicting Tailwind utilities.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(...inputs));
}
