import { getConnectionCsjDistribucion, getConnectionMeteloRapido, sql } from '../../database/connection.js';
import { obtener_detalle_Guardado } from './detalleOrdenCompra.service.js';

export const eliminarControlAlmacen = async (id) => {
    try {
        const pool = await getConnectionMeteloRapido();
        const request = pool.request();
        
        request.input('ID', sql.Int, id);

        await request.execute('EliminarControlAlmacen');
        
        return { message: 'Control de almacén eliminado correctamente' };
    } catch (error) {
        console.error('Error en eliminarControlAlmacen:', error);
        throw error;
    }
};

export const actualizarItemControlAlmacen = async (idControlAlmacen, jsonDetalleControlAlma) => {
    let fActualizadas = 0;
    let fEliminadas = 0;
    
    try {
        const pool = await getConnectionMeteloRapido();
        
        // Parsear el JSON recibido
        const lDetalleOrdenCompra = JSON.parse(jsonDetalleControlAlma);
        
        // Obtener items guardados previamente
        const eliminarItemOrdenCompra = (await obtener_detalle_Guardado(idControlAlmacen)) || [];

        // Filtrar items que no se deben eliminar (los que están en el JSON entrante)
        // Nota: Modificamos el array eliminarItemOrdenCompra in-place eliminando los que coinciden
        // Iteramos hacia atrás para poder eliminar elementos sin afectar los índices de los siguientes
        for (let i = 0; i < lDetalleOrdenCompra.length; i++) {
            for (let j = eliminarItemOrdenCompra.length - 1; j >= 0; j--) {
                if (lDetalleOrdenCompra[i].Codigo === eliminarItemOrdenCompra[j].Codigo) {
                    eliminarItemOrdenCompra.splice(j, 1);
                    break;
                }
            }
        }

        // Procesar actualizaciones e inserciones
        for (const tmp of lDetalleOrdenCompra) {
            const request = pool.request();
            let spName = '';

            if (tmp.Nuevo) {
                spName = 'AgregarProductoNuevo';
                request.input('idControlAlmacen', sql.Int, idControlAlmacen);
                request.input('codigoProducto', sql.VarChar, tmp.Codigo);
                request.input('codigoEAN', sql.VarChar, tmp.CodigoEAN);
                request.input('descripcionProducto', sql.VarChar, tmp.Descripcion);
                request.input('cantidad', sql.Int, tmp.CantidadBase);
                request.input('factor', sql.Int, tmp.Factor);
                request.input('unidadMin', sql.VarChar, tmp.Unidad);
                request.input('unidadRef', sql.VarChar, tmp.UnidadRef);
                request.input('observacion', sql.VarChar, tmp.Observacion);
                request.input('fechaVencimiento', sql.VarChar, tmp.FechaVencimiento);
                request.input('lote', sql.VarChar, tmp.Lote);
                request.input('revisado', sql.Bit, tmp.Revisado);
                request.input('cantidadProveedor', sql.Int, tmp.CantidadProveedor);
            } else {
                spName = 'ActualizarItemControlAlmacen';
                request.input('idControlAlmacen', sql.Int, idControlAlmacen);
                request.input('codigoProducto', sql.VarChar, tmp.Codigo);
                request.input('condigoEAN', sql.VarChar, tmp.CodigoEAN);
                request.input('descripcionProducto', sql.VarChar, tmp.Descripcion);
                request.input('cantidad', sql.Int, tmp.CantidadBase);
                request.input('observacion', sql.VarChar, tmp.Observacion);
                request.input('fechaVencimiento', sql.VarChar, tmp.FechaVencimiento);
                request.input('lote', sql.VarChar, tmp.Lote);
                request.input('revisado', sql.Bit, tmp.Revisado);
                request.input('cantidadProveedor', sql.Int, tmp.CantidadProveedor);
            }

            const result = await request.execute(spName);
            
            // Verificamos si se ejecutó correctamente (rowsAffected > 0)
            if (result.rowsAffected && result.rowsAffected.reduce((a, b) => a + b, 0) > 0) {
                 fActualizadas++;
            }
        }

        // Procesar eliminaciones
        if (eliminarItemOrdenCompra.length > 0) {
            for (const tmp of eliminarItemOrdenCompra) {
                const request = pool.request();
                request.input('idControlAlmacen', sql.Int, idControlAlmacen);
                request.input('codigo', sql.VarChar, tmp.Codigo);
                
                await request.execute('EliminarItemControlAlmacen');
                fEliminadas++;
            }
        }

        if (fActualizadas === lDetalleOrdenCompra.length) {
            return "Guardado correctamente.";
        } else {
            // Retornamos mensaje incluso si no coincide el conteo exacto, 
            // pero indicando que se procesó (similar a la lógica original que devuelve string vacío si no coincide)
            return fActualizadas > 0 ? "Guardado parcialmente." : "";
        }

    } catch (error) {
        console.error('Error en actualizarItemControlAlmacen:', error);
        throw error;
    }
};

