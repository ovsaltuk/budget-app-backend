// Импортируем Express
import express from 'express';
// Импортируем наши контроллеры из authController
import { register, login } from '../controllers/authController';

// Создаем роутер используя Express.Router()
const router = express.Router();

// Маршрут для регистрации нового пользователя
// POST /api/auth/register
router.post('/register', register);

// Маршрут для входа существующего пользователя  
// POST /api/auth/login
router.post('/login', login);

// Экспортируем роутер для использования в основном файле app.ts
export default router;