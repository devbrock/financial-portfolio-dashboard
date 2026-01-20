import { cn } from '@/utils/cn';
import type { DropdownMenuItemProps } from './DropdownMenu.types';
import { dropdownMenuItemClassName } from './DropdownMenu.styles';
import { useDropdownMenuContext } from './DropdownMenuContext';

export function DropdownMenuItem(props: DropdownMenuItemProps) {
  const { className, inset, onClick, ...rest } = props;
  const ctx = useDropdownMenuContext();

  return (
    <button
      type="button"
      role="menuitem"
      className={cn(dropdownMenuItemClassName, inset && 'pl-8', className)}
      onClick={e => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        ctx.setOpen(false);
      }}
      {...rest}
    />
  );
}
