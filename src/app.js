import morgan from 'morgan';
import express from 'express';
import cors from 'cors';
// import path from "path";
import clientRouter from './routes/client.routes.js';
import productRouter from './routes/product.routes.js';
import authRouter from './routes/auth.routes.js';
import documentRouter from './routes/document.routes.js';
import orderRouter from './routes/order.routes.js';
import openpayRouter from './routes/openpay.routes.js';
import reciboDigitalRoutes from './routes/reciboDigital.routes.js';
import cobranzaRouter from './routes/cobranza.routes.js';
import userConteoRouter from './conteoDiario/routes/user.routes.js';
import detalleOrdenCompraRouter from './conteoDiario/routes/detalleOrdenCompra.routes.js';
import conteoRouter from './conteoDiario/routes/conteo.routes.js';

// import { Server } from 'http';
import { Server }  from 'socket.io';

const app = express();

//Middlewares
app.use(morgan('dev'));
app.use(cors({
    origin: ['https://e-csjmarket.comsanjuan.com', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));

// Configurar límites de payload para manejar firmas digitales (imágenes base64)
app.use(express.urlencoded({ 
    extended: false, 
    limit: '50mb',
    parameterLimit: 50000
}));
app.use(express.json({ 
    limit: '50mb'
}));
// app.use('/productImages', express.static(path.join(__dirname, 'productImages')));

//rutas
app.use('/api', clientRouter);
app.use('/api', productRouter);
app.use('/api/auth', authRouter);
app.use('/api', documentRouter);
app.use('/api', orderRouter);
app.use('/api', openpayRouter);

// Registrar las nuevas rutas de recibo digital
app.use('/api', reciboDigitalRoutes);

// Registrar las rutas de cobranza
app.use('/api', cobranzaRouter);

// Registrar rutas de conteo diario
app.use('/api', userConteoRouter);
app.use('/api', detalleOrdenCompraRouter);
app.use('/api', conteoRouter);

// Manejo de errores específicos
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // Manejar error de payload demasiado grande
    if (err.type === 'entity.too.large') {
        return res.status(413).json({
            success: false,
            message: 'El archivo enviado es demasiado grande. Las firmas digitales no deben exceder 50MB.',
            error: 'PayloadTooLargeError',
            maxSize: '50MB'
        });
    }
    
    // Manejar otros errores de body-parser
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            success: false,
            message: 'Error al procesar los datos enviados. Verifique el formato de las firmas digitales.',
            error: 'ParseError'
        });
    }
    
    // Error genérico
    res.status(500).json({
        success: false,
        message: err.message || 'Error interno del servidor',
    });
});


export const configureSocketIO = (server) => {
    const io = new Server(server, {
        cors: {
            origin: ['http://localhost:3000', 'https://e-csjmarket.comsanjuan.com'],
            methods: [ 'GET', 'POST' ],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('Un cliente se ha conectado', socket.id);

        socket.on('join-payment-room', (order_id) => {
            socket.join(`payment-${order_id}`);
            console.log(`Cliente ${socket.id} se unió a la sala payment-${order_id}`);
        });

        socket.on('disconnect', () => {
            console.log('Un cliente se ha desconectado', socket.id);
        });
    });
    return io;
};


export default app;