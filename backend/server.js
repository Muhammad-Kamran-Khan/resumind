import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();
import connect from './db/Connect.js';
import userRoutes from './routes/auth/userRoutes.js';
import aiFeedbackRoute from './routes/aiFeedbackRoute.js';
import uploadRoute from './routes/uploadRoute.js';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: "https://resumind-seven.vercel.app",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use('/', userRoutes);
app.use('', aiFeedbackRoute);
app.use('/', uploadRoute);

// Simple root endpoint for health checks or testing
app.get('/', (req, res) => {
  res.status(200).send('API is running.');
});

// Server startup function
const server = async () => {
  try {
    await connect(); // Connect to the database
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Error starting server:', error.message);
    process.exit(1);
  }
};

// Execute the server startup
server();