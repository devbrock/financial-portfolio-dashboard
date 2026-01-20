import type { ComboboxItem } from './Combobox.types';

export function findLabel(items: readonly ComboboxItem[], value: string | undefined): string {
  if (!value) return '';
  return items.find(i => i.value === value)?.label ?? '';
}
