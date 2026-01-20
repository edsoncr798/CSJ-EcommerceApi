import { obtener_detalle, obtener_detalle_Guardado } from '../services/detalleOrdenCompra.service.js';

export const getDetalleOrden = async (req, res) => {
    try {
        const { numeroOrden, numeroAlmacen } = req.query; // Usamos query params para GET

        if (!numeroOrden || !numeroAlmacen) {
            return res.status(400).json({ message: "Se requieren numeroOrden y numeroAlmacen" });
        }

        const result = await obtener_detalle(numeroOrden, numeroAlmacen);

        if (!result) {
            return res.status(404).json({ message: "No se encontraron detalles para esta orden" });
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const getDetalleGuardado = async (req, res) => {
    try {
        const { idControlAlmacen } = req.params;

        if (!idControlAlmacen) {
            return res.status(400).json({ message: "Se requiere idControlAlmacen" });
        }

        const result = await obtener_detalle_Guardado(idControlAlmacen);

        if (!result) {
            return res.status(404).json({ message: "No se encontraron detalles guardados para este control" });
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};
