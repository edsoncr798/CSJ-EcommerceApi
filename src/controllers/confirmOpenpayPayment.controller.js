import axios from 'axios'
import dotenv from 'dotenv'
import { deleteOrder, getOrderStatusService, updateOrderStatus, getOrderDetailsService } from '../services/order.service.js'
import { sendPurchaseConfirmationEmail } from '../services/email.service.js'
import { io } from '../../index.js'

dotenv.config()

const OPENPAY_BASE_URL = process.env.OPENPAY_BASE_URL
const MERCHANT_ID = process.env.OPENPAY_MERCHANT_ID
const PRIVATE_KEY = process.env.OPENPAY_PRIVATE_KEY

export const confirmOpenpayPaymentVisa = async (req, res) => {
  const { order_id, transaction_id } = req.query

  const authHeader = `Basic ${Buffer.from(`${PRIVATE_KEY}:`).toString('base64')}`

  try {

    //verificamos el estado actual del pedido antes de procesar
    const current = await getOrderStatusService(order_id);

    if(current.recordset[0].Estado === 'APROBADO'){
      return res.json({ 
        success: true, 
        message: 'El pedido ya ha sido aprobado.' 
      });
    }
    
    const response = await axios.get(`${OPENPAY_BASE_URL}/${MERCHANT_ID}/charges/${transaction_id}`, {
      headers: {
        Authorization: authHeader
      }
    })

    if (response.data.status === 'completed') {
     
      await updateOrderStatus(order_id, 'APROBADO');

     
      const orderDetails = await getOrderDetailsService(order_id);

      if (!orderDetails.recordset || orderDetails.recordset.length === 0) {
        throw new Error('No se encontraron detalles de la orden');
      }

      const firstRecord = orderDetails.recordset[0];
      
      
      try {
        await sendPurchaseConfirmationEmail({
          order_id: order_id,
          Email: firstRecord.Email, // Agregamos el email del cliente
          items: orderDetails.recordset.map(item => ({
            Descripcion: item.Descripcion,
            Cantidad: item.Cantidad,
            Precio: item.PrecioUnitario,
            Total: item.PrecioTotal
          })),
          TotalVenta: orderDetails.recordset.reduce((sum, item) => sum + item.PrecioTotal, 0),
          Fecha: firstRecord.Fecha
        });
      } catch (emailError) {
        console.error('Error al enviar el correo de confirmación:', emailError);
      }


      return res.json({ success: true })
    } else {
      await deleteOrder(order_id);
      return res.json({ success: false, message: 'El pago no fue exitoso.' })
    }
  } catch (error) {
    console.error('Error al confirmar pago con Openpay:', error.response?.data || error.message)
    return res.status(500).json({ success: false, message: 'Error al confirmar el pago.' })
  }
};

export async function verificarEstadoPagoOpenpay(transaction_id) {
  const authHeader = `Basic ${Buffer.from(`${PRIVATE_KEY}:`).toString('base64')}`;
  
  try {
    const response = await axios.get(`${OPENPAY_BASE_URL}/${MERCHANT_ID}/charges/${transaction_id}`, {
      headers: {
        Authorization: authHeader
      }
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error al verificar estado del pago:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}



// Webhook modificado
export const recibirWebhookOpenpay = async (req, res) => {
  try {
    const event = req.body;

    if (event.type === 'verification' && event.verification_code) {
      console.log(event.verification_code);
      return res.status(200).type('text/plain').send(event.verification_code);
    }

    const status = event.status || event.transaction?.status;
    const order_id = event.order_id || event.transaction?.order_id;
    const transaction_id = event.id || event.transaction?.id;
    const payment_method = event.method || event.transaction?.method;

    if (!order_id) {
      console.error('❌ Error: Order ID no encontrado en el webhook');
      return res.status(400).json({
        success: false,
        message: 'Order ID no proporcionado'
      });
    }

    
    if (event.type === 'charge.succeeded' && status === 'completed') {
      await updateOrderStatus(order_id, 'APROBADO');

      const orderDetails = await getOrderDetailsService(order_id);

      if (!orderDetails.recordset || orderDetails.recordset.length === 0) {
        throw new Error('No se encontraron detalles de la orden');
      }

      const firstRecord = orderDetails.recordset[0];
      
      try {
        await sendPurchaseConfirmationEmail({
          order_id: order_id,
          Email: firstRecord.Email, // Agregamos el email del cliente
          items: orderDetails.recordset.map(item => ({
            Descripcion: item.Descripcion,
            Cantidad: item.Cantidad,
            Precio: item.PrecioUnitario,
            Total: item.PrecioTotal
          })),
          TotalVenta: orderDetails.recordset.reduce((sum, item) => sum + item.PrecioTotal, 0),
          Fecha: firstRecord.Fecha
        });
      } catch (emailError) {
        console.error('Error al enviar el correo de confirmación:', emailError);
      }

      io.to(`payment-${order_id}`).emit('payment-status', {
        success: true,
        message: 'Pago procesado exitosamente',
        order_id: order_id,
        status: 'APROBADO',
        payment_method: payment_method,
        transaction_id: transaction_id
      });
      return res.status(200).json({
        success: true,
        message: 'Pago procesado exitosamente'
      });
    } else if (event.type === 'charge.failed') {
      await deleteOrder(order_id);
      io.to(`payment-${order_id}`).emit('payment-status', {
        success: false,
        message: 'Pago fallido',
        order_id: order_id,
        status: 'CANCELADO',
        payment_method: payment_method,
        transaction_id: transaction_id,
        reason: 'Pago fallido'
      })
    }
    return res.status(200).json({
      success: true,
      message: 'Evento recibido pero no procesado'
    });

  } catch (error) {
    console.error('❌ Error en webhook:', error.message);
    return res.status(500).json({ error: 'Error interno' });
  }
};






// Nueva ruta para confirmar pago contra entrega
export const confirmCashPayment = async (req, res) => {
  const { order_id } = req.body;

  if (!order_id) {
    return res.status(400).json({ success: false, message: 'El ID del pedido es requerido.' });
  }

  try {
    const currentStatus = await getOrderStatusService(order_id);

    if (currentStatus === 'APROBADO') {
      return res.json({ success: true, message: 'El pedido ya ha sido confirmado previamente.' });
    }

    await updateOrderStatus(order_id, 'APROBADO');
      const orderDetails = await getOrderDetailsService(order_id);

      if (!orderDetails.recordset || orderDetails.recordset.length === 0) {
        throw new Error('No se encontraron detalles de la orden');
      }

      const firstRecord = orderDetails.recordset[0];
      
      try {
        await sendPurchaseConfirmationEmail({
          order_id: order_id,
          Email: firstRecord.Email, // Agregamos el email del cliente
          items: orderDetails.recordset.map(item => ({
            Descripcion: item.Descripcion,
            Cantidad: item.Cantidad,
            Precio: item.PrecioUnitario,
            Total: item.PrecioTotal
          })),
          TotalVenta: orderDetails.recordset.reduce((sum, item) => sum + item.PrecioTotal, 0),
          Fecha: firstRecord.Fecha
        });
      } catch (emailError) {
        console.error('Error al enviar el correo de confirmación:', emailError);
      }
    return res.json({ success: true });
  } catch (error) {
    console.error('Error al confirmar pedido contra entrega:', error);
    return res.status(500).json({ success: false, message: 'No se pudo confirmar el pedido.' });
  }
};

