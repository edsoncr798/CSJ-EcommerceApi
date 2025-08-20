import sql from 'mssql';
import { DB_DATABASE, DB_PASSWORD, DB_SERVER, DB_USER } from "../config/config.js";

// Conexión principal (existente)
export const dbSettings = {
    user: DB_USER,
    password: DB_PASSWORD,
    server: DB_SERVER,
    database: DB_DATABASE,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

// Nueva conexión para la segunda base de datos
export const dbSettings2 = {
    user: process.env.DB_USER_2,
    password: process.env.DB_PASSWORD_2,
    server: process.env.DB_SERVER_2,
    database: process.env.DB_DATABASE_2,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

// Función de conexión principal (existente)
export const getConnection = async () => {
    try {
        const pool = await sql.connect(dbSettings);
        console.log('Conexión a la base de datos ecommere exitosa')

        return pool;
    } catch (err) {
        console.error('Error al conectar a la base de datos ecommere', err.stack);
        throw err;
    }
};

// Nueva función para la segunda base de datos
export const getConnection2 = async () => {
    try {
        const pool = await sql.connect(dbSettings2);
        console.log('Conexión a la base de datos recibodigital exitosa')

        return pool;
    } catch (err) {
        console.error('Error al conectar a la base de datos recibodigital', err.stack);
        throw err;
    }
};

export { sql };