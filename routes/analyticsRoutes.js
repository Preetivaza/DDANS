import express from 'express';
import {
  getDutySummary,
  getMonthlyDutyStats,
  getTopStaff,
  getStatusTrends,
  getCreatorStats
} from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/summary', getDutySummary);
router.get('/monthly-stats', getMonthlyDutyStats);
router.get('/top-staff', getTopStaff);
router.get('/status-trends', getStatusTrends);
router.get('/creator-stats', getCreatorStats);

export default router;
