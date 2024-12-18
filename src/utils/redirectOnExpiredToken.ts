import { redirect } from 'next/navigation';
import { isTokenExpired } from './jwt/validation';
import { config } from '../config';

// This exists solely to solve an edge case where users
// who may have an expired token are viewing a page that uses
// authenticated functions on a route *not* protected by their middleware
// In this case, we want to redirect them to login, but we don't want to
// redirect them if they don't have a token, as this would inadvertently
// protect pages that may just be checking authentication status
//
// This is very much an edge case though - in general, all routes should be protected by middleware
//
// TODO: This is a temporary solution, long-term this would be much better 
// off living inside getKindeServerSession, but we'd need to make getKindeServerSession async (breaking)
export const redirectOnExpiredToken = (token: string | null) => {
	if(config.isDebugMode) {
		console.log('redirectOnExpiredToken: checking for expired token')
	}
	if (!token) {
		if(config.isDebugMode) {
			console.log('redirectOnExpiredToken: no token, not redirecting')
		}
		return;
	}
	if (!isTokenExpired(token)) {
		if(config.isDebugMode) {
			console.log('redirectOnExpiredToken: token is not expired, not redirecting')
		}
		return;
	}
	if(config.isDebugMode) {
		console.log('redirectOnExpiredToken: token is defined and expired, redirecting')
	}
	redirect('/api/auth/login');
};
