import type { Config } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL;
const isMySQL = databaseUrl?.startsWith('mysql://');

export default {
  schema: './src/db/schema/auth.ts',
  out: './drizzle',
  dialect: isMySQL ? 'mysql' : 'sqlite',
  dbCredentials: isMySQL ? {
    url: databaseUrl,
  } : {
    url: 'sqlite.db',
  },
} as Config;
