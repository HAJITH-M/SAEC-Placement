// AuthSchema.js
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .refine(
      (email) => {
        // Split the email into local part and domain

        const [localPart] = email.split('@');
        


        // Check if the local part doesn't contain @ or forbidden characters
        return (

          // domain === 'saec.ac.in' &&
          localPart.length > 0 &&
          /^[a-zA-Z0-9._-]+$/.test(localPart)
        );
      },

      'Please enter a valid email address'
    ),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});