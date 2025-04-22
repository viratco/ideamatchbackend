import express from 'express';
import { saveIdea, getSavedIdeas } from '../controllers/saveIdeaController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/save', authenticate, saveIdea);
router.get('/', authenticate, getSavedIdeas);

export default router;
