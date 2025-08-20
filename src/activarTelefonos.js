import fs from 'fs';
import path from 'path';
import { getConnection, sql } from './database/connection.js';

/**
 * Función para activar teléfonos principales leyendo códigos de persona desde un archivo
 * @param {string} filePath - Ruta del archivo que contiene los códigos de persona
 */
export const activarTelefonosDesdeArchivo = async (filePath = './data/codigosPersona.txt') => {
    let pool;
    let exitosos = 0;
    let fallidos = 0;
    const resultados = [];
    
    try {
        // Leer el archivo con los códigos
        console.log(`Leyendo códigos de persona desde: ${filePath}`);
        const data = fs.readFileSync(filePath, 'utf8');
        const codigos = data.split('\n').map(code => code.trim()).filter(code => code !== '');
        
        console.log(`Se encontraron ${codigos.length} códigos de persona para procesar`);
        
        // Conectar a la base de datos
        pool = await getConnection();
        
        // Procesar cada código
        for (const codigo of codigos) {
            try {
                console.log(`Procesando código de persona: ${codigo}`);
                
                // Query para activar teléfono principal
                const result = await pool.request()
                    .input('id', sql.TYPES.Int, codigo)
                    .query(`
                        UPDATE Telefono 
                        SET Principal = 1 
                        WHERE IDPersona = @id
                    `);
                
                const filasAfectadas = result.rowsAffected[0] || 0;
                
                if (filasAfectadas > 0) {
                    exitosos++;
                    resultados.push({
                        codigo,
                        success: true,
                        filasAfectadas,
                        message: `Teléfono de persona ${codigo} activado como principal correctamente`
                    });
                    console.log(`✓ Teléfono de persona ${codigo} activado como principal exitosamente (${filasAfectadas} filas)`);
                } else {
                    fallidos++;
                    resultados.push({
                        codigo,
                        success: false,
                        filasAfectadas: 0,
                        message: `No se encontró teléfono para la persona ${codigo}`
                    });
                    console.log(`✗ No se encontró teléfono para la persona ${codigo}`);
                }
                
            } catch (error) {
                fallidos++;
                resultados.push({
                    codigo,
                    success: false,
                    error: error.message,
                    message: `Error al procesar código de persona ${codigo}`
                });
                console.error(`✗ Error al procesar código de persona ${codigo}:`, error.message);
            }
        }
        
        // Resumen final
        console.log('\n=== RESUMEN DE PROCESAMIENTO ===');
        console.log(`Total de códigos procesados: ${codigos.length}`);
        console.log(`Exitosos: ${exitosos}`);
        console.log(`Fallidos: ${fallidos}`);
        console.log('================================\n');
        
        return {
            success: true,
            totalProcesados: codigos.length,
            exitosos,
            fallidos,
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
 * Función para consultar teléfonos principales por persona
 */
export const consultarTelefonosPrincipales = async () => {
    let pool;
    try {
        pool = await getConnection();
        
        const result = await pool.request()
            .query(`
                SELECT 
                    IDPersona,
                    Numero,
                    Principal,
                    PKID as TelefonoId
                FROM Telefono 
                WHERE Principal = 1
                ORDER BY IDPersona
            `);
        
        return {
            success: true,
            data: result.recordset,
            total: result.recordset.length
        };
        
    } catch (error) {
        console.error('Error al consultar teléfonos principales:', error);
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

/**
 * Función para desactivar todos los teléfonos principales de una persona antes de activar uno nuevo
 * @param {string} idPersona - ID de la persona
 */
export const desactivarTelefonosPrincipales = async (idPersona) => {
    let pool;
    try {
        pool = await getConnection();
        
        const result = await pool.request()
            .input('idPersona', sql.TYPES.NChar(50), idPersona)
            .query(`
                UPDATE Telefono 
                SET Principal = 0 
                WHERE IDPersona = @idPersona
            `);
        
        return {
            success: true,
            filasAfectadas: result.rowsAffected[0] || 0
        };
        
    } catch (error) {
        console.error('Error al desactivar teléfonos principales:', error);
        return {
            success: false,
            error: error.message,
            filasAfectadas: 0
        };
    } finally {
        if (pool) {
            pool.close();
        }
    }
};

// Función principal para ejecutar desde línea de comandos
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('Iniciando proceso de activación de teléfonos principales...');
    
    // Verificar si existe el archivo
    const filePath = './data/codigosPersona.txt';
    if (!fs.existsSync(filePath)) {
        console.log('No se encontró el archivo de códigos en:', filePath);
        console.log('Crea el archivo con los códigos de persona, uno por línea.');
        
        // Crear archivo de ejemplo
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        
        const ejemploCodigos = '12345678\n87654321\n11223344\n55667788';
        fs.writeFileSync(filePath, ejemploCodigos);
        console.log('Se ha creado un archivo de ejemplo en:', filePath);
        console.log('Modifica el archivo con los códigos de persona reales y vuelve a ejecutar.');
        process.exit(0);
    }
    
    // Ejecutar la función
    activarTelefonosDesdeArchivo(filePath)
        .then(resultado => {
            console.log('Proceso completado:', resultado);
            process.exit(0);
        })
        .catch(error => {
            console.error('Error en el proceso:', error);
            process.exit(1);
        });
}