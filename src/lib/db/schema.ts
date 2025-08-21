import { pgTable, serial, varchar, decimal, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';

// Enum для типа категории
export const categoryTypeEnum = pgEnum('category_type', ['income', 'expense']);

// Таблица пользователей
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Таблица кошельков
export const wallets = pgTable('wallets', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  balance: decimal('balance', { precision: 12, scale: 2 }).default('0.00'),
  currency: varchar('currency', { length: 3 }).default('RUB'),
  userId: integer('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Таблица категорий
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  type: categoryTypeEnum('type').notNull(),
  userId: integer('user_id').notNull(),
  parentId: integer('parent_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Таблица транзакций
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  type: categoryTypeEnum('type').notNull(),
  description: varchar('description', { length: 500 }),
  date: timestamp('date').defaultNow(),
  userId: integer('user_id').notNull(),
  categoryId: integer('category_id').notNull(),
  walletId: integer('wallet_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});