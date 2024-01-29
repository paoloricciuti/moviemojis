import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { users } from './users';
import { generateId } from 'lucia';

export const sessions = sqliteTable('sessions', {
	id: text('id')
		.$default(() => generateId(15))
		.primaryKey(),
	expires_at: integer('expires_at').notNull(),
	user_id: text('user_id')
		.notNull()
		.references(() => users.id),
	created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});
