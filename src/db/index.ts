// src/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as articleSchema from './schema/articles';

const connectionString = import.meta.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('Missing DATABASE_URL environment variable');
}

// Create a Postgres client for Drizzle
const client = postgres(connectionString);

// Create Drizzle instance with all schemas
export const db = drizzle(client, {
    schema: {
        ...schema,
        ...articleSchema
    }
});