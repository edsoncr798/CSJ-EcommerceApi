import sql from 'mssql';
import { DB_DATABASE, DB_PASSWORD, DB_SERVER, DB_USER } from "../config/config.js";

// Configuraciones de conexión
export const dbSettings = {
    user: DB_USER,
    password: DB_PASSWORD,
    server: DB_SERVER,
    database: DB_DATABASE,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

export const dbSettings2 = {
    user: process.env.DB_USER_2,
    password: process.env.DB_PASSWORD_2,
    server: process.env.DB_SERVER_2,
    database: process.env.DB_DATABASE_2,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Pools de conexión separados
let mainPool = null;
let reciboDigitalPool = null;

// Función de conexión principal
export const getConnection = async () => {
    try {
        if (!mainPool) {
            mainPool = new sql.ConnectionPool(dbSettings);  // ← AQUÍ estaba el error
            await mainPool.connect();
            console.log('Conexión a la base de datos ecommerce exitosa');
        }
        return mainPool;
    } catch (err) {
        console.error('Error al conectar a la base de datos ecommerce', err.stack);
        throw err;
    }
};

// Función para la segunda base de datos
export const getConnectionReciboDigital = async () => {
    try {
        if (!reciboDigitalPool) {
            reciboDigitalPool = new sql.ConnectionPool(dbSettings2);  // ← Y aquí también
            await reciboDigitalPool.connect();
            console.log('Conexión a la base de datos recibodigital exitosa');
        }
        return reciboDigitalPool;
    } catch (err) {
        console.error('Error al conectar a la base de datos recibodigital', err.stack);
        throw err;
    }
};

// Función para cerrar conexiones
export const closeConnections = async () => {
    try {
        if (mainPool) {
            await mainPool.close();
            mainPool = null;
        }
        if (reciboDigitalPool) {
            await reciboDigitalPool.close();
            reciboDigitalPool = null;
        }
        console.log('Todas las conexiones cerradas');
    } catch (err) {
        console.error('Error al cerrar conexiones:', err);
    }
};

export { sql };