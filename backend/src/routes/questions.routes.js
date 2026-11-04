import { Router } from "express";
import { getQuestions } from "../controllers/questions.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get('/', requireAuth, getQuestions);

export default router;
