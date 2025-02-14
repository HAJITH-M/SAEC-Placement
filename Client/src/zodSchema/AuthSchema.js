// AuthSchema.js
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .refine(
      (email) => {
        // Split the email into local part and domain
        const [localPart, domain] = email.split('@');
        
        // Check if the domain is exactly saec.ac.in
        // And ensure the local part doesn't contain @ or forbidden characters
        return (
          domain === 'saec.ac.in' &&
          localPart.length > 0 &&
          /^[a-zA-Z0-9._-]+$/.test(localPart)
        );
      },
      'Only valid college email addresses (@saec.ac.in) are allowed'
    ),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});