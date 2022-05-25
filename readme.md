# Kinde Auth NextJS

Kinde Auth for NextJS. Server-side with PKCE (OAuth2.1).

## Usage

Get started in 5 minutes.

### Setup environment variables

Put these things in your `.env` file.

```bash
KINDE_DOMAIN='app.kinde.localtest.me'
KINDE_REDIRECT_URL='kinde.localtest.me'
KINDE_LOGOUT_URL='kinde.localtest.me/404'
CLIENT_ID='reg@live'
CLIENT_SECRET='[your secret]'
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

Create a file at `myapp/pages/api/auth/[...kindeAuth].js`
Inside the file `[...kindeAuth].js` put this code:

```js
import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/bundle";

export default handleAuth();
```

### Getting user information

To access the user information, use the `useAuth` hook from any part of your app, wrapped by your `KindeProvider`.

```js
import styles from "../styles/Home.module.css";

export default function Home() {
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

Pointing to `/api/auth/login` will take you to the login page etc.
