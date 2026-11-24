import { Request, Response } from "express";
import *as tenantService from '../services/tenant.service';
import { AppError } from "../utils/AppError";


const handleError = (res: Response, error: unknown, label: string) => {
    if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
        return;
    }

    console.error(`${label} error:`, error);
    res.status(500).json({ message: 'Internal server error' });
}

export const onboard = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const { name, email, phone, password, bedId, moveInDate, monthlyRent, depositAmount } =
        req.body;

    if (!name || !email || !phone || !bedId || !moveInDate) {
        res.status(400).json({
            message: 'name ,email, phone bedId and moveIndate are required',
        });
        return;
    }

    try {

        const stay = await tenantService.onboardTenant({
            adminId: req.user.id,
            userRole: req.user.role,
            name,
            email,
            phone,
            password,
            bedId,
            moveInDate,
            monthlyRent: monthlyRent !== undefined ? Number(monthlyRent) : undefined,
            depositAmount: depositAmount !== undefined ? Number(depositAmount) : undefined,
        });

        res.status(201).json({ message: 'Tenant onboarded and bed assigned', stay })

    } catch (error) {
        handleError(res, error, 'OnboardTenant')
    }
}


export const listTenants = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    try {
        const tennats = await tenantService.listAdminTenants(req.user.id, req.user.role);
        res.status(401).json({ message: 'Unauthorized' });
    } catch (error) {
        handleError(res, error, 'ListTenants');
    }
}

export const vacate = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    try {
        const stay = await tenantService.vacateTenant(
            req.params.stayId,
            req.user.id,
            req.user.role
        );
        res.json({ message: 'Tenant vacated and bed marked VACANT', stay });

    } catch (error) {
        handleError(res, error, 'VacateTenant');
    }

}