export const finalizarIngresoAlmacen = async (idControlAlmacen, observacion, revisado, aprobado, jsonDetalleControlAlma) => {
    try {
        const pool = await getConnectionMeteloRapido();
        const request = pool.request();
        
        request.input('idControlAlmacen', sql.Int, idControlAlmacen);
        request.input('revisado', sql.VarChar, revisado);
        request.input('aprobado', sql.VarChar, aprobado);
        request.input('observacion', sql.VarChar, observacion);

        const result = await request.execute('FinalizarControlAlmacen');
        
        // rowsAffected retorna un array con el número de filas afectadas por cada sentencia en el SP
        const filasAfectadas = result.rowsAffected.reduce((a, b) => a + b, 0);

        if (filasAfectadas > 0) {
            return await actualizarItemControlAlmacen(idControlAlmacen, jsonDetalleControlAlma);
        } else {
            return "Algo salio mal.";
        }
    } catch (error) {
        // En caso de error, intentamos eliminar el control de almacén como rollback
        try {
            await eliminarControlAlmacen(idControlAlmacen);
        } catch (rollbackError) {
            console.error('Error durante el rollback (eliminarControlAlmacen):', rollbackError);
        }
        
        return "Algo salio mal. " + error.message;
    }
};

export const guardarControlAlmacen = async (idUsuario, numeroOrdenCompra, nombreProveedor, facturaProveedor, guiaTransportista, almacen, jsonDetalleControlAlma) => {
    let idOrdenCompra = 0;
    
    try {
        const pool = await getConnectionMeteloRapido();
        const request = pool.request();
        
        request.input('idUsuario', sql.Int, idUsuario);
        request.input('numeroOrdenCompra', sql.VarChar, numeroOrdenCompra);
        request.input('nombreProveedor', sql.VarChar, nombreProveedor);
        request.input('facturaProveedor', sql.VarChar, facturaProveedor);
        request.input('guiaTransportista', sql.VarChar, guiaTransportista);
        request.input('almacen', sql.VarChar, almacen);

        const result = await request.execute('GuardarControlAlmacen');
        
        if (!result.recordset || result.recordset.length === 0) {
             throw new Error("No se obtuvo respuesta del procedimiento GuardarControlAlmacen");
        }

        const row = result.recordset[0];
        // En C# usan GetValue(0) y GetValue(1)
        // Asumimos que la primera columna es ID y la segunda Serie
        const values = Object.values(row);
        
        // Asegurar que idOrdenCompra sea un entero válido
        idOrdenCompra = parseInt(values[0]);
        
        if (isNaN(idOrdenCompra)) {
             throw new Error("El ID de orden de compra retornado no es un número válido: " + values[0]);
        }

        const serie = values[1];
        
        const nuevaOrdenCompra = {
            IdOrdenCompra: idOrdenCompra,
            Serie: serie
        };

        const lDetalleOrdenCompra = JSON.parse(jsonDetalleControlAlma);
        
        const guardarItems = await guardarItemControlAlmacen(lDetalleOrdenCompra, idOrdenCompra);

        if (guardarItems === lDetalleOrdenCompra.length) {
            return nuevaOrdenCompra;
        } else {
            await eliminarControlAlmacen(idOrdenCompra);
            return null;
        }

    } catch (error) {
        console.error('Error en guardarControlAlmacen:', error);
        // Si ya se había creado la orden (tenemos ID), intentamos eliminarla
        if (idOrdenCompra > 0) {
            try {
                await eliminarControlAlmacen(idOrdenCompra);
            } catch (rollbackError) {
                console.error('Error durante rollback en guardarControlAlmacen:', rollbackError);
            }
        }
        throw error;
    }
};

