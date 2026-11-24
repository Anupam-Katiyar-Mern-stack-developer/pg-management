// src/routes/ticket.routes.ts
import { Router } from 'express';
import * as ticketController from '../controllers/ticket.controller';
import {
    authenticate,
    authorizeRoles,
    requirePermission,
} from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Tenant apne tickets dekh sakta hai; Admin ko can_use_ticketing chahiye
router.get(
    '/',
    (req, res, next) => {
        if (req.user?.role === 'ADMIN') {
            return requirePermission('can_use_ticketing')(req, res, next);
        }
        next();
    },
    ticketController.list
);

// Tenant issue raise karega
router.post('/', authorizeRoles('TENANT'), ticketController.create);

// Admin / Super Admin status update karega
router.patch(
    '/:ticketId/status',
    authorizeRoles('ADMIN', 'SUPER_ADMIN'),
    requirePermission('can_use_ticketing'),
    ticketController.updateStatus
);

export default router;