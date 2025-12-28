import { building } from '$app/environment';
import { auth } from '$lib/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';

export function handle({ event, resolve }) {
	return svelteKitHandler({ event, resolve, auth, building });
}
