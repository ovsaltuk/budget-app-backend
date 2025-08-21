// drizzle.config.ts
import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config({ path: '.env' });

export default {
  schema: './src/lib/db/schema.ts',    // Путь к вашей схеме
  out: './src/lib/db/migrations',      // Куда сохранять миграции
  dialect: 'postgresql',               // Тип БД
  dbCredentials: {
    url: process.env.DATABASE_URL!,    // URL из .env файла
  },
  verbose: true,                       // Подробный вывод
  strict: true,                        // Строгая проверка
} satisfies Config;