import {getConnection, sql} from "../database/connection.js";
import {
    getConfectioneryProductsFromDB,
    getEssentialProductsFromDB,
    getNewProductsFromDB,
    getProductsByCategoryFromDB,
    getProductsFromDB,
    searchProductsFromDb,
    getRefrigeratedProductsFromDB,
    getStockProductFromDB,
    getProductsWholeSalePricesFromDB
} from "../services/products.service.js";


export const getAllProducts = async (req, res) => {
    try {
        let result = await getProductsFromDB()
        res.status(200).json({
            message: 'Productos obtenidos',
            data: result.recordsets
        });
    } catch (err) {
        console.error('Error al ejecutar el procedimiento almacenado', err.message);
        res.status(500).json({error: err.message});
    } finally {
        sql.close();
    }
};

export const getAllStockProducts = async (req, res) => {
    try{
        // Obtener idProducto de la query string (opcional)
        const idProducto = req.query.idProducto ? parseInt(req.query.idProducto) : null;
        const result = await getStockProductFromDB(idProducto);
        res.status(200).json({
            message: 'Productos obtenidos',
            data: result.recordsets
        })
    } catch (err){
        console.error('Error al ejecutar el procedimiento almacenado', err.message);
        res.status(500).json({ error: err.message });
    } finally {
        sql.close();
    }
}

export const getProductsWholeSalePrices = async (req, res) => {
    try{
        const idProducto = parseInt(req.params.idProducto);
        const result = await getProductsWholeSalePricesFromDB(idProducto);
        res.status(200).json({
            message: 'Precios obtenidos',
            data: result.recordsets
        })
    } catch (err){
        console.error('Error al ejecutar el procedimiento almacenado', err.message);
        res.status(500).json({ error: err.message });
    } finally {
        sql.close();
    }
}


export const getProductById = async (req, res) => {
    const {id} = req.params;
    try {
        let pool = await getConnection();
        let result = await pool.request()
            .input('ProductID', sql.TYPES.Int, id)
            .execute('ECOMMERCE_getProductById');
        if (result.recordset.length === 0) {
            res.status(404).send('No recordset found!');
        }else {
            res.json(result.recordset[0]);
        }
    } catch (err) {
        console.error('Error al ejecutar la consulta', err);
        res.status(500).send('Error al ejecutar la consulta');
    } finally {
        sql.close();
    }
};


export const getNewProducts = async (req, res) => {
    try{
        const result = await getNewProductsFromDB();
        res.status(200).json({
            message: 'Productos obtenidos',
            data: result.recordsets
        })
    } catch (err){
        console.error('Error al ejecutar el procedimiento almacenado', err.message);
        res.status(500).json({error: err.message});
    } finally {
        sql.close();
    }
};


export const getEssentialProducts = async (req, res) => {
    try{
        const result = await getEssentialProductsFromDB();
        res.status(200).json({
            message: 'Productos obtenidos',
            data: result.recordsets
        })

    } catch (err){
        console.error('Error al ejecutar el procedimiento almacenado', err.message);
        res.status(500).json({ error: err.message });
    }
};

export const getRefrigeratedProducts = async (req, res) =>{
    try{
        const result = await getRefrigeratedProductsFromDB();
        res.status(200).json({
            message: 'Productos obtenidos',
            data: result.recordsets
        })
    } catch (err){
        console.error('Error al ejecutar el procedimiento almacenado', err.message);
        res.status(500).json({ error: err.message });
    } finally {
        sql.close();
    }
}

export  const getConfectioneryProducts = async (req, res) => {
    try{
        let result = await getConfectioneryProductsFromDB();
        res.status(200).json({
            message: 'Productos obtenidos',
            data: result.recordsets
        })
    } catch (err) {
        console.error('Error al ejecutar el P. A.')
    }
}

export  const getProductsByCategory = async (req, res) => {
    const category = req.query.id
    try {
        const result = await getProductsByCategoryFromDB(category);
        res.status(200).json({
            message: 'Productos obtenidos',
            data: result.recordsets
        })
    } catch (err) {
        console.error('Error al ejecutar el procedimiento almacenado', err.message);
        res.status(500).json({ error: err.message });
    }
};

export const searchProducts = async (req, res) => {
    const { text } = req.query;

    try{    
        const result = await searchProductsFromDb(text)
        
        res.status(200).json({
            success: true,
            data: result.recordsets
        });
    } catch(error){
        console.error('Error en la busqueda de productos: ', error);
        return res.status(500).json({
            success:false,
            message: 'Error al buscar productos'
        })
    }
};