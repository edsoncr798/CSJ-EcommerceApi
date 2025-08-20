import fs from 'fs';
import path from 'path';
import {getConnection, sql} from "./database/connection.js";
import cloudinary from './cloudinaryConfig.js'

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));


export const updateProductImages = async () => {
    let pool;
    let count = 0;
    try {
        pool = await getConnection();
        const imageDir = path.join(path.resolve(), 'productImages');
        const files = fs.readdirSync(imageDir);


        for (const file of files) {
            const productCode = path.basename(file, path.extname(file));
            const filePath = path.join(imageDir, file);

            try {
                console.log(`Actualizando producto con código: ${productCode}`);

                const result = await cloudinary.uploader.upload(filePath, {
                    public_id: productCode,
                    folder: 'csj-productImages'
                });

                const imageUrl = result.secure_url;
                const uploadedProductCode = path.basename(result.public_id);

                if (uploadedProductCode === productCode) {
                    const data = await pool.request()
                        .input('Codigo', sql.TYPES.VarChar, productCode)
                        .input('Imagen', sql.TYPES.VarChar, imageUrl)
                        .query(`
                            UPDATE p
                            SET p.ImagenProducto = @Imagen FROM dbo.Producto p
                            INNER JOIN dbo.ProductoServicio ps
                            ON p.PKID = ps.PKID
                            WHERE ps.Codigo = @Codigo
                        `)

                    if (data.rowsAffected[0] === 0) {
                        console.log(`No se encontró producto con código: ${productCode}`);
                    }
                    count++
                } else {
                    console.error(`El public_id no coincide con el código del producto: ${productCode}`);
                }
            } catch (err) {
                if (err.http_code === 420) {
                    console.log(`Límite de operaciones alcanzado. Esperando una hora antes de reintentar...`);
                    await wait(3600000);
                    break;
                } else {
                    console.error(`Error al procesar la imagen para el producto con código ${productCode}:`, err);
                }
            }
        }
        console.log('Imágenes actualizadas correctamente.');
        console.log('toal actualizados: ', count )
    } catch (err) {
        console.error('Error al actualizar las imágenes:', err);
    } finally {
        if (pool) {
            pool.close();
        }
    }
}


export const updateProductCategory = async () => {
    try{
         const data = fs.readFileSync('./data/codigoProducto.txt', 'utf8');
         const confiteriaCodes = data.split('\n').map(code => code.trim()).filter(code => code !== '');


         const pool = await getConnection();

         for(const code of confiteriaCodes) {
             await  pool.request()
                 .input('Codigo', sql.TYPES.VarChar, code)
                 .input('text', sql.TYPES.VarChar, '01A')
                 .query(`
                 UPDATE  dbo.ProductoServicio
                 SET CodigoOSCE = @text
                 WHERE Codigo = @Codigo
                 `)
         }
         console.log('Tabla de productos actualizada correctamente');
    } catch (err){
        console.error('Error al actualizar la tabla de productos:', err);
    }
}