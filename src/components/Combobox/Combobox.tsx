import * as React from 'react';
import { cn } from '@utils/cn';
import { Input } from '../Input/Input';
import { useControllableState } from '../_internal/useControllableState';
import type { ComboboxItem, ComboboxProps } from './Combobox.types';
import { ComboboxList } from './ComboboxList';
import { findLabel } from './comboboxUtils';
import { createComboboxKeyHandler } from './useComboboxKeyboard';

/**
 * Combobox
 * Searchable select for symbols; supports debounced input and keyboard navigation.
 *
 * A11y notes (spec):
 * - role=combobox, aria-expanded, aria-controls, aria-activedescendant
 * - suggestions list: role=listbox; items role=option; selected state via aria-selected
 * - announce loading and 'no results' via aria-live polite region
 */
export function Combobox(props: ComboboxProps) {
  const {
    items,
    value,
    defaultValue,
    onValueChange,
    placeholder,
    debounceMs = 250,
    onQueryChange,
    onInputChange,
    inputTransform,
    minChars = 1,
    filterItems = true,
    closeOnSelect = true,
    closeOnBlur = true,
    loading = false,
    className,
    inputClassName,
    'data-testid': dataTestId,
    onKeyDown,
    onFocus,
    onBlur,
    ...restInputProps
  } = props;

  const listboxId = React.useId();
  const liveId = React.useId();

  const [selectedValue, setSelectedValue] = useControllableState<string>({
    value,
    defaultValue: defaultValue ?? '',
    onChange: onValueChange,
  });

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState<string>(() => findLabel(items, selectedValue));
  const [debouncedQuery, setDebouncedQuery] = React.useState(query);
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);

  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!open) setQuery(findLabel(items, selectedValue));
  }, [items, open, selectedValue]);

  React.useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedQuery(query), debounceMs);
    return () => window.clearTimeout(handle);
  }, [query, debounceMs]);

  React.useEffect(() => {
    onQueryChange?.(debouncedQuery);
  }, [debouncedQuery, onQueryChange]);

  const filtered = React.useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (q.length < minChars) return [] as ComboboxItem[];
    if (!filterItems) return [...items];
    return items.filter(it => it.label.toLowerCase().includes(q));
  }, [items, debouncedQuery, minChars, filterItems]);

  const activeItemId =
    activeIndex >= 0 && activeIndex < filtered.length ? `${listboxId}-opt-${activeIndex}` : undefined;

  const openIfReady = React.useCallback(
    (nextQuery: string) => setOpen(nextQuery.trim().length >= minChars),
    [minChars]
  );

  const handleSelect = React.useCallback(
    (item: ComboboxItem) => {
      if (item.disabled) return;
      setSelectedValue(item.value);
      setQuery(item.label);
      setActiveIndex(-1);
      if (closeOnSelect) setOpen(false);
    },
    [closeOnSelect, setSelectedValue]
  );

  const handleKeyDown = createComboboxKeyHandler({
    open, setOpen, activeIndex, setActiveIndex, filtered, handleSelect, onKeyDown,
  });

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    onFocus?.(e);
    if (!e.defaultPrevented) openIfReady(query);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    onBlur?.(e);
    if (!e.defaultPrevented && closeOnBlur) window.setTimeout(() => setOpen(false), 0);
  };

  const describedBy =
    [restInputProps['aria-describedby'], loading ? liveId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('relative', className)} data-testid={dataTestId}>
      <Input
        {...restInputProps}
        ref={inputRef}
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-activedescendant={activeItemId}
        aria-describedby={describedBy}
        placeholder={placeholder}
        className={cn(inputClassName)}
        value={query}
        onChange={e => {
          const next = inputTransform ? inputTransform(e.currentTarget.value) : e.currentTarget.value;
          setQuery(next);
          setActiveIndex(-1);
          openIfReady(next);
          onInputChange?.(next);
        }}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />

      <div id={liveId} aria-live="polite" className="sr-only">
        {loading ? 'Loading results' : filtered.length === 0 && open ? 'No results' : ''}
      </div>

      {open && (loading || filtered.length > 0) && (
        <ComboboxList
          listboxId={listboxId}
          items={filtered}
          loading={loading}
          selectedValue={selectedValue}
          activeIndex={activeIndex}
          onActiveIndexChange={setActiveIndex}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
}
