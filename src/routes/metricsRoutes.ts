import express, { Request, Response, Router, RequestHandler } from 'express';
import { generateMetrics } from '../services/metricsService';

const router: Router = express.Router();

const generateMetricsHandler: RequestHandler = async (req, res) => {
  try {
    const { ideaTitle, ideaFitness } = req.body;

    if (!ideaTitle || !ideaFitness) {
      res.status(400).json({ 
        message: 'Idea title and fitness are required'
      });
      return;
    }

    const metrics = await generateMetrics(ideaTitle, ideaFitness);
    res.json(metrics);
  } catch (error: any) {
    console.error('Error generating metrics:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to generate metrics'
    });
  }
};

router.post('/generate', generateMetricsHandler);

export default router;