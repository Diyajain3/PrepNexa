import {Router} from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { getMe } from "../controllers/users.controller";

const router=Router();

router.get('/me',requireAuth,getMe);

export default router;