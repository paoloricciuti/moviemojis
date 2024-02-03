import { sql } from 'drizzle-orm';
import { sqliteTable, text, index, unique, integer } from 'drizzle-orm/sqlite-core';
import { users } from './users';
import { movies } from './movies';
import { generateId } from 'lucia';
import type { InferSelectModel } from 'drizzle-orm';

export const upvotes = sqliteTable(
	'upvotes',
	{
		id: text('id')
			.$default(() => generateId(15))
			.primaryKey(),
		from_user: text('from_user').references(() => users.id),
		for_movie: text('for_movie').references(() => movies.id),
		delta: integer('delta').notNull().default(1).$type<-1 | 1>(),
		created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
		updated_at: text('updated_at'),
	},
	(table) => {
		return {
			from_user_idx: index('from_user_idx').on(table.from_user),
			for_movie_idx: index('for_movie_idx').on(table.for_movie),
			user_movie_unq: unique('user_movie_unq').on(table.from_user, table.for_movie),
		};
	},
);

export type Upvotes = InferSelectModel<typeof upvotes>;
