import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware.js';
import { signup, login } from '../controllers/auth.controller.js';

const router = Router();

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) })

router.post('/signup',validate(signupSchema),signup);
router.post('/login',validate(loginSchema),login)

export default router;