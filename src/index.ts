import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { generateBusinessIdea } from './services/openRouterService';
import { IdeaGenerationParams } from './types/idea';
import businessPlanRoutes from './routes/businessPlanRoutes';
import metricsRoutes from './routes/metricsRoutes';
import userRoutes from './routes/userRoutes';
import saveIdeaRoutes from './routes/saveIdeaRoutes';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());
// Configure CORS
const corsOptions = {
  origin: function(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    const allowedOrigins = [
      'http://localhost:8080',
      'http://localhost:8081',
      'http://localhost:8082',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',  // Vite's fallback port
      'http://127.0.0.1:5173',  // Also allow localhost as IP
      'http://127.0.0.1:5174'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Routes
app.use('/api/business-plan', businessPlanRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ideas', saveIdeaRoutes);

app.post('/api/generate-idea', async (req, res) => {
  try {
    console.log('Received request to generate idea:', req.body);
    const idea = await generateBusinessIdea(req.body);
    console.log('Successfully generated idea');
    res.json(idea);
  } catch (error: any) {
    console.error('Error in /api/generate-idea:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to generate business idea',
      error: error.stack
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
