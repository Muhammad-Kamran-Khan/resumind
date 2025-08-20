import { Router } from 'express';
import multer from 'multer';
import { handleResumeUpload } from '../controllers/AnalysisController.js';
import { protect } from '../middleware/authMiddlewares.js';

const router = Router();

// Configure multer to use memory storage.
// This will make the uploaded file available as a buffer in `req.file.buffer`.
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// The route definition now uses the in-memory upload middleware.
// The `protect` middleware ensures only logged-in users can upload.
router.post('/upload', protect, upload.single('resume'), handleResumeUpload);

export default router;