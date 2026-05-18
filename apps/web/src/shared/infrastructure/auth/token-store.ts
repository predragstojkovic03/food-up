/**
 * In-memory access token store.
 *
 * WHY a module-level variable instead of React state or localStorage:
 * - localStorage: readable by any JS on the page — XSS can exfiltrate it silently.
 * - React state: triggers re-renders every time the token rotates, which is noisy.
 * - Module variable: lives only in memory, cleared on tab close / page refresh,
 *   never persisted. A 15-minute access token in memory is low-risk even under XSS.
 *
 * The refresh token (which can mint new access tokens) lives in an httpOnly cookie
 * and is completely inaccessible to JavaScript, which is where the real protection is.
 */
let _accessToken: string | null = null;

export const tokenStore = {
  get: (): string | null => _accessToken,
  set: (token: string): void => { _accessToken = token; },
  clear: (): void => { _accessToken = null; },
};
