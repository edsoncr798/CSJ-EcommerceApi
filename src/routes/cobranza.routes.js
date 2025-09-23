import { Router } from 'express';
import { 
    agregarItemCargoCobranza, 
    procesarComprobantes 
} from '../controllers/cobranza.controller.js';

const router = Router();

// Agregar item al cargo cobranza
router.post('/cargo-cobranza/item', agregarItemCargoCobranza);

// Procesar múltiples comprobantes
router.post('/cargo-cobranza/procesar', procesarComprobantes);

export default router;