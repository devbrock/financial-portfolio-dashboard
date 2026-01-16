import {
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
  Skeleton,
  Text,
} from "@components";
import { EllipsisVertical } from "lucide-react";
import { cn } from "@/utils/cn";
import type { AssetCardModel } from "@/types/dashboard";
import { formatMoneyUsd } from "@utils/formatMoneyUsd";
import { formatSignedPct } from "@utils/formatSignedPct";

type AssetSummaryCardProps = {
  asset: AssetCardModel;
  loading?: boolean;
};

export function AssetSummaryCard(props: AssetSummaryCardProps) {
  const { asset, loading = false } = props;

  const deltaTone =
    asset.weeklyDeltaPct > 0
      ? ("success" as const)
      : asset.weeklyDeltaPct < 0
        ? ("danger" as const)
        : ("neutral" as const);

  const deltaDir =
    asset.weeklyDeltaPct > 0
      ? ("up" as const)
      : asset.weeklyDeltaPct < 0
        ? ("down" as const)
        : ("flat" as const);

  return (
    <Card
      elevation="sm"
      className={cn(
        "p-5",
        "transition-shadow duration-200 motion-reduce:transition-none",
        !loading && "hover:shadow-md hover:shadow-black/10"
      )}
    >
      <CardBody className="space-y-3">
        <Inline align="center" justify="between" className="gap-3">
          <Inline align="center" className="min-w-0 gap-3">
            <div
              className={cn(
                "grid h-10 w-10 place-items-center rounded-2xl",
                "border border-(--ui-border) bg-(--ui-surface)"
              )}
              aria-hidden="true"
            >
              <span className="text-sm font-semibold">
                {asset.name.slice(0, 1)}
              </span>
            </div>
            <div className="min-w-0">
              {loading ? (
                <div className="space-y-2" aria-hidden="true">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-14" />
                </div>
              ) : (
                <>
                  <Text as="div" className="truncate font-semibold">
                    {asset.name}
                  </Text>
                  <Text as="div" size="sm" tone="muted" className="truncate">
                    {asset.ticker}
                  </Text>
                </>
              )}
            </div>
          </Inline>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton
                ariaLabel="Open menu"
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
                View asset
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => undefined}>
                Add alert
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => undefined}>
                Export
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Inline>

        <Inline align="end" justify="between" className="gap-3">
          {loading ? (
            <Skeleton className="h-8 w-28" />
          ) : (
            <Text as="div" className="text-2xl font-semibold">
              {formatMoneyUsd(asset.valueUsd)}
            </Text>
          )}

          {loading ? (
            <Skeleton className="h-6 w-24 rounded-full" />
          ) : (
            <Inline align="center" className="gap-2">
              <DeltaPill direction={deltaDir} tone={deltaTone}>
                {formatSignedPct(asset.weeklyDeltaPct)}
              </DeltaPill>
              <Text as="span" size="sm" tone="muted">
                Weekly
              </Text>
            </Inline>
          )}
        </Inline>
      </CardBody>
    </Card>
  );
}
