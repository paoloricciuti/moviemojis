import { form, getRequestEvent, query } from '$app/server';
import { BETTER_AUTH_URL } from '$env/static/private';
import { redirect } from '@sveltejs/kit';
import { auth } from './auth';

export const get_user = query(async () => {
	const { request } = getRequestEvent();
	const user = await auth.api.getSession({
		headers: request.headers
	});
	return user;
});

async function login_social(provider: 'github' | 'google') {
	const response = await auth.api.signInSocial({
		returnHeaders: true,
		body: {
			provider,
			callbackURL: BETTER_AUTH_URL
		}
	});
	if (response.response.redirect && response.response.url) {
		redirect(302, response.response.url!);
	}
}

export const login_with_google = form(async () => {
	await login_social('google');
});

export const logout = form(async () => {
	const { request } = getRequestEvent();
	await auth.api.signOut({
		returnHeaders: true,
		headers: request.headers
	});
});
