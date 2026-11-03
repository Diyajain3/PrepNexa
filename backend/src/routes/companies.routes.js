import {Router} from "express"
import { getCompanies } from "../controllers/companies.controller.js"
import { requireAuth } from "../middleware/auth.middleware.js";

const router=Router();
router.get('/companies',requireAuth,getCompanies);

export default router;