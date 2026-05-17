// backend/index.js
import express from 'express';
import cors from 'cors';
import pool from './config/db.js';
import lawRoutes from './routes/lawRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Allows us to receive JSON in req.body


// Simple Test Route to check DB connection
app.use('/api/law', lawRoutes);

app.use('/api/law/messages', messageRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});