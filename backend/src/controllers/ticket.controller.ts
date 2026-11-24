// src/controllers/ticket.controller.ts
import { Request, Response } from 'express';
import * as ticketService from '../services/ticket.service';
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
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const { category, title, description, priority } = req.body as Partial<ticketService.CreateTicketInput>;

    if (!category || !title || !description) {
        res.status(400).json({ message: 'category, title, and description are required' });
        return;
    }

    try {
        const ticket = await ticketService.createTicket({
            tenantId: req.user.id,
            category,
            title,
            description,
            priority,
        });
        res.status(201).json({ message: 'Support ticket raised successfully', ticket });
    } catch (error) {
        handleError(res, error, 'CreateTicket');
    }
};

export const list = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const status = req.query.status as ticketService.TicketStatus | undefined;

    try {
        const tickets = await ticketService.listTickets(req.user.id, req.user.role, status);
        res.json({ tickets });
    } catch (error) {
        handleError(res, error, 'ListTickets');
    }
};

export const updateStatus = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const { status, resolutionNote } = req.body as {
        status?: ticketService.TicketStatus;
        resolutionNote?: string;
    };
    const validStatuses: ticketService.TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];

    if (!status || !validStatuses.includes(status)) {
        res.status(400).json({ message: 'status must be OPEN, IN_PROGRESS, or RESOLVED' });
        return;
    }

    try {
        const ticket = await ticketService.updateTicketStatus(
            req.params.ticketId,
            req.user.id,
            req.user.role,
            status,
            resolutionNote
        );
        res.json({ message: 'Ticket status updated', ticket });
    } catch (error) {
        handleError(res, error, 'UpdateTicketStatus');
    }
};