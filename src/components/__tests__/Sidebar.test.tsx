import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar, SidebarRail, SidebarTrigger } from '../Sidebar/Sidebar';
import { SidebarProvider } from '../Sidebar/sidebar.context';

describe('Sidebar', () => {
  it('toggles open state via rail', async () => {
    const user = userEvent.setup();
    render(
      <SidebarProvider defaultOpen>
        <Sidebar data-testid="sidebar" />
        <SidebarRail data-testid="rail" />
      </SidebarProvider>
    );

    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveAttribute('data-state', 'open');

    await user.click(screen.getByTestId('rail'));
    expect(sidebar).toHaveAttribute('data-state', 'collapsed');
  });

  it('renders offcanvas variant', () => {
    render(
      <SidebarProvider defaultOpen={false}>
        <Sidebar data-testid="sidebar" collapsible="offcanvas" />
        <SidebarTrigger />
      </SidebarProvider>
    );

    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveAttribute('data-collapsible', 'offcanvas');
    expect(sidebar).toHaveAttribute('data-state', 'collapsed');
  });
});
