import { Router } from 'express';
import { consultDocument, validateDocument, validatePersona } from '../controllers/document.controller.js';

const router = Router();

router.get('/document/:document', consultDocument);
router.get('/validate-doc/:doc', validateDocument);
router.get('/validate-persona/:dni/:codigo', validatePersona);

export default router;