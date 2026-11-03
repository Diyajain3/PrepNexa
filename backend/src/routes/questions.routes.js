import {Router} from "express";
import { getQuestions } from "../controllers/questions.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router=Router();

router.get('/',requireAuth,getQuestions);

export default router;