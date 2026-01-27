import * as productoService from "../services/producto.service.js";

export const getProducto = async (req, res) => {
    try {
        const { listaInvent, codigoProducto } = req.query;
        if (!listaInvent || !codigoProducto) {
            return res.status(400).json({ message: "listaInvent y codigoProducto son requeridos" });
        }
        const result = await productoService.buscarProducto(listaInvent, codigoProducto);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getConteoDiarioBuscar = async (req, res) => {
    try {
        const { codigoProducto } = req.query;
        if (!codigoProducto) {
            return res.status(400).json({ message: "codigoProducto es requerido" });
        }
        const result = await productoService.conteoDiarioBuscar(codigoProducto);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAlmacenes = async (req, res) => {
    try {
        const result = await productoService.listarAlmacen();
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
