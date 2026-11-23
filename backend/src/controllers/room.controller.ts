// src/controllers/room.controller.ts
import { Request, Response } from 'express';
import * as roomService from '../services/room.service';
import { AppError } from '../utils/AppError';

const handleError = (res: Response, error: unknown, label: string) => {
    if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
        return;
    }
    console.error(`${label} error:`, error);
    res.status(500).json({ message: 'Internal server error' });
};

export const createRoom = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const {
        propertyId,
        roomNumber,
        floor,
        sharingType,
        totalBeds,
        monthlyRent,
        depositAmount,
    } = req.body;

    if (!propertyId || !roomNumber || !sharingType || !totalBeds || !monthlyRent) {
        res.status(400).json({
            message:
                'propertyId, roomNumber, sharingType, totalBeds, and monthlyRent are required',
        });
        return;
    }

    try {
        const room = await roomService.createRoomWithBeds({
            adminId: req.user.id,
            userRole: req.user.role,
            propertyId,
            roomNumber,
            floor: floor !== undefined ? Number(floor) : 0,
            sharingType,
            totalBeds: Number(totalBeds),
            monthlyRent: Number(monthlyRent),
            depositAmount: depositAmount !== undefined ? Number(depositAmount) : Number(monthlyRent),
        });

        res.status(201).json({ message: 'Room and beds created successfully', room });
    } catch (error) {
        handleError(res, error, 'CreateRoom');
    }
};

export const listByProperty = async (req: Request, res: Response): Promise<void> => {
    try {
        const rooms = await roomService.getRoomsByProperty(req.params.propertyId);
        res.json({ rooms });
    } catch (error) {
        handleError(res, error, 'ListRoomsByProperty');
    }
};

export const updateBed = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const { status } = req.body as { status?: roomService.BedStatus };
    const validStatuses: roomService.BedStatus[] = ['VACANT', 'OCCUPIED', 'MAINTENANCE'];

    if (!status || !validStatuses.includes(status)) {
        res.status(400).json({
            message: 'status must be one of VACANT, OCCUPIED, or MAINTENANCE',
        });
        return;
    }

    try {
        const bed = await roomService.updateBedStatus(
            req.params.bedId,
            status,
            req.user.id,
            req.user.role
        );
        res.json({ message: 'Bed status updated', bed });
    } catch (error) {
        handleError(res, error, 'UpdateBedStatus');
    }
};