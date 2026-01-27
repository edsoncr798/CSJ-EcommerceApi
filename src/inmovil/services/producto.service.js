import {  getConnectionConteoDiario, getConnectionCsjDistribucion, sql } from "../../database/connection.js";

export const buscarProducto = async (listaInvent, codigoProducto) => {
    try {
        const pool = await getConnectionCsjDistribucion();
        const result = await pool.request()
            .input("listaInvent", sql.VarChar, listaInvent)
            .input("codigoProducto", sql.VarChar, codigoProducto)
            .execute("InMovil_BuscarProductoNuevo");
        
        return result.recordset;
    } catch (error) {
        console.error("Error en buscarProducto:", error);
        throw error;
    }
};

export const conteoDiarioBuscar = async (codigoProducto) => {
    try {
        const pool = await getConnectionCsjDistribucion();
        const result = await pool.request()
            .input("codigoProducto", sql.VarChar, codigoProducto)
            .execute("ConteoDiario_BuscarProductoNuevo");
        
        return result.recordset;
    } catch (error) {
        console.error("Error en conteoDiarioBuscar:", error);
        throw error;
    }
};

export const listarAlmacen = async () => {
    try {
        const pool = await getConnectionConteoDiario();
        // El código C# hace: contextCD.almacen.Where(x => x.activo == true).OrderBy(x => x.nombre).Select(x => x.nombre)
        // Asumiendo que existe una tabla 'almacen' o similar. 
        // Si no hay un SP, usamos una consulta directa como parece sugerir el código C# (LINQ to Entities)
        const result = await pool.request()
            .query("SELECT nombre FROM almacen WHERE activo = 1 ORDER BY nombre");
        
        return result.recordset.map(row => row.nombre);
    } catch (error) {
        console.error("Error en listarAlmacen:", error);
        throw error;
    }
};
