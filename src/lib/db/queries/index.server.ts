import { eq, sql, desc, and } from 'drizzle-orm';
import { db } from '../index.server';
import { movies } from '../schemas/movies';
import { get_skewed_random } from '$lib/utils';
import type { Film } from '$lib/validations';
import { upvotes, type Upvotes } from '../schemas/upvotes';
import { users } from '../schemas/users';

export async function get_emojis_from_title_from_db(title: string) {
	const movie_list = await db
		.select({
			movies: {
				id: movies.id,
				emojis: movies.emojis,
				title: movies.title,
			},
			upvotes: sql<number>`cast(sum(${upvotes.delta}) as int)`,
		})
		.from(movies)
		.leftJoin(upvotes, eq(movies.id, upvotes.for_movie))
		.where(eq(movies.title, title))
		.groupBy(movies.id, movies.emojis, movies.title)
		.orderBy((table) => desc(table.upvotes));

	if (movie_list.length === 0) return;

	const random_entry = get_skewed_random(movie_list.length, Math.random);
	return { ...movie_list[random_entry]!.movies, upvotes: movie_list[random_entry]!.upvotes };
}

export function add_new_movie(movie: Film, emojis: string) {
	return db
		.insert(movies)
		.values({
			emojis,
			title: movie.title,
			tmdb_id: movie.id.toString(),
		})
		.returning();
}

export async function get_user_from_google_id(id: string) {
	const selected_users = await db.select().from(users).where(eq(users.google_id, id)).limit(1);
	if (selected_users?.length > 0) {
		return selected_users[0];
	}
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
	return db
		.insert(users)
		.values({
			email,
			google_id,
			picture,
		})
		.returning();
}

export function add_new_upvote({
	delta,
	for_movie,
	from_user,
}: Omit<Upvotes, 'id' | 'created_at' | 'updated_at'>) {
	return db
		.insert(upvotes)
		.values({
			delta,
			for_movie,
			from_user,
		})
		.onConflictDoUpdate({
			target: [upvotes.for_movie, upvotes.from_user],
			set: {
				delta,
			},
			where: and(eq(upvotes.for_movie, for_movie ?? ''), eq(upvotes.from_user, from_user ?? '')),
		})
		.returning();
}

export async function get_upvote_for_movie(for_movie: string, from_user: string) {
	const [upvote] = await db
		.select()
		.from(upvotes)
		.where(and(eq(upvotes.for_movie, for_movie), eq(upvotes.from_user, from_user)));
	return upvote;
}
