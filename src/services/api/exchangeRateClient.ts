import axios from 'axios';
import { applyApiErrorHandling } from '@/services/api/clients/withErrorHandling';

const BASE_URL = 'https://api.exchangerate-api.com/v4/latest';

export const exchangeRateClient = axios.create({
  baseURL: BASE_URL,
});

applyApiErrorHandling(exchangeRateClient, 'Exchange Rates');
