// Временные mock-данные
let categories = [
  { id: 1, name: 'Продукты', type: 'expense' },
  { id: 2, name: 'Транспорт', type: 'expense' },
  { id: 3, name: 'Зарплата', type: 'income' }
];

// Получить все категории
export const getCategories = (req: any, res: any) => {
  console.log('GET /api/categories - returning mock data');
  res.json(categories);
};

// Создать новую категорию
export const createCategory = (req: any, res: any) => {
  console.log('POST /api/categories - creating mock category');
  
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
};