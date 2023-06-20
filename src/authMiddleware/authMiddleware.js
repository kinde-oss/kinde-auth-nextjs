import jwt_decode from 'jwt-decode';
import {NextResponse} from 'next/server';

export function authMiddleware(request) {
  let isAuthenticated = false;
  const kinde_token = request.cookies.get('kinde_token');
  if (kinde_token) {
    const payload = jwt_decode(JSON.parse(kinde_token.value).access_token);
    isAuthenticated = true;
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  } else {
    return NextResponse.next();
  }
}
