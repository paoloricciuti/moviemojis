export function load({ locals }) {
	return {
		user: locals.user,
		sessions: locals.session,
	};
}
