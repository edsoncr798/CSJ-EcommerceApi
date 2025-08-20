import axios from 'axios';
import { getConnection, sql } from '../database/connection.js';

export const consultDocumentService = async (documentNumber) => {
    try {
        const isRuc = documentNumber.length === 11;
        const url = isRuc 
            ? `https://api.apis.net.pe/v2/sunat/ruc?numero=${documentNumber}`
            : `https://api.apis.net.pe/v2/reniec/dni?numero=${documentNumber}`;
            
        const response = await axios.get(url, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${process.env.API_TOKEN}`
            }
        });

        // Lógica de negocio aquí
        return {
            success: true,
            data: isRuc ? {
                Nombre: response.data.razonSocial || '',
                Direccion1: response.data.direccion || '',
                Distrito1: response.data.ubigeo || ''
            } : {
                Nombre: response.data.nombres || '',
                Apellido: `${response.data.apellidoPaterno || ''} ${response.data.apellidoMaterno || ''}`.trim(),
            }
        };
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Error al consultar el documento'
        };
    }
}; 


export const validateDocumentFromDB = async (doc) => {
    let pool;
    try {
        pool = await getConnection();
        const request = pool.request();
        request.input('document', sql.TYPES.VarChar(255), doc);
        return await request.execute('ECOMMERCE_ValidarDoc');
    } catch (err) {
        console.error('Error al ejecutar el procedimiento almacenado:', err);
        throw err;
    }
};

export const validatePersonaService = async (dni, codigo) => {
    let pool;
    try {
        pool = await getConnection();
        const request = pool.request();
        request.input('dni', sql.TYPES.VarChar(50), dni);
        request.input('codUser', sql.TYPES.NChar(50), codigo);
        const result = await request.execute('ECOMMERCE_ValidarPersona');
        
        if (result.recordset && result.recordset.length > 0) {
            return {
                success: true,
                isPersona: true,
                data: result.recordset[0]
            };
        } else {
            return {
                success: true,
                isPersona: false,
                message: 'La persona no existe o no pertenece a la empresa'
            };
        }
    } catch (err) {
        console.error('Error al ejecutar el procedimiento almacenado:', err);
        throw err;
    }
};


// Agregar al final de document.service.js
export const desactivarProductoService = async (codigo, idListaPrecios = 58) => {
    let pool;
    try {
        pool = await getConnection();
        const request = pool.request();
        request.input('codigo', sql.TYPES.VarChar(50), codigo);
        request.input('idListaPrecios', sql.TYPES.Int, idListaPrecios);
        
        const result = await request.query(`
            UPDATE ilp 
            SET Desactivado = 1
            FROM ItemListaPrecios ilp
            INNER JOIN ProductoServicio ps ON ilp.IDProducto = ps.PKID
            WHERE ps.Codigo = @codigo 
            AND ilp.IDListaPrecios = @idListaPrecios
        `);
        
        const filasAfectadas = result.rowsAffected[0] || 0;
        
        return {
            success: true,
            filasAfectadas,
            message: filasAfectadas > 0 
                ? `Producto ${codigo} desactivado correctamente` 
                : `No se encontró el producto ${codigo} en la lista ${idListaPrecios}`
        };
    } catch (err) {
        console.error('Error al desactivar producto:', err);
        throw err;
    } finally {
        if (pool) {
            pool.close();
        }
    }
};