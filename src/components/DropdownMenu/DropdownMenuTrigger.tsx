import * as React from 'react';
import { Slot } from '@/components/_internal/Slot';
import type { DropdownMenuTriggerProps } from './DropdownMenu.types';
import { useDropdownMenuContext } from './DropdownMenuContext';

export function DropdownMenuTrigger(props: DropdownMenuTriggerProps) {
  const { asChild, children } = props;
  const ctx = useDropdownMenuContext();
  const Comp = asChild ? Slot : 'button';

  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    // eslint-disable-next-line react-hooks/immutability
    ctx.triggerElRef.current = e.currentTarget as HTMLElement;
    switch (e.key) {
      case 'Enter':
      case ' ':
      case 'ArrowDown':
        e.preventDefault();
        ctx.setOpen(true);
        break;
    }
  };

  const onClick = (e: React.MouseEvent<HTMLElement>) => {
    // eslint-disable-next-line react-hooks/immutability
    ctx.triggerElRef.current = e.currentTarget as HTMLElement;
    ctx.setOpen(!ctx.open);
  };

  return (
    <span ref={ctx.triggerAnchorRef} className="inline-flex">
      <Comp onKeyDown={onKeyDown} onClick={onClick} aria-haspopup="menu" aria-expanded={ctx.open}>
        {children}
      </Comp>
    </span>
  );
}
