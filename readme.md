# Kinde NextJS

The Kinde SDK for NextJS.

You can also use the NextJS starter kit [here](https://github.com/kinde-starter-kits/kinde-nextjs-app-router-starter-kit).

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://makeapullrequest.com) [![Kinde Docs](https://img.shields.io/badge/Kinde-Docs-eee?style=flat-square)](https://kinde.com/docs/developer-tools/nextjs-sdk) [![Kinde Community](https://img.shields.io/badge/Kinde-Community-eee?style=flat-square)](https://thekindecommunity.slack.com)

## Documentation

Please refer to the Kinde [NextJS SDK document](https://docs.kinde.com/developer-tools/sdks/backend/nextjs-sdk/).

### Portal return URL allowlist

Set `KINDE_PORTAL_ALLOWED_RETURN_URL_REGEX` to restrict query-string
`returnUrl` values accepted by the portal route. This setting is optional and
separate from `KINDE_POST_LOGIN_ALLOWED_URL_REGEX`.

When it is unset, requested portal return URLs are passed through unchanged and
the SDK logs a one-time warning. When it is set, non-matching values fall back
to `KINDE_SITE_URL`. See the
[portal return URL](https://docs.kinde.com/developer-tools/sdks/backend/nextjs-sdk/#portal-return-url)
section of the Next.js SDK docs.

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
