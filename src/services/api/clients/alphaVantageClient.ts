import axios from 'axios';
import { applyApiErrorHandling } from './withErrorHandling';

const BASE_URL = 'https://www.alphavantage.co/query';

/* Axios client for the Alpha Vantage API */
export const alphaVantageClient = axios.create({
  baseURL: BASE_URL,
  params: {
    apikey: import.meta.env.VITE_ALPHA_VANTAGE_API_KEY,
  },
});

applyApiErrorHandling(alphaVantageClient, 'Alpha Vantage');
