import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const sessions = sqliteTable('sessions', {
	id: text('id')
		.$default(() => crypto.randomUUID())
		.primaryKey(),
	expires_at: integer('expires_at').notNull(),
	user_id: text('user_id')
		.notNull()
		.references(() => users.id),
	created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});
