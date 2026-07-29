# Upgrade guide: middleware 401s and cross-tab logout

This guide is for apps on **`@kinde-oss/kinde-auth-nextjs` 2.11.x** (or earlier) that use `withAuth` middleware and are seeing redirects or 5xx responses after logout in another tab.

**Target version:** latest (`v2.13.0` or newer, including builds that ship cross-tab logout sync).

---

## Do you need to change your middleware file?

**Usually no.** The `withAuth` API and options (`publicPaths`, `isReturnToCurrentPage`, `loginPage`, `isAuthorized`, `orgCode`, etc.) are unchanged.

A typical setup keeps working as-is:

```ts
// middleware.ts
import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export default withAuth(async function middleware(req) {
  // your logic
}, {
  publicPaths: ["/", "/about"],
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

You do **not** need to:

- Change import paths
- Add new middleware options for 401s or cross-tab sync
- Rewrite matchers solely for this upgrade

---

## What changes automatically after you upgrade

### 1. Unauthenticated API calls return `401` instead of redirect / 5xx

| Request type | Before (e.g. 2.11.0) | After (latest) |
|---|---|---|
| Document navigation (GET/HEAD, HTML) | Redirect to login | Redirect to login (unchanged) |
| Mutating methods (POST, PUT, PATCH, DELETE, …) | Redirect to login | **`401` JSON** `{ statusCode: 401, message: "Unauthorized" }` |
| Fetch/XHR-style GET (JSON `Accept`, `Sec-Fetch-Mode: cors`, `Sec-Fetch-Dest: empty`) | Redirect to login | **`401` JSON** |
| `/api/auth/setup` auth failures | Often **200** / **500** | **`401`** |

No middleware config is required for this; it is built into `withAuth`.

### 2. Cross-tab logout UI sync (client)

If you use `KindeProvider` and `LogoutLink`:

- Logging out in Tab A notifies other tabs
- Other tabs clear in-memory client auth state
- Focusing a stale tab revalidates via `/setup` and clears state if cookies are gone

No middleware changes are required for this either.

---

## Recommended upgrade steps

### Step 1 — Bump the package

```bash
pnpm add @kinde-oss/kinde-auth-nextjs@latest
# or: npm / yarn equivalent
```

Redeploy so Edge/Node middleware runs the new SDK build.

### Step 2 — Confirm middleware covers the routes that need auth

`withAuth` only runs where your `matcher` (and `publicPaths`) allow it.

- Protected **pages and APIs** should be included in the matcher.
- Use `publicPaths` for routes that must stay public (middleware can still refresh tokens on those paths when configured that way).
- Prefer running middleware broadly and marking public routes explicitly, rather than omitting APIs from the matcher.

Example:

```ts
export default withAuth(req, {
  publicPaths: ["/", "/pricing", "/api/health"],
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

### Step 3 — Update client API error handling (important)

After upgrade, unauthenticated `fetch` / XHR calls should receive **`401`**, not an HTML login redirect.

Ensure client code:

1. Checks `response.status === 401` (and does **not** assume a redirect to login).
2. Treats `401` as logged out (clear UI state, prompt login, or call your logout flow).
3. Does not parse redirect HTML as JSON.

Example:

```ts
const res = await fetch("/api/orders");
if (res.status === 401) {
  // session gone (e.g. logged out in another tab)
  // update UI / redirect to login yourself if desired
  return;
}
const data = await res.json();
```

If you previously followed redirects and treated “ended up on login” as the signal, switch to explicit `401` handling.

### Step 4 — Prefer SDK logout UI for cross-tab sync

Use `LogoutLink` (or ensure logout goes through the SDK logout route) so other tabs get the `logged_out` broadcast:

```tsx
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";

<LogoutLink>Sign out</LogoutLink>
```

If users hit `/api/auth/logout` via a plain `<a href>` without `LogoutLink`, cookies still clear, but other tabs may only update when they regain focus (visibility revalidation).

Wrap the app in `KindeProvider` if you rely on client auth state (`useKindeBrowserClient`).

### Step 5 — Smoke-test the reported scenario

1. Open two tabs on a protected page while logged in.
2. Log out in Tab A.
3. Switch to Tab B — UI should show logged out (immediately via broadcast, or on focus).
4. From Tab B, call a protected API — expect **`401`**, not a login redirect body or 5xx.
5. Navigate a protected page in the browser — expect redirect to login (document navigation).

---

## When you *might* need middleware code changes

Only if you customized auth failure behavior yourself:

| Situation | Action |
|---|---|
| Custom middleware that **reimplements** redirects instead of using `withAuth`’s response | Prefer composing with `withAuth`, or mirror the new 401 rules for API requests |
| App assumed **all** unauthenticated hits are redirects (including POST/fetch) | Update those callers for `401` (Step 3) |
| GET “API” routes that send `Accept: text/html` and navigate-style fetch headers | May still redirect; send JSON/`cors`/`empty` fetch headers, or handle redirect explicitly |
| Routes not in the middleware matcher | Add them, or protect with `protectApi` / server session checks |

There is **no new required option** on `withAuth` for this upgrade.

---

## Optional: protecting Route Handlers without middleware

If some APIs are outside the matcher, use server helpers / `protectApi` as you do today. Unauthenticated responses should remain **`401`**, consistent with middleware API behavior on latest.

---

## Summary

| Area | Required action |
|---|---|
| `middleware.ts` `withAuth` setup | **None** for standard setups |
| Package version | Upgrade to latest |
| Client `fetch` / API callers | Handle **`401`** as logged out |
| `KindeProvider` + `LogoutLink` | Recommended for cross-tab UI sync |
| Matcher / `publicPaths` | Review only if APIs were excluded from middleware |

**Bottom line:** existing middleware configuration can stay; the upgrade mainly changes **response behavior** (401 for API-style requests) and adds **client cross-tab sync**. Update callers that expected redirects or 5xx after logout.
