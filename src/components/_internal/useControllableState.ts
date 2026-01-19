import { useCallback, useState } from 'react';

/**
 * A small helper for controlled/uncontrolled React state.
 *
 * Analogy: it’s like a car that can be driven either by the driver (controlled prop)
 * or by cruise control (internal state). If the driver grabs the wheel, cruise control
 * backs off.
 */
export function useControllableState<T>(params: {
  value: T | undefined;
  defaultValue: T;
  onChange?: (next: T) => void;
}): [T, (next: T) => void] {
  const { value, defaultValue, onChange } = params;
  const [uncontrolled, setUncontrolled] = useState<T>(defaultValue);

  const isControlled = value !== undefined;
  const state = isControlled ? value : uncontrolled;

  const setState = useCallback(
    (next: T) => {
      if (!isControlled) setUncontrolled(next);
      onChange?.(next);
    },
    [isControlled, onChange]
  );

  return [state, setState];
}
