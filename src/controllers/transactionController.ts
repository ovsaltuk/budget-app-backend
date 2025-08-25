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