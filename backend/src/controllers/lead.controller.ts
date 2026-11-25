// src/controllers/lead.controller.ts
import { Request, Response } from 'express';
import * as leadService from '../services/lead.service';
import { AppError } from '../utils/AppError';

const handleError = (res: Response, error: unknown, label: string) => {
    if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
        return;
    }
    console.error(`${label} error:`, error);
    res.status(500).json({ message: 'Internal server error' });
};

export const create = async (req: Request, res: Response): Promise<void> => {
    const { propertyId, name, phone, visitDate, preferredSharing } =
        req.body as Partial<leadService.CreateLeadInput>;

    if (!propertyId || !name || !phone || !visitDate) {
        res.status(400).json({
            message: 'propertyId, name, phone, and visitDate are required',
        });
        return;
    }

    try {
        const lead = await leadService.createLead({
            propertyId,
            name,
            phone,
            visitDate,
            preferredSharing,
        });
        res.status(201).json({ message: 'Visit scheduled successfully', lead });
    } catch (error) {
        handleError(res, error, 'CreateLead');
    }
};

export const list = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const status = req.query.status as leadService.LeadStatus | undefined;

    try {
        const leads = await leadService.listLeads(req.user.id, req.user.role, status);
        res.json({ leads });
    } catch (error) {
        handleError(res, error, 'ListLeads');
    }
};

export const updateStatus = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const { status } = req.body as { status?: leadService.LeadStatus };
    const validStatuses: leadService.LeadStatus[] = [
        'NEW',
        'CONTACTED',
        'VISITED',
        'CONVERTED',
        'CANCELLED',
    ];

    if (!status || !validStatuses.includes(status)) {
        res.status(400).json({
            message: 'status must be NEW, CONTACTED, VISITED, CONVERTED, or CANCELLED',
        });
        return;
    }

    try {
        const lead = await leadService.updateLeadStatus(
            req.params.leadId,
            req.user.id,
            req.user.role,
            status
        );
        res.json({ message: 'Lead status updated', lead });
    } catch (error) {
        handleError(res, error, 'UpdateLeadStatus');
    }
};