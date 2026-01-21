import { http, HttpResponse } from 'msw';

const FINNHUB_BASE = 'https://finnhub.io/api/v1';
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const ALPHAVANTAGE_BASE = 'https://www.alphavantage.co';

export const handlers = [
  http.get(`${FINNHUB_BASE}/search`, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') ?? '';

    const result = query
      ? [
          {
            description: 'Apple Inc',
            displaySymbol: 'AAPL',
            symbol: 'AAPL',
            type: 'Common Stock',
          },
        ]
      : [];

    return HttpResponse.json({ count: result.length, result });
  }),
  http.get(`${FINNHUB_BASE}/quote`, ({ request }) => {
    const url = new URL(request.url);
    const symbol = url.searchParams.get('symbol') ?? '';
    const price = symbol === 'AAPL' ? 190 : 120;
    return HttpResponse.json({
      c: price,
      d: 1,
      dp: 0.8,
      h: price + 2,
      l: price - 2,
      o: price - 1,
      pc: price - 0.5,
    });
  }),
  http.get(`${FINNHUB_BASE}/stock/profile2`, ({ request }) => {
    const url = new URL(request.url);
    const symbol = url.searchParams.get('symbol') ?? '';
    return HttpResponse.json({
      country: 'US',
      currency: 'USD',
      exchange: 'NASDAQ',
      ipo: '1980-12-12',
      marketCapitalization: 1000,
      name: symbol === 'AAPL' ? 'Apple' : 'Company',
      phone: '',
      shareOutstanding: 100,
      ticker: symbol,
      weburl: 'https://example.com',
      logo: 'https://logo.example.com/logo.png',
      finnhubIndustry: 'Technology',
    });
  }),
  http.get(`${FINNHUB_BASE}/calendar/earnings`, () => {
    return HttpResponse.json({
      earningsCalendar: [
        {
          date: '2024-01-10',
          epsActual: 1.2,
          epsEstimate: 1.1,
          hour: 'bmo',
          quarter: 1,
          revenueActual: 1000000,
          revenueEstimate: 950000,
          symbol: 'AAPL',
          year: 2024,
        },
      ],
    });
  }),
  http.get(`${FINNHUB_BASE}/news`, () => {
    return HttpResponse.json([
      {
        category: 'general',
        id: 1,
        datetime: 1704412800,
        headline: 'Markets open higher',
        image: 'https://example.com/news.jpg',
        related: 'SPY',
        source: 'Example News',
        summary: 'Stocks open higher ahead of earnings.',
        url: 'https://example.com/news/1',
      },
    ]);
  }),
  http.get(`${FINNHUB_BASE}/company-news`, () => {
    return HttpResponse.json([
      {
        category: 'company',
        id: 2,
        datetime: 1704499200,
        headline: 'Company earnings preview',
        image: 'https://example.com/company-news.jpg',
        related: 'AAPL',
        source: 'Example News',
        summary: 'Previewing upcoming earnings.',
        url: 'https://example.com/news/2',
      },
    ]);
  }),
  http.get(`${COINGECKO_BASE}/search`, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('query') ?? '';
    const coins = query
      ? [
          {
            id: 'bitcoin',
            name: 'Bitcoin',
            symbol: 'btc',
            thumb: 'https://assets.coingecko.com/coins/images/1/thumb.png',
            large: 'https://assets.coingecko.com/coins/images/1/large.png',
            market_cap_rank: 1,
          },
        ]
      : [];
    return HttpResponse.json({ coins });
  }),
  http.get(`${COINGECKO_BASE}/simple/price`, ({ request }) => {
    const url = new URL(request.url);
    const ids = (url.searchParams.get('ids') ?? '').split(',');
    const response: Record<string, { usd: number; usd_24h_change: number }> = {};
    ids.filter(Boolean).forEach(id => {
      response[id] = {
        usd: id === 'bitcoin' ? 50000 : 100,
        usd_24h_change: id === 'bitcoin' ? 2.5 : -1.2,
      };
    });
    return HttpResponse.json(response);
  }),
  http.get(`${COINGECKO_BASE}/coins/markets`, ({ request }) => {
    const url = new URL(request.url);
    const ids = (url.searchParams.get('ids') ?? '').split(',').filter(Boolean);
    const response = ids.map(id => ({
      id,
      symbol: id.slice(0, 3),
      name: id === 'bitcoin' ? 'Bitcoin' : id,
      image: 'https://assets.coingecko.com/coins/images/1/large.png',
      current_price: id === 'bitcoin' ? 50000 : 100,
      price_change_percentage_24h: id === 'bitcoin' ? 2.5 : -1.2,
    }));
    return HttpResponse.json(response);
  }),
  http.get(`${COINGECKO_BASE}/coins/:id`, ({ params }) => {
    const id = params.id as string;
    return HttpResponse.json({
      id,
      symbol: id.slice(0, 3),
      name: id === 'bitcoin' ? 'Bitcoin' : id,
      image: {
        thumb: 'https://assets.coingecko.com/coins/images/1/thumb.png',
        small: 'https://assets.coingecko.com/coins/images/1/small.png',
        large: 'https://assets.coingecko.com/coins/images/1/large.png',
      },
    });
  }),
  http.get(`${COINGECKO_BASE}/coins/:id/market_chart`, () => {
    return HttpResponse.json({
      prices: [[0, 1]],
      market_caps: [[0, 1]],
      total_volumes: [[0, 1]],
    });
  }),
  http.get(`${ALPHAVANTAGE_BASE}/query`, ({ request }) => {
    const url = new URL(request.url);
    const symbol = (url.searchParams.get('symbol') ?? 'AAPL').toUpperCase();
    return HttpResponse.json({
      'Meta Data': {
        '1. Information': 'Daily Prices',
        '2. Symbol': symbol,
        '3. Last Refreshed': '2024-01-05',
        '4. Output Size': 'Compact',
        '5. Time Zone': 'US/Eastern',
      },
      'Time Series (Daily)': {
        '2024-01-05': {
          '1. open': '190.00',
          '2. high': '195.00',
          '3. low': '188.00',
          '4. close': '192.00',
          '5. volume': '100000',
        },
        '2024-01-04': {
          '1. open': '185.00',
          '2. high': '191.00',
          '3. low': '184.00',
          '4. close': '188.00',
          '5. volume': '90000',
        },
      },
    });
  }),
];
