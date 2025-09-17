// Импортируем типы из Express и наш расширенный Request
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
// Импортируем Prisma Client
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Получить все транзакции текущего пользователя
export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Используем userId из authMiddleware (добавленного в req.user)
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.userId },
      orderBy: { date: 'desc' } // Сортируем по дате: сначала новые
    });
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
};

// Создать новую транзакцию
export const createTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  // Извлекаем данные из тела запроса
  const { type, amount, date, category, subcategory, description } = req.body;
  
  try {
    // Создаем транзакцию и связываем ее с текущим пользователем
    const transaction = await prisma.transaction.create({
      data: {
        type,
        amount: parseFloat(amount), // Преобразуем в число
        date: new Date(date),       // Преобразуем в Date объект
        category,
        subcategory,
        description,
        user: { connect: { id: req.user.userId } } // Связываем с пользователем
      }
    });
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Failed to create transaction' });
  }
};

// Получить конкретную транзакцию по ID
export const getTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const transaction = await prisma.transaction.findFirst({
      where: { 
        id: parseInt(id),      // ID транзакции
        userId: req.user.userId // И пользователь должен быть владельцем
      }
    });

    if (!transaction) {
      res.status(404).json({ message: 'Transaction not found' });
      return;
    }

    res.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Failed to fetch transaction' });
  }
};

// Обновить транзакцию (исправленная версия)
export const updateTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { type, amount, date, category, subcategory, description } = req.body;

  try {
    const transactionId = Number(id);
    if (isNaN(transactionId)) {
      res.status(400).json({ message: "Invalid transaction id" });
      return;
    }

    // Собираем updateData только из переданных полей
    const updateData: Partial<{
      type: string;
      amount: number;
      date: Date;
      category: string;
      subcategory: string;
      description: string;
    }> = {};

    if (type) updateData.type = type;
    if (amount !== undefined) {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount)) {
        res.status(400).json({ message: "Invalid amount" });
        return;
      }
      updateData.amount = parsedAmount;
    }
    if (date) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        res.status(400).json({ message: "Invalid date" });
        return;
      }
      updateData.date = parsedDate;
    }
    if (category) updateData.category = category;
    if (subcategory) updateData.subcategory = subcategory;
    if (description) updateData.description = description;

    const transaction = await prisma.transaction.updateMany({
      where: { id: transactionId, userId: req.user.userId },
      data: updateData,
    });

    if (transaction.count === 0) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }

    const updatedTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    res.json(updatedTransaction);
  } catch (error) {
    console.error("Update transaction error:", error);
    res.status(500).json({ message: "Failed to update transaction" });
  }
};

// Удалить транзакцию
export const deleteTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    await prisma.transaction.delete({
      where: { 
        id: parseInt(id),
        userId: req.user.userId // Удаляем только свои транзакции
      }
    });
    res.status(204).send(); // 204 No Content - успешное удаление
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Failed to delete transaction' });
  }
};

// Массовое удаление транзакций
export const deleteTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  const { ids } = req.body;

  try {
    // Валидация: проверяем что ids является массивом
    if (!Array.isArray(ids)) {
      res.status(400).json({ message: 'Expected array of transaction IDs' });
      return;
    }

    // Преобразуем все ID в числа и фильтруем невалидные
    const transactionIds = ids
      .map(id => typeof id === 'string' ? parseInt(id) : id)
      .filter(id => typeof id === 'number' && !isNaN(id) && id > 0);
    
    if (transactionIds.length === 0) {
      res.status(400).json({ message: 'No valid transaction IDs provided' });
      return;
    }

    console.log('Attempting to delete transaction IDs:', transactionIds);

    // Удаляем транзакции только принадлежащие текущему пользователю
    const deleteResult = await prisma.transaction.deleteMany({
      where: {
        id: {
          in: transactionIds
        },
        userId: req.user.userId // Важно: удаляем только свои транзакции
      }
    });

    console.log('Delete result:', deleteResult);

    res.json({
      message: `Successfully deleted ${deleteResult.count} transactions`,
      deletedCount: deleteResult.count
    });
  } catch (error: any) {
    console.error('Delete transactions error:', error);
    
    // Более детальная обработка ошибок
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    res.status(500).json({ 
      message: 'Failed to delete transactions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Массовое создание транзакций
export const createTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  const transactionsData = req.body;

  try {
    // Валидация: проверяем что это массив
    if (!Array.isArray(transactionsData)) {
      res.status(400).json({ message: 'Expected array of transactions' });
      return;
    }

    const createdTransactions = await prisma.$transaction(
      transactionsData.map(transactionData => 
        prisma.transaction.create({
          data: {
            type: transactionData.type,
            amount: parseFloat(transactionData.amount),
            date: new Date(transactionData.date),
            category: transactionData.category,
            subcategory: transactionData.subcategory,
            description: transactionData.description,
            user: { connect: { id: req.user.userId } }
          }
        })
      )
    );

    res.status(201).json(createdTransactions);
  } catch (error) {
    console.error('Create transactions error:', error);
    res.status(500).json({ message: 'Failed to create transactions' });
  }
};