import { describe, expect, it, vi } from 'vitest';
import { clampNumber } from '../clampNumber';
import { compareStrings } from '../compareStrings';
import { formatLastUpdated } from '../formatLastUpdated';
import { generateSeed } from '../generateSeed';

describe('utility extras', () => {
  it('clamps numbers to a range', () => {
    expect(clampNumber(10, 0, 5)).toBe(5);
    expect(clampNumber(-2, 0, 5)).toBe(0);
    expect(clampNumber(3, 0, 5)).toBe(3);
  });

  it('compares strings case-insensitively', () => {
    expect(compareStrings('alpha', 'Beta')).toBeLessThan(0);
    expect(compareStrings('Gamma', 'gamma')).toBe(0);
  });

  it('formats last updated durations', () => {
    expect(formatLastUpdated(45)).toBe('45s ago');
    expect(formatLastUpdated(90)).toBe('1m ago');
    expect(formatLastUpdated(60 * 60 * 2)).toBe('2h ago');
  });

  it('generates a deterministic-length seed', () => {
    const nowSpy = vi.spyOn(Date, 'now');
    nowSpy.mockReturnValueOnce(1000).mockReturnValueOnce(2000);

    const first = generateSeed();
    const second = generateSeed();

    expect(first).toHaveLength(16);
    expect(second).toHaveLength(16);

    nowSpy.mockRestore();
  });
});
