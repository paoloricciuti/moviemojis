import { building } from '$app/environment';
import { auth } from '$lib/auth';
import { isAuthPath } from 'better-auth/svelte-kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';

export async function handle({ event, resolve }) {
	console.log(event.url.toString(), auth.options, isAuthPath(event.url.toString(), auth.options));
	return svelteKitHandler({ event, resolve, auth, building });
}
