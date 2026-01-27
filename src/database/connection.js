import sql from 'mssql';
import {
    DB_DATABASE, DB_PASSWORD, DB_SERVER, DB_USER,
    DB_DATABASE_2, DB_PASSWORD_2, DB_SERVER_2, DB_USER_2,
    DB_DATABASE_3, DB_PASSWORD_3, DB_SERVER_3, DB_USER_3,
    DB_DATABASE_4, DB_PASSWORD_4, DB_SERVER_4, DB_USER_4,
    DB_DATABASE_5, DB_PASSWORD_5, DB_SERVER_5, DB_USER_5,
    DB_DATABASE_6, DB_PASSWORD_6, DB_SERVER_6, DB_USER_6
} from "../config/config.js";

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
    user: DB_USER_2,
    password: DB_PASSWORD_2,
    server: DB_SERVER_2,
    database: DB_DATABASE_2,
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
    user: DB_USER_3,
    password: DB_PASSWORD_3,
    server: DB_SERVER_3,
    database: DB_DATABASE_3,
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
    user: DB_USER_4,
    password: DB_PASSWORD_4,
    server: DB_SERVER_4,
    database: DB_DATABASE_4,
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

// Configuraciones de conexión para la quinta base de datos
export const dbSettings5 = {
    user: DB_USER_5,
    password: DB_PASSWORD_5,
    server: DB_SERVER_5,
    database: DB_DATABASE_5,
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

// Configuraciones de conexión para la sexta base de datos
export const dbSettings6 = {
    user: DB_USER_6,
    password: DB_PASSWORD_6,
    server: DB_SERVER_6,
    database: DB_DATABASE_6,
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
let inMovilPool = null;
let conteoDiarioPool = null;



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

// Función para la quinta base de datos
export const getConnectionInMovil = async () => {
    try {
        if (!inMovilPool) {
            inMovilPool = new sql.ConnectionPool(dbSettings5);
            await inMovilPool.connect();
            console.log('Conexión a la base de datos inmovil exitosa');
        }
        return inMovilPool;
    } catch (err) {
        console.error('Error al conectar a la base de datos inmovil', err.stack);
        throw err;
    }
};

// Función para la sexta base de datos
export const getConnectionConteoDiario = async () => {
    try {
        if (!conteoDiarioPool) {
            conteoDiarioPool = new sql.ConnectionPool(dbSettings6);
            await conteoDiarioPool.connect();
            console.log('Conexión a la base de datos conteodiario exitosa');
        }
        return conteoDiarioPool;
    } catch (err) {
        console.error('Error al conectar a la base de datos conteodiario', err.stack);
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
        if (inMovilPool) {
            await inMovilPool.close();
            inMovilPool = null;
        }
        if (conteoDiarioPool) {
            await conteoDiarioPool.close();
            conteoDiarioPool = null;
        }
        console.log('Todas las conexiones cerradas');
    } catch (err) {
        console.error('Error al cerrar conexiones:', err);
    }
};

export { sql };