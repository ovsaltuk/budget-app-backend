import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import categoriesRouter from './routes/categories.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

app.use('/api/categories', categoriesRouter);

// Health check - простейший эндпоинт
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is working!' });
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});