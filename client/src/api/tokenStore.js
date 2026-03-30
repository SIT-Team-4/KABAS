/**
 * Token storage with three layers: in-memory, sessionStorage, localStorage.
 *
 * Security note: when "remember me" is selected the JWT is persisted in
 * localStorage, which is accessible to any JS running on the same origin.
 * This is an accepted trade-off for the current project stage — the default
 * (sessionStorage) is cleared when the tab closes, limiting exposure.
 *
 * Future improvement: use httpOnly cookies set by the server so tokens are
 * never accessible to client-side JavaScript.
 */
const SESSION_TOKEN_KEY = "kabas.auth.sessionToken";
const PERSISTENT_TOKEN_KEY = "kabas.auth.persistentToken";

let memoryToken = null;

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage && !!window.sessionStorage;
}

export function getToken() {
  if (memoryToken) return memoryToken;
  if (!canUseStorage()) return null;
  return window.sessionStorage.getItem(SESSION_TOKEN_KEY)
    || window.localStorage.getItem(PERSISTENT_TOKEN_KEY);
}

export function setToken(token, { remember } = { remember: false }) {
  memoryToken = token;
  if (!canUseStorage()) return;

  window.sessionStorage.removeItem(SESSION_TOKEN_KEY);
  window.localStorage.removeItem(PERSISTENT_TOKEN_KEY);

  if (!token) return;

  if (remember) {
    window.localStorage.setItem(PERSISTENT_TOKEN_KEY, token);
  } else {
    window.sessionStorage.setItem(SESSION_TOKEN_KEY, token);
  }
}

export function clearToken() {
  memoryToken = null;
  if (!canUseStorage()) return;
  window.sessionStorage.removeItem(SESSION_TOKEN_KEY);
  window.localStorage.removeItem(PERSISTENT_TOKEN_KEY);
}
