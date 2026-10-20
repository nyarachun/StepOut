import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'https://stepout-events.onrender.com';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});