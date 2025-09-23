import { getConnection, sql } from '../database/connection.js';

// Servicio para agregar item al cargo cobranza
export const agregarItemCargoCobranzaService = async (itemData) => {
    try {
        const {
            idDocumento,
            idCargoCobranza,
            saldo,
            numeroMedioPago,
            numeroDocumento,
            montoCobrado,
            idTipoMedioPago
        } = itemData;

        // Validar parámetros requeridos
        if (!idDocumento || !idCargoCobranza || !montoCobrado || !idTipoMedioPago) {
            throw new Error('Parámetros requeridos: idDocumento, idCargoCobranza, montoCobrado, idTipoMedioPago');
        }

        const pool = await getConnection();
        const result = await pool.request()
            .input('idDocumento', sql.Int, parseInt(idDocumento))
            .input('idCargoCobranza', sql.Int, parseInt(idCargoCobranza))
            .input('saldo', sql.Decimal(18, 4), parseFloat(saldo) || 0)
            .input('numeroMedioPago', sql.VarChar(100), numeroMedioPago || '')
            .input('numeroDocumento', sql.VarChar(100), numeroDocumento || '')
            .input('montoCobrado', sql.Decimal(18, 4), parseFloat(montoCobrado))
            .input('idTipoMedioPago', sql.Int, parseInt(idTipoMedioPago))
            .execute('Cobranza_ItemCargoCobranza');

        return {
            success: true,
            data: result.recordset[0],
            message: 'Item agregado exitosamente'
        };
    } catch (error) {
        console.error('Error en agregarItemCargoCobranzaService:', error.message);
        throw {
            type: 'DATABASE_ERROR',
            message: 'Error al agregar item al cargo cobranza',
            status: 500,
            originalError: error.message
        };
    }
};

// Servicio para crear un nuevo cargo cobranza
export const crearCargoCobranzaService = async (tipoLiquidacion, idEmpleado, montoTotal) => {
    try {
        // Validar y convertir parámetros
        const tipoLiquidacionInt = parseInt(tipoLiquidacion);
        const idEmpleadoInt = parseInt(idEmpleado);
        const montoTotalDecimal = parseFloat(montoTotal);
        
        // Validar que los parámetros sean válidos
        if (isNaN(tipoLiquidacionInt) || isNaN(idEmpleadoInt) || isNaN(montoTotalDecimal)) {
            throw new Error('Parámetros inválidos: tipoLiquidacion, idEmpleado y montoTotal deben ser números válidos');
        }
        
        if (montoTotalDecimal <= 0) {
            throw new Error('El monto total debe ser mayor a cero');
        }
        
        const pool = await getConnection();
        const result = await pool.request()
            .input('tipoLiquidacion', sql.Int, tipoLiquidacionInt)
            .input('idEmpleado', sql.Int, idEmpleadoInt)
            .input('montoTotal', sql.Decimal(18, 6), montoTotalDecimal)
            .execute('Cobranza_NuevoCargoCobranza1');
        
        if (!result.recordset || result.recordset.length === 0) {
            throw new Error('No se pudo crear el cargo cobranza');
        }
        
        return {
            success: true,
            data: result.recordset[0],
            message: 'Cargo cobranza creado exitosamente'
        };
        
    } catch (error) {
        console.error('Error en crearCargoCobranzaService:', error.message);
        throw {
            type: 'DATABASE_ERROR',
            message: 'Error al crear cargo cobranza',
            status: 500,
            originalError: error.message
        };
    }
};

// Servicio para procesar múltiples comprobantes
export const procesarComprobantesService = async (comprobantes, idEmpleado, tipoLiquidacion) => {
    try {
        // Validar parámetros de entrada
        if (!comprobantes || !Array.isArray(comprobantes) || comprobantes.length === 0) {
            throw new Error('Se requiere un array de comprobantes válido');
        }
        
        if (!idEmpleado || isNaN(parseInt(idEmpleado))) {
            throw new Error('Se requiere un ID de empleado válido');
        }
        
        if (!tipoLiquidacion || isNaN(parseInt(tipoLiquidacion))) {
            throw new Error('Se requiere un tipo de liquidación válido');
        }

        // Agrupar comprobantes por tipo de medio de pago
        const gruposPorMedioPago = comprobantes.reduce((grupos, comp) => {
            const tipo = comp.idTipoMedioPago;
            if (!grupos[tipo]) {
                grupos[tipo] = {
                    comprobantes: [],
                    montoTotal: 0
                };
            }
            grupos[tipo].comprobantes.push(comp);
            grupos[tipo].montoTotal += parseFloat(comp.montoCobrado) || 0;
            return grupos;
        }, {});

        const resultados = [];

        // Procesar cada grupo de medio de pago
        for (const [tipoMedioPago, grupo] of Object.entries(gruposPorMedioPago)) {
            // 1. Crear cargo cobranza usando el tipoLiquidacion proporcionado
            const cargoResult = await crearCargoCobranzaService(
                parseInt(tipoLiquidacion),
                idEmpleado,
                grupo.montoTotal
            );
            
            const cargoCobranza = cargoResult.data;
            const items = [];

            // 2. Agregar cada comprobante como item
            for (const comp of grupo.comprobantes) {
                const itemData = {
                    idDocumento: comp.idDocumento,
                    idCargoCobranza: cargoCobranza.PKID,
                    saldo: comp.saldo || 0,
                    numeroMedioPago: comp.numeroMedioPago || '',
                    numeroDocumento: comp.numeroDocumento || '',
                    montoCobrado: comp.montoCobrado,
                    idTipoMedioPago: comp.idTipoMedioPago
                };

                const itemResult = await agregarItemCargoCobranzaService(itemData);
                items.push(itemResult.data);
            }

            resultados.push({
                cargoCobranza,
                items,
                tipoMedioPago: parseInt(tipoMedioPago),
                cantidadItems: items.length,
                montoTotal: grupo.montoTotal
            });
        }

        return {
            success: true,
            data: resultados,
            message: `Procesados ${resultados.length} cargo(s) de cobranza con ${comprobantes.length} comprobante(s)`
        };
        
    } catch (error) {
        console.error('Error en procesarComprobantesService:', error.message);
        throw {
            type: 'DATABASE_ERROR',
            message: 'Error al procesar comprobantes',
            status: 500,
            originalError: error.message
        };
    }
};
