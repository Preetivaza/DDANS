// import express from 'express';
// // import { signup, login, logout } from '../controllers/authController.js';
// import { signup,login,logout ,forgotPassword,resetPassword,validate} from '../controllers/AuthController.js';
// import { authMiddleware } from '../middleware/authMiddleware.js';
// const router = express.Router();

// // Define routes
// router.post('/signup', signup);
// router.post('/login', login);
// router.post('/logout', logout);
// router.post('/forget-password',forgotPassword);
// router.post('/reset-password',resetPassword);

// router.get('/validate', authMiddleware(['admin']),validate);
// export default router;




import express from 'express';
import { signup, login, logout, forgotPassword, resetPassword, validate,getCurrentUser } from '../controllers/AuthController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Define routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forget-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected route to validate token
router.get('/validate', authMiddleware(['admin',"authority",'staff']), validate);
router.get('/me', authMiddleware(['admin', 'authority', 'staff']), getCurrentUser);

export default router;