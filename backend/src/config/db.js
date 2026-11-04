import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { env } from './env.js';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });
