import app from './app';

// Определяем порт, на котором будет работать сервер.
// process.env.PORT - это переменная окружения, которую можно задать при запуске сервера.
// Если она не задана, используем порт по умолчанию 5000.
const PORT = process.env.PORT || 5000;

// Запускаем сервер и слушаем указанный порт
app.listen(PORT, () => {
  // Эта callback-функция выполняется, когда сервер успешно запустился
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});