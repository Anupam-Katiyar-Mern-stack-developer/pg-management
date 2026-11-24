// src/routes/tenant.routes.ts
import { Router } from 'express';
import * as tenantController from '../controllers/tenant.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate, authorizeRoles('ADMIN', 'SUPER_ADMIN'));

router.get('/', tenantController.listTenants);
router.post('/onboard', tenantController.onboard);
router.patch('/:stayId/vacate', tenantController.vacate);

export default router;