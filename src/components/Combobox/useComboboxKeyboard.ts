import type * as React from 'react';
import type { ComboboxItem } from './Combobox.types';

type UseComboboxKeyboardOptions = {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  filtered: ComboboxItem[];
  handleSelect: (item: ComboboxItem) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

/**
 * Creates a keyboard event handler for Combobox navigation.
 * Handles ArrowDown, ArrowUp, Enter, and Escape keys.
 */
export function createComboboxKeyHandler({
  open,
  setOpen,
  activeIndex,
  setActiveIndex,
  filtered,
  handleSelect,
  onKeyDown,
}: UseComboboxKeyboardOptions): (e: React.KeyboardEvent<HTMLInputElement>) => void {
  return (e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        if (!open) setOpen(true);
        setActiveIndex(prev => {
          const next = Math.min(prev + 1, filtered.length - 1);
          return Number.isFinite(next) ? next : -1;
        });
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        setActiveIndex(prev => Math.max(prev - 1, 0));
        break;
      }
      case 'Enter': {
        if (!open) return;
        const item = filtered[activeIndex];
        if (item) {
          e.preventDefault();
          handleSelect(item);
        }
        break;
      }
      case 'Escape': {
        if (!open) return;
        e.preventDefault();
        setOpen(false);
        setActiveIndex(-1);
        break;
      }
    }
  };
}