export const guardarItemControlAlmacen = async (lDetalleOrdenCompra, idControlAlmacen) => {
    let itemsIngresados = 0;

    try {
        const pool = await getConnectionMeteloRapido();

        for (const eDetOrdenCompra of lDetalleOrdenCompra) {
            const request = pool.request();

            request.input('idControlAlmacen', sql.Int, idControlAlmacen);
            request.input('codigoProducto', sql.VarChar, eDetOrdenCompra.Codigo);
            request.input('codigoEAN', sql.VarChar, eDetOrdenCompra.CodigoEAN);
            request.input('descripcionProducto', sql.VarChar, eDetOrdenCompra.Descripcion);
            request.input('cantidad', sql.Int, eDetOrdenCompra.CantidadBase);
            request.input('factor', sql.Int, eDetOrdenCompra.Factor);
            request.input('unidadMin', sql.VarChar, eDetOrdenCompra.Unidad);
            request.input('unidadRef', sql.VarChar, eDetOrdenCompra.UnidadRef);
            // Aseguramos que 'Nuevo' sea booleano (bit en SQL)
            request.input('nuevo', sql.Bit, eDetOrdenCompra.Nuevo); 
            request.input('observacion', sql.VarChar, eDetOrdenCompra.Observacion);
            request.input('cantidadOriginal', sql.Int, eDetOrdenCompra.CantidadBaseOriginal);

            await request.execute('GuardarItemControlAlmacen');
            
            itemsIngresados++;
        }

        return itemsIngresados;
    } catch (error) {
        console.error('Error en guardarItemControlAlmacen:', error);
        throw error;
    }
};

export const mostrarIngresosTerminados = async (almacen, fecha) => {
    try {
        const pool = await getConnectionMeteloRapido();
        const request = pool.request();

        // Reemplazar '-' por '/' como en el código C#
        const fechaFormatted = fecha.replace(/-/g, '/');

        request.input('almacen', sql.VarChar, almacen);
        request.input('fecha', sql.VarChar, fechaFormatted);

        const result = await request.execute('MostrarIngresosTerminados');

        const lOrdenCompraTerminado = [];

        if (result.recordset && result.recordset.length > 0) {
            for (const row of result.recordset) {
                const values = Object.values(row);
                lOrdenCompraTerminado.push({
                    ID: values[0],
                    NumeroDocumento: values[1],
                    NumeroOrdenCompra: values[2],
                    Proveedor: values[3],
                    FacturaProveedor: values[4],
                    FechaRecepcion: values[5],
                    FechaIngreso: values[6],
                    GuiaTransportista: values[7],
                    Usuario: values[8],
                    Seleccionado: false
                });
            }
        }
        return lOrdenCompraTerminado;
    } catch (error) {
        console.error('Error en mostrarIngresosTerminados:', error);
        throw error;
    }
};

export const mostrarIngresosPendiente = async (almacen) => {
    try {
        const pool = await getConnectionMeteloRapido();
        const request = pool.request();

        request.input('almacen', sql.VarChar, almacen);

        const result = await request.execute('MostrarIngresosPendiente');

        const lOrdenCompraPendiente = [];

        if (result.recordset && result.recordset.length > 0) {
            for (const row of result.recordset) {
                const values = Object.values(row);
                lOrdenCompraPendiente.push({
                    ID: values[0],
                    NumeroDocumento: values[1],
                    NumeroOrdenCompra: values[2],
                    Proveedor: values[3],
                    FacturaProveedor: values[4],
                    FechaRecepcion: values[5],
                    GuiaTransportista: values[6],
                    Seleccionado: false
                });
            }
        }
        return lOrdenCompraPendiente;
    } catch (error) {
        console.error('Error en mostrarIngresosPendiente:', error);
        throw error;
    }
};

export const mostrarIngresosSinProcesar = async (almacen) => {
    try {
        const pool = await getConnectionCsjDistribucion();
        const request = pool.request();

        request.input('numeroAlmacen', sql.VarChar, almacen);

        const result = await request.execute('Metelo_OrdenCompraSinProcesar');

        const lOrdenCompraSinProcesar = [];

        if (result.recordset && result.recordset.length > 0) {
            for (const row of result.recordset) {
                const values = Object.values(row);
                lOrdenCompraSinProcesar.push({
                    NumeroOrdenCompra: values[0],
                    Fecha: values[1],
                    EstadoFacturacion: values[2],
                    EstadoEntrega: values[3],
                    Seleccionado: false
                });
            }
        }
        return lOrdenCompraSinProcesar;
    } catch (error) {
        console.error('Error en mostrarIngresosSinProcesar:', error);
        throw error;
    }
};

