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

To make router intent clear (and enable future optimizations), you can now use router‑specific subpath imports. All existing imports still work unchanged.

### Imports

```
# Existing (unchanged)
@kinde-oss/kinde-auth-nextjs
@kinde-oss/kinde-auth-nextjs/server
@kinde-oss/kinde-auth-nextjs/components
@kinde-oss/kinde-auth-nextjs/middleware

# New (additive)
@kinde-oss/kinde-auth-nextjs/app
@kinde-oss/kinde-auth-nextjs/app/server
@kinde-oss/kinde-auth-nextjs/pages
@kinde-oss/kinde-auth-nextjs/pages/server
```

### Which path to use

| Path | Use in | Typical usage |
|------|--------|---------------|
| `.../app` | App Router client/RSC | Provider, hooks, link components |
| `.../app/server` | App Router server code (route handlers, server actions) | Session + auth helpers |
| `.../pages` | Pages Router client code | Same client exports as root |
| `.../pages/server` | Pages API routes / SSR utilities | Session + auth helpers |

### Behavior parity
All new subpaths currently re-export the exact same implementations as the legacy ones. No behavior change, no deprecations yet. Future minor versions may optimize these bundles; any divergence will be documented.

### Migration (optional)
```ts
// Before (still valid)
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

// After (App Router example)
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/app/server';
```

### Helper wrappers (syntactic sugar)

```ts
import { createAppRouterSession } from '@kinde-oss/kinde-auth-nextjs/app/server';
import { createPagesRouterSession } from '@kinde-oss/kinde-auth-nextjs/pages/server';

// App Router
const appSession = createAppRouterSession();
const token = await appSession.getAccessToken?.();

// Pages Router
export default async function handler(req, res) {
	const pageSession = createPagesRouterSession(req, res);
	const user = await pageSession.getUser?.();
	res.status(200).json({ user });
}
```

Wrappers simply call `getKindeServerSession`; they:
- Make router context explicit
- Provide future extension points
- Assist gradual migration from Pages to App Router

You can ignore them and continue using `getKindeServerSession` directly if you prefer.
