import { Router, Request, Response } from 'express';
import { 
  authenticateJWT, 
  AuthRequest 
} from '../middleware/authMiddleware';
import { 
  generateBusinessPlan, 
  generateProblemOpportunity, 
  generateMarketSize, 
  generateProductOffering, 
  generateSolutionDetails, 
  generateSubscriptionPlans,
  generateCustomerSegments,
  generateGrowthProjections,
  generateCompetitorAnalysis,
  generateUsp,
  generateHowItWorks,
  generateMarketingStrategy,
  generateTechnologyPlan,
  generateRevenueProjections,
  generateChallenges,
  generateSwotAnalysis,
  generateStrategicRoadmap,
  generateMetrics,
  generateMarketShare,

  BusinessPlanData 
} from '../services/businessPlanService';

const router = Router();

router.post('/generate', authenticateJWT, function(req: AuthRequest, res: Response) {
  const handleRequest = async () => {
    try {
      if (!req.body.title || !req.body.ideaFitness) {
        return res.status(400).json({
          message: 'Title and idea fitness assessment are required'
        });
      }

      const params = {
        title: req.body.title,
        ideaFitness: req.body.ideaFitness,
        userId: req.userId // Pass userId for per-user business plans
      };

      const result = await generateBusinessPlan(params);
      res.json(result);
    } catch (error: any) {
      console.error('Error in /api/business-plan/generate:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to generate business plan'
      });
    }
  };
  
  handleRequest();
});

router.post('/problem-opportunity', function(req: Request, res: Response) {
  const handleRequest = async () => {
    try {
      if (!req.body.title || !req.body.ideaFitness) {
        return res.status(400).json({
          message: 'Title and idea fitness assessment are required'
        });
      }

      const params = {
        title: req.body.title,
        ideaFitness: req.body.ideaFitness
      };

      const result = await generateProblemOpportunity(params);
      res.json(result);
    } catch (error: any) {
      console.error('Error in /api/business-plan/problem-opportunity:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to generate problem and opportunity statements'
      });
    }
  };
  
  handleRequest();
});

router.post('/market-size', function(req: Request, res: Response) {
  const handleRequest = async () => {
    try {
      if (!req.body.title || !req.body.ideaFitness) {
        return res.status(400).json({
          message: 'Title and idea fitness assessment are required'
        });
      }

      const params = {
        title: req.body.title,
        ideaFitness: req.body.ideaFitness
      };

      const result = await generateMarketSize(params);
      res.json(result);
    } catch (error: any) {
      console.error('Error in /api/business-plan/market-size:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to generate market size data'
      });
    }
  };
  
  handleRequest();
});

router.post('/product-offering', function(req: Request, res: Response) {
  const handleRequest = async () => {
    try {
      if (!req.body.title || !req.body.ideaFitness) {
        return res.status(400).json({
          message: 'Title and idea fitness assessment are required'
        });
      }

      const params = {
        title: req.body.title,
        ideaFitness: req.body.ideaFitness
      };

      const result = await generateProductOffering(params);
      res.json(result);
    } catch (error: any) {
      console.error('Error in /api/business-plan/product-offering:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to generate product offering'
      });
    }
  };
  
  handleRequest();
});

router.post('/solution-details', function(req: Request, res: Response) {
  const handleRequest = async () => {
    try {
      if (!req.body.title || !req.body.ideaFitness) {
        return res.status(400).json({
          message: 'Title and idea fitness assessment are required'
        });
      }

      const params = {
        title: req.body.title,
        ideaFitness: req.body.ideaFitness
      };

      const result = await generateSolutionDetails(params);
      res.json(result);
    } catch (error: any) {
      console.error('Error in /api/business-plan/solution-details:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to generate solution details'
      });
    }
  };
  
  handleRequest();
});

