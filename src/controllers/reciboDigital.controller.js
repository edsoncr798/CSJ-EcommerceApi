import { insertarReciboDigitalService, obtenerReciboDigitalService, getAllDigitalReceiptsService, buscarRecibosDigitalesService, obtenerProximoCorrelativoService, getCpDataFromDb, getCpDetailsFromDb, getSalesGroupService } from '../services/reciboDigital.service.js';


export const crearReciboDigital = async (req, res) => {
    try {
        const reciboData = req.body;
        
        // Validaciones básicas
        const camposRequeridos = [
            'numeroRecibo', 'numeroComprobante', 'fechaGeneracion',
            'clienteNombre','idVendedor', 'vendedorNombre', 'vendedorCodigo', 'vendedorDni',
            'saldoTotal', 'montoPagado', 'tipoPago', 'metodoPago', 'tipoDocumento', 'idCanal',
            'canal', 'idGrupoVentas', 'grupoVentas'
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


// Actualizar el controlador existente para manejar filtros
export const getAllDigitalReceiptsController = async (req, res) => {
    try {
        // Extraer filtros de query parameters
        const filtros = {
            fechaInicio: req.query.fechaInicio,
            fechaFin: req.query.fechaFin,
            idVendedor: req.query.idVendedor ? parseInt(req.query.idVendedor) : null,
            tipoPago: req.query.tipoPago,
            estado: req.query.estado,
            numeroRecibo: req.query.numeroRecibo,
            clienteNombre: req.query.clienteNombre,
            IdCanal: req.query.IdCanal,
            IdGrupoVentas: req.query.IdGrupoVentas,
        };
        
        // Filtrar valores null/undefined
        const filtrosLimpios = Object.fromEntries(
            Object.entries(filtros).filter(([_, value]) => value != null && value !== '')
        );
        
        const result = await getAllDigitalReceiptsService(filtrosLimpios);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error en getAllDigitalReceipts:', error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

// Controlador para obtener el próximo número correlativo
export const obtenerProximoCorrelativo = async (req, res) => {
    try {
        const result = await obtenerProximoCorrelativoService();
        
        return res.status(200).json({
            success: true,
            message: result.message,
            numeroCorrelativo: result.data.numeroCorrelativo
        });
        
    } catch (error) {
        console.error('Error en obtenerProximoCorrelativo:', error);
        
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Error al generar número correlativo',
            numeroCorrelativo: null
        });
    }
};


export const getCpData = async (req, res) => {
    try {
        const { numeroComprobante } = req.params;
        const { tipo } = req.query;
        
        // Validar y convertir el tipo de búsqueda
        let tipoBusqueda = parseInt(tipo) || 1; // Por defecto tipo 1
        
        // Validar que el tipo sea 1 o 2
        if (tipoBusqueda !== 1 && tipoBusqueda !== 2) {
            return res.status(400).json({
                success: false,
                message: 'El parámetro tipo debe ser 1 (comprobante directo) o 2 (consolidado de carga)'
            });
        }
        
        console.log(`getCpData - Número: ${numeroComprobante}, Tipo: ${tipoBusqueda}`);
        
        const result = await getCpDataFromDb(numeroComprobante, tipoBusqueda);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error en getCpData:', error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Error al obtener los datos de la base de datos'
        });
    }
}


export const getCpDetail = async(req, res) => {
    try{
        const { numeroComprobante } = req.params;
        const result = await getCpDetailsFromDb(numeroComprobante);
        return res.status(200).json(result);
    }catch(error){
        console.error('Error en getCpDetail:', error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Error al obtener los datos de la base de datos'
        });
    }
}

// Nuevo controlador específico para búsquedas avanzadas
export const buscarRecibosDigitales = async (req, res) => {
    try {
        const filtros = req.body;
        
        // Validar que al menos un filtro esté presente
        const filtrosValidos = Object.values(filtros).some(value => value != null && value !== '');
        
        if (!filtrosValidos) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar al menos un filtro de búsqueda'
            });
        }
        
        // Validar formato de fechas si están presentes
        if (filtros.fechaInicio && isNaN(Date.parse(filtros.fechaInicio))) {
            return res.status(400).json({
                success: false,
                message: 'Formato de fecha inválido en fechaInicio'
            });
        }
        
        if (filtros.fechaFin && isNaN(Date.parse(filtros.fechaFin))) {
            return res.status(400).json({
                success: false,
                message: 'Formato de fecha inválido en fechaFin'
            });
        }
        
        const result = await buscarRecibosDigitalesService(filtros);
        return res.status(200).json(result);
        
    } catch (error) {
        console.error('Error en buscarRecibosDigitales:', error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

// Controlador para obtener estadísticas de recibos
export const obtenerEstadisticasRecibos = async (req, res) => {
    try {
        const { fechaInicio, fechaFin, idVendedor } = req.query;
        
        const filtros = {
            fechaInicio,
            fechaFin,
            idVendedor: idVendedor ? parseInt(idVendedor) : null
        };
        
        const filtrosLimpios = Object.fromEntries(
            Object.entries(filtros).filter(([_, value]) => value != null && value !== '')
        );
        
        const result = await getAllDigitalReceiptsService(filtrosLimpios);
        
        // Calcular estadísticas
        const recibos = result.data;
        const estadisticas = {
            totalRecibos: recibos.length,
            montoTotal: recibos.reduce((sum, recibo) => sum + parseFloat(recibo.MontoPagado || 0), 0),
            saldoPendienteTotal: recibos.reduce((sum, recibo) => sum + parseFloat(recibo.SaldoPendiente || 0), 0),
            porTipoPago: {},
            porEstado: {},
            porVendedor: {}
        };
        
        // Agrupar por tipo de pago
        recibos.forEach(recibo => {
            const tipo = recibo.TipoPago || 'No especificado';
            estadisticas.porTipoPago[tipo] = (estadisticas.porTipoPago[tipo] || 0) + 1;
        });
        
        // Agrupar por estado
        recibos.forEach(recibo => {
            const estado = recibo.EstadoPago || 'No especificado';
            estadisticas.porEstado[estado] = (estadisticas.porEstado[estado] || 0) + 1;
        });
        
        // Agrupar por vendedor
        recibos.forEach(recibo => {
            const vendedor = recibo.VendedorNombre || 'No especificado';
            estadisticas.porVendedor[vendedor] = (estadisticas.porVendedor[vendedor] || 0) + 1;
        });
        
        return res.status(200).json({
            success: true,
            data: estadisticas,
            filtrosAplicados: filtrosLimpios,
            message: 'Estadísticas calculadas exitosamente'
        });
        
    } catch (error) {
        console.error('Error en obtenerEstadisticasRecibos:', error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
};

export const getSalesGroup = async (req, res) => {
    try {
        const result = await getSalesGroupService();
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error en getSalesGroupController:', error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
}


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