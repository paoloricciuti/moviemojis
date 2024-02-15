import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { DATABASE_URL, DATABASE_TOKEN } from '$env/static/private';
import { PUBLIC_USE_MSW } from '$env/static/public';
import { migrate } from 'drizzle-orm/libsql/migrator';

export const client = createClient({ url: DATABASE_URL, authToken: DATABASE_TOKEN });

const db = drizzle(client);

if (PUBLIC_USE_MSW === 'true') {
	await migrate(db, { migrationsFolder: 'drizzle' });
}

export { db };
