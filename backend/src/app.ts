// backend/src/app.ts
import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Base Route
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'PG Management API is ready 🚀' });
});

export default app;