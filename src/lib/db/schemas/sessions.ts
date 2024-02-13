import { sql, type InferSelectModel } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { users } from './users';
import { generateId } from 'lucia';

export type Sessions = InferSelectModel<typeof sessions>;

export const sessions = sqliteTable('sessions', {
	id: text('id')
		.$default(() => generateId(15))
		.primaryKey(),
	expires_at: integer('expires_at').notNull(),
	user_id: text('user_id')
		.notNull()
		.references(() => users.id),
	created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	updated_at: text('updated_at'),
});
