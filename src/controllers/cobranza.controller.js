import { 
    agregarItemCargoCobranzaService, 
    procesarComprobantesService
} from '../services/cobranza.service.js';

// Controlador para agregar item al cargo cobranza
export const agregarItemCargoCobranza = async (req, res) => {
    try {
        const {
            idDocumento,
            idCargoCobranza,
            saldo,
            numeroMedioPago,
            numeroDocumento,
            montoCobrado,
            idTipoMedioPago
        } = req.body;

        // Validaciones básicas
        const camposRequeridos = [
            'idDocumento', 'saldo', 
            'montoCobrado', 'idTipoMedioPago'
        ];
        
        const camposFaltantes = camposRequeridos.filter(campo => 
            req.body[campo] === undefined || req.body[campo] === null
        );
        
        if (camposFaltantes.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Campos requeridos faltantes: ${camposFaltantes.join(', ')}`
            });
        }

        // Validar tipos de datos
        if (isNaN(idDocumento) || isNaN(idCargoCobranza) || isNaN(idTipoMedioPago)) {
            return res.status(400).json({
                success: false,
                message: 'Los campos idDocumento, idCargoCobranza e idTipoMedioPago deben ser números'
            });
        }

        if (isNaN(saldo) || isNaN(montoCobrado)) {
            return res.status(400).json({
                success: false,
                message: 'Los campos saldo y montoCobrado deben ser números válidos'
            });
        }

        if (montoCobrado <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El monto cobrado debe ser mayor a 0'
            });
        }

        const itemData = {
            idDocumento,
            idCargoCobranza,
            saldo,
            numeroMedioPago: numeroMedioPago || '',
            numeroDocumento: numeroDocumento || '',
            montoCobrado,
            idTipoMedioPago
        };

        const result = await agregarItemCargoCobranzaService(itemData);
        
        return res.status(201).json(result);
        
    } catch (error) {
        console.error('Error en agregarItemCargoCobranza:', error);
        
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor',
            ...(process.env.NODE_ENV === 'development' && { error: error.originalError })
        });
    }
};

// Controlador para procesar múltiples comprobantes
export const procesarComprobantes = async (req, res) => {
    try {
        // Usar 4087 como tipo de liquidación por defecto (existe en la base de datos)
        const { comprobantes, idEmpleado, tipoLiquidacion } = req.body;

        // Validaciones básicas
        if (!comprobantes || !Array.isArray(comprobantes)) {
            return res.status(400).json({
                success: false,
                message: 'El campo comprobantes es requerido y debe ser un array'
            });
        }

        if (comprobantes.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar al menos un comprobante'
            });
        }

        if (!idEmpleado || isNaN(idEmpleado)) {
            return res.status(400).json({
                success: false,
                message: 'El campo idEmpleado es requerido y debe ser un número'
            });
        }

        // Validar que tipoLiquidacion sea un número válido
        if (isNaN(tipoLiquidacion)) {
            return res.status(400).json({
                success: false,
                message: 'El campo tipoLiquidacion debe ser un número válido'
            });
        }

        // Validar estructura de cada comprobante
        const camposRequeridosComprobante = [
            'idDocumento', 'saldo', 'montoCobrado', 'idTipoMedioPago'
        ];

        for (let i = 0; i < comprobantes.length; i++) {
            const comp = comprobantes[i];
            
            const camposFaltantes = camposRequeridosComprobante.filter(campo => 
                comp[campo] === undefined || comp[campo] === null
            );
            
            if (camposFaltantes.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Comprobante ${i + 1}: Campos requeridos faltantes: ${camposFaltantes.join(', ')}`
                });
            }

            // Validar tipos de datos
            if (isNaN(comp.idDocumento) || isNaN(comp.idTipoMedioPago)) {
                return res.status(400).json({
                    success: false,
                    message: `Comprobante ${i + 1}: Los campos idDocumento e idTipoMedioPago deben ser números`
                });
            }

            if (isNaN(comp.saldo) || isNaN(comp.montoCobrado)) {
                return res.status(400).json({
                    success: false,
                    message: `Comprobante ${i + 1}: Los campos saldo y montoCobrado deben ser números válidos`
                });
            }

            if (comp.montoCobrado <= 0) {
                return res.status(400).json({
                    success: false,
                    message: `Comprobante ${i + 1}: El monto cobrado debe ser mayor a 0`
                });
            }
        }

        const result = await procesarComprobantesService(comprobantes, idEmpleado, tipoLiquidacion);
        
        return res.status(201).json(result);
        
    } catch (error) {
        console.error('Error en procesarComprobantes:', error);
        
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor',
            ...(process.env.NODE_ENV === 'development' && { error: error.originalError })
        });
    }
};