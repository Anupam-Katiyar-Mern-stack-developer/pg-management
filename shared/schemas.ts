// shared/schemas.ts
import { z } from 'zod';

export const registerSchema = z.object({
    name: z.string().min(3, "Name kam se kam 3 characters ka hona chahiye"),
    email: z.string().email("Valid email enter karein"),
    password: z.string().min(6, "Password kam se kam 6 characters ka hona chahiye"),
    phone: z.string().optional(),
    role: z.enum(['ADMIN', 'TENANT']).default('TENANT')
});

export const loginSchema = z.object({
    email: z.string().email("Valid email enter karein"),
    password: z.string().min(1, "Password zaroori hai")
});

// Zod se TS types automatically extract karna (API payloads ke liye)
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;