import type * as React from "react";

export type ComboboxItem = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type ComboboxProps = {
  /**
   * Items to display in the suggestions list.
   */
  items: readonly ComboboxItem[];
  /**
   * Selected value (controlled).
   */
  value?: string;
  /**
   * Selected value (uncontrolled).
   */
  defaultValue?: string;
  /**
   * Called when a value is selected.
   */
  onValueChange?: (nextValue: string) => void;
  /**
   * Input placeholder.
   */
  placeholder?: string;
  /**
   * Debounce delay for query changes (ms).
   */
  debounceMs?: number;
  /**
   * Called with the debounced query string.
   */
  onQueryChange?: (query: string) => void;
  /**
   * Called with the raw query string on each input change.
   */
  onInputChange?: (query: string) => void;
  /**
   * Minimum characters before opening suggestions.
   */
  minChars?: number;
  /**
   * Filter items locally based on the query.
   */
  filterItems?: boolean;
  /**
   * Close suggestions when an item is selected.
   */
  closeOnSelect?: boolean;
  /**
   * Close suggestions on blur.
   */
  closeOnBlur?: boolean;
  /**
   * Marks the combobox as loading; announced via aria-live region.
   */
  loading?: boolean;
  /**
   * Optional className for the wrapper.
   */
  className?: string;
  /**
   * Optional className for the input.
   */
  inputClassName?: string;
  /**
   * Optional test id.
   */
  "data-testid"?: string;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "className" | "placeholder" | "size"
>;
