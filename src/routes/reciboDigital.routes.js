import { Router } from 'express';
import { 
    crearReciboDigital, 
    obtenerReciboDigital, 
    getAllDigitalReceiptsController,
    buscarRecibosDigitales,
    obtenerEstadisticasRecibos
} from '../controllers/reciboDigital.controller.js';

const router = Router();

// Crear un nuevo recibo digital
router.post('/recibo-digital', crearReciboDigital);

// Búsqueda avanzada de recibos (POST para filtros complejos)
router.post('/recibo-digital/buscar', buscarRecibosDigitales);

// Obtener estadísticas de recibos
router.get('/recibo-digital/estadisticas', obtenerEstadisticasRecibos);

// Obtener todos los recibos digitales (con filtros opcionales via query params)
router.get('/recibo-digital', getAllDigitalReceiptsController);

// Obtener un recibo digital por número
router.get('/recibo-digital/:numeroRecibo', obtenerReciboDigital);

export default router;