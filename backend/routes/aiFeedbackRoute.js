import { Router } from 'express';
import { getAnalysisById, getAnalysesByUserId } from '../controllers/AnalysisController.js';

const router = Router();

// GET endpoint to retrieve analysis results
router.get('/resume/:id', getAnalysisById);

router.get('/resumes/:userId', getAnalysesByUserId);

export default router;