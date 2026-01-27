import { getConnection, sql } from "../../database/connection.js";

export const listarVendedores = async (nombre) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input("nombre", sql.VarChar, nombre)
            .execute("SanJuanVentas_BuscarVendedores");
        
        return result.recordset;
    } catch (error) {
        console.error("Error en listarVendedores:", error);
        throw error;
    }
};
