# TODO: Migrate JWT Auth from localStorage to httpOnly Cookies

## Context
PR #26 stores JWTs in localStorage/sessionStorage, which is vulnerable to XSS. This TODO documents a migration to httpOnly cookies so tokens are never accessible to client-side JavaScript.

---

## Server Changes

### 1. Install `cookie-parser`
**File:** `server/package.json`
```bash
cd server && npm install cookie-parser
```

### 2. Add cookie-parser middleware
**File:** `server/src/config/app.js`
- Import and mount `cookie-parser` before routes
- Add `credentials: true` to `corsOptions` so browsers send cookies cross-origin
```js
import cookieParser from 'cookie-parser';
// ...
const corsOptions = {
    // ... existing config
    credentials: true,  // ADD THIS
};
// ...
app.use(cookieParser());
```

### 3. Set cookie on login, clear on logout
**File:** `server/src/controllers/authController.js`
- `login()`: after `authService.login()`, set the JWT as an httpOnly cookie and return only the user (not the token) in the response body
- Add a `logout()` handler that clears the cookie
```js
// In login():
const result = await authService.login(data);
res.cookie('token', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // match JWT_EXPIRY
});
return res.status(200).json({ success: true, data: { user: result.user } });

// New logout handler:
export async function logout(req, res) {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
    return res.json({ success: true, message: 'Logged out' });
}
```

### 4. Add logout route
**File:** `server/src/routes/auth.js`
```js
router.post('/logout', authController.logout);
```

### 5. Read token from cookie in auth middleware
**File:** `server/src/middleware/auth.js`
- Check `req.cookies.token` as a third auth source (after Bearer header, before API key)
- This keeps backward compatibility with existing `Authorization: Bearer` and `x-api-key` flows
```js
// After the Bearer token check (line 19), before API key fallback:
const cookieToken = req.cookies?.token;
if (cookieToken) {
    try {
        req.user = await authService.verifyToken(cookieToken);
        return next();
    } catch {
        return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
}
```

---

## Client Changes

### 6. Add `credentials: "include"` to all fetch calls
**File:** `client/src/api/client.js`
- Add `credentials: "include"` to the fetch options so cookies are sent cross-origin
- Remove the `Authorization` header logic (lines 29-34)
```js
// Remove: import { getToken } from "./tokenStore";
// Remove: the auth/token/Authorization block
// Add credentials: "include" to the fetch call:
const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: mergedHeaders,
    credentials: "include",  // ADD THIS
    body: body != null ? JSON.stringify(body) : undefined,
    signal,
});
```

### 7. Simplify AuthContext — remove token management
**File:** `client/src/context/AuthContext.jsx`
- Remove imports of `clearToken`, `getToken`, `setToken`
- `bootstrapAuth`: always call `getMe()` (the cookie is sent automatically); if it 401s, user is not authenticated
- `login`: just call the API (cookie is set by server); no `setToken` needed
- `logout`: call `POST /auth/logout` API instead of `clearToken()`

### 8. Add logout API call
**File:** `client/src/api/authApi.js`
```js
export async function logout() {
    await apiClient.request("/auth/logout", { method: "POST" });
}
```

### 9. Delete tokenStore.js
**File:** `client/src/api/tokenStore.js`
- Delete entirely — no longer needed
- Remove any remaining imports in other files

---

## CSRF Protection (Required)

httpOnly cookies auto-attach on every request, making CSRF attacks possible. Choose one:

**Option A — Double-submit cookie (recommended for SPA)**
- Server sets a non-httpOnly CSRF token cookie on login
- Client reads it and sends it as an `X-CSRF-Token` header on mutating requests
- Server middleware compares header to cookie

**Option B — `sameSite: 'strict'` only**
- Already included in the cookie config above
- Sufficient for same-origin deployments (client and server on same domain)
- Not sufficient if client and API are on different domains (e.g., Render static site vs Render web service)

---

## Files Summary

| # | File | Action |
|---|------|--------|
| 1 | `server/package.json` | Add `cookie-parser` dependency |
| 2 | `server/src/config/app.js` | Add `cookieParser()` middleware, `credentials: true` to CORS |
| 3 | `server/src/controllers/authController.js` | Set cookie on login, add `logout()` handler |
| 4 | `server/src/routes/auth.js` | Add `POST /logout` route |
| 5 | `server/src/middleware/auth.js` | Read token from `req.cookies.token` |
| 6 | `client/src/api/client.js` | Add `credentials: "include"`, remove `Authorization` header logic |
| 7 | `client/src/context/AuthContext.jsx` | Remove token management, call logout API |
| 8 | `client/src/api/authApi.js` | Add `logout()` function |
| 9 | `client/src/api/tokenStore.js` | Delete file |

## Verification
1. `cd server && npm test` — no regressions
2. `cd client && CI=true npm test` — no regressions
3. Manual: login → inspect response headers for `Set-Cookie: token=...; HttpOnly` → verify `document.cookie` does NOT contain the token → access a protected page → logout → verify cookie cleared and protected page redirects to login
