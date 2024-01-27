import { eq } from 'drizzle-orm';
import { db } from '..';
import { movies } from '../schemas/movies';
import { get_skewed_random } from '$lib/utils';
import type { Film } from '$lib/validations';

export async function get_emojis_from_title_from_db(title: string) {
	// TODO: sort by upvotes
	const movie_list = await db.select().from(movies).where(eq(movies.title, title));
	if (movie_list.length === 0) return;

	const random_entry = get_skewed_random(movie_list.length, Math.random);
	return movie_list[random_entry].emojis;
}

export function add_new_movie(movie: Film, emojis: string) {
	db.insert(movies)
		.values({
			emojis,
			title: movie.original_title,
			tmdb_id: movie.id.toString(),
		})
		.execute();
}
