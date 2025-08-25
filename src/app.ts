
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
// Добавь этот импорт после остальных импортов
import authRoutes from './routes/auth';
import transactionRoutes from './routes/transactions';

// Создаем экземпляр Express-приложения
const app = express();

// Подключаем middleware Helmet для безопасности headers
app.use(helmet());
// Подключаем middleware CORS. Разрешаем запросы с любого источника (*)
// Позже мы можем заменить '*' на URL нашего фронтенда для большей безопасности
app.use(cors());
// Подключаем middleware Morgan для логирования в комбинированном формате
app.use(morgan('combined'));
// Подключаем встроенное middleware Express для парсинга JSON из тела запроса
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes); 
app.use('/api/transactions', transactionRoutes);

// Пока что создадим простой тестовый маршрут
app.get('/api/health', (req, res) => {
  // Отвечаем статусом 200 и JSON-объектом с сообщением
  res.status(200).json({ message: 'Server is running!' });
});

export default app;