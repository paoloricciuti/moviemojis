import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { DATABASE_URL, DATABASE_TOKEN } from '$env/static/private';

const client = createClient({ url: DATABASE_URL, authToken: DATABASE_TOKEN });

export const db = drizzle(client);
