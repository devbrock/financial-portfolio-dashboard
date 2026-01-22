import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { AllocationChart } from '../AllocationChart';
import { renderWithProviders } from '@/test/test-utils';
import type { AllocationSlice } from '@/types/dashboard';

const data: AllocationSlice[] = [
  { name: 'Stocks', value: 60, color: 'red' },
  { name: 'Crypto', value: 40, color: 'blue' },
];

describe('AllocationChart', () => {
  it('renders chart metadata', () => {
    renderWithProviders(<AllocationChart data={data} totalInvested={1000} />);
    expect(screen.getByText('Diversification')).toBeInTheDocument();
    expect(screen.getByText('Current allocation')).toBeInTheDocument();
    expect(screen.getByText('$1,000.00')).toBeInTheDocument();
  });

  it('renders an empty state when no allocation data is present', () => {
    renderWithProviders(<AllocationChart data={[]} totalInvested={0} />);
    expect(screen.getByText('No diversification data yet.')).toBeInTheDocument();
    expect(
      screen.getByText('Add holdings to see your allocation breakdown.')
    ).toBeInTheDocument();
  });
});
