// src/routes/room.routes.ts
import { Router } from 'express';
import * as roomController from '../controllers/room.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// Public: PG Details page par live rooms & vacant beds dikhane ke liye
router.get('/property/:propertyId', roomController.listByProperty);

// Admin / Super Admin: Room add aur bed status update karne ke liye
router.post(
    '/',
    authenticate,
    authorizeRoles('ADMIN', 'SUPER_ADMIN'),
    roomController.createRoom
);
router.patch(
    '/beds/:bedId',
    authenticate,
    authorizeRoles('ADMIN', 'SUPER_ADMIN'),
    roomController.updateBed
);

export default router;