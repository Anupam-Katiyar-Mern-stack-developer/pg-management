// src/routes/property.routes.ts
import { Router } from 'express';
import * as propertyController from '../controllers/property.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// Admin routes (specific paths ko /:idOrSlug se upar rakhna zaroori hai)
router.get('/mine', authenticate, authorizeRoles('ADMIN', 'SUPER_ADMIN'), propertyController.listMine);
router.post('/', authenticate, authorizeRoles('ADMIN', 'SUPER_ADMIN'), propertyController.create);

// Public Marketplace routes
router.get('/', propertyController.listPublic);
router.get('/:idOrSlug', propertyController.getOne);

export default router;