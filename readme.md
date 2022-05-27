# Kinde Auth NextJS

Kinde Auth for NextJS. Server-side with PKCE (OAuth2.1).

## Usage

Get started in 5 minutes.

### Install

Install `@kinde-oss/kinde-auth-nextjs` as a dependency to your NextJS project.

```bash
npm i @kinde-oss/kinde-auth-nextjs
```

### Setup environment variables

Put these variables in your `.env` file. You can find these variables on your Kinde `Settings` -> `App keys` page.

```bash
KINDE_REDIRECT_URL=[http://localhost:3000]
KINDE_ISSUER_URL=[https://your_kinde_domain]
KINDE_POST_LOGOUT_REDIRECT_ROUTE=/[your_logout_route]
KINDE_CLIENT_ID=[your_kinde_client_id]
KINDE_CLIENT_SECRET=[your_kinde_client_secret]
```

### Wrap your app in a KindeProvider

Import the provider and wrap the parts of your app that need access to your users.

```js
import "../styles/globals.css";
import { KindeProvider } from "@kinde-oss/kinde-auth-nextjs";

function MyApp({ Component, pageProps }) {
  return (
    <KindeProvider>
      <Component {...pageProps} />
    </KindeProvider>
  );
}

export default MyApp;
```

### Put in your API endpoints

Create a file `myapp/pages/api/auth/[...kindeAuth].js` inside your NextJS project.
Inside the file `[...kindeAuth].js` put this code:

```js
import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/bundle";

export default handleAuth();
```

### Getting user information

To access the user information, use the `useKindeAuth` hook from any part of your app, wrapped by your `KindeProvider`.

```js
import styles from "../styles/Home.module.css";
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";

export default function Home() {
  const auth = useKindeAuth();
  console.log(auth);

  return (
    <div className={styles["link-list"]}>
      <a href="/api/auth/me">get me</a>
      <a href="/api/auth/login">Login</a>
      <a href="/api/auth/logout">logout</a>
      <a href="/api/auth/register">register</a>
    </div>
  );
}
```

- `/api/auth/me` - this endpoint will get user information
- `/api/auth/login` - will redirect you to login at the KindeAuth server
- `/api/auth/logout` - will log you out of the app
- `/api/auth/register` - will redirect you to register at the KindeAuth server.
