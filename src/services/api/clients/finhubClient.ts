import axios from "axios";

const BASE_URL = "https://finnhub.io/api/v1";

/* Axios client for the Finhub API */
export const finhubClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "X-Finnhub-Token": process.env.FINHUB_API_KEY,
  },
});
