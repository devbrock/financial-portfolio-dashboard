import type { AlertProps } from '../Alert/Alert.types';

export type StatusMessageProps = {
  title: string;
  message?: string;
  tone?: AlertProps['tone'];
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};
