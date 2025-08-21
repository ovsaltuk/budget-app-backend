import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Получаем connection string из переменных окружения
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:mysecretpassword@localhost:5432/finance';

// Создаем клиент PostgreSQL
const client = postgres(connectionString);

// Создаем Drizzle instance с нашей схемой
export const db = drizzle(client, { schema });