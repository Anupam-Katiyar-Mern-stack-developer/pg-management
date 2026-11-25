// src/routes/lead.routes.ts
import { Router } from 'express';
import * as leadController from '../controllers/lead.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// Public: PG Details page ke "Schedule a Free Visit" modal se hit hoga
router.post('/', leadController.create);

// Protected: Admin apni property ke leads dekh aur update kar sakega
router.get('/', authenticate, authorizeRoles('ADMIN', 'SUPER_ADMIN'), leadController.list);
router.patch(
    '/:leadId/status',
    authenticate,
    authorizeRoles('ADMIN', 'SUPER_ADMIN'),
    leadController.updateStatus
);

export default router;