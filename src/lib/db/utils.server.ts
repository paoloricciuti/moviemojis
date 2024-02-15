import { sql, type InferInsertModel } from 'drizzle-orm';
import { db } from './index.server';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { PUBLIC_USE_MSW } from '$env/static/public';
import { movies } from './schemas/movies';
import { sessions } from './schemas/sessions';
import { upvotes } from './schemas/upvotes';
import { users } from './schemas/users';

export async function reset_db() {
	if (PUBLIC_USE_MSW !== 'true') return;
	await db.run(sql`PRAGMA writable_schema = 1;`);
	await db.run(sql`DELETE FROM sqlite_master;`);
	await db.run(sql`PRAGMA writable_schema = 0;`);
	await db.run(sql`VACUUM;`);
	await db.run(sql`PRAGMA integrity_check;`);
	await migrate(db, { migrationsFolder: 'drizzle' });
}

export const schemas = {
	movies,
	sessions,
	upvotes,
	users,
};

export type Db = {
	[Key in keyof typeof schemas]?: Array<InferInsertModel<(typeof schemas)[Key]>>;
};
