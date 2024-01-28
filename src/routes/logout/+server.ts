import { lucia } from '$lib/auth/index.server.js';
import { redirect } from '@sveltejs/kit';

export async function GET({ cookies, locals }) {
	if (locals.session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		await lucia.invalidateSession(locals.session?.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			...sessionCookie.attributes,
			path: sessionCookie.attributes.path ?? '/',
		});
	}
	redirect(302, '/');
}
