import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { exportPortfolioReportCSV } from '../exportCSV';

describe('exportPortfolioReportCSV', () => {
  const originalCreateElement = document.createElement.bind(document);
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;
  const originalBlob = globalThis.Blob;
  let link: HTMLAnchorElement | null = null;
  let clickSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-02-01T12:00:00Z'));
    clickSpy = vi.fn();
    link = null;

    vi.spyOn(document, 'createElement').mockImplementation(tagName => {
      if (tagName === 'a') {
        link = {
          href: '',
          download: '',
          click: clickSpy,
        } as unknown as HTMLAnchorElement;
        return link;
      }
      return originalCreateElement(tagName);
    });

    if (originalCreateObjectURL) {
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
    } else {
      URL.createObjectURL = vi.fn(() => 'blob:mock');
    }

    if (originalRevokeObjectURL) {
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    } else {
      URL.revokeObjectURL = vi.fn();
    }

    globalThis.Blob = class MockBlob {
      private readonly parts: unknown[];
      public readonly type?: string;

      constructor(parts: unknown[] = [], options?: BlobPropertyBag) {
        this.parts = parts;
        this.type = options?.type;
      }

      async text() {
        return this.parts.map(part => (typeof part === 'string' ? part : String(part))).join('');
      }
    } as unknown as typeof Blob;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    globalThis.Blob = originalBlob;
  });

  it('builds a CSV file and triggers download', async () => {
    exportPortfolioReportCSV({
      generatedAt: '2024-02-01',
      currency: 'USD',
      rangeLabel: '30d',
      rate: 1.2,
      performance: [
        { date: '2024-01-01', value: 100 },
        { date: '2024-01-02', value: 110 },
      ],
      allocation: [
        { name: 'Stocks', valuePct: 60 },
        { name: 'Crypto', valuePct: 40 },
      ],
      holdings: [
        {
          symbol: 'AAPL',
          name: 'Alpha, "Quote"',
          quantity: 1.2345,
          purchasePrice: 100,
          currentPrice: 110,
          totalValue: 135,
          pnl: 35,
          purchaseDate: '2024-01-01',
        },
      ],
    });

    expect(link?.download).toBe('portfolio-report-2024-02-01.csv');
    expect(clickSpy).toHaveBeenCalled();

    const blobArg = (URL.createObjectURL as unknown as vi.Mock).mock.calls[0]?.[0] as Blob;
    const csvText = await blobArg.text();

    expect(csvText).toContain('Portfolio Report');
    expect(csvText).toContain('Generated At,2024-02-01');
    expect(csvText).toContain('Diversification');
    expect(csvText).toContain('Holdings');
    expect(csvText).toContain('AAPL,"Alpha, ""Quote"""');
    expect(csvText).toContain('2024-01-02,132.00');
  });
});
