import { getConnectionInMovil, getConnectionCsjDistribucion, getConnectionConteoDiario, sql } from "../../database/connection.js";

export const guardarResultados = async (conteoNuevo) => {
    const { listaInventario, tipoResponsable, nombreResponsable, almacen, conteos } = conteoNuevo;
    
    try {
        // 1. Consolidar conteos por código de producto
        const conteosConsolidados = Object.values(conteos.reduce((acc, curr) => {
            if (!acc[curr.codigoProducto]) {
                acc[curr.codigoProducto] = { ...curr };
            } else {
                acc[curr.codigoProducto].cantidadTotal += curr.cantidadTotal;
            }
            return acc;
        }, {}));

        // 2. Guardar en Base de Datos Principal (webstore/ecommerce)
        const poolMain = await getConnectionCsjDistribucion();
        await poolMain.request().query("SET LOCK_TIMEOUT 20000");

        for (const item of conteosConsolidados) {
            await poolMain.request()
                .input("listaInvent", sql.VarChar, listaInventario)
                .input("tipoResponsable", sql.Int, tipoResponsable)
                .input("nombreResponsable", sql.VarChar, nombreResponsable)
                .input("codigoProducto", sql.VarChar, item.codigoProducto)
                .input("nombreProducto", sql.VarChar, item.nombreProducto)
                .input("unidadMin", sql.VarChar, item.unidadMin)
                .input("unidadBase", sql.VarChar, item.unidadBase)
                .input("parcial", sql.VarChar, item.parcial.toString())
                .input("cantidadTotal", sql.Int, item.cantidadTotal)
                .input("factor", sql.Int, item.factor)
                .input("perteneceLista", sql.Bit, item.perteneceLista)
                .input("almacen", sql.VarChar, almacen)
                .execute("InMovil_GuardarResultadosNuevo");
        }

        // 3. Guardar en MeteloRapido (inmovil)
        const poolInmovil = await getConnectionInMovil();
        
        for (const item of conteos) {
            // Eliminar anteriores
            await poolInmovil.request()
                .input("listaInventario", sql.VarChar, listaInventario)
                .input("tipoResponsable", sql.Int, tipoResponsable)
                .input("codigoProducto", sql.VarChar, item.codigoProducto)
                .query(`DELETE FROM resultados 
                        WHERE listaInventario = @listaInventario 
                        AND tipoResponsable = @tipoResponsable 
                        AND codigoProducto = @codigoProducto`);

            // Insertar nuevo
            await poolInmovil.request()
                .input("listaInventario", sql.VarChar, listaInventario)
                .input("tipoResponsable", sql.Int, tipoResponsable)
                .input("nombreResponsable", sql.VarChar, nombreResponsable)
                .input("codigoProducto", sql.VarChar, item.codigoProducto)
                .input("nombreProducto", sql.VarChar, item.nombreProducto)
                .input("unidadMin", sql.VarChar, item.unidadMin)
                .input("unidadBase", sql.VarChar, item.unidadBase)
                .input("parcial", sql.VarChar, item.parcial.toString())
                .input("cantidadTotal", sql.Int, item.cantidadTotal)
                .input("factor", sql.Int, item.factor)
                .input("perteneceLista", sql.Bit, item.perteneceLista)
                .input("almacen", sql.VarChar, almacen)
                .input("fecha", sql.DateTime, new Date())
                .query(`INSERT INTO resultados (listaInventario, tipoResponsable, nombreResponsable, codigoProducto, nombreProducto, unidadMin, unidadBase, parcial, cantidadTotal, factor, fecha, perteneceLista, almacen) 
                        VALUES (@listaInventario, @tipoResponsable, @nombreResponsable, @codigoProducto, @nombreProducto, @unidadMin, @unidadBase, @parcial, @cantidadTotal, @factor, @fecha, @perteneceLista, @almacen)`);
        }

        return { Exito: true, Mensaje: "Guardado exitoso" };
    } catch (error) {
        console.error("Error en guardarResultados:", error);
        return { Exito: false, Mensaje: "Error al guardar los resultados: " + error.message };
    }
};

