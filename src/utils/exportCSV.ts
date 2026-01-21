type CsvValue = string | number | null | undefined;

type PortfolioReportParams = {
  generatedAt: string;
  currency: string;
  rangeLabel: string;
  rate: number;
  performance: Array<{ date: string; value: number }>;
  allocation: Array<{ name: string; valuePct: number }>;
  holdings: Array<{
    symbol: string;
    name: string;
    quantity: number;
    purchasePrice: number;
    currentPrice: number;
    totalValue: number;
    pnl: number;
    purchaseDate: string;
  }>;
};

const escapeCsv = (value: CsvValue) => {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const formatNumber = (value: number, digits = 2) => value.toFixed(digits);

const convert = (value: number, rate: number) => Number((value * rate).toFixed(2));

/**
 * exportPortfolioReportCSV
 * Builds a portfolio report CSV and triggers a client-side download.
 */
export function exportPortfolioReportCSV(params: PortfolioReportParams): void {
  const { generatedAt, currency, rangeLabel, rate, performance, allocation, holdings } = params;

  const rows: CsvValue[][] = [];
  rows.push(['Portfolio Report']);
  rows.push(['Generated At', generatedAt]);
  rows.push(['Currency', currency]);
  rows.push(['Range', rangeLabel]);
  rows.push([]);

  rows.push(['Performance']);
  rows.push(['Date', 'Value']);
  performance.forEach(point => {
    rows.push([point.date, formatNumber(convert(point.value, rate))]);
  });
  rows.push([]);

  rows.push(['Diversification']);
  rows.push(['Asset Class', 'Percent']);
  allocation.forEach(slice => {
    rows.push([slice.name, formatNumber(slice.valuePct)]);
  });
  rows.push([]);

  rows.push(['Holdings']);
  rows.push([
    'Symbol',
    'Name',
    'Quantity',
    'Purchase Price',
    'Current Price',
    'Total Value',
    'P/L',
    'Purchase Date',
  ]);
  holdings.forEach(holding => {
    rows.push([
      holding.symbol,
      holding.name,
      formatNumber(holding.quantity, 4),
      formatNumber(convert(holding.purchasePrice, rate)),
      formatNumber(convert(holding.currentPrice, rate)),
      formatNumber(convert(holding.totalValue, rate)),
      formatNumber(convert(holding.pnl, rate)),
      holding.purchaseDate,
    ]);
  });

  const csv = rows.map(row => row.map(escapeCsv).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `portfolio-report-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}
