import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('recharts', async () => {
  const React = await import('react');
  type ContentProps = {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    index?: number;
    name?: string;
    value?: number;
    depth?: number;
  };
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive">{children}</div>
    ),
    Treemap: ({
      content,
      children,
    }: {
      content: React.ReactElement<ContentProps>;
      children?: React.ReactNode;
    }) => {
      const leaf = React.cloneElement<ContentProps>(content, {
        x: 0,
        y: 0,
        width: 120,
        height: 80,
        index: 0,
        name: 'Tech',
        value: 200,
        depth: 1,
      });
      const tiny = React.cloneElement<ContentProps>(content, {
        x: 0,
        y: 0,
        width: 40,
        height: 20,
        index: 1,
        name: 'Tiny',
        value: 5,
        depth: 1,
      });
      const group = React.cloneElement<ContentProps>(content, {
        x: 0,
        y: 0,
        width: 80,
        height: 40,
        index: 2,
        name: 'Group',
        value: 10,
        depth: 0,
      });
      const missing = React.cloneElement<ContentProps>(content, {
        y: 0,
        index: 3,
        name: 'Missing',
        value: 0,
        depth: 1,
      });
      return (
        <svg data-testid="treemap">
          {leaf}
          {tiny}
          {group}
          {missing}
          {children}
        </svg>
      );
    },
    Tooltip: ({ content }: { content: (props: unknown) => React.ReactNode }) => (
      <div data-testid="tooltip">
        {content({
          active: true,
          label: 'Portfolio',
          payload: [{ name: 'Tech', value: 200 }, { value: '5' }, { value: null }, 'invalid'],
        })}
      </div>
    ),
  };
});

const { Treemap } = await import('../Treemap/Treemap');

describe('Treemap', () => {
  it('renders treemap cells and tooltip data', () => {
    render(<Treemap data={[{ name: 'Tech', value: 200 }]} />);

    expect(screen.getAllByText('Tech').length).toBeGreaterThan(0);
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('200.00')).toBeInTheDocument();
    expect(screen.getByText('Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.queryByText('Tiny')).not.toBeInTheDocument();
    expect(screen.queryByText('Group')).not.toBeInTheDocument();
  });
});
