import { lucia } from '$lib/auth/index.server';
import type { Handle } from '@sveltejs/kit';
import { PUBLIC_USE_MSW } from '$env/static/public';
import { sequence } from '@sveltejs/kit/hooks';
import { SEED_ENDPOINT } from '../constants';
import { db } from '$lib/db/queries/mocks/index.server';

const handlers: Handle[] = [];

if (PUBLIC_USE_MSW === 'true') {
	import('./msw/server').then(({ server }) => {
		server.listen({
			onUnhandledRequest: 'bypass',
		});
	});

	const text_decoder = new TextDecoder();

	// eslint-disable-next-line svelte/no-inner-declarations, no-inner-declarations
	function read_body(request: Request) {
		let body = '';
		let resolve: (value: Record<string, unknown>) => void;
		const body_promise = new Promise<Record<string, unknown>>((res) => {
			resolve = res;
		});
		request.body?.pipeTo(
			new WritableStream({
				write(chunk) {
					body += text_decoder.decode(chunk);
				},
				close() {
					resolve(JSON.parse(body));
				},
			}),
		);
		return body_promise;
	}

	// seed from playwright handle;
	handlers.push(async ({ event, resolve }) => {
		const request = event.request.clone();
		if (request.method === 'POST') {
			const request_url = new URL(request.url);
			if (request_url.pathname === SEED_ENDPOINT) {
				const body = await read_body(request);
				for (const key in body) {
					(db as Record<string, unknown>)[key] = body[key];
				}
				return new Response(null, {
					status: 204,
				});
			}
		}
		return resolve(event);
	});
}

// lucia handle
handlers.push(async ({ event, resolve }) => {
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
});

export const handle = sequence(...handlers);
