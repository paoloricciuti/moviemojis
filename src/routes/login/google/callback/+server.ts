import { google, lucia } from '$lib/auth/index.server';
import { OAuth2RequestError } from 'arctic';

import { add_new_user, get_user_from_google_id } from '$lib/db/queries/index.server';
import { google_openid_schema } from '$lib/validations';
import { error, redirect } from '@sveltejs/kit';
import { parse } from 'valibot';

export async function GET(event) {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const stored_state = event.cookies.get('google_oauth_state') ?? null;
	const stored_verifier = event.cookies.get('google_oauth_verifier') ?? null;
	if (!code || !state || !stored_state || state !== stored_state || !stored_verifier) {
		error(400);
	}

	try {
		const tokens = await google.validateAuthorizationCode(code, stored_verifier);
		const google_reponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`,
			},
		});
		const google_user_json = await google_reponse.json();
		const google_user = parse(google_openid_schema, google_user_json);
		const existing_user = await get_user_from_google_id(google_user.sub);

		if (existing_user) {
			const session = await lucia.createSession(existing_user.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes,
			});
		} else {
			const [new_user] = await add_new_user({
				email: google_user.email,
				google_id: google_user.sub,
				picture: google_user.picture,
			});
			const session = await lucia.createSession(new_user.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes,
			});
		}
		console.log('here');
	} catch (e) {
		// the specific error message depends on the provider
		if (e instanceof OAuth2RequestError) {
			// invalid code
			error(400);
		}
		error(500);
	}
	redirect(302, '/');
}
