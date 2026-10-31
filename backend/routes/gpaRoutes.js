import express from 'express';
import {
  getCumulativeGPA,
  predictGPA,
  calculateTargetGPA,
  getAnalytics
} from '../controllers/gpaController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/cumulative', getCumulativeGPA);
router.post('/predict', predictGPA);
router.post('/target', calculateTargetGPA);
router.get('/analytics', getAnalytics);

export default router;
