import {
  DeltaPill,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
  Inline,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Text,
} from '@components';
import { ChevronUp, EllipsisVertical } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { HoldingRow, SortKey, SortDir } from '@/types/dashboard';
import { formatMoneyUsd } from '@utils/formatMoneyUsd';
import { formatCompact } from '@utils/formatCompact';
import { formatSignedPct } from '@utils/formatSignedPct';
import { ariasort } from '@utils/ariasort';

type HoldingsTableProps = {
  holdings: readonly HoldingRow[];
  onSort: (key: SortKey) => void;
  sortKey: SortKey;
  sortDir: SortDir;
  onRemove: (id: string) => void;
  flash?: boolean;
};

export function HoldingsTable(props: HoldingsTableProps) {
  const { holdings, onSort, sortKey, sortDir, onRemove, flash = false } = props;

  return (
    <Table>
      <TableHead>
        <TableRow>
          <SortableTh
            label="Name"
            active={sortKey === 'name'}
            dir={sortKey === 'name' ? sortDir : null}
            onClick={() => onSort('name')}
          />
          <SortableTh
            label="Purchase Date"
            active={sortKey === 'date'}
            dir={sortKey === 'date' ? sortDir : null}
            onClick={() => onSort('date')}
          />
          <SortableTh
            label="Volume"
            active={sortKey === 'volume'}
            dir={sortKey === 'volume' ? sortDir : null}
            onClick={() => onSort('volume')}
          />
          <SortableTh
            label="Change"
            active={sortKey === 'changePct'}
            dir={sortKey === 'changePct' ? sortDir : null}
            onClick={() => onSort('changePct')}
          />
          <SortableTh
            label="Purchase Price"
            active={sortKey === 'purchasePrice'}
            dir={sortKey === 'purchasePrice' ? sortDir : null}
            onClick={() => onSort('purchasePrice')}
          />
          <SortableTh
            label="Current Price"
            active={sortKey === 'priceUsd'}
            dir={sortKey === 'priceUsd' ? sortDir : null}
            onClick={() => onSort('priceUsd')}
          />
          <SortableTh
            label="Profit/Loss"
            active={sortKey === 'pnlUsd'}
            dir={sortKey === 'pnlUsd' ? sortDir : null}
            onClick={() => onSort('pnlUsd')}
          />
          <TableHeadCell className="w-12">
            <span className="sr-only">Actions</span>
          </TableHeadCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {holdings.map(h => (
          <TableRow
            key={h.id}
            hover
            className={cn(flash && 'bg-emerald-50/60 transition-colors duration-700')}
          >
            <TableCell>
              <Inline align="center" className="gap-3">
                <span
                  aria-hidden="true"
                  className={cn(
                    'grid h-9 w-9 place-items-center rounded-2xl bg-(--ui-surface-2)',
                    h.logo && 'overflow-hidden'
                  )}
                >
                  {h.logo ? (
                    <img src={h.logo} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-semibold">{h.name.slice(0, 1)}</span>
                  )}
                </span>
                <div className="min-w-0">
                  <Text as="div" className="truncate font-semibold">
                    {h.name}
                  </Text>
                  <Text as="div" size="sm" tone="muted">
                    {h.ticker}
                  </Text>
                </div>
              </Inline>
            </TableCell>
            <TableCell>{h.date}</TableCell>
            <TableCell>{formatCompact(h.volume)}</TableCell>
            <TableCell>
              <DeltaPill
                direction={h.changePct > 0 ? 'up' : h.changePct < 0 ? 'down' : 'flat'}
                tone={h.changePct > 0 ? 'success' : h.changePct < 0 ? 'danger' : 'neutral'}
              >
                {formatSignedPct(h.changePct)}
              </DeltaPill>
            </TableCell>
            <TableCell>{formatMoneyUsd(h.purchasePrice)}</TableCell>
            <TableCell>{formatMoneyUsd(h.priceUsd)}</TableCell>
            <TableCell>
              <Text
                as="span"
                className={cn('font-semibold', h.pnlUsd >= 0 ? 'text-emerald-700' : 'text-red-700')}
              >
                {h.pnlUsd >= 0 ? '+' : ''}
                {formatMoneyUsd(h.pnlUsd)}
              </Text>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <IconButton
                    ariaLabel={`Row actions for ${h.ticker}`}
                    variant="ghost"
                    size="sm"
                    icon={<EllipsisVertical />}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className={cn(
                    'animate-in fade-in zoom-in-95 duration-150 motion-reduce:animate-none'
                  )}
                >
                  <DropdownMenuItem onClick={() => undefined}>View details</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onRemove(h.id)}>Remove…</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function SortableTh(props: {
  label: string;
  active: boolean;
  dir: SortDir | null;
  onClick: () => void;
}) {
  const { label, active, dir, onClick } = props;
  return (
    <TableHeadCell aria-sort={ariasort(dir)}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'inline-flex items-center gap-2',
          'rounded-lg px-2 py-1',
          'hover:bg-(--ui-surface)',
          'focus-visible:ring-2 focus-visible:ring-(--ui-focus) focus-visible:ring-offset-2 focus-visible:ring-offset-(--ui-bg) focus-visible:outline-none'
        )}
      >
        <span>{label}</span>
        <span aria-hidden="true" className={cn('inline-flex', !active && 'opacity-40')}>
          <ChevronUp />
        </span>
      </button>
    </TableHeadCell>
  );
}
