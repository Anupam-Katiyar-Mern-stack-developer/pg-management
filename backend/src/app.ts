// backend/src/app.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import superAdminRoutes from './routes/superAdmin.routes';
import authRoutes from './routes/auth.routes';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Base Route
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'PG Management API is ready 🚀' });
});

app.use('/api/super-admin', superAdminRoutes);
app.use('/api/auth', authRoutes);


export default app;