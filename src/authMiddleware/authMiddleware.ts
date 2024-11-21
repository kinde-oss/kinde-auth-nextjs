import {NextRequest, NextResponse} from 'next/server';
import {config} from '../config/index';
import {type KindeAccessToken, KindeIdToken} from '../../types';
import {jwtDecoder} from '@kinde/jwt-decoder';
import {validateToken} from '@kinde/jwt-validator';

const handleMiddleware = async (req, options, onSuccess) => {
  const {pathname} = req.nextUrl;

  const isReturnToCurrentPage = options?.isReturnToCurrentPage;
  const loginPage = options?.loginPage || '/api/auth/login';

  let publicPaths = ['/_next', '/favicon.ico'];
  if (options?.publicPaths !== undefined) {
    if (Array.isArray(options?.publicPaths)) {
      publicPaths = options.publicPaths;
    }
  }

  const loginRedirectUrl = isReturnToCurrentPage
    ? `${loginPage}?post_login_redirect_url=${pathname}`
    : loginPage;

  if (loginPage == pathname || publicPaths.some((p) => pathname.startsWith(p)))
    return;

  const kindeToken = req.cookies.get('access_token');

  if (!kindeToken) {
    const response = NextResponse.redirect(
      new URL(loginRedirectUrl, options?.redirectURLBase || config.redirectURL)
    );
    return response;
  }
  console.log('here');
  

  const accessTokenValue = jwtDecoder<KindeAccessToken>(
    req.cookies.get('access_token')?.value
  );
  const idTokenValue = jwtDecoder<KindeIdToken>(
    req.cookies.get('id_token')?.value
  );

  // check token is valid
  const validateTokenResponse = await validateToken({
    token: kindeToken.value,
    domain: config.issuerURL
  });

  const customValidationValid = options?.isAuthorized
    ? options.isAuthorized({req, token: accessTokenValue})
    : true;

  if (validateTokenResponse.valid && customValidationValid && onSuccess) {
    return await onSuccess({
      token: accessTokenValue,
      user: {
        family_name: idTokenValue.family_name,
        given_name: idTokenValue.given_name,
        email: idTokenValue.email,
        id: idTokenValue.sub,
        picture: idTokenValue.picture
      }
    });
  }

  if (validateTokenResponse.valid && customValidationValid) {
    return;
  }

  return NextResponse.redirect(
    new URL(loginRedirectUrl, options?.redirectURLBase || config.redirectURL)
  );
};

/**
 * @param {Request} [req]
 * @param {function(req: Request & {kindeAuth: {user: any, token: string}})} [onIsAuthorized]
 */
export function withAuth(...args) {
  // most basic usage - no options
  if (!args.length || args[0] instanceof Request) {
    // @ts-ignore
    return handleMiddleware(...args);
  }

  // passing through the kindeAuth data to the middleware function
  if (typeof args[0] === 'function') {
    const middleware = args[0];
    const options = args[1];
    return async (...args) =>
      await handleMiddleware(args[0], options, async ({token, user}) => {
        args[0].kindeAuth = {token, user};
        return await middleware(...args);
      });
  }

  // includes options
  const options = args[0];
  // @ts-ignore
  return async (...args) => await handleMiddleware(args[0], options);
}
