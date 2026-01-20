import { getConnectionMeteloRapido, sql } from '../../database/connection.js';


export const createUser = async (nombre, documento, almacen, password, key) => {
    try {
        const pool = await getConnectionMeteloRapido();
        const request = pool.request();
        
        request.input('nombre', sql.VarChar, nombre);
        request.input('documento', sql.VarChar, documento);
        request.input('almacen', sql.VarChar, almacen);
        request.input('contraseña', sql.VarChar, password);
        request.input('key', sql.VarChar, key);

        const result = await request.execute('NuevoUsuario');

        if (result.recordset && result.recordset.length > 0) {
            // Retorna el primer valor de la primera fila (GetString(0))
            const firstRecord = result.recordset[0];
            const firstValue = Object.values(firstRecord)[0];
            return {
                success: true,
                message: "Usuario creado exitosamente",
                data: firstValue
            };
        } else {
            return {
                success: false,
                message: "Ocurrio un error al momento de crear el usuario."
            };
        }
    } catch (error) {
        console.error('Error en nuevoUsuario:', error);
        throw error;
    }
};

export const validarUsuario = async (documento, password, key) => {
    try {
        const pool = await getConnectionMeteloRapido();
        const request = pool.request();
        
        request.input('documento', sql.VarChar, documento);
        request.input('contraseña', sql.VarChar, password);
        request.input('key', sql.VarChar, key);

        const result = await request.execute('ValidarUsuario');

        if (result.recordset && result.recordset.length > 0) {
            const row = result.recordset[0];
            const values = Object.values(row);
            
            return {
                ID: values[0],
                Nombre: values[1],
                Almacen: values[2],
                Activo: values[3]
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error en validarUsuario:', error);
        throw error;
    }
};

