import { z } from 'zod';


export const loginSchema = z.object({
    email: z.string().email('Invalid email address').endsWith('@saec.ac.in', 'Must be a college email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  });
  