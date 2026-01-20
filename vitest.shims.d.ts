/// <reference types="@vitest/browser-playwright" />
import type { AxeMatchers } from 'jest-axe';

declare module 'vitest' {
  interface Assertion<T = any> extends AxeMatchers<T> {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
