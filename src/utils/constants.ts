// Секретный ключ для подписи JWT-токенов.
// В продакшене это должно быть длинное, случайное значение,
// хранящееся в переменных окружения (.env файл)
export const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-dev';

// Можно также добавить соль для хеширования паролей здесь
// export const SALT_ROUNDS = 10;