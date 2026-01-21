import { describe, expect, it } from 'vitest';
import { formatDate, formatEarningsTime, formatUpdatedAt } from '../marketFormatters';

describe('marketFormatters', () => {
  it('formats updated timestamp with fallback', () => {
    expect(formatUpdatedAt(0)).toBe('Updated: --');
    expect(formatUpdatedAt(1704067200000)).toContain('Updated at');
  });

  it('formats earnings time values', () => {
    expect(formatEarningsTime()).toBe('--');
    expect(formatEarningsTime(null)).toBe('--');
    expect(formatEarningsTime('bmo')).toBe('Before open');
    expect(formatEarningsTime(' AMC ')).toBe('After close');
    expect(formatEarningsTime('midday')).toBe('midday');
  });

  it('formats dates with a readable fallback', () => {
    expect(formatDate('invalid-date')).toBe('invalid-date');
    expect(formatDate('2024-01-15')).toContain('Jan');
  });
});
