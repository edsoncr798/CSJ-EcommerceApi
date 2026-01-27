import * as conteoService from "../services/conteo.service.js";

export const guardarResultados = async (req, res) => {
    try {
        const result = await conteoService.guardarResultados(req.body);
        if (result.Exito) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({ Exito: false, Mensaje: error.message });
    }
};

export const guardarReconteo = async (req, res) => {
    try {
        const result = await conteoService.guardarReconteo(req.body);
        if (result.Exito) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({ Exito: false, Mensaje: error.message });
    }
};

export const guardarResultadosCD = async (req, res) => {
    try {
        const result = await conteoService.guardarResultadosCD(req.body);
        if (result.Exito) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({ Exito: false, Mensaje: error.message });
    }
};

export const verDiferencias = async (req, res) => {
    try {
        const { listaInventario } = req.query;
        if (!listaInventario) {
            return res.status(400).json({ Exito: false, Mensaje: "listaInventario es requerido" });
        }
        const result = await conteoService.verDiferencias(listaInventario);
        res.json(result);
    } catch (error) {
        res.status(500).json({ Exito: false, Mensaje: error.message });
    }
};
