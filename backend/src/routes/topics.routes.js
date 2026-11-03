import {Router} from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { getTopics } from "../controllers/topics.controller";

const router=Router();

router.get('/',requireAuth,getTopics);

export default router;