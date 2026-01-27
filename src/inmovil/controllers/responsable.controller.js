import * as responsableService from "../services/responsable.service.js";

export const getResponsables = async (req, res) => {
    try {
        const { listaInvent } = req.query;
        if (!listaInvent) {
            return res.status(400).json({ message: "listaInvent es requerido" });
        }
        const result = await responsableService.listarResponsables(listaInvent);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const validarResponsables = async (req, res) => {
    try {
        const { NombreResponsable, DocResponsable, Codigo, listaInventario, nombreDispositivo, CodVersion } = req.query;
        
        if (!NombreResponsable || !DocResponsable || !CodVersion) {
            return res.status(400).json({ message: "NombreResponsable, DocResponsable y CodVersion son requeridos" });
        }

        const result = await responsableService.validarResponsables(
            NombreResponsable, DocResponsable, Codigo, listaInventario, nombreDispositivo, CodVersion
        );
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const postRegistrar = async (req, res) => {
    try {
        const { Codigo, listaInventario, nombreResponsable, nombreDispositivo } = req.query;
        const result = await responsableService.registrarSesion(Codigo, listaInventario, nombreResponsable, nombreDispositivo);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const cerrarSesion = async (req, res) => {
    try {
        const { codigo, listalistaInventario } = req.query;
        const result = await responsableService.cerrarSesion(codigo, listalistaInventario);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const verificarEnvio = async (req, res) => {
    try {
        const { listalistaInventario, tipoResponsable } = req.query;
        const result = await responsableService.verificarEnvio(listalistaInventario, parseInt(tipoResponsable));
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
