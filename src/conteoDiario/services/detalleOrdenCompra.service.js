import { getConnectionMeteloRapido, getConnectionCsjDistribucion, sql } from '../../database/connection.js';

export const obtener_detalle = async (numero_ordencompra, numeroAlmacen) => {
    try {
        const pool = await getConnectionCsjDistribucion(); // Usando la conexión principal (conex en C#)
        const request = pool.request();
        
        request.input('numero_ordenCompra', sql.VarChar, numero_ordencompra);
        request.input('numeroAlmacen', sql.VarChar, numeroAlmacen);

        const result = await request.execute('Metelo_DetalleOrdenCompra');
        
        const led = [];
        
        if (result.recordset && result.recordset.length > 0) {
            for (const row of result.recordset) {
                const values = Object.values(row);
                
                // if (Convert.ToInt32(sqlDr.GetValue(4)) > 0)
                if (values[4] > 0) {
                    led.push({
                        Codigo: values[0],
                        CodigoEAN: values[1],
                        Descripcion: values[2],
                        Factor: values[3],
                        CantidadBase: values[4],
                        Unidad: values[5],
                        UnidadRef: values[6],
                        Revisado: false,
                        CantidadBaseOriginal: values[4],
                        Nuevo: false,
                        Observacion: "",
                        FechaVencimiento: "",
                        Lote: ""
                    });
                }
            }
        }
        
        return led.length > 0 ? led : null;
    } catch (error) {
        console.error('Error en obtener_detalle:', error);
        throw error;
    }
};

export const obtener_detalle_Guardado = async (idControlAlmacen) => {
    try {
        const pool = await getConnectionMeteloRapido(); // Usando conexión MeteloRapido (conexMete en C#)
        const request = pool.request();
        
        request.input('idControlAlmacen', sql.Int, idControlAlmacen);
        
        const result = await request.execute('MostrarDetalleControlAlmacen');
        
        const led = [];
        
        if (result.recordset && result.recordset.length > 0) {
            for (const row of result.recordset) {
                const values = Object.values(row);
                
                if (values[4] > 0) {
                    led.push({
                        Codigo: values[0],
                        CodigoEAN: values[1],
                        Descripcion: values[2],
                        Factor: values[3],
                        CantidadBase: values[4],
                        Unidad: values[5],
                        UnidadRef: values[6],
                        Nuevo: values[7],
                        Observacion: values[8],
                        FechaVencimiento: values[9],
                        Lote: values[10],
                        CantidadBaseOriginal: values[11],
                        Revisado: values[12],
                        CantidadProveedor: values[13]
                    });
                }
            }
        }
        
        return led.length > 0 ? led : null;
    } catch (error) {
        console.error('Error en obtener_detalle_Guardado:', error);
        throw error;
    }
};