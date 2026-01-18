import axios from "axios";
import { applyApiErrorHandling } from "./withErrorHandling";

const BASE_URL = "https://finnhub.io/api/v1";

/* Axios client for the Finnhub API */
export const finnhubClient = axios.create({
  baseURL: BASE_URL,
  params: {
    token: import.meta.env.VITE_FINNHUB_API_KEY,
  },
});

applyApiErrorHandling(finnhubClient);
