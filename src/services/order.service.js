import { processBonifications } from "../controllers/order.controller.js";
import { getConnection, sql } from "../database/connection.js"

// Función para procesar las bonificaciones
const procesarBonificaciones = async (pool, IdCp) => {
    try {
        console.log('Iniciando proceso de bonificaciones para IdCp:', IdCp);
        
        // Primero verificamos los items del pedido
        const verifyRequest = pool.request();
        verifyRequest.input('IDCp', sql.TYPES.Int, IdCp);
        const verifyResult = await verifyRequest.query(`
            SELECT *
            FROM vw_ProductosPorOrden 
            WHERE IDCp = @IDCp
        `);
        
        console.log('Items encontrados en vw_ProductosPorOrden:', verifyResult.recordset);

        if (verifyResult.recordset.length === 0) {
            console.warn('No se encontraron items para procesar bonificaciones en el pedido:', IdCp);
            return [{
                TipoMensaje: 'Error',
                Mensaje: 'No se encontraron items para procesar bonificaciones'
            }];
        }

        console.log(`Procesando ${verifyResult.recordset.length} items para bonificaciones...`);

        // Ejecutamos el procedimiento de bonificaciones
        const bonusRequest = pool.request();
        bonusRequest.input('IDCp', sql.TYPES.Int, IdCp);
        bonusRequest.queryTimeout = 10000; // 11 segundos de timeout

        console.log('Ejecutando procedimiento de bonificaciones...');
        const bonusResult = await bonusRequest.execute('ECOMMERCE_GestionarBonificacionPedido');
        console.log('Resultado de bonificaciones:', bonusResult.recordset);

        if (!bonusResult.recordset || bonusResult.recordset.length === 0) {
            console.log('No se encontraron bonificaciones aplicables');
            return [{
                TipoMensaje: 'SinBonificacion',
                Mensaje: 'No hay productos con bonificación en el pedido.'
            }];
        }

        return bonusResult.recordset;
    } catch (error) {
        console.error('Error al procesar bonificaciones:', error);
        if (error.code === 'ETIMEOUT') {
            return [{
                TipoMensaje: 'Error',
                Mensaje: 'El proceso de bonificaciones tomó demasiado tiempo. Por favor, verifique las bonificaciones manualmente.'
            }];
        }
        return [{
            TipoMensaje: 'Error',
            Mensaje: 'Error al procesar las bonificaciones: ' + error.message
        }];
    }
};




