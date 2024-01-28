// routes/login/github/+server.ts
import { google } from '$lib/auth/index.server';
import { redirect } from '@sveltejs/kit';
import { generateCodeVerifier, generateState } from 'arctic';

export async function GET(event) {
	const state = generateState();
	const code_verifier = generateCodeVerifier();
	const url = await google.createAuthorizationURL(state, code_verifier, {
		scopes: ['openid', 'email', 'profile'],
	});

	console.log(url.toJSON());

	event.cookies.set('google_oauth_state', state, {
		path: '/',
		secure: import.meta.env.PROD,
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax',
	});

	event.cookies.set('google_oauth_verifier', code_verifier, {
		path: '/',
		secure: import.meta.env.PROD,
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax',
	});

	redirect(302, url.toString());
}
