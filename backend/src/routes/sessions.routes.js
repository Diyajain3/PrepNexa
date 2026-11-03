import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { startSession, submitAnswer, endSession, getSessions,getSession,getCurrentQuestion } from '../controllers/sessions.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', getSessions);
router.get('/:id', getSession);
router.post('/start', startSession);
router.post('/:id/answer', submitAnswer);
router.post('/:id/end', endSession);
router.get('/:id/current',getCurrentQuestion);