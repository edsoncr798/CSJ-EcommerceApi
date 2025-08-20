import axios from 'axios';
import dotenv from 'dotenv';
import { verificarEstadoPagoOpenpay } from '../controllers/confirmOpenpayPayment.controller.js';
import { io } from '../../index.js';

dotenv.config();

const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL;


const OPENPAY_BASE_URL = process.env.OPENPAY_BASE_URL;
const OPENPAY_DASHBOARD_URL = process.env.OPENPAY_DASHBOARD_URL;
const MERCHANT_ID = process.env.OPENPAY_MERCHANT_ID;
const PRIVATE_KEY = process.env.OPENPAY_PRIVATE_KEY;

export const crearCargoVisa = async (req, res) => {
  try {
    const { order_id, amount, email, name, last_name, phone_number } = req.body;

    const cargoData = {
      method: 'card',
      amount,
      currency: 'PEN',
      description: 'Pago Ecomerce SanJuan',
      order_id,
      confirm: false,
      send_email: false,
      redirect_url: `${FRONTEND_BASE_URL}/confirmationPage?order_id=${order_id}`, // ruta produccion
      customer: {
        name,
        last_name,
        phone_number,
        email,
      },
    };

    const authHeader = `Basic ${Buffer.from(`${PRIVATE_KEY}:`).toString('base64')}`;

    const response = await axios.post(`${OPENPAY_BASE_URL}/${MERCHANT_ID}/charges`, cargoData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
    });


    res.json({
      redirect_url: response.data.payment_method.url,
      transaction_id: response.data.id
    });
  } catch (error) {
    console.error('Error en Openpay:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error al procesar el pago', details: error.response?.data });
  }
};


export const crearCargoKashio = async (req, res) => {
  try {
    const { order_id, amount, email, name, last_name, phone_number } = req.body;
    const due_date = new Date();
    due_date.setMinutes(due_date.getMinutes() + 10); // Expira en 10 minutos

    const cargoData = {
      method: "store",
      amount,
      currency: "PEN",
      description: "Pago Ecommerce SanJuan",
      order_id,
      due_date,
      customer: {
        name,
        last_name,
        phone_number,
        email
      }
    }

    const authHeader = `Basic ${Buffer.from(`${PRIVATE_KEY}:`).toString('base64')}`;

    const response = await axios.post(`${OPENPAY_BASE_URL}/v1/${MERCHANT_ID}/charges`, cargoData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
    });

    // Programar la verificación del estado para cuando expire
    const timeUntilExpiry = due_date.getTime() - new Date().getTime() + 30000; // Agrega 30 segundos de margen;
    setTimeout(async () => {
      const verificacion = await verificarEstadoPagoOpenpay(response.data.id);
      if (verificacion.success) {
        const estadoActual = verificacion.data.status;
        if (estadoActual !== 'completed') {
          // Si no está completado al momento de expirar, lo consideramos expirado
          io.to(`payment-${order_id}`).emit('payment-status', {
            success: false,
            message: 'Pago expirado',
            order_id: order_id,
            status: 'CANCELADO',
            payment_method: 'store',
            transaction_id: response.data.id,
            reason: 'Tiempo de pago expirado'
          });
        }
      }
    }, timeUntilExpiry);

    res.json({
      transaction_id: response.data.id,
      order_id: response.data.order_id,
      reference: response.data.payment_method.reference,
      barcode_url: response.data.payment_method.barcode_url,
      pdf_url: `${OPENPAY_DASHBOARD_URL}/paynet-pdf/${MERCHANT_ID}/${response.data.payment_method.reference}`,
      due_date: response.data.due_date,
      amount: response.data.amount,
      name: response.data.customer.name,
      last_name: response.data.customer.last_name,
      email: response.data.customer.email
    });
  } catch (error) {
    console.error('Error en Openpay:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error al procesar el pago', details: error.response?.data });
  }
};



