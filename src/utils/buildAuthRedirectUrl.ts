/**
 * Constructs the URL to redirect an unauthenticated user to the auth/login page,
 * appending optional `org_code` and `post_login_redirect_url` query parameters
 * based on middleware options.
 */
export const buildAuthRedirectUrl = (
  loginPage: string,
  {
    orgCode,
    isReturnToCurrentPage,
    pathname,
    search,
  }: {
    orgCode?: string;
    isReturnToCurrentPage?: boolean;
    pathname?: string;
    search?: string;
  },
): string => {
  const params = new URLSearchParams();

  if (orgCode) {
    params.set("org_code", orgCode);
  }

  if (isReturnToCurrentPage) {
    params.set("post_login_redirect_url", (pathname ?? "") + (search ?? ""));
  }

  const queryString = params.toString();
  return queryString ? `${loginPage}?${queryString}` : loginPage;
};
