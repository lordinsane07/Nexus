/**
 * Database Client — Neon Serverless + Drizzle ORM
 *
 * Uses pooled connection (DATABASE_URL) for all runtime operations.
 * Direct connection (DATABASE_URL_UNPOOLED) is for migrations only.
 */
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });

export type Database = typeof db;
