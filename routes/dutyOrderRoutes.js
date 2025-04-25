// import express from 'express';
// import { authMiddleware } from '../middleware/authMiddleware.js';
// import {
//   createDutyOrder,
//   approveDutyOrder,
//   getAllDutyOrders,
//   getDutyOrderById,
//   updateDutyOrder,
//   deleteDutyOrder,
//   rejectDutyOrder,
//   cancelDutyOrder,
//   getStaffDuties,
//   getStaffDutyById,
//   markDutyAsCompleted
// } from '../controllers/dutyOrderController.js'

// const router = express.Router();

// // Create duty order (Admin only)
// router.post('/create', authMiddleware(['admin',"authority"]), createDutyOrder);

// // Approve duty order (Authority only)
// router.post('/approve', authMiddleware(['authority']), approveDutyOrder);

// // Get all duty orders (Admin/Authority only)
// router.get('/', authMiddleware(['admin', 'authority']), getAllDutyOrders);

// // Get duty order by ID (Admin/Authority only)
// router.get('/:id', authMiddleware(['admin', 'authority']), getDutyOrderById);

// // Update duty order (Admin/Authority only)
// router.put('/:id', authMiddleware(['admin', 'authority']), updateDutyOrder);

// // Delete duty order (Admin only)
// router.delete('/:id', authMiddleware(['admin']), deleteDutyOrder);

// router.post('/reject',authMiddleware(['authority']),rejectDutyOrder);
// router.post('/cancel',authMiddleware(['admin','authority']),cancelDutyOrder);





// // Staff routes
// router.get('/staff', authMiddleware(['staff', 'authority']), getStaffDuties);
// router.get('/staff/:id', authMiddleware(['staff']), getStaffDutyById);
// router.put('/staff/:id/complete', authMiddleware(['staff']), markDutyAsCompleted);

// export default router;



// src/routes/dutyOrders.router.js
import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  createDutyOrder,
  approveDutyOrder,
  getAllDutyOrders,
  getDutyOrderById,
  updateDutyOrder,
  deleteDutyOrder,
  rejectDutyOrder,
  cancelDutyOrder,
  getStaffDuties,
  getStaffDutyById,
  markDutyAsCompleted,
} from '../controllers/dutyOrderController.js';

const router = express.Router();

// Admin/Authority routes
router.post('/create', authMiddleware(['admin', 'authority']), createDutyOrder);
router.post('/approve', authMiddleware(['authority']), approveDutyOrder);
router.get('/', authMiddleware(['admin', 'authority']), getAllDutyOrders);
router.get('/:id', authMiddleware(['admin', 'authority']), getDutyOrderById);
router.put('/:id', authMiddleware(['admin', 'authority']), updateDutyOrder);
router.delete('/:id', authMiddleware(['admin']), deleteDutyOrder);
router.post('/reject', authMiddleware(['authority']), rejectDutyOrder);
router.post('/cancel', authMiddleware(['admin', 'authority']), cancelDutyOrder);

// Staff routes
router.get('/staff', authMiddleware(['staff']), getStaffDuties); // Only staff can access
router.get('/staff/:id', authMiddleware(['staff']), getStaffDutyById);
router.put('/staff/:id/complete', authMiddleware(['staff']), markDutyAsCompleted);

export default router;