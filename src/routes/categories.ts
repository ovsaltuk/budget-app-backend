import express from 'express';
import { getCategories, createCategory } from '../controllers/categoriesController.js';

const router = express.Router();

// GET /api/categories
router.get('/', getCategories);

// POST /api/categories  
router.post('/', createCategory);

export default router;