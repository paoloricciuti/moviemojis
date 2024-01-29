import { sql } from 'drizzle-orm';
import { sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
import { users } from './users';
import { generateId } from 'lucia';

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
	},
	(table) => {
		return {
			title_idx: index('title_idx').on(table.title),
		};
	},
);
