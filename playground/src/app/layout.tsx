'use client';

import './globals.css';
import {
  RegisterLink,
  LoginLink,
  LogoutLink
} from '@kinde-oss/kinde-auth-nextjs/components';
import {useKindeBrowserClient} from '@kinde-oss/kinde-auth-nextjs';
import Link from 'next/link';

// export const metadata = {
//   title: 'Kinde Auth',
//   description: 'Kinde with NextJS App Router'
// };

export default function RootLayout({children}: {children: React.ReactNode}) {
  const {isAuthenticated, user} = useKindeBrowserClient();
  return (
    <html lang="en">
      <body>
        <header>
          <nav className="nav container">
            <h1 className="text-display-3">KindeAuth</h1>
            <div>
              {!isAuthenticated ? (
                <>
                  <LoginLink className="btn btn-ghost sign-in-btn">
                    Sign in
                  </LoginLink>
                  <RegisterLink className="btn btn-dark">Sign up</RegisterLink>
                </>
              ) : (
                <div className="profile-blob">
                  {user?.picture ? (
                    <img
                      className="avatar"
                      src={user?.picture}
                      alt="user profile avatar"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="avatar">
                      {user?.given_name?.[0]}
                      {user?.family_name?.[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-heading-2">
                      {user?.given_name} {user?.family_name}
                    </p>

                    <LogoutLink className="text-subtle">Log out</LogoutLink>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="footer">
          <div className="container">
            <strong className="text-heading-2">KindeAuth</strong>
            <p className="footer-tagline text-body-3">
              Visit our{' '}
              <Link className="link" href="https://kinde.com/docs">
                help center
              </Link>
            </p>

            <small className="text-subtle">
              © 2023 KindeAuth, Inc. All rights reserved
            </small>
          </div>
        </footer>
      </body>
    </html>
  );
}
