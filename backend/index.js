// backend/index.js
import express from 'express';
import cors from 'cors';
import pool from './config/db.js';
import lawRoutes from './routes/lawRoutes.js';
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Allows us to receive JSON in req.body

const cors = require('cors');
app.use(cors({
  origin: 'https://lfms-git-main-raomaheers-projects.vercel.app'
}));

// Simple Test Route to check DB connection
app.use('/api/law', lawRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});