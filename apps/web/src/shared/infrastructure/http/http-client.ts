import { tokenStore } from '../auth/token-store';
import { HttpError } from './http-error';

type TokenStore = typeof tokenStore;

export class HttpClient {
  /**
   * In-flight refresh promise, shared across all concurrent requests.
   *
   * WHY deduplicate: if the access token expires while 5 requests are in flight,
   * all 5 get 401 simultaneously. Without deduplication, all 5 would fire a
   * /auth/refresh call — which would trigger reuse detection and kill the session.
   * By sharing a single promise, only one refresh fires; the others await its result.
   */
  private _refreshPromise: Promise<string | null> | null = null;

  constructor(
    private readonly _tokenStore: TokenStore,
    private readonly _onUnauthorized?: () => void,
  ) {}

  async get<TResponse>(url: string): Promise<TResponse> {
    const res = await this._fetch(url, {});
    if (!res.ok) throw new HttpError(res.status, await res.text());
    return res.json();
  }

  async post<TBody, TResponse>(url: string, body: TBody): Promise<TResponse> {
    const res = await this._fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new HttpError(res.status, await res.text());
    const text = await res.text();
    return text ? JSON.parse(text) : (undefined as TResponse);
  }

  async patch<TBody, TResponse>(url: string, body: TBody): Promise<TResponse> {
    const res = await this._fetch(url, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new HttpError(res.status, await res.text());
    const text = await res.text();
    return text ? JSON.parse(text) : (undefined as TResponse);
  }

  async delete(url: string): Promise<void> {
    const res = await this._fetch(url, { method: 'DELETE' });
    if (!res.ok) throw new HttpError(res.status, await res.text());
  }

  async download(url: string): Promise<void> {
    const res = await this._fetch(url, {});
    if (!res.ok) throw new HttpError(res.status, await res.text());

    const blob = await res.blob();
    const disposition = res.headers.get('Content-Disposition') ?? '';
    const match = disposition.match(/filename="([^"]+)"/);
    const filename = match?.[1] ?? 'download';

    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  /**
   * Core request executor with transparent 401 → refresh → retry.
   *
   * WHY build headers inline via a closure: `_buildHeaders()` reads the *current*
   * tokenStore value at call time. After a successful refresh, the store holds the
   * new token — so calling `_buildHeaders()` again for the retry automatically picks
   * up the fresh token without any extra wiring.
   */
  private async _fetch(url: string, init: Omit<RequestInit, 'headers'>): Promise<Response> {
    const buildHeaders = (): HeadersInit => ({
      'Content-Type': 'application/json',
      ...(this._tokenStore.get() ? { Authorization: `Bearer ${this._tokenStore.get()}` } : {}),
    });

    let res = await fetch(url, { ...init, headers: buildHeaders() });

    if (res.status !== 401) return res;

    // Attempt a silent token refresh before giving up
    if (!this._refreshPromise) {
      this._refreshPromise = this._doRefresh().finally(() => {
        this._refreshPromise = null;
      });
    }
    const newToken = await this._refreshPromise;

    if (!newToken) {
      // Refresh failed — the session is dead. Only redirect if the user is
      // already authenticated (avoids redirect loops during initial session restore).
      this._onUnauthorized?.();
      return res; // caller will see the 401 and can handle it (e.g. throw HttpError)
    }

    // Retry with the fresh token — buildHeaders() now reads the updated store
    return fetch(url, { ...init, headers: buildHeaders() });
  }

  /**
   * Calls /api/auth/refresh with credentials: 'include' so the browser sends the
   * httpOnly refresh cookie. Uses native fetch directly to avoid triggering the
   * 401 interceptor recursively.
   */
  private async _doRefresh(): Promise<string | null> {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) return null;
      const { access_token } = await res.json();
      this._tokenStore.set(access_token);
      return access_token;
    } catch {
      return null;
    }
  }
}
