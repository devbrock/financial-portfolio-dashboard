import * as React from 'react';
import { cn } from '@/utils/cn';
import { dropdownMenuSeparatorClassName } from './DropdownMenu.styles';

export function DropdownMenuSeparator(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div role="separator" className={cn(dropdownMenuSeparatorClassName, className)} {...rest} />
  );
}
