'use client';

import {useKindeBrowserClient} from '@kinde-oss/kinde-auth-nextjs';

export default function Dashboard() {
  const {accessToken, isLoading, error} = useKindeBrowserClient();
  const now = Date.now();

  if (isLoading) return 'Loading...';
  const diff = Math.abs(now - accessToken?.exp * 1000);

  return (
    <div className="container">
      <div className="card start-hero">
        <p className="text-body-2 start-hero-intro">Woohoo!</p>
        <p className="text-display-2">
          Your authentication is all sorted.
          <br />
          Build the important stuff.
        </p>
      </div>
      <section className="next-steps-section">
        <h2 className="text-heading-1">Next steps for you</h2>
        {/* <pre>{accessToken?.exp}</pre> */}
        <pre>{diff / 1000}</pre>
      </section>
    </div>
  );
}
