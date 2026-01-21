import { cn } from '@/utils/cn';
import type { ComboboxItem } from './Combobox.types';
import { comboboxOptionClassName, comboboxPanelClassName } from './Combobox.styles';

type ComboboxListProps = {
  listboxId: string;
  items: ComboboxItem[];
  loading: boolean;
  selectedValue: string;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onSelect: (item: ComboboxItem) => void;
};

export function ComboboxList(props: ComboboxListProps) {
  const { listboxId, items, loading, selectedValue, activeIndex, onActiveIndexChange, onSelect } =
    props;

  return (
    <div
      id={listboxId}
      role="listbox"
      className={cn('absolute z-10 mt-2 w-full', comboboxPanelClassName)}
    >
      {loading ? (
        <div className="px-3 py-2 text-sm text-(--ui-text-muted)">Loading…</div>
      ) : (
        items.map((item, idx) => {
          const selected = item.value === selectedValue;
          const active = idx === activeIndex;
          return (
            <div
              key={item.value}
              id={`${listboxId}-opt-${idx}`}
              role="option"
              aria-selected={selected}
              aria-disabled={item.disabled || undefined}
              data-active={active ? 'true' : 'false'}
              className={cn(
                comboboxOptionClassName,
                'cursor-pointer',
                item.disabled && 'cursor-not-allowed opacity-50',
                active && 'bg-(--ui-surface)'
              )}
              onMouseEnter={() => onActiveIndexChange(idx)}
              onMouseDown={e => {
                e.preventDefault();
              }}
              onClick={() => onSelect(item)}
            >
              {item.label}
            </div>
          );
        })
      )}
    </div>
  );
}