router.post('/subscription-plans', function(req: Request, res: Response) {
  const handleRequest = async () => {
    try {
      if (!req.body.title || !req.body.ideaFitness) {
        return res.status(400).json({
          message: 'Title and idea fitness assessment are required'
        });
      }

      const params = {
        title: req.body.title,
        ideaFitness: req.body.ideaFitness
      };

      const result = await generateSubscriptionPlans(params);
      res.json(result);
    } catch (error: any) {
      console.error('Error in /api/business-plan/subscription-plans:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to generate subscription plans'
      });
    }
  };
  
  handleRequest();
});

router.post('/customer-segments', function(req: Request, res: Response) {
  const handleRequest = async () => {
    try {
      if (!req.body.title || !req.body.ideaFitness) {
        return res.status(400).json({
          message: 'Title and idea fitness assessment are required'
        });
      }

      const params = {
        title: req.body.title,
        ideaFitness: req.body.ideaFitness
      };

      const result = await generateCustomerSegments(params);
      res.json(result);
    } catch (error: any) {
      console.error('Error in /api/business-plan/customer-segments:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to generate customer segments'
      });
    }
  };
  
  handleRequest();
});

router.post('/growth-projections', function(req: Request, res: Response) {
  const handleRequest = async () => {
    try {
      if (!req.body.title || !req.body.ideaFitness) {
        return res.status(400).json({
          message: 'Title and idea fitness assessment are required'
        });
      }

      const params = {
        title: req.body.title,
        ideaFitness: req.body.ideaFitness
      };

      const result = await generateGrowthProjections(params);
      res.json(result);
    } catch (error: any) {
      console.error('Error in /api/business-plan/growth-projections:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to generate growth projections'
      });
    }
  };
  
  handleRequest();
});

router.post('/competitor-analysis', function(req: Request, res: Response) {
  const handleRequest = async () => {
    try {
      if (!req.body.title || !req.body.ideaFitness) {
        return res.status(400).json({
          message: 'Title and idea fitness assessment are required'
        });
      }

      const params = {
        title: req.body.title,
        ideaFitness: req.body.ideaFitness
      };

      const result = await generateCompetitorAnalysis(params);
      res.json(result);
    } catch (error: any) {
      console.error('Error in /api/business-plan/competitor-analysis:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to generate competitor analysis'
      });
    }
  };
  
  handleRequest();
});

router.post('/usp', function(req: Request, res: Response) {
  const handleRequest = async () => {
    try {
      if (!req.body.title || !req.body.ideaFitness) {
        return res.status(400).json({
          message: 'Title and idea fitness assessment are required'
        });
      }

      const params = {
        title: req.body.title,
        ideaFitness: req.body.ideaFitness
      };

      const result = await generateUsp(params);
      res.json(result);
    } catch (error: any) {
      console.error('Error in /api/business-plan/usp:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to generate USP'
      });
    }
  };
  
  handleRequest();
});

router.post('/how-it-works', function(req: Request, res: Response) {
  const handleRequest = async () => {
    try {
      if (!req.body.title || !req.body.ideaFitness) {
        return res.status(400).json({
          message: 'Title and idea fitness assessment are required'
        });
      }

      const params = {
        title: req.body.title,
        ideaFitness: req.body.ideaFitness
      };

      const result = await generateHowItWorks(params);
      res.json(result);
    } catch (error: any) {
      console.error('Error in /api/business-plan/how-it-works:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to generate How It Works'
      });
    }
  };
  
  handleRequest();
});

router.post('/marketing-strategy', function(req: Request, res: Response) {
  const handleRequest = async () => {
    try {
      if (!req.body.title || !req.body.ideaFitness) {
        return res.status(400).json({
          message: 'Title and idea fitness assessment are required'
        });
      }

      const params = {
        title: req.body.title,
        ideaFitness: req.body.ideaFitness
      };

      const result = await generateMarketingStrategy(params);
      res.json(result);
    } catch (error: any) {
      console.error('Error in /api/business-plan/marketing-strategy:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to generate marketing strategy'
      });
    }
  };
  
  handleRequest();
});

