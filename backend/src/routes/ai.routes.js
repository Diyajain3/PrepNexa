import {Router} from "express";
import { testQuestion,testScore } from "../controllers/ai.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router=Router();

router.post('/test-question',requireAuth,testQuestion);
router.post('/test-score',requireAuth,testScore);

export default router;