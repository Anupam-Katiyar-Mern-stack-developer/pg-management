// src/controllers/invoice.controller.ts
import { Request, Response } from 'express';
import * as invoiceService from '../services/invoice.service';
import { AppError } from '../utils/AppError';

const handleError = (res: Response, error: unknown, label: string) => {
    if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
        return;
    }
    console.error(`${label} error:`, error);
    res.status(500).json({ message: 'Internal server error' });
};

export const generate = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const { billingMonth } = req.body as { billingMonth?: string };
    if (!billingMonth) {
        res.status(400).json({ message: 'billingMonth (YYYY-MM) is required' });
        return;
    }

    try {
        const result = await invoiceService.generateMonthlyInvoices(
            req.user.id,
            req.user.role,
            billingMonth
        );
        res.status(201).json({
            message: `${result.createdCount} invoice(s) generated for ${billingMonth}`,
            ...result,
        });
    } catch (error) {
        handleError(res, error, 'GenerateInvoices');
    }
};

export const list = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const status = req.query.status as invoiceService.InvoiceStatus | undefined;

    try {
        const invoices = await invoiceService.listInvoices(
            req.user.id,
            req.user.role,
            status
        );
        res.json({ invoices });
    } catch (error) {
        handleError(res, error, 'ListInvoices');
    }
};

export const markPaid = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const { paymentMode = 'UPI' } = req.body as {
        paymentMode?: invoiceService.PaymentMode;
    };
    const validModes: invoiceService.PaymentMode[] = ['CASH', 'UPI', 'ONLINE'];

    if (!validModes.includes(paymentMode)) {
        res.status(400).json({ message: 'paymentMode must be CASH, UPI, or ONLINE' });
        return;
    }

    try {
        const invoice = await invoiceService.markInvoicePaid(
            req.params.invoiceId,
            req.user.id,
            req.user.role,
            paymentMode
        );
        res.json({ message: 'Invoice marked as PAID', invoice });
    } catch (error) {
        handleError(res, error, 'MarkInvoicePaid');
    }
};