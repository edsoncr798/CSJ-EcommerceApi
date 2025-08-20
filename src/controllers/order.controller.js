import { createOrderService, getPurchaseHistory, getOrderStatusService } from "../services/order.service.js";
// import { crearCargo } from "./openpay.controller.js";

export const createOrder = async (req, res) => {
    const orderData = req.body

    try {

        // const paymentResponse = await crearCargo();
        const completeOrderData = {
            ...orderData,
            EstadoAprobacion: orderData.EstadoAprobacion || 'PENDIENTE'
        };

        const result = await createOrderService(completeOrderData);

        const bonificacionesFormateadas = result.data.bonificaciones.map(item => ({
            producto: item.itemId,
            tieneBonificacion: item.datosBonificacion.tieneBonificacion,
            mensajes: item.mensajes.map(i => i.Mensaje)
        }));

        res.status(200).json({
            success: true,
            message: 'Productos comprados exitosamente',
            data: result.data.result?.[0],//result.recordset[0],
            bonificacion: result.data.bonificaciones || []
        });

    } catch (error) {
        console.error('Error al crear el pedido', error);
        res.status(500).json({ message: error.message });
    }

};

export const processBonifications = async (req, res) => {
    try {
        const { IdCp } = req.params;
        
        if (!IdCp) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere el IdCp del pedido'
            });
        }

       // const result = await procesarBonificaciones(IdCp);
        
        // Si el resultado indica error, enviamos el status correspondiente
        if (!result.success) {
            return res.status(500).json(result);
        }

        // Si todo salió bien, enviamos status 200
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error en el controlador de bonificaciones:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al procesar las bonificaciones',
            error: error.message
        });
    }
};


export const getOrder = async (req, res) => {
    const idUser = req.query.id
    try {
        const result = await getPurchaseHistory(idUser);
        res.status(200).json({
            message: 'Tus compras',
            data: result.recordset
        })
    } catch (error) {
        console.error('Error al obtener el historial de compras:', error);
        res.status(500).json({
            message: 'Error al obtener las compras',
            error: error.message
        });
    }
};

//export const getOrderStatus = async (req, res) => {
 //   const { order_id } = req.params;
 //   try {
  //      const estado = await getOrderStatusService(order_id); // consulta a la BD
 //       res.json(estado.recordset[0]);
 //   } catch (error) {
 //       res.status(500).json({ error: 'No se pudo obtener el estado del pedido' });
  //  }
//};
