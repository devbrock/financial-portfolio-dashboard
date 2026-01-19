import type React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../DropdownMenu/DropdownMenu';

describe('DropdownMenu', () => {
  it('opens on click and closes on outside click', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Profile</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.click(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('supports keyboard navigation and escape to close', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>First</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Second</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByRole('button', { name: 'Open' });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    const firstItem = screen.getByRole('menuitem', { name: 'First' });
    const secondItem = screen.getByRole('menuitem', { name: 'Second' });
    firstItem.focus();
    await waitFor(() => expect(firstItem).toHaveFocus());

    fireEvent.keyDown(firstItem, { key: 'ArrowDown' });
    await waitFor(() => expect(secondItem).toHaveFocus());

    fireEvent.keyDown(secondItem, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('wraps focus on arrow up navigation', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>First</DropdownMenuItem>
          <DropdownMenuItem>Second</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByRole('button', { name: 'Open' });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    const firstItem = screen.getByRole('menuitem', { name: 'First' });
    const secondItem = screen.getByRole('menuitem', { name: 'Second' });
    firstItem.focus();
    await waitFor(() => expect(firstItem).toHaveFocus());

    fireEvent.keyDown(firstItem, { key: 'ArrowUp' });
    await waitFor(() => expect(secondItem).toHaveFocus());
  });

  it('keeps menu open when item click is prevented', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
    });

    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onClick}>Keep Open</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await user.click(screen.getByRole('menuitem', { name: 'Keep Open' }));

    expect(onClick).toHaveBeenCalled();
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('closes menu when item is activated', () => {
    const onClick = vi.fn();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onClick}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    fireEvent.click(screen.getByRole('menuitem', { name: 'Logout' }));
    expect(onClick).toHaveBeenCalled();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
