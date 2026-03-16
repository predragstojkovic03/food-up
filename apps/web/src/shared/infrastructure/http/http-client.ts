import { HttpError } from './http-error';

/**
 * Typed HTTP client wrapping the native Fetch API.
 *
 * Automatically attaches `Content-Type: application/json` and an `Authorization`
 * bearer token to every request when a token getter is provided.
 * Throws {@link HttpError} for any non-2xx response.
 */
export class HttpClient {
  /**
   * @param getToken - Optional function returning the current bearer token.
   *   Called before each request; returning `null` omits the Authorization header.
   */
  constructor(private readonly getToken?: () => string | null) {}

  /**
   * Sends a GET request and returns the parsed JSON response body.
   *
   * @template TResponse - Expected shape of the response body.
   * @param url - Request URL.
   * @throws {HttpError} When the response status is not ok.
   */
  async get<TResponse>(url: string): Promise<TResponse> {
    const res = await fetch(url, {
      headers: this.buildHeaders(),
    });
    if (!res.ok) throw new HttpError(res.status, await res.text());

    return res.json();
  }

  /**
   * Sends a POST request with a JSON-serialized body and returns the parsed JSON response body.
   *
   * @template TBody - Shape of the request body.
   * @template TResponse - Expected shape of the response body.
   * @param url - Request URL.
   * @param body - Request payload, serialized to JSON.
   * @throws {HttpError} When the response status is not ok.
   */
  async post<TBody, TResponse>(url: string, body: TBody): Promise<TResponse> {
    const res = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new HttpError(res.status, await res.text());

    return res.json();
  }

  private buildHeaders(): HeadersInit {
    const token = this.getToken?.();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }
}
