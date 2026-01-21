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
  const titleClassName =
    tone === 'danger'
      ? 'text-red-900 dark:text-red-100'
      : tone === 'warning'
        ? 'text-amber-900 dark:text-amber-100'
        : tone === 'success'
          ? 'text-emerald-900 dark:text-emerald-100'
          : 'text-(--ui-text)';
  const messageClassName =
    tone === 'danger'
      ? 'text-red-800 dark:text-red-200'
      : tone === 'warning'
        ? 'text-amber-800 dark:text-amber-200'
        : tone === 'success'
          ? 'text-emerald-800 dark:text-emerald-200'
          : 'text-(--ui-text-muted)';

  return (
    <Alert
      tone={tone}
      className={cn('items-start justify-between gap-4', className)}
      aria-live={tone === 'danger' ? 'assertive' : 'polite'}
    >
      <div className="min-w-0">
        <Text as="div" className={cn('text-sm font-semibold', titleClassName)}>
          {title}
        </Text>
        {message ? (
          <Text as="div" size="sm" className={cn('mt-1', messageClassName)}>
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
