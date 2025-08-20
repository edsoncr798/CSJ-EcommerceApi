import {getConnection, sql} from "../database/connection.js";

export const registerUserWithGoogle = async (data) => {
    try {
        // Establecer la conexión
        const pool = await getConnection();
        // Crear una nueva solicitud
        const request = pool.request();

        // mapeo de parametros de entrada
        const params = [
            {name: 'p_Prefijo', type: sql.TYPES.VarChar(10), value: data.p_Prefijo},
            {name: 'p_Nombre', type: sql.TYPES.VarChar(500), value: data.p_Nombre},
            {name: 'p_ApellidoPaterno', type: sql.TYPES.VarChar(100), value: data.p_ApellidoPaterno},
            {name: 'p_ApellidoMaterno', type: sql.TYPES.VarChar(100), value: data.p_ApellidoMaterno},
            {name: 'p_PrimerNombre', type: sql.TYPES.VarChar(100), value: data.p_PrimerNombre},
            {name: 'p_SegundoNombre', type: sql.TYPES.VarChar(100), value: data.p_SegundoNombre},
            {name: 'p_Email', type: sql.TYPES.VarChar(100), value: data.p_Email},
            {name: 'p_DocIdentidad', type: sql.TYPES.NVarChar(255), value: data.p_DocIdentidad},
            {name: 'p_Direccion1', type: sql.TYPES.NVarChar(255), value: data.p_Direccion1},
            {name: 'p_Distrito1', type: sql.TYPES.NVarChar(255), value: data.p_Distrito1},
            {name: 'p_TelefonoGeneral', type: sql.TYPES.NVarChar(255), value: data.p_TelefonoGeneral},
        ];

        params.forEach(param => {
            request.input(param.name, param.type, param.value)
        });


        const result = await request.execute('ECOMMERCE_InsertarPersona');

        // Verificar el resultado
        if (!result) {
            throw new Error('No se obtuvo respuesta del servidor');
        }
        return result;

    } catch (error) {
        console.error('Error en insertClientService:', error);
        throw {
            type: 'SERVER_ERROR',
            message: 'Error al crear el cliente',
            status: 500,
            originalError: error
        };
    }
};

export const listAddresses = async (idPersona) => {
    let pool;
    try{
        pool = await getConnection();
        const request = pool.request();
        request.input('idPersona', sql.TYPES.Int , idPersona);
        return await request.execute('MARKET_listarDirecciones');
    } catch (error) {
        console.error('Error al ejecutar el procedimiento almacenado:', error);
        throw error;
    }
}