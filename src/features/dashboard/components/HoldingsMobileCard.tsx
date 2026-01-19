import {
  Badge,
  Card,
  CardBody,
  DeltaPill,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
  Inline,
  Text,
} from "@components";
import { EllipsisVertical } from "lucide-react";
import { cn } from "@/utils/cn";
import type { HoldingRow } from "@/types/dashboard";
import { formatMoneyUsd } from "@utils/formatMoneyUsd";
import { formatSignedPct } from "@utils/formatSignedPct";

type HoldingsMobileCardProps = {
  holding: HoldingRow;
  onRemove: (id: string) => void;
  flash?: boolean;
};

export function HoldingsMobileCard(props: HoldingsMobileCardProps) {
  const { holding, onRemove, flash = false } = props;

  return (
    <Card
      className={cn(
        "p-4",
        flash &&
          "ring-2 ring-emerald-200/80 shadow-[0_0_0_2px_rgba(16,185,129,0.2)] animate-pulse"
      )}
    >
      <CardBody className="space-y-3">
        <Inline align="center" justify="between" className="gap-3">
          <Inline align="center" className="gap-3">
            <span
              aria-hidden="true"
              className={cn(
                "grid h-10 w-10 place-items-center rounded-2xl bg-(--ui-surface-2)",
                holding.logo && "overflow-hidden"
              )}
            >
              {holding.logo ? (
                <img
                  src={holding.logo}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold">
                  {holding.name.slice(0, 1)}
                </span>
              )}
            </span>
            <div className="min-w-0">
              <Text as="div" className="truncate font-semibold">
                {holding.name}
              </Text>
              <Text as="div" size="sm" tone="muted">
                {holding.ticker} • {holding.date}
              </Text>
            </div>
          </Inline>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton
                ariaLabel={`Row actions for ${holding.ticker}`}
                variant="ghost"
                size="sm"
                icon={<EllipsisVertical />}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className={cn(
                "animate-in fade-in zoom-in-95 duration-150 motion-reduce:animate-none"
              )}
            >
              <DropdownMenuItem onClick={() => undefined}>
                View details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onRemove(holding.id)}>
                Remove…
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Inline>

        <Inline wrap gap="sm" className="gap-2">
          <Badge tone={holding.status === "active" ? "success" : "warning"}>
            {holding.status === "active" ? "Active" : "Pending"}
          </Badge>
          <DeltaPill
            direction={
              holding.changePct > 0
                ? "up"
                : holding.changePct < 0
                  ? "down"
                  : "flat"
            }
            tone={
              holding.changePct > 0
                ? "success"
                : holding.changePct < 0
                  ? "danger"
                  : "neutral"
            }
          >
            {formatSignedPct(holding.changePct)}
          </DeltaPill>
        </Inline>

        <Inline align="center" justify="between" className="gap-3">
          <Text as="div" size="sm" tone="muted">
            Purchase price
          </Text>
          <Text as="div" className="font-semibold">
            {formatMoneyUsd(holding.purchasePrice)}
          </Text>
        </Inline>
        <Inline align="center" justify="between" className="gap-3">
          <Text as="div" size="sm" tone="muted">
            Price
          </Text>
          <Text as="div" className="font-semibold">
            {formatMoneyUsd(holding.priceUsd)}
          </Text>
        </Inline>
        <Inline align="center" justify="between" className="gap-3">
          <Text as="div" size="sm" tone="muted">
            P/L
          </Text>
          <Text
            as="div"
            className={cn(
              "font-semibold",
              holding.pnlUsd >= 0 ? "text-emerald-700" : "text-red-700"
            )}
          >
            {holding.pnlUsd >= 0 ? "+" : ""}
            {formatMoneyUsd(holding.pnlUsd)}
          </Text>
        </Inline>
      </CardBody>
    </Card>
  );
}
