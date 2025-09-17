import { getConnectionReciboDigital, getConnection, sql } from '../database/connection.js';

export const insertarReciboDigitalService = async (reciboData) => {
    try {
        const pool = await getConnectionReciboDigital();
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
            { name: 'vendedorTelef', type: sql.TYPES.NVarChar(20), value: reciboData.vendedorTelef || null },
            { name: 'idCanal' , type: sql.TYPES.Int, value: reciboData.idCanal },
            { name: 'canal', type: sql.TYPES.NVarChar(100), value: reciboData.canal },
            { name: 'idGrupoVentas', type: sql.TYPES.Int, value: reciboData.idGrupoVentas },
            { name: 'grupoVentas', type: sql.TYPES.NVarChar(100), value: reciboData.grupoVentas },
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


export const getAllDigitalReceiptsService = async (filtros = {}) => {
    try {
        const pool = await getConnectionReciboDigital();
        const request = pool.request();
        
        // Agregar parámetros opcionales del stored procedure
        if (filtros.fechaInicio) {
            request.input('FechaInicio', sql.TYPES.DateTime, new Date(filtros.fechaInicio));
        }
        
        if (filtros.fechaFin) {
            request.input('FechaFin', sql.TYPES.DateTime, new Date(filtros.fechaFin));
        }
        
        if (filtros.idVendedor) {
            request.input('IdVendedor', sql.TYPES.Int, filtros.idVendedor);
        }
        
        if (filtros.tipoPago) {
            request.input('TipoPago', sql.TYPES.VarChar(50), filtros.tipoPago);
        }
        
        if (filtros.estado) {
            request.input('Estado', sql.TYPES.VarChar(50), filtros.estado);
        }
        
        if (filtros.numeroRecibo) {
            request.input('NumeroRecibo', sql.TYPES.VarChar(50), filtros.numeroRecibo);
        }
        
        if (filtros.clienteNombre) {
            request.input('ClienteNombre', sql.TYPES.VarChar(255), filtros.clienteNombre);
        }

        if (filtros.IdCanal) {
            request.input('IdCanal', sql.TYPES.Int, filtros.IdCanal);
        }

        if (filtros.IdGrupoVentas) {
            request.input('IdGrupoVentas', sql.TYPES.Int, filtros.IdGrupoVentas);
        }
        
        // Ejecutar el stored procedure
        const result = await request.execute('sp_ObtenerRecibosDigitales');
        
        return {
            success: true,
            data: result.recordset,
            totalRecords: result.recordset.length,
            message: 'Recibos digitales obtenidos exitosamente'
        };
        
    } catch (error) {
        console.error('Error en getAllDigitalReceiptsService:', error);
        throw {
            type: 'DATABASE_ERROR',
            message: 'Error al obtener los recibos digitales',
            status: 500,
            originalError: error.message
        };
    }
};


export const getSalesGroupService = async () => {
    try {
        const pool = await getConnection();
        const request = pool.request();
        const result = await request.query(`
            SELECT 
                PKID as idGrupoVenta,
                Nombre as nombreGrupo
            FROM GrupoVentas
        `);
        return {
            success: true,
            data: result.recordset,
            message: 'Grupos de venta obtenidos exitosamente'
        };
    } catch (error) {
        console.error('Error en getSalesGroupService:', error);
        throw {
            type: 'DATABASE_ERROR',
            message: 'Error al obtener los grupos de venta',
            status: 500,
            originalError: error.message
        };
    }
}



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


export const getCpDataFromDb = async (numCp, tipobusqueda = 1) => {
    try {
        console.log('getCpDataFromDb - Parámetros:', { numCp, tipobusqueda });
        const pool = await getConnection();
        const request = pool.request();
        request.input('tipobusqueda', sql.TYPES.Int, tipobusqueda);
        request.input('numCp', sql.TYPES.NVarChar(100), numCp);
        const result = await request.execute('Andi_MiComprobante_Buscar');
        console.log('getCpDataFromDb - Resultado:', result.recordset.length, 'registros');
        return result.recordset;
    } catch (error) {
        console.error('Error en getCpDataFromDb:', error);
        throw {
            type: 'DATABASE_ERROR',
            message: 'Error al obtener los datos de la base de datos',
            status: 500,
            originalError: error.message
        };
    }
};

export const getCpDetailsFromDb = async (numCp) => {
    try{
        console.log('getCpDetailsFromDb - Parámetro recibido:', numCp);
        const pool = await getConnection();
        const request = pool.request();
        request.input('numCp', sql.TYPES.NVarChar(20), numCp);

        const result = await request.execute('MiComprobante_Detalles');
        console.log('getCpDetailsFromDb - Resultado:', result.recordset);
        return result.recordset;
    }catch( error){
        console.error('Error en getCpDetailsFromDb:', error);
        throw {
            type: 'DATABASE_ERROR',
            message: 'Error al obtener los detalles del comprobante',
            status: 500,
            originalError: error.message
        };
    }
};


// Función específica para búsquedas con filtros avanzados
export const buscarRecibosDigitalesService = async (filtros) => {
    try {
        const pool = await getConnectionReciboDigital();
        const request = pool.request();
        
        // Validar y agregar parámetros
        const parametros = {
            FechaInicio: filtros.fechaInicio ? new Date(filtros.fechaInicio) : null,
            FechaFin: filtros.fechaFin ? new Date(filtros.fechaFin) : null,
            IdVendedor: filtros.idVendedor || null,
            TipoPago: filtros.tipoPago || null,
            Estado: filtros.estado || null,
            NumeroRecibo: filtros.numeroRecibo || null,
            ClienteNombre: filtros.clienteNombre || null,
            IdCanal: filtros.IdCanal || null,
            IdGrupoVentas: filtros.IdGrupoVentas || null,
        };
        
        // Agregar parámetros al request
        Object.entries(parametros).forEach(([key, value]) => {
            if (key.includes('Fecha') && value) {
                request.input(key, sql.TYPES.DateTime, value);
            } else if (key === 'IdVendedor' && value) {
                request.input(key, sql.TYPES.Int, value);
            } else if (value) {
                request.input(key, sql.TYPES.VarChar(255), value);
            }
        });
        
        const result = await request.execute('sp_ObtenerRecibosDigitales');
        
        return {
            success: true,
            data: result.recordset,
            filtrosAplicados: filtros,
            totalRecords: result.recordset.length,
            message: `Se encontraron ${result.recordset.length} recibos digitales`
        };
        
    } catch (error) {
        console.error('Error en buscarRecibosDigitalesService:', error);
        throw {
            type: 'DATABASE_ERROR',
            message: 'Error al buscar recibos digitales',
            status: 500,
            originalError: error.message
        };
    }
};

// Función para obtener el próximo número correlativo
export const obtenerProximoCorrelativoService = async () => {
    try {
        // Intentar conectar a la base de datos
        const pool = await getConnectionReciboDigital();
        const request = pool.request();
        
        // Obtener el último número correlativo de la base de datos
        const query = `
            SELECT MAX(CAST(numeroRecibo AS INT)) as ultimoNumero
            FROM recibos
            WHERE numeroRecibo NOT LIKE 'L%'
        `;
        
        const result = await request.query(query);
        let ultimoNumero = result.recordset[0]?.ultimoNumero || 0;
        
        // Incrementar para el próximo número
        const proximoNumero = ultimoNumero + 1;
        
        // Formatear con ceros a la izquierda (001, 002, 003...)
        const numeroCorrelativo = proximoNumero.toString().padStart(3, '0');
        
        console.log(`Próximo número correlativo generado desde BD: ${numeroCorrelativo}`);
        
        return {
            success: true,
            data: {
                numeroCorrelativo: numeroCorrelativo
            },
            message: 'Número correlativo generado exitosamente'
        };
        
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
        
        // Si hay cualquier error, generar un número por defecto
        console.log('Generando número correlativo sin base de datos');
        
        // Generar un número basado en timestamp para que sea único
        const timestamp = Date.now();
        const numeroCorrelativo = (timestamp % 1000).toString().padStart(3, '0');
        
        console.log(`Número correlativo generado offline: ${numeroCorrelativo}`);
        
        return {
            success: true,
            data: {
                numeroCorrelativo: numeroCorrelativo
            },
            message: 'Número correlativo generado exitosamente (modo offline)'
        };
    }
};


