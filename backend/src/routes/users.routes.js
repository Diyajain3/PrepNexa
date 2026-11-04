import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { getMe } from "../controllers/users.controller.js";

const router = Router();

router.get('/me', requireAuth, getMe);

export default router;
