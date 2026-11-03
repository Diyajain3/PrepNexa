import {Router} from "express"
import { getCompanies } from "../controllers/companies.controller.js"
import { requireAuth } from "../middleware/auth.middleware.js";

const router=Router();
router.get('/', requireAuth, getCompanies);

export default router;
