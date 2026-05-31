// backend/index.js
import express from 'express';
import cors from 'cors';
import pool from './config/db.js';
import lawRoutes from './routes/lawRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import documentRoutes from './routes/documentRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Allows us to receive JSON in req.body


app.get('/debug', (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? 'exists' : 'missing',
    DB_HOST: process.env.DB_HOST,
  });
});

// Simple Test Route to check DB connection
app.use('/api/law/messages', messageRoutes);
app.use('/api/law/cases',     documentRoutes);
app.use('/api/law', lawRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});