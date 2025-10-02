import {getConnection, sql} from "../database/connection.js";


export const getProductsFromDB = async () => {
    try {
        let pool = await getConnection();
        let result = pool.request();
        return result.execute('ECOMMERCE_listarProducto');
    } catch (error) {
        console.error('Error al ejecutar el procedimiento almacenado:', error);
        throw error;
    }
};


export const getNewProductsFromDB = async () => {
    try {
        let pool = await getConnection();
        const request = pool.request();
        return request.execute('ECOMMERCE_FiltroProductosNuevos');
    } catch (error) {
        console.error('Error al ejecutar el procedimiento almacenado:', error);
        throw error;
    }
}

export const getEssentialProductsFromDB = async () => {
    let pool;
    try {
        pool = await getConnection();
        const result = pool.request();
        return result.execute('ECOMMERCE_FiltroProductoEsencial');
    } catch (error) {
        console.error('Error al ejecutar el procedimiento almacenado:', error);
        throw error;
    }
};

export const getStockProductFromDB = async() =>{
    let pool;
    try{
        pool = await getConnection();
        const result = pool.request();
        return result.execute('MARKET_listarStockProducto');
    } catch(error){
        console.error('Error al ejecutar el procedimiento almacenado:', error);
        throw error;
    }
}

export const getRefrigeratedProductsFromDB = async () =>{
    let pool;
    try{
        pool = await getConnection();
        const result = pool.request();
        return result.execute('ECOMMERCE_FiltroProductoRefrigerados');
    }catch(error){
        console.error('Error al ejecutar el procedimiento almacenado:', error);
        throw error;
    }
}

export const getConfectioneryProductsFromDB = async () => {
    let pool;
    try {
        pool = await getConnection();
        const result = pool.request();
        return result.execute('ECOMMERCE_FiltroProductoConfiteria');
    } catch (error) {
        console.error('Error al ejecutar el procedimiento almacenado:', error);
        throw error;
    }
};


export const getProductsByCategoryFromDB = async (code) => {
    let pool;
    try {
        pool = await getConnection();
        const request = pool.request();
        request.input('category', sql.TYPES.VarChar(2), code);
        return await request.execute('ECOMMERCE_FiltrarProductos');
    } catch (err) {
        console.error('Error al ejecutar el procedimiento almacenado:', err);
        throw err;
    }
};

export const searchProductsFromDb = async (text) =>{
    let pool;
    try{
        pool = await getConnection();
        const request = pool.request();
        request.input('text', sql.VarChar(200), text);
        return await request.execute('ECOMMERCE_GetProductByTitle');
    } catch(error) {
        console.error('Error al ejecutar el procedimiento almacenado:', error)
        throw error;          
    }
};

