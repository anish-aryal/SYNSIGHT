import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import analysisRoutes from './sentimentAnalysis/routes/analysis.js';
import chatRoutes from "./routes/chatRoutes.js"
import reportRoutes from './reports/routes/reportRoutes.js';


// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/analysis', analysisRoutes);  
app.use('/api/reports', reportRoutes);


// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'SYNSIGHT API is running' 
  });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});