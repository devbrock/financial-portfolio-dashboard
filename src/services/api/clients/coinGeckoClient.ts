import axios from 'axios';
import { applyApiErrorHandling } from './withErrorHandling';

const BASE_URL = 'https://api.coingecko.com/api/v3';

/* Axios client for the CoinGecko API */
export const coinGeckoClient = axios.create({
  baseURL: BASE_URL,
});

applyApiErrorHandling(coinGeckoClient, 'CoinGecko');
