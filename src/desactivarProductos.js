import fs from 'fs';
import path from 'path';
import { getConnection, sql } from './database/connection.js';

/**
 * Función para desactivar productos leyendo códigos desde un archivo
 * @param {string} filePath - Ruta del archivo que contiene los códigos
 * @param {number} idListaPrecios - ID de la lista de precios (por defecto 58)
 */
export const desactivarProductosDesdeArchivo = async (filePath = './data/codigos.txt', idListaPrecios = 58) => {
    let pool;
    let exitosos = 0;
    let fallidos = 0;
    const resultados = [];
    
    try {
        // Leer el archivo con los códigos
        console.log(`Leyendo códigos desde: ${filePath}`);
        const data = fs.readFileSync(filePath, 'utf8');
        const codigos = data.split('\n').map(code => code.trim()).filter(code => code !== '');
        
        console.log(`Se encontraron ${codigos.length} códigos para procesar`);
        console.log(`Lista de precios ID: ${idListaPrecios}`);
        
        // Conectar a la base de datos
        pool = await getConnection();
        
        // Procesar cada código
        for (const codigo of codigos) {
            try {
                console.log(`Procesando código: ${codigo}`);
                
                // Query corregida con el JOIN apropiado
                const result = await pool.request()
                    .input('codigo', sql.TYPES.VarChar(50), codigo)
                    .input('idListaPrecios', sql.TYPES.Int, idListaPrecios)
                    .query(`
                        UPDATE ilp 
                        SET Desactivado = 1
                        FROM ItemListaPrecios ilp
                        INNER JOIN ProductoServicio ps ON ilp.IDProducto = ps.PKID
                        WHERE ps.Codigo = @codigo 
                        AND ilp.IDListaPrecios = @idListaPrecios
                    `);
                
                const filasAfectadas = result.rowsAffected[0] || 0;
                
                if (filasAfectadas > 0) {
                    exitosos++;
                    resultados.push({
                        codigo,
                        success: true,
                        filasAfectadas,
                        message: `Producto ${codigo} desactivado correctamente en lista ${idListaPrecios}`
                    });
                    console.log(`✓ Producto ${codigo} desactivado exitosamente (${filasAfectadas} filas)`);
                } else {
                    fallidos++;
                    resultados.push({
                        codigo,
                        success: false,
                        filasAfectadas: 0,
                        message: `No se encontró el producto ${codigo} en la lista ${idListaPrecios}`
                    });
                    console.log(`✗ No se encontró producto ${codigo} en lista ${idListaPrecios}`);
                }
                
            } catch (error) {
                fallidos++;
                resultados.push({
                    codigo,
                    success: false,
                    error: error.message,
                    message: `Error al procesar código ${codigo}`
                });
                console.error(`✗ Error al procesar código ${codigo}:`, error.message);
            }
        }
        
        // Resumen final
        console.log('\n=== RESUMEN DE PROCESAMIENTO ===');
        console.log(`Total de códigos procesados: ${codigos.length}`);
        console.log(`Exitosos: ${exitosos}`);
        console.log(`Fallidos: ${fallidos}`);
        console.log(`Lista de precios: ${idListaPrecios}`);
        console.log('================================\n');
        
        return {
            success: true,
            totalProcesados: codigos.length,
            exitosos,
            fallidos,
            idListaPrecios,
            resultados
        };
        
    } catch (error) {
        console.error('Error al procesar el archivo:', error);
        return {
            success: false,
            error: error.message,
            totalProcesados: 0,
            exitosos: 0,
            fallidos: 0,
            resultados: []
        };
    } finally {
        if (pool) {
            pool.close();
        }
    }
};

/**
 * Función para consultar productos desactivados
 */
export const consultarProductosDesactivados = async (idListaPrecios = 58) => {
    let pool;
    try {
        pool = await getConnection();
        
        const result = await pool.request()
            .input('idListaPrecios', sql.TYPES.Int, idListaPrecios)
            .query(`
                SELECT 
                    ps.PKID, 
                    ilp.IDProducto as productoId, 
                    ps.Descripcion, 
                    ps.Codigo, 
                    ilp.Desactivado, 
                    ilp.PKID as ItemListaPreciosId, 
                    ilp.IDListaPrecios 
                FROM ProductoServicio ps 
                INNER JOIN ItemListaPrecios ilp ON ps.PKID = ilp.IDProducto 
                WHERE ilp.IDListaPrecios = @idListaPrecios 
                AND ilp.Desactivado = 1
            `);
        
        return {
            success: true,
            data: result.recordset,
            total: result.recordset.length
        };
        
    } catch (error) {
        console.error('Error al consultar productos desactivados:', error);
        return {
            success: false,
            error: error.message,
            data: [],
            total: 0
        };
    } finally {
        if (pool) {
            pool.close();
        }
    }
};

// Función principal para ejecutar desde línea de comandos
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('Iniciando proceso de desactivación de productos...');
    
    // Verificar si existe el archivo
    const filePath = './data/codigos.txt';
    if (!fs.existsSync(filePath)) {
        console.log('No se encontró el archivo de códigos en:', filePath);
        console.log('Crea el archivo con los códigos de productos, uno por línea.');
        process.exit(0);
    }
    
    // Ejecutar la función
    desactivarProductosDesdeArchivo(filePath, 58)
        .then(resultado => {
            console.log('Proceso completado:', resultado);
            process.exit(0);
        })
        .catch(error => {
            console.error('Error en el proceso:', error);
            process.exit(1);
        });
}