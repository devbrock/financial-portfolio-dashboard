import { useMemo } from "react";
import {
  AreaChart,
  ChartContainer,
  Chip,
  DeltaPill,
  Inline,
  Skeleton,
  Text,
} from "@components";
import { cn } from "@/utils/cn";
import type { PerformancePoint } from "@/types/dashboard";
import { formatMoneyUsd } from "@utils/formatMoneyUsd";
import { formatCompact } from "@utils/formatCompact";
import { formatSignedPct } from "@utils/formatSignedPct";

type PerformanceChartProps = {
  data: readonly PerformancePoint[];
  range: "7d" | "30d" | "90d" | "1y";
  onRangeChange: (range: "7d" | "30d" | "90d" | "1y") => void;
  loading?: boolean;
  isSimulated?: boolean;
  flash?: boolean;
};

export function PerformanceChart(props: PerformanceChartProps) {
  const {
    data,
    range,
    onRangeChange,
    loading = false,
    isSimulated = false,
    flash = false,
  } = props;

  const { totalProfitUsd, profitPercentage } = useMemo(() => {
    if (data.length === 0) return { totalProfitUsd: 0, profitPercentage: 0 };

    const total = data[data.length - 1].profitUsd;
    const initial = data[0].profitUsd;
    const change = total - initial;
    const percentage = initial !== 0 ? (change / initial) * 100 : 0;

    return { totalProfitUsd: total, profitPercentage: percentage };
  }, [data]);

  return (
    <ChartContainer
      title="Profit status"
      subtitle="Performance"
      className={cn(
        flash &&
          "ring-2 ring-emerald-200/80 shadow-[0_0_0_2px_rgba(16,185,129,0.2)] animate-pulse"
      )}
      actions={
        <Inline align="center" className="gap-2">
          <Chip selected={range === "7d"} onClick={() => onRangeChange("7d")}>
            7D
          </Chip>
          <Chip
            selected={range === "30d"}
            onClick={() => onRangeChange("30d")}
          >
            30D
          </Chip>
          <Chip
            selected={range === "90d"}
            onClick={() => onRangeChange("90d")}
          >
            90D
          </Chip>
          <Chip selected={range === "1y"} onClick={() => onRangeChange("1y")}>
            1Y
          </Chip>
        </Inline>
      }
      aria-busy={loading || undefined}
    >
      {loading ? (
        <div className="space-y-3" aria-hidden="true">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-[260px] w-full" />
        </div>
      ) : (
        <>
          <Inline align="end" justify="between" className="mb-3 gap-3">
            <div>
              <Text as="div" className="text-2xl font-semibold">
                {formatMoneyUsd(totalProfitUsd)}
              </Text>
              <Text as="div" size="sm" tone="muted">
                Total profit
              </Text>
            </div>
            <DeltaPill
              direction={
                profitPercentage > 0
                  ? "up"
                  : profitPercentage < 0
                    ? "down"
                    : "flat"
              }
              tone={
                profitPercentage > 0
                  ? "success"
                  : profitPercentage < 0
                    ? "danger"
                    : "neutral"
              }
            >
              {formatSignedPct(profitPercentage)}
            </DeltaPill>
          </Inline>
          <AreaChart<PerformancePoint>
            data={data}
            xKey="month"
            series={[
              {
                key: "profitUsd",
                name: "Profit",
                color: "var(--ui-primary)",
              },
            ]}
            yTickFormatter={(v) =>
              typeof v === "number" ? `$${formatCompact(v)}` : String(v)
            }
          />
          {isSimulated ? (
            <Text as="div" size="xs" tone="muted" className="mt-3">
              Simulated performance data.
            </Text>
          ) : null}
        </>
      )}
    </ChartContainer>
  );
}
