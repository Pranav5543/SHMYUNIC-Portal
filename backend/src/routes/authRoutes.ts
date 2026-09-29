import { Router } from 'express';
import { handleLogin, handleRegister, handleGoogleAuth, handleGoogleCallback, getCurrentUser } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/login', handleLogin);
router.post('/register', handleRegister);
router.get('/google', handleGoogleAuth);
router.get('/google/callback', handleGoogleCallback);
router.get('/me', authenticateToken, getCurrentUser);

export default router;
