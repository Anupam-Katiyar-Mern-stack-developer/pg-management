// src/routes/superAdmin.routes.ts
import { Router } from 'express';
import * as superAdminController from '../controllers/superAdmin.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// Sabhi Super Admin routes par auth + role check globally laga diya
router.use(authenticate, authorizeRoles('SUPER_ADMIN'));

router.get('/admins', superAdminController.listAdmins);
router.post('/admins', superAdminController.createAdmin);
router.patch('/admins/:adminId/permissions', superAdminController.updatePermissions);
router.patch('/admins/:adminId/status', superAdminController.toggleStatus);

export default router;