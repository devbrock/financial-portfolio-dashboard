import axios from "axios";

const BASE_URL = "https://www.alphavantage.co/query";

/* Axios client for the Alpha Vantage API */
export const alphaVantageClient = axios.create({
  baseURL: BASE_URL,
  params: {
    apikey: import.meta.env.VITE_ALPHA_VANTAGE_API_KEY,
  },
});
