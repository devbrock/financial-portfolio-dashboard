import axios from "axios";

const BASE_URL = "https://finnhub.io/api/v1";

/* Axios client for the Finnhub API */
export const finnhubClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "X-Finnhub-Token": process.env.FINNHUB_API_KEY,
  },
});
