import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardSidebar } from '../DashboardSidebar';
import { SidebarProvider } from '@components';
import { renderWithProviders } from '@/test/test-utils';

describe('DashboardSidebar', () => {
  it('calls onNavChange when a menu item is selected', async () => {
    const user = userEvent.setup();
    const onNavChange = vi.fn();

    renderWithProviders(
      <SidebarProvider>
        <DashboardSidebar activeNav="Overview" onNavChange={onNavChange} />
      </SidebarProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Market' }));
    expect(onNavChange).toHaveBeenCalledWith('Market');
  });
});
