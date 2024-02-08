import type { Film } from '$lib/validations';
import type { Upvotes } from '../../schemas/upvotes';

// TODO: craete in memory db

export async function get_emojis_from_title_from_db(title: string) {
	return {
		id: 'random',
		emojis: '🎊🎉🥂',
		title,
		upvotes: 1,
	};
}

export function add_new_movie(movie: Film, emojis: string) {
	return [
		{
			id: 'random',
			emojis,
			title: movie.title,
			tmdb_id: movie.id.toString(),
		},
	];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function get_user_from_google_id(id: string) {
	// TODO: add also a fake user
	return null;
}

export function add_new_user({
	email,
	google_id,
	picture,
}: {
	email: string;
	google_id: string;
	picture: string;
}) {
	return [
		{
			id: 'randomuser',
			email,
			google_id,
			picture,
		},
	];
}

export function add_new_upvote({
	delta,
	for_movie,
	from_user,
}: Omit<Upvotes, 'id' | 'created_at' | 'updated_at'>) {
	return [
		{
			id: 'random_upvote',
			delta,
			for_movie,
			from_user,
		},
	];
}

export async function get_upvote_for_movie(for_movie: string, from_user: string) {
	return {
		for_movie,
		from_user,
		id: 'random_upvote',
		delta: 1,
	};
}