export const guardarReconteo = async (conteoNuevo) => {
    const { listaInventario, tipoResponsable, nombreResponsable, almacen, conteos } = conteoNuevo;
    
    try {
        const poolInmovil = await getConnectionInMovil();
        
        for (const item of conteos) {
            await poolInmovil.request()
                .input("listaInvent", sql.VarChar, listaInventario)
                .input("tipoResponsable", sql.Int, tipoResponsable)
                .input("nombreResponsable", sql.VarChar, nombreResponsable)
                .input("codigoProducto", sql.VarChar, item.codigoProducto)
                .input("nombreProducto", sql.VarChar, item.nombreProducto)
                .input("unidadMin", sql.VarChar, item.unidadMin)
                .input("unidadBase", sql.VarChar, item.unidadBase)
                .input("parcial", sql.VarChar, item.parcial.toString())
                .input("cantidadTotal", sql.Int, item.cantidadTotal)
                .input("factor", sql.Int, item.factor)
                .input("perteneceLista", sql.Bit, item.perteneceLista)
                .input("almacen", sql.VarChar, almacen)
                .execute("InMovil_GuardarReconteo");
        }

        return { Exito: true, Mensaje: "Guardado exitoso" };
    } catch (error) {
        console.error("Error en guardarReconteo:", error);
        return { Exito: false, Mensaje: "Error al guardar los resultados: " + error.message };
    }
};

export const guardarResultadosCD = async (conteoNuevoCD) => {
    const { almacen, dni, conteos } = conteoNuevoCD;
    
    try {
        const poolCD = await getConnectionConteoDiario();
        
        // Eliminar conteos anteriores del día para ese almacén y DNI
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await poolCD.request()
            .input("almacen", sql.VarChar, almacen)
            .input("dni", sql.VarChar, dni)
            .input("today", sql.DateTime, today)
            .query("DELETE FROM conteoDiario WHERE fecha >= @today AND almacen = @almacen AND dni = @dni");

        for (const item of conteos) {
            const cantidadMin = item.cantidadTotal % item.factor;
            const cantidadBase = Math.floor(item.cantidadTotal / item.factor);

            await poolCD.request()
                .input("codigoProducto", sql.VarChar, item.productoCodigo)
                .input("nombreProducto", sql.VarChar, item.productoNombre)
                .input("unidadMin", sql.VarChar, item.unidadMin)
                .input("unidadBase", sql.VarChar, item.unidadBase)
                .input("parcial", sql.VarChar, item.parcial.toString())
                .input("cantidadTotal", sql.Int, item.cantidadTotal)
                .input("factor", sql.Int, item.factor)
                .input("almacen", sql.VarChar, almacen)
                .input("cantidadMin", sql.Int, cantidadMin)
                .input("cantidadBase", sql.Int, cantidadBase)
                .input("dni", sql.VarChar, dni)
                .input("fecha", sql.DateTime, new Date())
                .query(`INSERT INTO conteoDiario (codigoProducto, nombreProducto, unidadMin, unidadBase, parcial, cantidadTotal, factor, fecha, almacen, cantidadMin, cantidadBase, dni) 
                        VALUES (@codigoProducto, @nombreProducto, @unidadMin, @unidadBase, @parcial, @cantidadTotal, @factor, @fecha, @almacen, @cantidadMin, @cantidadBase, @dni)`);
        }

        return { Exito: true, Mensaje: "Guardado exitoso" };
    } catch (error) {
        console.error("Error en guardarResultadosCD:", error);
        return { Exito: false, Mensaje: "Error al guardar los resultados: " + error.message };
    }
};

export const verDiferencias = async (listaInventario) => {
    try {
        const poolInmovil = await getConnectionInMovil();
        const result = await poolInmovil.request()
            .input("listaInventario", sql.VarChar, listaInventario)
            .execute("SP_VerDiferencias");
        
        if (result.recordset.length === 1 && result.recordset[0].nombreProducto === "") {
            return {
                Exito: false,
                Mensaje: "Primero deben finalizar el inventario ambas cuadrillas. Inténtelo nuevamente más tarde."
            };
        }

        return result.recordset;
    } catch (error) {
        console.error("Error en verDiferencias:", error);
        throw error;
    }
};
