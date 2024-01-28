import { Lucia } from 'lucia';
import { LibSQLAdapter } from '@lucia-auth/adapter-sqlite';
import { dev } from '$app/environment';
import { client } from '../db/index.server';
import { Google } from 'arctic';
import { GOOGLE_CLIENT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } from '$env/static/private';
import type { Users } from '$lib/db/schemas/users';

const adapter = new LibSQLAdapter(client, {
	user: 'users',
	session: 'sessions',
});

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev,
		},
	},
	getUserAttributes: (attributes) => {
		return {
			picture: attributes.picture,
			username: attributes.email,
			google_id: attributes.google_id,
		};
	},
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: Omit<Users, 'id'>;
	}
}

export const google = new Google(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
