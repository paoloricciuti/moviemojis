import { sql } from 'drizzle-orm';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	id: text('id')
		.$default(() => crypto.randomUUID())
		.primaryKey(),
	email: text('email').notNull(),
	created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});
