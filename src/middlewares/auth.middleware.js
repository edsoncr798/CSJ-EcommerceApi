import admin from '../config/firebase.js';

export const verifyToken = async (req, res, next) => {

    try{
        const token = req.headers.authorization?.split('Bearer ')[1];
        if (!token) {
            return res.status(401).json({
                message: 'No se proporcionó un token de acceso'
            });
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
        
    } catch (error) {
        console.error('Error en verificando token:', error);
        res.status(401).json({
            message: 'Token no válido o expirado',
            error: error.message
        });
    }
}
