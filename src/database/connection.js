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

// Configuraciones de conexión para la tercera base de datos
export const dbSettings3 = {
    user: process.env.DB_USER_3,
    password: process.env.DB_PASSWORD_3,
    server: process.env.DB_SERVER_3,
    database: process.env.DB_DATABASE_3,
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

// Configuraciones de conexión para la cuarta base de datos
export const dbSettings4 = {
    user: process.env.DB_USER_4,
    password: process.env.DB_PASSWORD_4,
    server: process.env.DB_SERVER_4,
    database: process.env.DB_DATABASE_4,
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
let csjDistribucionPool = null;
let meteloRapidoPool = null;

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

// Función para la tercera base de datos
export const getConnectionCsjDistribucion = async () => {
    try {
        if (!csjDistribucionPool) {
            csjDistribucionPool = new sql.ConnectionPool(dbSettings3);
            await csjDistribucionPool.connect();
            console.log('Conexión a la base de datos csjdistribucion exitosa');
        }
        return csjDistribucionPool;
    } catch (err) {
        console.error('Error al conectar a la base de datos csjdistribucion', err.stack);
        throw err;
    }
};

// Función para la cuarta base de datos
export const getConnectionMeteloRapido = async () => {
    try {
        if (!meteloRapidoPool) {
            meteloRapidoPool = new sql.ConnectionPool(dbSettings4);
            await meteloRapidoPool.connect();
            console.log('Conexión a la base de datos metelorapido exitosa');
        }
        return meteloRapidoPool;
    } catch (err) {
        console.error('Error al conectar a la base de datos metelorapido', err.stack);
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
        if (csjDistribucionPool) {
            await csjDistribucionPool.close();
            csjDistribucionPool = null;
        }
        if (meteloRapidoPool) {
            await meteloRapidoPool.close();
            meteloRapidoPool = null;
        }
        console.log('Todas las conexiones cerradas');
    } catch (err) {
        console.error('Error al cerrar conexiones:', err);
    }
};

export { sql };