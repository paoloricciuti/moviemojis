import type { Config } from 'drizzle-kit';
export default {
	schema: './src/lib/db/schemas/*',
	out: './drizzle',
	driver: 'turso',
	dbCredentials: {
		url: process.env.DATABASE_URL,
	},
} satisfies Config;
