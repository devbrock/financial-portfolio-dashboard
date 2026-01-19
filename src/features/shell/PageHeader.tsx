import type { ReactNode } from 'react';
import { Heading, Inline, Text } from '@components';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
};

export function PageHeader(props: PageHeaderProps) {
  const { title, subtitle, rightSlot } = props;

  return (
    <Inline align="center" justify="between" className="gap-3 py-4">
      <div className="min-w-0">
        <Heading as="h1" className="text-xl">
          {title}
        </Heading>
        {subtitle ? (
          <Text as="div" size="sm" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </div>
      {rightSlot ? <div className="shrink-0 text-right">{rightSlot}</div> : null}
    </Inline>
  );
}
