import { eq, sql, desc } from 'drizzle-orm';
import { db } from '..';
import { movies } from '../schemas/movies';
import { get_skewed_random } from '$lib/utils';
import type { Film } from '$lib/validations';
import { upvotes } from '../schemas/upvotes';

export async function get_emojis_from_title_from_db(title: string) {
	const movie_list = await db
		.select({
			movies: {
				id: movies.id,
				emojis: movies.emojis,
				title: movies.title,
			},
			upvotes: sql`cast(count(${upvotes.id}) as int)`,
		})
		.from(movies)
		.leftJoin(upvotes, eq(movies.id, upvotes.for_movie))
		.where(eq(movies.title, title))
		.groupBy(movies.id, movies.emojis, movies.title)
		.orderBy((table) => desc(table.upvotes));

	if (movie_list.length === 0) return;

	const random_entry = get_skewed_random(movie_list.length, Math.random);
	return movie_list[random_entry].movies.emojis;
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
