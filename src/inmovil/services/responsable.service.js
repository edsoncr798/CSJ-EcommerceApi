import { getConnectionCsjDistribucion, getConnectionInMovil, sql } from "../../database/connection.js";

export const listarResponsables = async (listaInvent) => {
    try {
        const pool = await getConnectionCsjDistribucion();
        const result = await pool.request()
            .input("listaInvent", sql.VarChar, listaInvent)
            .execute("TomaInventario_MostrarResponsablesNuevo");
        
        return result.recordset;
    } catch (error) {
        console.error("Error en listarResponsables:", error);
        throw error;
    }
};

export const validarResponsables = async (NombreResponsable, DocResponsable, Codigo, listaInventario, nombreDispositivo, CodVersion) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input("NombreResponsable", sql.VarChar, NombreResponsable)
            .input("DocResponsable", sql.VarChar, DocResponsable)
            .input("CodVersion", sql.VarChar, CodVersion)
            .execute("TomaInventario_ValidarResponsableNuevo");
        
        const validar = result.recordset[0];
        
        if (!validar) {
            throw new Error("No se obtuvo respuesta de la validación");
        }

        switch (validar.id) {
            case 0:
                return "El Nombre del Responsable no corresponde con el número de DNI ingresado";
            case 1:
                return await registrarSesion(Codigo, listaInventario, NombreResponsable, nombreDispositivo);
            case 2:
                return "No tienes instalada la ultima version de la aplicacion";
            default:
                return "Respuesta de validación desconocida";
        }
    } catch (error) {
        console.error("Error en validarResponsables:", error);
        throw error;
    }
};

export const registrarSesion = async (Codigo, listaInventario, nombreResponsable, nombreDispositivo) => {
    try {
        const pool = await getConnectionInMovil();
        const result = await pool.request()
            .input("Codigo", sql.VarChar, Codigo)
            .input("listaInventario", sql.VarChar, listaInventario)
            .input("nombreResponsable", sql.VarChar, nombreResponsable)
            .input("nombreDispositivo", sql.VarChar, nombreDispositivo)
            .execute("InMovil_ValidarSesionNuevo");
        
        return result.recordset[0]?.estadoSesion;
    } catch (error) {
        console.error("Error en registrarSesion:", error);
        throw error;
    }
};

export const cerrarSesion = async (codigo, listaInventario) => {
    try {
        const pool = await getConnectionInMovil();
        await pool.request()
            .input("Codigo", sql.VarChar, codigo)
            .input("listaInventario", sql.VarChar, listaInventario)
            .execute("InMovil_CerrarSesionNuevo");
        
        return "Sesion cerrada";
    } catch (error) {
        console.error("Error en cerrarSesion:", error);
        throw error;
    }
};

export const verificarEnvio = async (listaInventario, tipoResponsable) => {
    try {
        const pool = await getConnectionInMovil();
        const result = await pool.request()
            .input("listaInventario", sql.VarChar, listaInventario)
            .input("tipoResponsable", sql.Int, tipoResponsable)
            .execute("InMovil_VerificarEnvio");
        
        if (result.recordset.length > 0) {
            return {
                Exito: false,
                Mensaje: "Usted ya a finalizado su conteo"
            };
        } else {
            return {
                Exito: true,
                Mensaje: "OK"
            };
        }
    } catch (error) {
        console.error("Error en verificarEnvio:", error);
        throw error;
    }
};
