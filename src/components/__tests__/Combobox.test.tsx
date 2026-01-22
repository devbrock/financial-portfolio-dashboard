import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Combobox } from '../Combobox/Combobox';
import type { ComboboxItem } from '../Combobox/Combobox.types';

const items: ComboboxItem[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'disabled-item', label: 'Disabled Item', disabled: true },
];

describe('Combobox', () => {
  describe('basic rendering', () => {
    it('renders with placeholder', () => {
      render(<Combobox items={items} placeholder="Search fruits..." />);
      expect(screen.getByPlaceholderText('Search fruits...')).toBeInTheDocument();
    });

    it('shows combobox role with proper aria attributes', () => {
      render(<Combobox items={items} />);
      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('aria-autocomplete', 'list');
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('keyboard navigation', () => {
    it('opens listbox and navigates with ArrowDown', async () => {
      const user = userEvent.setup();
      render(<Combobox items={items} minChars={1} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'a');

      // Wait for listbox to appear
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // ArrowDown should navigate to first item
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-activedescendant');
      });
    });

    it('opens listbox with ArrowDown when closed', async () => {
      const user = userEvent.setup();
      render(<Combobox items={items} minChars={1} filterItems={false} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'a');

      // Wait for listbox to appear
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Close it
      fireEvent.keyDown(input, { key: 'Escape' });
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });

      // ArrowDown should re-open
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    it('navigates up with ArrowUp', async () => {
      const user = userEvent.setup();
      render(<Combobox items={items} minChars={1} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'a');

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Navigate down twice
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      // Navigate up
      fireEvent.keyDown(input, { key: 'ArrowUp' });

      // Should still have an active descendant
      expect(input).toHaveAttribute('aria-activedescendant');
    });

    it('selects item with Enter', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      render(<Combobox items={items} minChars={1} onValueChange={onValueChange} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'a');

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Navigate to first item and select
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(onValueChange).toHaveBeenCalledWith('apple');
      });
    });

    it('does nothing on Enter when listbox is closed', async () => {
      const onValueChange = vi.fn();
      render(<Combobox items={items} minChars={1} onValueChange={onValueChange} />);

      const input = screen.getByRole('combobox');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('does nothing on Enter when no item is active', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      render(<Combobox items={items} minChars={1} onValueChange={onValueChange} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'a');

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Press Enter without navigating to any item
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('closes listbox with Escape', async () => {
      const user = userEvent.setup();
      render(<Combobox items={items} minChars={1} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'a');

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('does nothing on Escape when listbox is closed', () => {
      const setOpen = vi.fn();
      render(<Combobox items={items} minChars={1} />);

      const input = screen.getByRole('combobox');
      fireEvent.keyDown(input, { key: 'Escape' });

      // Should not throw or cause issues
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('calls custom onKeyDown handler', async () => {
      const onKeyDown = vi.fn();
      const user = userEvent.setup();
      render(<Combobox items={items} minChars={1} onKeyDown={onKeyDown} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'a');

      fireEvent.keyDown(input, { key: 'ArrowDown' });

      expect(onKeyDown).toHaveBeenCalled();
    });

    it('respects preventDefault from custom onKeyDown', async () => {
      const onKeyDown = vi.fn((e: React.KeyboardEvent) => {
        e.preventDefault();
      });
      const user = userEvent.setup();
      render(<Combobox items={items} minChars={1} onKeyDown={onKeyDown} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'a');

      // Navigate down - since we're preventing default, the internal handler will return early
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      // The callback should still have been called
      expect(onKeyDown).toHaveBeenCalled();
    });

    it('handles ArrowDown at end of list gracefully', async () => {
      const user = userEvent.setup();
      render(<Combobox items={items.slice(0, 2)} minChars={1} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'a');

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Navigate past the end
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      // Should not throw, just stay at end
      expect(input).toHaveAttribute('aria-activedescendant');
    });

    it('handles ArrowUp at start of list gracefully', async () => {
      const user = userEvent.setup();
      render(<Combobox items={items} minChars={1} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'a');

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Navigate to first item then try to go up
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      fireEvent.keyDown(input, { key: 'ArrowUp' });

      // Should stay at index 0
      expect(input).toHaveAttribute('aria-activedescendant');
    });
  });

  describe('disabled items', () => {
    it('does not select disabled items', async () => {
      const onValueChange = vi.fn();
      const user = userEvent.setup();
      render(
        <Combobox
          items={[{ value: 'disabled', label: 'Disabled', disabled: true }]}
          minChars={1}
          onValueChange={onValueChange}
        />
      );

      const input = screen.getByRole('combobox');
      await user.type(input, 'd');

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe('focus and blur', () => {
    it('opens on focus when query meets minChars', async () => {
      const user = userEvent.setup();
      render(<Combobox items={items} minChars={1} defaultValue="apple" />);

      const input = screen.getByRole('combobox');
      await user.click(input);

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('closes on blur when closeOnBlur is true', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <Combobox items={items} minChars={1} closeOnBlur />
          <button>Other</button>
        </div>
      );

      const input = screen.getByRole('combobox');
      await user.type(input, 'a');

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Other' }));

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('calls custom onFocus handler', async () => {
      const onFocus = vi.fn();
      const user = userEvent.setup();
      render(<Combobox items={items} onFocus={onFocus} />);

      const input = screen.getByRole('combobox');
      await user.click(input);

      expect(onFocus).toHaveBeenCalled();
    });

    it('calls custom onBlur handler', async () => {
      const onBlur = vi.fn();
      const user = userEvent.setup();
      render(
        <div>
          <Combobox items={items} onBlur={onBlur} />
          <button>Other</button>
        </div>
      );

      const input = screen.getByRole('combobox');
      await user.click(input);
      await user.click(screen.getByRole('button', { name: 'Other' }));

      expect(onBlur).toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('shows loading announcement in live region', async () => {
      const user = userEvent.setup();
      render(<Combobox items={[]} minChars={1} loading />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'a');

      expect(screen.getByText('Loading results')).toBeInTheDocument();
    });

    it('shows no results in live region when empty', async () => {
      const user = userEvent.setup();
      render(<Combobox items={[]} minChars={1} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'xyz');

      await waitFor(() => {
        expect(screen.getByText('No results')).toBeInTheDocument();
      });
    });
  });

  describe('input transformation', () => {
    it('applies inputTransform to typed value', async () => {
      const user = userEvent.setup();
      render(<Combobox items={items} inputTransform={v => v.toUpperCase()} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'apple');

      expect(input).toHaveValue('APPLE');
    });
  });

  describe('controlled value', () => {
    it('updates display when value changes externally', () => {
      const { rerender } = render(<Combobox items={items} value="apple" />);

      const input = screen.getByRole('combobox');
      expect(input).toHaveValue('Apple');

      rerender(<Combobox items={items} value="banana" />);
      expect(input).toHaveValue('Banana');
    });
  });

  describe('filtering', () => {
    it('filters items based on query when filterItems is true', async () => {
      const user = userEvent.setup();
      render(<Combobox items={items} minChars={1} filterItems />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'ban');

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      expect(screen.getByText('Banana')).toBeInTheDocument();
      expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    });

    it('shows all items when filterItems is false', async () => {
      const user = userEvent.setup();
      render(<Combobox items={items} minChars={1} filterItems={false} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'ban');

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      expect(screen.getByText('Banana')).toBeInTheDocument();
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });
  });

  describe('selection behavior', () => {
    it('closes on select when closeOnSelect is true', async () => {
      const user = userEvent.setup();
      render(<Combobox items={items} minChars={1} closeOnSelect />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'a');

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Apple'));

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('stays open on select when closeOnSelect is false', async () => {
      const user = userEvent.setup();
      render(<Combobox items={items} minChars={1} closeOnSelect={false} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'a');

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Apple'));

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

  describe('onInputChange callback', () => {
    it('calls onInputChange when typing', async () => {
      const onInputChange = vi.fn();
      const user = userEvent.setup();
      render(<Combobox items={items} onInputChange={onInputChange} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'a');

      expect(onInputChange).toHaveBeenCalledWith('a');
    });
  });

  describe('empty filtered list with ArrowDown', () => {
    it('handles ArrowDown with empty filtered list', async () => {
      const user = userEvent.setup();
      render(<Combobox items={[]} minChars={1} />);

      const input = screen.getByRole('combobox');
      await user.type(input, 'xyz');

      // ArrowDown with no items should not throw
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      // activeIndex should handle gracefully (NaN case in Math.min)
      expect(input).not.toHaveAttribute('aria-activedescendant');
    });
  });
});

