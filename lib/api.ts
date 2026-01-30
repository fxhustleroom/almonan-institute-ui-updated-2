import axios from 'axios';
import { API_BASE } from '@/lib/config';
import { getTokens } from '@/lib/auth-storage';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const t = getTokens();
  if (t?.accessToken) {
    config.headers = config.headers ?? {};
    // Bearer token auth (matches NestJS API)
    config.headers['Authorization'] = `Bearer ${t.accessToken}`;
  }
  return config;
});
