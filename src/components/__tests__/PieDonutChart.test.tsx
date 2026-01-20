import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('recharts', async () => {
  const React = await import('react');
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive">{children}</div>
    ),
    PieChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="piechart">{children}</div>
    ),
    Tooltip: ({ content }: { content: (props: unknown) => React.ReactNode }) => (
      <div data-testid="tooltip">
        {content({
          active: true,
          label: 'Breakdown',
          payload: [{ name: 'Alpha', value: 42, color: '#111111' }],
        })}
      </div>
    ),
    Pie: ({
      innerRadius,
      outerRadius,
      dataKey,
      nameKey,
      children,
    }: {
      innerRadius?: number;
      outerRadius?: number;
      dataKey?: string;
      nameKey?: string;
      children?: React.ReactNode;
    }) => (
      <div
        data-testid="pie"
        data-inner={innerRadius}
        data-outer={outerRadius}
        data-name={String(nameKey)}
        data-value={String(dataKey)}
      >
        {children}
      </div>
    ),
    Cell: ({ fill }: { fill: string }) => <span data-testid="cell" data-fill={fill} />,
  };
});

const { PieDonutChart } = await import('../PieDonutChart/PieDonutChart');

const data = [
  { name: 'Alpha', value: 60 },
  { name: 'Beta', value: 30 },
  { name: 'Gamma', value: 10 },
];

describe('PieDonutChart', () => {
  it('renders donut defaults with tooltip content', () => {
    render(<PieDonutChart data={data} nameKey="name" valueKey="value" colors={['red', 'green']} />);

    const pie = screen.getByTestId('pie');
    expect(pie).toHaveAttribute('data-inner', '56');
    expect(pie).toHaveAttribute('data-outer', '90');
    expect(pie).toHaveAttribute('data-name', 'name');
    expect(pie).toHaveAttribute('data-value', 'value');

    const cells = screen.getAllByTestId('cell');
    expect(cells).toHaveLength(3);
    expect(cells[0]).toHaveAttribute('data-fill', 'red');
    expect(cells[1]).toHaveAttribute('data-fill', 'green');
    expect(cells[2]).toHaveAttribute('data-fill', 'red');

    expect(screen.getByText('Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('42.00')).toBeInTheDocument();
  });

  it('renders pie variant with explicit outer radius', () => {
    render(
      <PieDonutChart
        data={data}
        nameKey="name"
        valueKey="value"
        variant="pie"
        innerRadius={44}
        outerRadius={120}
      />
    );

    const pie = screen.getByTestId('pie');
    expect(pie).toHaveAttribute('data-inner', '0');
    expect(pie).toHaveAttribute('data-outer', '120');
  });
});
