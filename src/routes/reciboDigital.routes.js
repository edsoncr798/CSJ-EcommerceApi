import { Router } from 'express';
import { crearReciboDigital, obtenerReciboDigital } from '../controllers/reciboDigital.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Crear un nuevo recibo digital
router.post('/recibo-digital', verifyToken, crearReciboDigital);

// Obtener un recibo digital por número
router.get('/recibo-digital/:numeroRecibo', verifyToken, obtenerReciboDigital);

export default router;