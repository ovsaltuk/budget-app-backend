// Импортируем типы из Express
import { Request, Response, NextFunction } from 'express';
// Импортируем библиотеку для проверки JWT
import jwt from 'jsonwebtoken';
// Импортируем наш секретный ключ
import { JWT_SECRET } from '../utils/constants';

// Расширяем стандартный интерфейс Request из Express
// чтобы добавить в него поле user
export interface AuthRequest extends Request {
  user?: any; // Пока используем any, позже можно заменить на конкретный тип
}

// Middleware-функция для проверки аутентификации
export const authMiddleware = (
  req: AuthRequest, // Используем наш расширенный интерфейс
  res: Response,
  next: NextFunction // Функция для перехода к следующему middleware/обработчику
) => {
  // 1. Получаем токен из заголовка Authorization
  // Формат: "Bearer <token>"
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // 2. Если токена нет - сразу возвращаем ошибку 401 (Unauthorized)
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // 3. Проверяем валидность токена с помощью нашего секретного ключа
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 4. Если токен валиден, добавляем расшифрованные данные в req.user
    // Теперь последующие middleware и обработчики будут иметь доступ к данным пользователя
    req.user = decoded;
    
    // 5. Передаем управление следующему middleware или обработчику маршрута
    next();
  } catch (error) {
    // 6. Если токен невалиден (истек, подделан и т.д.) - возвращаем ошибку
    res.status(401).json({ message: 'Token is not valid' });
  }
};