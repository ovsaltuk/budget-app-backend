// Импортируем типы из Express
import { Request, Response } from 'express';
// Импортируем библиотеку для хеширования паролей
import bcrypt from 'bcryptjs';
// Импортируем библиотеку для работы с JWT
import jwt from 'jsonwebtoken';
// Импортируем Prisma Client
import { PrismaClient } from '@prisma/client';
// Импортируем наш секретный ключ
import { JWT_SECRET } from '../utils/constants';

// Создаем экземпляр Prisma Client
const prisma = new PrismaClient();

// Контроллер для регистрации нового пользователя
export const register = async (req: Request, res: Response): Promise<void> => {
  // Извлекаем email, login и password из тела запроса
  const { email, login, password } = req.body;

  try {
    // 1. Проверяем, не существует ли уже пользователь с таким email или login
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { login: login }
        ]
      }
    });

    // 2. Если пользователь найден - возвращаем ошибку
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return; // Важно: прекращаем выполнение функции после отправки ответа
    }

    // 3. Хешируем пароль перед сохранением в базу
    // 10 - это "соль", количество раундов хеширования (чем больше, тем безопаснее, но медленнее)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Создаем нового пользователя в базе данных
    const user = await prisma.user.create({
      data: {
        email: email,
        login: login,
        password: hashedPassword // Сохраняем только хеш пароля!
      }
    });

    // 5. Создаем JWT-токен для нового пользователя
    // В токен мы помещаем userId, чтобы потом идентифицировать пользователя
    const token = jwt.sign(
      { userId: user.id }, // payload (данные, которые будут в токене)
      JWT_SECRET,         // секретный ключ
      { expiresIn: '7d' } // токен будет действителен 7 дней
    );

    // 6. Возвращаем успешный ответ с токеном и данными пользователя (без пароля!)
    res.status(201).json({
      message: 'User created successfully',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        login: user.login
      }
    });

  } catch (error) {
    // 7. Обрабатываем любые непредвиденные ошибки
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Контроллер для входа существующего пользователя
export const login = async (req: Request, res: Response): Promise<void> => {
  // Извлекаем login (может быть email или логин) и password из тела запроса
  const { login, password } = req.body;

  try {
    // 1. Ищем пользователя по email ИЛИ login
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: login },
          { login: login }
        ]
      }
    });

    // 2. Если пользователь не найден - возвращаем ошибку
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // 3. Сравниваем введенный пароль с хешем из базы данных
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // 4. Если пароль неверный - возвращаем ошибку
    if (!isPasswordValid) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // 5. Создаем JWT-токен для аутентифицированного пользователя
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 6. Возвращаем успешный ответ с токеном и данными пользователя
    res.json({
      message: 'Logged in successfully',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        login: user.login
      }
    });

  } catch (error) {
    // 7. Обрабатываем любые непредвиденные ошибки
    console.error('Login error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};