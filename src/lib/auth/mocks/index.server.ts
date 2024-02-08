import { dev } from '$app/environment';
import { Lucia } from 'lucia';
import type { Adapter } from 'lucia';

// TODO: make this work with the in memory db (in the future)
class InMemoryAdapter implements Adapter {
	async deleteExpiredSessions() {}
	async deleteSession() {}
	async deleteUserSessions() {}
	async getSessionAndUser() {
		return [null, null] as [null, null];
	}
	async getUserSessions() {
		return [];
	}
	async setSession() {}
	async updateSessionExpiration() {}
}

const adapter = new InMemoryAdapter();

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

// TODO: figure out how to mock google auth
export const google = {};
