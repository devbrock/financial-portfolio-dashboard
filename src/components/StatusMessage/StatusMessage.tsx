import { Alert } from '../Alert/Alert';
import { Button } from '../Button/Button';
import { Text } from '../Text/Text';
import { cn } from '@utils/cn';
import type { StatusMessageProps } from './StatusMessage.types';

/**
 * StatusMessage
 * Standardized empty/error/info block with optional action.
 */
export function StatusMessage(props: StatusMessageProps) {
  const { title, message, tone = 'info', actionLabel, onAction, className } = props;
  const showAction = Boolean(actionLabel && onAction);

  return (
    <Alert
      tone={tone}
      className={cn('items-start justify-between gap-4', className)}
      aria-live={tone === 'danger' ? 'assertive' : 'polite'}
    >
      <div className="min-w-0">
        <Text as="div" className="text-sm font-semibold">
          {title}
        </Text>
        {message ? (
          <Text as="div" size="sm" tone="muted" className="mt-1">
            {message}
          </Text>
        ) : null}
      </div>
      {showAction ? (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </Alert>
  );
}