export const createOrderService = async (data) => {
    try {
        const pool = await getConnection();
        const request = pool.request();

        const params = [
            { name: 'IdPersona', type: sql.TYPES.Int, value: data.IdPersona },
            { name: 'IdDireccionEntrega', type: sql.TYPES.Int, value: data.IdDireccionEntrega },
            { name: 'TotalVenta', type: sql.TYPES.Decimal(18, 6), value: data.TotalVenta },
            { name: 'Peso', type: sql.TYPES.Decimal(18, 6), value: data.Peso },
            { name: 'TipoCp', type: sql.TYPES.Int, value: data.TipoCp },
            { name: 'EstadoAprobacion', type: sql.VarChar(20), value: data.EstadoAprobacion }
        ];

        params.forEach(param => {
            request.input(param.name, param.type, param.value);
        });

        const result = await request.execute('ECOMMERCE_InsertarPedido_Nuevo');

        // Verifica si hay resultados
        if (!result.recordset || result.recordset.length === 0) {
            throw new Error('No se recibió un IdCp válido del procedimiento almacenado.');
        }
        
        const IdCp = result.recordset[0].IdCp; // Obtén el IdCp
        const fechaFormateada = new Date(result.recordset[0].Fecha).toISOString().split('T')[0];
        let mensajesBonificacion = [];
        // Insertar cada item en el pedido
        for (const item of data.items) {
            // Crear una nueva solicitud para cada item
            const itemRequest = pool.request();

            // Agregar los parámetros para el item
            itemRequest.input('IdCp', sql.TYPES.Int, IdCp); // Asegúrate de pasar el IdCp
            itemRequest.input('IdCpInventario', sql.TYPES.Int, result.recordset[0].IdCpInventario);
            itemRequest.input('Fecha', sql.TYPES.Date, fechaFormateada);
            itemRequest.input('IdProducto', sql.TYPES.Int, item.IdProducto);
            itemRequest.input('IdUnidad', sql.TYPES.Int, item.IdUnidad);
            itemRequest.input('Peso', sql.TYPES.Decimal(18, 6), item.Peso);
            itemRequest.input('Descripcion', sql.TYPES.NVarChar, item.Descripcion);
            itemRequest.input('Cantidad', sql.TYPES.Int, item.Cantidad);
            itemRequest.input('Precio', sql.TYPES.Decimal(18, 6), item.Precio);
            itemRequest.input('Total', sql.TYPES.Decimal(18, 6), item.Total);
            
            // Ejecutar el procedimiento para insertar el item
            const resultItem = await itemRequest.execute('ECOMMERCE_insertarItemPedidov1');

            // Captura mensajes de bonificación devueltos por el SP
            if (resultItem?.recordsets?.length > 0) {
                mensajesBonificacion.push({
                    itemId: item.IdProducto, // Para identificar a qué item corresponde
                    datosBonificacion: resultItem.recordsets[0]?.[0] || {}, // {tieneBonificacion, idProductoB...}
                    mensajes: resultItem.recordsets[1] || [] // Array de mensajes de depuración
                });
            }
        }

        // Estructura de respuesta mejorada
        return {
            data: {
                result: result.recordset,
                bonificaciones: mensajesBonificacion
            }
        };
    } catch (error) {
        console.error('Error al crear el pedido:', error);
        throw {
            type: 'SERVER_ERROR',
            message: 'Error al procesar el pedido',
            status: 500,
            originalError: error
        };
    }
};



export const updateOrderStatus = async (orderId, newStatus) => {
    try {
        const pool = await getConnection();
        const request = pool.request();
        request.input('orderId', sql.TYPES.Int, orderId)
        request.input('EstadoAprobacion', newStatus)
        request.execute('ECOMMERCE_ActualizarEstadoAprobacion')

        return request
    } catch (error) {
        console.error('Error al actualizar el estado del pedido:', error)
        throw new Error('No se pudo actualizar el estado del pedido')
    }
};

export const getOrderStatusService = async (orderId) => {
    try {
        const pool = await getConnection();
        const request = pool.request();
        request.input('orderId', sql.Int, orderId);
        return await request.execute('ECOMMERCE_GetOrderStatus')
    } catch (error) {
        console.error('Error al consultar el estado del pedido:', error);
        throw new Error('No se pudo obtener el estado del pedido');
    }
};


export const deleteOrder = async (orderId) => {
    try {
        const pool = await getConnection();
        const request = pool.request();
        request.input('orderId', sql.TYPES.Int, orderId)
        request.execute('ECOMMERCE_deleteOrder')
        return request
    } catch (error) {
        console.error('Error al eliminar el pedido:', error);
        throw new Error('No se pudo eliminar el pedido')
    }
};


export const getPurchaseHistory = async (idPersona) => {
    let pool;
    try {
        pool = await getConnection();
        const request = pool.request();
        request.input('idUser', sql.TYPES.Int, idPersona);
        return await request.execute('ECOMMERCE_GetPurchaseHistory');
    } catch (error) {
        console.error('Error al ejecutar el procedimiento almacenado:', error);
        throw error;
    }
}


export const getOrderDetailsService = async (orderId) => {
    try {
        const pool = await getConnection();
        const request = pool.request();
        request.input('IDCp', sql.Int, orderId);
        
        const query = `
            SELECT * FROM vw_ProductosPorOrden 
            WHERE IDCp = @IDCp
        `;
        
        const result = await request.query(query);
        return result;
    } catch (error) {
        console.error('Error al obtener los detalles del pedido:', error);
        throw new Error('No se pudieron obtener los detalles del pedido');
    }
};