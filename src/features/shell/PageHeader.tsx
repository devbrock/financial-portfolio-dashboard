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
    <Inline
      align="center"
      justify="between"
      className="animate-in fade-in slide-in-from-top-1 gap-3 py-4 duration-300 motion-reduce:animate-none"
    >
      <div className="min-w-0">
        <Heading as="h1" className="text-3xl md:text-2xl">
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
