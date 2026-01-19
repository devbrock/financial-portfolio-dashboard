import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Carousel } from '../Carousel/Carousel';

describe('Carousel', () => {
  it('renders slides and navigates with arrows', async () => {
    const user = userEvent.setup();
    render(
      <Carousel loop={false}>
        <div>Slide A</div>
        <div>Slide B</div>
      </Carousel>
    );

    const panels = screen.getAllByRole('tabpanel', { hidden: true });
    expect(panels[0]).toHaveAttribute('aria-hidden', 'false');
    expect(panels[1]).toHaveAttribute('aria-hidden', 'true');

    const nextButton = screen.getByRole('button', { name: 'Next slide' });
    await user.click(nextButton);

    const updatedPanels = screen.getAllByRole('tabpanel', { hidden: true });
    expect(updatedPanels[1]).toHaveAttribute('aria-hidden', 'false');

    const prevButton = screen.getByRole('button', { name: 'Previous slide' });
    await user.click(prevButton);

    const resetPanels = screen.getAllByRole('tabpanel', { hidden: true });
    expect(resetPanels[0]).toHaveAttribute('aria-hidden', 'false');
  });

  it('navigates with pagination dots', async () => {
    const user = userEvent.setup();
    render(
      <Carousel>
        <div>Slide A</div>
        <div>Slide B</div>
        <div>Slide C</div>
      </Carousel>
    );

    const dots = screen.getAllByRole('tab', { name: /Go to slide/i });
    expect(dots).toHaveLength(3);

    await user.click(dots[2]);
    const panels = screen.getAllByRole('tabpanel', { hidden: true });
    expect(panels[2]).toHaveAttribute('aria-hidden', 'false');
  });
});
