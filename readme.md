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

## New Explicit Import Entry Points (App vs Pages Router)

We have introduced **additive, non-breaking** explicit subpath imports to make it clearer which APIs you are using in a Next.js App Router vs Pages Router environment. All existing imports continue to work unchanged.

### Available existing imports
```
@kinde-oss/kinde-auth-nextjs
@kinde-oss/kinde-auth-nextjs/server
@kinde-oss/kinde-auth-nextjs/components
@kinde-oss/kinde-auth-nextjs/middleware
```

### New additive imports
```
@kinde-oss/kinde-auth-nextjs/app
@kinde-oss/kinde-auth-nextjs/app/server
@kinde-oss/kinde-auth-nextjs/pages
@kinde-oss/kinde-auth-nextjs/pages/server
```

### When to use which
- Use `.../app` in client components or RSC-compatible code for the App Router.
- Use `.../app/server` inside App Router server contexts (route handlers, server actions) when you need helpers like `getKindeServerSession`.
- Use `.../pages` and `.../pages/server` analogously when working in the traditional Pages Router.

### Behavior parity
Currently these new paths **re-export the same implementations** as the legacy generic paths. This guarantees there is no behavior change. Future minor versions may begin optimizing these new entrypoints (e.g., lighter dependencies) while keeping the old ones stable; any divergence will be documented.

### Migration (optional at this stage)
You can start switching to the explicit paths for clarity:
```ts
// Before (still valid)
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

// After (App Router example)
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/app/server';
```

No deprecation warnings are emitted yet (it is in the pipeline); this is a clarity & future-proofing step.
