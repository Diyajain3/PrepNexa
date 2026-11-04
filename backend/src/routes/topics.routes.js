import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { getTopics } from "../controllers/topics.controller.js";

const router = Router();

router.get('/', requireAuth, getTopics);

export default router;
