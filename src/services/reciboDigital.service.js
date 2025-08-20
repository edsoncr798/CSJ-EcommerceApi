import { getConnection2, sql } from '../database/connection.js';

export const insertarReciboDigitalService = async (reciboData) => {
    try {
        const pool = await getConnection2();
        const request = pool.request();

        // Mapear todos los parámetros del stored procedure
        const params = [
            { name: 'numeroRecibo', type: sql.TYPES.NVarChar(50), value: reciboData.numeroRecibo },
            { name: 'numeroComprobante', type: sql.TYPES.NVarChar(50), value: reciboData.numeroComprobante },
            { name: 'fechaGeneracion', type: sql.TYPES.DateTime2, value: reciboData.fechaGeneracion },
            { name: 'estado', type: sql.TYPES.NVarChar(20), value: reciboData.estado || 'procesado' },
            { name: 'clienteNombre', type: sql.TYPES.NVarChar(255), value: reciboData.clienteNombre },
            { name: 'clienteDocumento', type: sql.TYPES.NVarChar(50), value: reciboData.clienteDocumento || null },
            { name: 'idVendedor', type: sql.TYPES.Int, value: reciboData.idVendedor },
            { name: 'vendedorNombre', type: sql.TYPES.NVarChar(255), value: reciboData.vendedorNombre },
            { name: 'vendedorCodigo', type: sql.TYPES.NVarChar(20), value: reciboData.vendedorCodigo },
            { name: 'vendedorDni', type: sql.TYPES.NVarChar(20), value: reciboData.vendedorDni },
            { name: 'saldoTotal', type: sql.TYPES.Decimal(18, 2), value: reciboData.saldoTotal },
            { name: 'montoPagado', type: sql.TYPES.Decimal(18, 2), value: reciboData.montoPagado },
            { name: 'tipoPago', type: sql.TYPES.NVarChar(20), value: reciboData.tipoPago },
            { name: 'metodoPago', type: sql.TYPES.NVarChar(50), value: reciboData.metodoPago },
            { name: 'numeroCheque', type: sql.TYPES.NVarChar(50), value: reciboData.numeroCheque || null },
            { name: 'numeroCuenta', type: sql.TYPES.NVarChar(50), value: reciboData.numeroCuenta || null },
            { name: 'diasPago', type: sql.TYPES.Int, value: reciboData.diasPago || null },
            { name: 'tipoDocumento', type: sql.TYPES.NVarChar(20), value: reciboData.tipoDocumento },
            { name: 'firmaVendedor', type: sql.TYPES.NVarChar(sql.MAX), value: reciboData.firmaVendedor || null },
            { name: 'firmaCliente', type: sql.TYPES.NVarChar(sql.MAX), value: reciboData.firmaCliente || null },
            { name: 'observaciones', type: sql.TYPES.NVarChar(500), value: reciboData.observaciones || null }
        ];

        // Agregar todos los parámetros al request
        params.forEach(param => {
            request.input(param.name, param.type, param.value);
        });

        // Ejecutar el stored procedure
        const result = await request.execute('SP_InsertarReciboDigital');

        return {
            success: true,
            data: result.recordset[0],
            message: 'Recibo digital insertado exitosamente'
        };

    } catch (error) {
        console.error('Error en insertarReciboDigitalService:', error);
        
        // Manejar errores específicos del stored procedure
        if (error.message.includes('El número de recibo ya existe')) {
            throw {
                type: 'DUPLICATE_RECEIPT',
                message: 'El número de recibo ya existe',
                status: 409
            };
        }
        
        throw {
            type: 'DATABASE_ERROR',
            message: 'Error al insertar el recibo digital',
            status: 500,
            originalError: error.message
        };
    }
};

// Función adicional para obtener recibos (opcional)
export const obtenerReciboDigitalService = async (numeroRecibo) => {
    try {
        const pool = await getConnectionReciboDigital();
        const request = pool.request();
        
        request.input('numeroRecibo', sql.TYPES.NVarChar(50), numeroRecibo);
        
        const result = await request.query(`
            SELECT * FROM recibos 
            WHERE numeroRecibo = @numeroRecibo
        `);
        
        return {
            success: true,
            data: result.recordset[0] || null
        };
        
    } catch (error) {
        console.error('Error en obtenerReciboDigitalService:', error);
        throw {
            type: 'DATABASE_ERROR',
            message: 'Error al obtener el recibo digital',
            status: 500,
            originalError: error.message
        };
    }
};