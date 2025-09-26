# Kinde NextJS

The Kinde SDK for NextJS.

You can also use the NextJS starter kit [here](https://github.com/kinde-starter-kits/kinde-nextjs-app-router-starter-kit).

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://makeapullrequest.com) [![Kinde Docs](https://img.shields.io/badge/Kinde-Docs-eee?style=flat-square)](https://kinde.com/docs/developer-tools/nextjs-sdk) [![Kinde Community](https://img.shields.io/badge/Kinde-Community-eee?style=flat-square)](https://thekindecommunity.slack.com)

## Documentation

Please refer to the Kinde [NextJS SDK document](https://docs.kinde.com/developer-tools/sdks/backend/nextjs-sdk/).

## Publishing

The core team handles publishing.

To publish a new package version, use the “Release and Publish to NPM” action in the “Actions” tab.

## Contributing

Please refer to Kinde’s [contributing guidelines](https://github.com/kinde-oss/.github/blob/489e2ca9c3307c2b2e098a885e22f2239116394a/CONTRIBUTING.md).

## Playground

To create the playground run `npm run dev:prepare`

This will clone the NextJS app router starter kit into a `/playground` directory and reference the SDK via `npm link`.

You will need to add your Kinde credentials to the generated `.env.local` file inside `/playground`

`npm run dev` will load up the playground on [http://localhost:3000](http://localhost:3000)

## License

By contributing to Kinde, you agree that your contributions will be licensed under its MIT License.

## Explicit Import Entry Points (App vs Pages Router)

Router‑specific subpaths make intent clear and enable future tree‑shaking. All existing root imports still work; these are additive.

```
# Existing
@kinde-oss/kinde-auth-nextjs
@kinde-oss/kinde-auth-nextjs/server

# New
@kinde-oss/kinde-auth-nextjs/app          (client / RSC)
@kinde-oss/kinde-auth-nextjs/app/server   (App Router server helpers)
@kinde-oss/kinde-auth-nextjs/pages        (Pages client)
@kinde-oss/kinde-auth-nextjs/pages/server (Pages server helpers)
```

| Subpath | Use for |
|---------|---------|
| `.../app` | App Router components, provider, hooks |
| `.../app/server` | App Router route handlers / server actions |
| `.../pages` | Pages Router client code |
| `.../pages/server` | Pages API routes / getServerSideProps-like logic |

### Session wrappers

We provide lightweight wrappers that surface token / flag / entitlement / role / permission access via `@kinde/js-utils`:

```ts
import { createAppRouterSession } from '@kinde-oss/kinde-auth-nextjs/app/server';
import { createPagesRouterSession } from '@kinde-oss/kinde-auth-nextjs/pages/server';

// App Router
const session = createAppRouterSession();
const accessToken = await session.getAccessToken?.();

// Pages Router
export default async function handler(req, res) {
  const session = createPagesRouterSession(req, res);
  const isAuth = await session.isAuthenticated?.();
  res.status(200).json({ isAuth });
}
```

Key points:
- Wrappers use js-utils for all token/flag/org/permission/role utilities (no legacy factories).
- `refreshTokens` now also uses the js-utils `refreshToken` flow; we manually persist refreshed tokens to Next.js cookies (App Router via `cookies()`, Pages via response headers) with the same splitting and persistence logic.
- Legacy exports (including `getKindeServerSession`) are unchanged and still supported.

Upcoming (non-breaking) refinements: replace interim cookie write logic when js-utils ships its server storage layer; add opt-in flag before removing any legacy paths.
