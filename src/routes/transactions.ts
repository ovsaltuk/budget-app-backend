import express from 'express';
// Импортируем все функции из контроллера транзакций
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  createTransactions,
} from '../controllers/transactionController';
// Импортируем middleware для проверки аутентификации
import { authMiddleware } from '../middleware/auth';

// Создаем роутер
const router = express.Router();

// Все роуты ниже требуют аутентификации
// middleware authMiddleware будет проверять JWT токен для каждого запроса
router.use(authMiddleware);

// GET /api/transactions - получить все транзакции пользователя
router.get('/', getTransactions);

// GET /api/transactions/:id - получить конкретную транзакцию по ID
router.get('/:id', getTransaction);

// POST /api/transactions - создать новую транзакцию
router.post('/', createTransaction);

// POST /api/transactions/bulk - создать несколько новых транзакций
router.post('/bulk', createTransactions); 

// PUT /api/transactions/:id - обновить существующую транзакцию
router.put('/:id', updateTransaction);

// DELETE /api/transactions/:id - удалить транзакцию
router.delete('/:id', deleteTransaction);

// Экспортируем роутер
export default router;