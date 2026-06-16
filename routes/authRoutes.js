import { Router } from 'express';
import { login, register, getMe, getSchools, deleteSchool } from '../controllers/authController.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.get('/me', authMiddleware, getMe);

// Admin-only routes
router.post('/register', authMiddleware, roleMiddleware(['admin']), register);
router.get('/schools', authMiddleware, roleMiddleware(['admin']), getSchools);
router.delete('/schools/:username', authMiddleware, roleMiddleware(['admin']), deleteSchool);

export default router;
