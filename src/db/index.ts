import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzleMysql } from 'drizzle-orm/mysql2';
import Database from 'better-sqlite3';
import mysql from 'mysql2/promise';
import * as schema from './schema/auth.ts';

const databaseUrl = process.env.DATABASE_URL;

export const db = await (async () => {
  if (databaseUrl?.startsWith('mysql://')) {
    const connection = await mysql.createConnection(databaseUrl);
    return drizzleMysql(connection, { schema, mode: 'default' });
  } else {
    const sqlite = new Database(databaseUrl || 'sqlite.db');
    return drizzleSqlite(sqlite, { schema });
  }
})();
