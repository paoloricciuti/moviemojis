import { sql, type InferSelectModel } from 'drizzle-orm';
import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { generateId } from 'lucia';
import { users } from './users';

export type Movies = InferSelectModel<typeof movies>;

export const movies = sqliteTable(
	'movies',
	{
		id: text('id')
			.$default(() => generateId(15))
			.primaryKey(),
		title: text('title').notNull(),
		tmdb_id: text('tmdb_id').notNull(),
		emojis: text('emojis').notNull(),
		created_by: text('created_by').references(() => users.id),
		created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
		updated_at: text('updated_at'),
	},
	(table) => {
		return {
			title_idx: index('title_idx').on(table.title),
		};
	},
);
