import { createUser, validarUsuario } from '../services/user.service.js';

export const createNewUser = async (req, res) => {
    try {
        const { nombre, documento, almacen, password, key } = req.body;

        if (!nombre || !documento || !almacen || !password || !key) {
            return res.status(400).json({ message: "Todos los campos son obligatorios: nombre, documento, almacen, password, key" });
        }

        const result = await createUser(nombre, documento, almacen, password, key);
        
        if (!result.success) {
             return res.status(400).json({ message: result.message });
        }

        return res.status(201).json({ message: "Usuario creado exitosamente", data: result });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const validateUser = async (req, res) => {
    try {
        const { documento, password, key } = req.body;

        if (!documento || !password || !key) {
            return res.status(400).json({ message: "Todos los campos son obligatorios: documento, password, key" });
        }

        const user = await validarUsuario(documento, password, key);

        if (!user) {
            return res.status(401).json({ message: "Credenciales inválidas o usuario no encontrado" });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};
