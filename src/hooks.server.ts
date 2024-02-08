import { lucia } from '$lib/auth/index.server';
import type { Handle } from '@sveltejs/kit';
import { PUBLIC_USE_MSW } from '$env/static/public';

if (PUBLIC_USE_MSW === 'true') {
	import('./msw/server').then(({ server }) => {
		server.listen({
			onUnhandledRequest: 'bypass',
		});
	});
}

export const handle: Handle = async ({ event, resolve }) => {
	const session_id = event.cookies.get(lucia.sessionCookieName);
	if (!session_id) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await lucia.validateSession(session_id);
	if (session && session.fresh) {
		const session_cookie = lucia.createSessionCookie(session.id);
		event.cookies.set(session_cookie.name, session_cookie.value, {
			path: '.',
			...session_cookie.attributes,
		});
	}
	if (!session) {
		const session_cookie = lucia.createBlankSessionCookie();
		event.cookies.set(session_cookie.name, session_cookie.value, {
			path: '.',
			...session_cookie.attributes,
		});
	}
	event.locals.user = user;
	event.locals.session = session;
	return resolve(event);
};
