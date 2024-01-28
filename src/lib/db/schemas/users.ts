import { sql } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export type Users = InferSelectModel<typeof users>;

export const users = sqliteTable('users', {
	id: text('id')
		.$default(() => crypto.randomUUID())
		.primaryKey(),
	email: text('email').notNull(),
	picture: text('picture'),
	google_id: text('google_id'),
	created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});
