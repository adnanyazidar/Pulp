import { edenTreaty } from '@elysiajs/eden';
import type { App } from '../../backend/src/index';

// @ts-ignore: Elysia version mismatch between frontend and backend
export const api = edenTreaty<App>(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

/**
 * Utility to get headers with Authorization token
 * Use this for manual fetch calls or when extending the client
 */
export const getAuthHeaders = (token: string | null) => {
  return token ? { Authorization: `Bearer ${token}` } : {};
};
