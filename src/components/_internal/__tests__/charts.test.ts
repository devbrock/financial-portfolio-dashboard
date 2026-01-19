import { describe, expect, it } from 'vitest';
import { toTick } from '../charts';
import { rechartsPayloadToItems } from '../rechartsTooltip';

describe('toTick', () => {
  it('returns numbers as strings', () => {
    expect(toTick(42)).toBe('42');
  });

  it('returns string values unchanged', () => {
    expect(toTick('Q1')).toBe('Q1');
  });
});

describe('rechartsPayloadToItems', () => {
  it('maps valid payload entries and skips invalid ones', () => {
    const items = rechartsPayloadToItems([
      { name: 'Revenue', value: 120, color: '#111111' },
      { dataKey: 'Fallback', value: '33' },
      { name: 'Ignored', value: null },
      'invalid',
    ]);

    expect(items).toEqual([
      { name: 'Revenue', value: 120, color: '#111111' },
      { name: 'Fallback', value: '33', color: undefined },
    ]);
  });

  it('uses fallback series name when needed', () => {
    const items = rechartsPayloadToItems([{ value: 7 }], 'Series');
    expect(items[0]?.name).toBe('Series');
  });
});
