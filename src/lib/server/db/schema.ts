import { sql, type InferSelectModel } from 'drizzle-orm';
import { index, integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';
import { user } from './auth-schema.ts';
export type Movies = InferSelectModel<typeof movies>;
export type Upvotes = InferSelectModel<typeof upvotes>;

export const movies = sqliteTable(
	'movies',
	{
		id: text('id').primaryKey(),
		title: text('title').notNull(),
		tmdb_id: text('tmdb_id').notNull(),
		emojis: text('emojis').notNull(),
		created_by: text('created_by').references(() => user.id),
		created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
		updated_at: text('updated_at')
	},
	(table) => [index('title_idx').on(table.title)]
);

export const upvotes = sqliteTable(
	'upvotes',
	{
		id: text('id').primaryKey(),
		from_user: text('from_user').references(() => user.id),
		for_movie: text('for_movie').references(() => movies.id),
		delta: integer('delta').notNull().default(1).$type<-1 | 1>(),
		created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
		updated_at: text('updated_at')
	},
	(table) => [
		index('from_user_idx').on(table.from_user),
		index('for_movie_idx').on(table.for_movie),
		unique('user_movie_unq').on(table.from_user, table.for_movie)
	]
);

export * from './auth-schema.ts';
