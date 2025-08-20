import { insertarReciboDigitalService, obtenerReciboDigitalService } from '../services/reciboDigital.service.js';

export const crearReciboDigital = async (req, res) => {
    try {
        const reciboData = req.body;
        
        // Validaciones básicas
        const camposRequeridos = [
            'numeroRecibo', 'numeroComprobante', 'fechaGeneracion',
            'clienteNombre','idVendedor', 'vendedorNombre', 'vendedorCodigo', 'vendedorDni',
            'saldoTotal', 'montoPagado', 'tipoPago', 'metodoPago', 'tipoDocumento'
        ];
        
        const camposFaltantes = camposRequeridos.filter(campo => !reciboData[campo]);
        
        if (camposFaltantes.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Campos requeridos faltantes: ${camposFaltantes.join(', ')}`
            });
        }
        
        // Validar formato de fecha
        if (reciboData.fechaGeneracion && isNaN(Date.parse(reciboData.fechaGeneracion))) {
            return res.status(400).json({
                success: false,
                message: 'Formato de fecha inválido en fechaGeneracion'
            });
        }
        
        const result = await insertarReciboDigitalService(reciboData);
        
        return res.status(201).json(result);
        
    } catch (error) {
        console.error('Error en crearReciboDigital:', error);
        
        if (error.type === 'DUPLICATE_RECEIPT') {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }
        
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor',
            ...(process.env.NODE_ENV === 'development' && { error: error.originalError })
        });
    }
};

export const obtenerReciboDigital = async (req, res) => {
    try {
        const { numeroRecibo } = req.params;
        
        if (!numeroRecibo) {
            return res.status(400).json({
                success: false,
                message: 'Número de recibo es requerido'
            });
        }
        
        const result = await obtenerReciboDigitalService(numeroRecibo);
        
        if (!result.data) {
            return res.status(404).json({
                success: false,
                message: 'Recibo no encontrado'
            });
        }
        
        return res.status(200).json(result);
        
    } catch (error) {
        console.error('Error en obtenerReciboDigital:', error);
        
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};