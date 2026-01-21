import { describe, expect, it } from 'vitest';
import { getErrorMessage } from '../getErrorMessage';

describe('error utilities', () => {
  it('returns the error message when given an Error', () => {
    expect(getErrorMessage(new Error('Boom'), 'Fallback')).toBe('Boom');
  });

  it('returns a non-empty string as-is', () => {
    expect(getErrorMessage('  Oops  ', 'Fallback')).toBe('  Oops  ');
  });

  it('returns the fallback for empty or unknown errors', () => {
    expect(getErrorMessage('', 'Fallback')).toBe('Fallback');
    expect(getErrorMessage(null, 'Fallback')).toBe('Fallback');
  });
});
