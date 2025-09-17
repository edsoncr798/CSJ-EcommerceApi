import { Router } from 'express';
import { 
    crearReciboDigital, 
    obtenerReciboDigital, 
    getAllDigitalReceiptsController,
    buscarRecibosDigitales,
    obtenerEstadisticasRecibos,
    obtenerProximoCorrelativo,
    getCpData,
    getCpDetail,
    getSalesGroup
} from '../controllers/reciboDigital.controller.js';

const router = Router();

// Crear un nuevo recibo digital
router.post('/recibo-digital', crearReciboDigital);

// Obtener los datos de un comprobante por número
router.get('/comprobante/cp/:numero', getCpData);

// Búsqueda avanzada de recibos (POST para filtros complejos)
router.post('/recibo-digital/buscar', buscarRecibosDigitales);

router.get('/comprobante/cpDetail/:numeroComprobante', getCpDetail);

// Obtener próximo número correlativo (DEBE ir antes de las rutas con parámetros)
router.get('/recibo-digital/proximo-correlativo', obtenerProximoCorrelativo);

// Obtener estadísticas de recibos
router.get('/recibo-digital/estadisticas', obtenerEstadisticasRecibos);

// Obtener grupos de venta (DEBE ir antes de las rutas con parámetros)
router.get('/recibo-digital/grupos-venta', getSalesGroup);

// Obtener todos los recibos digitales (con filtros opcionales via query params)
router.get('/recibo-digital', getAllDigitalReceiptsController);

// Obtener un recibo digital por número (DEBE ir al final)
router.get('/recibo-digital/:numeroRecibo', obtenerReciboDigital);


export default router;