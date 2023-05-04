# NextJS SDK

Kinde allows you to add authentication to your NextJS application quickly and to gain access to user profile information.

[![NPM](https://img.shields.io/npm/v/@kinde-oss/kinde-auth-nextjs.svg)](https://www.npmjs.com/package/@kinde-oss/kinde-auth-nextjs)
[![Documentation](https://img.shields.io/badge/Kinde-Docs-green.svg)](https://kinde.com/docs)
[![Slack](https://img.shields.io/badge/Chat-Slack-pink.svg)](https://join.slack.com/t/thekindecommunity/shared_invite/zt-1pwhkx0gg-se1H8nY9Y8CwAY6Ppzi~Nw)
[![Twitter](https://img.shields.io/twitter/follow/HeyKinde?style=social)](https://twitter.com/intent/follow?screen_name=HeyKinde)

This guide demonstrates how to integrate Kinde with any new or existing NextJS application using the Kinde NextJS SDK.

## Installation

Using npm:

```bash
npm i @kinde-oss/kinde-auth-nextjs
```

Using yarn:

```bash
yarn add @kinde-oss/kinde-auth-nextjs
```

## Getting started

### Kinde configuration

On the Kinde web app navigate to `Settings` -> `App keys` and find the `Callbacks` input field.

Here you want to put in the callback URLs for your NextJS app, which should look something like this:

- **Allowed callback URLs** - `http://localhost:3000/api/auth/kinde_callback`
- **Allowed logout redirect URLs** - `http://localhost:3000`

> Make sure you press the `Save` button at the bottom of the page!

### Configuring your app

#### Environment variables

Put these variables in your `.env` file. You can find these variables on your Kinde `Settings` -> `App keys` page.

> - `KINDE_REDIRECT_URL` - where your app is running
> - `KINDE_ISSUER_URL` - your kinde domain
> - `KINDE_POST_LOGOUT_REDIRECT_ROUTE` - where you want users to be redirected to after logging out. Make sure this URL is under your allowed logout redirect URLs.
> - `KINDE_CLIENT_ID` - you can find this on the `App Keys` page
> - `KINDE_CLIENT_SECRET` - you can find this on the `App Keys` page

```bash
KINDE_REDIRECT_URL=[http://localhost:3000]
KINDE_ISSUER_URL=[https://your_kinde_domain]
KINDE_POST_LOGOUT_REDIRECT_ROUTE=/[your_logout_route]
KINDE_CLIENT_ID=[your_kinde_client_id]
KINDE_CLIENT_SECRET=[your_kinde_client_secret]
```

#### API endpoints

Create a file `myapp/pages/api/auth/[...kindeAuth].js` inside your NextJS project. Inside the file `[...kindeAuth].js` put this code:

```js
import {handleAuth} from '@kinde-oss/kinde-auth-nextjs';

export default handleAuth();
```

This will handle Kinde Auth endpoints in your NextJS app.

- `/api/auth/me` - this endpoint will get user information
- `/api/auth/login` - will redirect you to login at the KindeAuth server
- `/api/auth/logout` - will log you out of the app
- `/api/auth/register` - will redirect you to register at the KindeAuth server.

### Integrate with your app

#### KindeProvider

Kinde uses a React Context Provider to maintain its internal state in your application.

Import the Kinde Provider component and wrap your application in it.

```js
import {KindeProvider} from '@kinde-oss/kinde-auth-nextjs';

function MyApp({Component, pageProps}) {
  return (
    <KindeProvider>
      <Component {...pageProps} />
    </KindeProvider>
  );
}

export default MyApp;
```

### Getting user information

To access the user information, use the `useKindeAuth` hook from any part of your app, wrapped by your `KindeProvider`.

```js
import {useKindeAuth} from '@kinde-oss/kinde-auth-nextjs';
import Link from 'next/link';

export default function Home() {
  const auth = useKindeAuth();

  return (
    <ul>
      <li>
        <Link href="/api/auth/me">
          <a>Get user</a>
        </Link>
      </li>
      <li>
        <Link href="/api/auth/login">
          <a>Sign in</a>
        </Link>
      </li>
      <li>
        <Link href="/api/auth/logout">
          <a>Sign out</a>
        </Link>
      </li>
      <li>
        <Link href="/api/auth/register">
          <a>Sign up</a>
        </Link>
      </li>
    </ul>
  );
}
```
