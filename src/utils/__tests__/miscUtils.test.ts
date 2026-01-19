import { describe, expect, it } from 'vitest';
import { ariasort } from '../ariasort';
import { cn } from '../cn';

describe('utility helpers', () => {
  it('builds aria-sort values', () => {
    expect(ariasort('asc')).toBe('ascending');
    expect(ariasort('desc')).toBe('descending');
    expect(ariasort(null)).toBe('none');
  });

  it('combines class names', () => {
    const isActive = Boolean(process.env['__TEST_FLAG__']);
    expect(cn('a', isActive && 'b', 'c')).toBe('a c');
  });
});
