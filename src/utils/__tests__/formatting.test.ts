import { describe, expect, it } from 'vitest';
import { formatMoneyUsd } from '../formatMoneyUsd';
import { formatCompact } from '../formatCompact';
import { formatLastUpdated } from '../formatLastUpdated';
import { formatSignedPct } from '../formatSignedPct';

// Intl formatting differs by locale, so assert key substrings.
describe('formatting utilities', () => {
  it('formats USD money', () => {
    expect(formatMoneyUsd(1234)).toContain('$1,234');
  });

  it('formats USD money under 1000 with cents', () => {
    expect(formatMoneyUsd(12.5)).toContain('12.50');
  });

  it('formats compact numbers', () => {
    expect(formatCompact(1200)).toMatch(/1\.2|1\.3/);
  });

  it('formats last updated', () => {
    expect(formatLastUpdated(5)).toContain('5s');
  });

  it('formats signed percentage', () => {
    expect(formatSignedPct(1.23)).toContain('+1.2');
    expect(formatSignedPct(-1.23)).toContain('-1.2');
  });
});
