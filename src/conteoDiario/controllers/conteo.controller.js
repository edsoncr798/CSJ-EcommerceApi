import { finalizarIngresoAlmacen, guardarControlAlmacen, mostrarIngresosTerminados, mostrarIngresosPendiente, mostrarIngresosSinProcesar, actualizarItemControlAlmacen } from '../services/conteo.service.js';

export const saveControlAlmacen = async (req, res) => {
    try {
        const { idUsuario, numeroOrdenCompra, nombreProveedor, facturaProveedor, guiaTransportista, Almacen, jsonDetalleControlAlma } = req.body;

        if (!idUsuario || !numeroOrdenCompra || !Almacen || !jsonDetalleControlAlma) {
            return res.status(400).json({ message: "Datos incompletos. Faltan campos requeridos." });
        }

        const jsonString = typeof jsonDetalleControlAlma === 'string' ? jsonDetalleControlAlma : JSON.stringify(jsonDetalleControlAlma);

        const result = await guardarControlAlmacen(idUsuario, numeroOrdenCompra, nombreProveedor, facturaProveedor, guiaTransportista, Almacen, jsonString);

        if (!result) {
            return res.status(400).json({ message: "No se pudo guardar el control de almacén." });
        }

        return res.status(201).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const updateItemControlAlmacen = async (req, res) => {
    try {
        const { idControlAlmacen, jsonDetalleControlAlma } = req.body;

        if (!idControlAlmacen || !jsonDetalleControlAlma) {
            return res.status(400).json({ message: "Se requieren idControlAlmacen y jsonDetalleControlAlma" });
        }
        
        const jsonString = typeof jsonDetalleControlAlma === 'string' ? jsonDetalleControlAlma : JSON.stringify(jsonDetalleControlAlma);

        const result = await actualizarItemControlAlmacen(idControlAlmacen, jsonString);
        return res.status(200).json({ message: result });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const getIngresosSinProcesar = async (req, res) => {
    try {
        const { almacen } = req.query;

        if (!almacen) {
            return res.status(400).json({ message: "Se requiere el parametro almacen" });
        }

        const result = await mostrarIngresosSinProcesar(almacen);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const getIngresosPendientes = async (req, res) => {
    try {
        const { almacen } = req.query;

        if (!almacen) {
            return res.status(400).json({ message: "Se requiere el parametro almacen" });
        }

        const result = await mostrarIngresosPendiente(almacen);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const getIngresosTerminados = async (req, res) => {
    try {
        const { almacen, fecha } = req.query;

        if (!almacen || !fecha) {
            return res.status(400).json({ message: "Se requieren almacen y fecha" });
        }

        const result = await mostrarIngresosTerminados(almacen, fecha);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const finalizeIngresoAlmacen = async (req, res) => {
    try {
        const { idControlAlmacen, observacion, revisado, aprobado, jsonDetalleControlAlma } = req.body;

        if (!idControlAlmacen || !jsonDetalleControlAlma) {
            return res.status(400).json({ message: "Datos incompletos. Se requiere idControlAlmacen y jsonDetalleControlAlma" });
        }

        const jsonString = typeof jsonDetalleControlAlma === 'string' ? jsonDetalleControlAlma : JSON.stringify(jsonDetalleControlAlma);

        const result = await finalizarIngresoAlmacen(idControlAlmacen, observacion, revisado, aprobado, jsonString);
        
        if (result.startsWith("Algo salio mal")) {
             return res.status(400).json({ message: result });
        }

        return res.status(200).json({ message: result });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};
