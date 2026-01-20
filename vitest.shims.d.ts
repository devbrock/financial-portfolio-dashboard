/// <reference types="@vitest/browser-playwright" />
import type { AxeMatchers } from 'jest-axe';

declare module 'vitest' {
  interface Assertion<T = unknown> extends AxeMatchers<T> {
    _?: never;
  }
  interface AsymmetricMatchersContaining extends AxeMatchers<unknown> {
    _?: never;
  }
}