router.post('/technology-plan', function(req: Request, res: Response) {
  const handleRequest = async () => {
    try {
      if (!req.body.title || !req.body.ideaFitness) {
        return res.status(400).json({
          message: 'Title and idea fitness assessment are required'
        });
      }

      const params = {
        title: req.body.title,
        ideaFitness: req.body.ideaFitness
      };

      const result = await generateTechnologyPlan(params);
      res.json(result);
    } catch (error: any) {
      console.error('Error in /api/business-plan/technology-plan:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to generate technology plan'
      });
    }
  };
  
  handleRequest();
});

router.post('/challenges', function(req: Request, res: Response) {
  const handleRequest = async () => {
    try {
      if (!req.body.title || !req.body.ideaFitness) {
        return res.status(400).json({
          message: 'Title and idea fitness assessment are required'
        });
      }

      const params = {
        title: req.body.title,
        ideaFitness: req.body.ideaFitness
      };

      const result = await generateChallenges(params);
      res.json(result);
    } catch (error: any) {
      console.error('Error in /api/business-plan/challenges:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to generate challenges'
      });
    }
  };
  
  handleRequest();
});

router.post('/revenue-projections', function(req: Request, res: Response) {
  const handleRequest = async () => {
    try {
      if (!req.body.title || !req.body.ideaFitness) {
        return res.status(400).json({
          message: 'Title and idea fitness assessment are required'
        });
      }

      const params = {
        title: req.body.title,
        ideaFitness: req.body.ideaFitness
      };

      const result = await generateRevenueProjections(params);
      res.json(result);
    } catch (error: any) {
      console.error('Error in /api/business-plan/revenue-projections:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to generate revenue projections'
      });
    }
  };
  
  handleRequest();
});

router.post('/swot-analysis', function(req: Request, res: Response) {
  const handleRequest = async () => {
    try {
      if (!req.body.title || !req.body.ideaFitness) {
        return res.status(400).json({
          message: 'Title and idea fitness assessment are required'
        });
      }

      const params = {
        title: req.body.title,
        ideaFitness: req.body.ideaFitness
      };

      const result = await generateSwotAnalysis(params);
      res.json(result);
    } catch (error: any) {
      console.error('Error in /api/business-plan/swot-analysis:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to generate SWOT analysis'
      });
    }
  };
  
  handleRequest();
});

router.post('/strategic-roadmap', function(req: Request, res: Response) {
  const handleRequest = async () => {
    try {
      if (!req.body.title || !req.body.ideaFitness) {
        return res.status(400).json({
          message: 'Title and idea fitness assessment are required'
        });
      }

      const params = {
        title: req.body.title,
        ideaFitness: req.body.ideaFitness
      };

      const result = await generateStrategicRoadmap(params);
      res.json(result);
    } catch (error: any) {
      console.error('Error in /api/business-plan/strategic-roadmap:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to generate strategic roadmap'
      });
    }
  };

  handleRequest();
});

router.post('/metrics', function(req: Request, res: Response) {
  console.log('Metrics endpoint hit with data:', req.body);
  const handleRequest = async () => {
    try {
      if (!req.body.title || !req.body.ideaFitness) {
        return res.status(400).json({
          message: 'Title and idea fitness assessment are required'
        });
      }

      const params = {
        title: req.body.title,
        ideaFitness: req.body.ideaFitness
      };

      const result = await generateMetrics(params);
      res.json(result);
    } catch (error: any) {
      console.error('Error in /api/business-plan/metrics:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to generate business metrics'
      });
    }
  };

  handleRequest();
});

router.post('/market-share', function(req: Request, res: Response) {
  const handleRequest = async () => {
    try {
      if (!req.body.title || !req.body.ideaFitness) {
        return res.status(400).json({ error: 'Title and idea fitness are required' });
      }

      const marketShareData = await generateMarketShare(req.body.title, req.body.ideaFitness);
      res.json(marketShareData);
    } catch (error) {
      console.error('Error generating market share:', error);
      res.status(500).json({ error: 'Failed to generate market share analysis' });
    }
  };

  handleRequest();
});

export default router;