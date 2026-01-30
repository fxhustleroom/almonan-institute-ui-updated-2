export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
};

const KEY = 'almonan_auth_tokens_v1';

export function getTokens(): AuthTokens | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthTokens;
  } catch {
    return null;
  }
}

export function setTokens(tokens: AuthTokens) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(tokens));
}

export function clearTokens() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY);
}
