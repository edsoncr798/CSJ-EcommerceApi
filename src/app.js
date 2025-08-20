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

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
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

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: err.message,
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