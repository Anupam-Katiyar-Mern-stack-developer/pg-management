import { Request, Response } from "express";
import * as authService from '../services/auth.service';
import { AppError } from "../utils/AppError";

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
    }

    try {
        const data = await authService.loginUser(email, password);
        res.json(data);

    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const getMe = async (require: Request, res: Response): Promise<void> => {
    if (!require.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        const user = await authService.getUserProfile(require.user.id);
        res.json({ user });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        console.error('GetMe error:', error);
        res.status(500).json({ message: 'Internal server error' });

    }
}