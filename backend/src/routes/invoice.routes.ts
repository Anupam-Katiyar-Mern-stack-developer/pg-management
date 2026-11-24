// src/routes/invoice.routes.ts
import { Router } from 'express';
import * as invoiceController from '../controllers/invoice.controller';
import {
  authenticate,
  authorizeRoles,
  requirePermission,
} from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Tenant apne invoices dekh sakta hai; Admin/Super Admin apni properties ke
router.get('/', invoiceController.list);

// Admin/Super Admin actions (can_use_invoicing permission required)
router.post(
  '/generate',
  authorizeRoles('ADMIN', 'SUPER_ADMIN'),
  requirePermission('can_use_invoicing'),
  invoiceController.generate
);

router.patch(
  '/:invoiceId/pay',
  authorizeRoles('ADMIN', 'SUPER_ADMIN'),
  requirePermission('can_use_invoicing'),
  invoiceController.markPaid
);

export default router;