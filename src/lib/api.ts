import { edenTreaty } from '@elysiajs/eden';
import type { App } from '../../backend/src/index';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// @ts-expect-error: Elysia version mismatch between frontend and backend
export const api = edenTreaty<App>(BASE_URL);

/**
 * Returns an Eden Treaty client with the Authorization header pre-set.
 * Use this for all authenticated API calls.
 */
export function getAuthedApi() {
  // Import auth store lazily to avoid circular deps / SSR issues
  const token = (() => {
    try {
      const raw = localStorage.getItem('pulp-auth');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.state?.token ?? null;
    } catch {
      return null;
    }
  })();

  // @ts-expect-error: dynamic treaty access
  return edenTreaty<App>(BASE_URL, {
    $fetch: {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }
  });
}

/**
 * Utility to get headers with Authorization token
 */
export const getAuthHeaders = (token: string | null) => {
  return token ? { Authorization: `Bearer ${token}` } : {};
};
