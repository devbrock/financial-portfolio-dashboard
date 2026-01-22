import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Skeleton,
  StatusMessage,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Text,
} from '@components';
import { formatDate, formatEarningsTime } from '../marketFormatters';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type { FinnhubEarningsCalendarEntry } from '@/types/finnhub';

type EarningsSectionProps = {
  data: FinnhubEarningsCalendarEntry[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRetry: () => void;
  formatMoney: (value: number) => string;
  formatCompactMoney: (value: number) => string;
};

/**
 * Displays the upcoming earnings calendar card.
 */
export function EarningsSection({
  data,
  isLoading,
  isError,
  error,
  onRetry,
  formatMoney,
  formatCompactMoney,
}: EarningsSectionProps) {
  return (
    <section aria-label="Earnings calendar">
      <Card>
        <CardHeader>
          <Heading as="h2" className="text-lg">
            Earnings calendar
          </Heading>
          <Text as="div" size="sm" tone="muted">
            Upcoming results in the next 7 days
          </Text>
        </CardHeader>
        <CardBody>
          {isError ? (
            <StatusMessage
              tone="danger"
              title="Unable to load the earnings calendar."
              message={getErrorMessage(error, 'Please try again in a moment.')}
              actionLabel="Retry"
              onAction={onRetry}
            />
          ) : isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : data.length === 0 ? (
            <StatusMessage
              title="No earnings scheduled."
              message="Check back later for upcoming results."
              className="border-dashed bg-transparent"
            />
          ) : (
            <Table tableProps={{ 'aria-label': 'Earnings calendar' }}>
              <TableHead>
                <TableRow>
                  <TableHeadCell>Date</TableHeadCell>
                  <TableHeadCell>Symbol</TableHeadCell>
                  <TableHeadCell>Time</TableHeadCell>
                  <TableHeadCell>EPS (Actual / Est.)</TableHeadCell>
                  <TableHeadCell>Revenue (Actual / Est.)</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.slice(0, 10).map(item => (
                  <TableRow key={`${item.symbol}-${item.date}`}>
                    <TableCell>{formatDate(item.date)}</TableCell>
                    <TableCell className="font-semibold">{item.symbol}</TableCell>
                    <TableCell>{formatEarningsTime(item.hour)}</TableCell>
                    <TableCell>
                      {item.epsActual == null && item.epsEstimate == null
                        ? '--'
                        : `${item.epsActual == null ? '--' : formatMoney(item.epsActual)} / ${item.epsEstimate == null ? '--' : formatMoney(item.epsEstimate)}`}
                    </TableCell>
                    <TableCell>
                      {item.revenueActual == null && item.revenueEstimate == null
                        ? '--'
                        : `${item.revenueActual == null ? '--' : formatCompactMoney(item.revenueActual)}` +
                          ` / ${item.revenueEstimate == null ? '--' : formatCompactMoney(item.revenueEstimate)}`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </section>
  );
}
