import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getStaffDuties,
  getStaffDutyById,
  markDutyAsCompleted,
  getStaffProfile,
  updateStaffProfile,
  getDutiesByStaffId
} from '../controllers/staffController.js';

const router = express.Router();

// Get all duties for staff
router.get('/duties', authMiddleware(['staff']), getStaffDuties);

// Get duties by staff ID (for admin/authority and staff viewing their own duties)
router.get('/duties/staff/:staffId', authMiddleware(['admin', 'authority', 'staff']), getDutiesByStaffId);

// Get specific duty by ID
router.get('/duties/:id', authMiddleware(['staff']), getStaffDutyById);

// Mark duty as completed
router.put('/duties/:id/complete', authMiddleware(['staff']), markDutyAsCompleted);

// Get staff profile
router.get('/profile', authMiddleware(['staff']), getStaffProfile);

// Update staff profile
router.put('/profile', authMiddleware(['staff']), updateStaffProfile);

export default router; 