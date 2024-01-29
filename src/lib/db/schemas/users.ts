import { sql } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { generateId } from 'lucia';

export type Users = InferSelectModel<typeof users>;

export const users = sqliteTable('users', {
	id: text('id')
		.$default(() => generateId(15))
		.primaryKey(),
	email: text('email').notNull(),
	picture: text('picture'),
	google_id: text('google_id'),
	created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});
