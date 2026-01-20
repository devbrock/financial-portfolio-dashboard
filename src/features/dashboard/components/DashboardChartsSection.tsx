import type { AllocationSlice } from '@/types/dashboard';
import { AllocationChart } from './AllocationChart';
import { PerformanceChart } from './PerformanceChart';

type DashboardChartsSectionProps = {
  range: '7d' | '30d' | '90d' | '1y';
  onRangeChange: (range: '7d' | '30d' | '90d' | '1y') => void;
  allocation: readonly AllocationSlice[];
  totalInvested: number;
  flashPrices: boolean;
};

export function DashboardChartsSection(props: DashboardChartsSectionProps) {
  const { range, onRangeChange, allocation, totalInvested, flashPrices } = props;

  return (
    <section aria-label="Charts" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <PerformanceChart range={range} onRangeChange={onRangeChange} flash={flashPrices} />
      <AllocationChart data={allocation} totalInvested={totalInvested} flash={flashPrices} />
    </section>
  );
}
