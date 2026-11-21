// src/routes/auth.routes.ts
import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.post('/login', authController.login);

// Protected routes (JWT required)
router.get('/me', authenticate, authController.getMe);

export default router;