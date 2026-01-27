import * as ventasService from "../services/ventas.service.js";

export const listarVendedores = async (req, res) => {
    try {
        const { nombre } = req.query;
        if (!nombre) {
            return res.status(400).json({ Exito: false, Mensaje: "nombre es requerido" });
        }
        const result = await ventasService.listarVendedores(nombre);
        res.json(result);
    } catch (error) {
        res.status(500).json({ Exito: false, Mensaje: error.message });
    }
};
