import { Router } from 'express';
import { login, loginWithGoogle } from '../controllers/auth.controller.js';
import { registerWithGoogle } from '../controllers/rgisterWithGoogle.controller.js';

const router = Router();

router.post('/login', login);
router.post('/login-google', loginWithGoogle);
router.post('/register-google', registerWithGoogle)

export default router;
