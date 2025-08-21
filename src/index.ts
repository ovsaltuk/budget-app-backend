import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { db } from './lib/db';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Простой тест без Prisma
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working without database' });
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

// Mock данные (временно, вместо БД)
let transactions: any[] = [];
let nextId = 1;

// Роуты для транзакций
app.get('/api/transactions', (req, res) => {
  res.json(transactions);
});

app.post('/api/transactions', (req, res) => {
  try {
    const { amount, type, category, wallet, description, date } = req.body;
    
    // Простая валидация
    if (!amount || !type || !category || !wallet) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newTransaction = {
      id: nextId++,
      amount: parseFloat(amount),
      type,
      category,
      wallet,
      description: description || '',
      date: date || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    transactions.push(newTransaction);
    res.status(201).json(newTransaction);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

// Mock данные для кошельков и категорий
let wallets = [
  { id: 1, name: 'Наличные', balance: 0, currency: 'RUB' },
  { id: 2, name: 'Сбербанк', balance: 0, currency: 'RUB' }
];

let categories = [
  { id: 1, name: 'Продукты', type: 'expense' },
  { id: 2, name: 'Транспорт', type: 'expense' },
  { id: 3, name: 'Зарплата', type: 'income' }
];

// Роуты для кошельков
app.get('/api/wallets', (req, res) => {
  res.json(wallets);
});

// Роуты для категорий
app.get('/api/categories', (req, res) => {
  res.json(categories);
});

app.post('/api/categories', (req, res) => {
  try {
    const { name, type } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    const newCategory = {
      id: categories.length + 1,
      name,
      type
    };

    categories.push(newCategory);
    res.status(201).json(newCategory);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

// Тестовый эндпоинт для проверки Drizzle
app.get('/api/test-drizzle', async (req, res) => {
  try {
    // Простой запрос к БД - правильный синтаксис Drizzle
    const result = await db.execute('SELECT 1 as test_number');
    
    res.json({ 
      message: 'Drizzle is working!', 
      database: 'connected',
      result: result // или result[0] для первого результата
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Drizzle connection failed',
      details: errorMessage 
    });
  }
});