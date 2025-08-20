import admin from '../config/firebase.js';
import {sendVerificationEmail} from "../services/email.service.js";
import { getConnection, sql } from '../database/connection.js';

export const login = async (req, res) => {

    try{
        const {email, password} = req.body;

        try{
            const userRecord = await admin.auth().getUserByEmail(email);
            if(!userRecord.emailVerified){
                const verificationLink = await admin.auth().generateEmailVerificationLink(email);
                await sendVerificationEmail(email, verificationLink);
                return res.status(403).json({
                    success: false,
                    message: 'Por favor, verifica tu email antes de iniciar sesión',
                    needsVerification: false
                });
            }

            const pool = await getConnection();
            const result = await pool.request()
                .input('email', sql.VarChar(100), email)
                .execute('ECOMMERCE_getPersonByEmail');
            
            if(!result.recordset?.[0]){
                return res.status(404).json({
                    success: false,
                    message: 'No se encontró el usuario'
                });
            }

            const customToken = await admin.auth().createCustomToken(userRecord.uid);

            return res.status(200).json({
                success: true,
                message: 'Inicio de sesión exitoso',
                data: {
                    user: result.recordset[0],
                    token: customToken
                }
            });
            
        } catch (error) {
            console.error('Error específico:', error);
            
            if (error.code === 'auth/user-not-found') {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            if (error.code === 'auth/invalid-email') {
                return res.status(400).json({
                    success: false,
                    message: 'Formato de email inválido'
                });
            }

            throw error;
        }

    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al iniciar sesión'
        });
    }
};


export const loginWithGoogle = async (req, res) => {
    const { token } = req.body;
   
    try {
        // Verifica el token de Google y obtiene la información del usuario
        const decodedToken = await admin.auth().verifyIdToken(token);
        const email = decodedToken.email;
        const uid = decodedToken.uid;

        // Verifica si el usuario existe en la base de datos
        const pool = await getConnection();
        const result = await pool.request()
            .input('email', sql.VarChar(100), email)
            .execute('ECOMMERCE_getPersonByEmail');

        if (result.recordset.length > 0) {
            // Usuario existe en BD - Login exitoso
            const user = result.recordset[0];
            
            // Obtener información actualizada de Firebase para el displayName
            const userRecord = await admin.auth().getUser(uid);

            const adapterUser = {
                IdUsuario: user.IdUsuario,
                Email: userRecord.email.trim(),
                NombreCompleto: userRecord.displayName?.trim(),
                PrimerNombre: user.PrimerNombre.trim(),
                SegundoNombre: user.SegundoNombre.trim(),
                ApellidoPaterno: user.ApellidoPaterno.trim(),
                ApellidoMaterno: user.ApellidoMaterno.trim(),
                NumeroDocumento: user.NumeroDocumento,
                Telefono: user.Telefono,
                FechaCumpleaños: user.FechaCumpleaños,
                TipoDocumento: user.TipoDocumento,
                Direccion: user.Direccion.trim(),
                UbigeoDistrito: user.UbigeoDistrito,
                IdDireccion: user.IdDireccion,
                Distrito: user.Distrito.trim(),
                Departamento: user.Departamento.trim(),
                Provincia: user.Provincia.trim()
            };

            const customToken = await admin.auth().createCustomToken(uid);

            return res.status(200).json({
                success: true,
                message: 'Inicio de sesión exitoso',
                data: {
                    user: adapterUser,
                    token: customToken
                }
            });
        } else {
            // Usuario no existe en BD - Necesita completar registro
            const userRecord = await admin.auth().getUser(uid);
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado, por favor complete el registro.',
                needsRegistration: true,
                userGoogle: {
                    uid: uid,
                    idToken: token, // El token original que se envió desde el frontend
                    displayName: userRecord.displayName,
                    email: userRecord.email,
                    photoUrl: userRecord.photoURL,
                    emailVerified: userRecord.emailVerified
                },
            });
        }
    } catch (error) {
        console.error('Error en login con Google:', error);
        
        // Errores de red/conectividad
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            return res.status(503).json({
                success: false,
                message: 'Error de conexión. Verifique su conexión a internet e intente nuevamente.',
                errorType: 'NETWORK_ERROR'
            });
        }

        // Error de timeout de red
        if (error.code === 'ECONNRESET' || error.message.includes('timeout')) {
            return res.status(408).json({
                success: false,
                message: 'La conexión tardó demasiado tiempo. Verifique su conexión a internet.',
                errorType: 'TIMEOUT_ERROR'
            });
        }

        // Errores específicos de Firebase Auth
        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado, por favor inicie sesión nuevamente',
                errorType: 'TOKEN_EXPIRED'
            });
        }
        
        if (error.code === 'auth/invalid-id-token') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido',
                errorType: 'INVALID_TOKEN'
            });
        }

        // Errores de Firebase relacionados con red
        if (error.code === 'auth/network-request-failed') {
            return res.status(503).json({
                success: false,
                message: 'Error de red al conectar con Firebase. Verifique su conexión a internet.',
                errorType: 'FIREBASE_NETWORK_ERROR'
            });
        }

        // Errores de base de datos relacionados con conectividad
        if (error.message.includes('Failed to connect') || error.message.includes('Connection timeout')) {
            return res.status(503).json({
                success: false,
                message: 'Error de conexión con la base de datos. Intente nuevamente en unos momentos.',
                errorType: 'DATABASE_CONNECTION_ERROR'
            });
        }

        // Error genérico de servidor
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor. Intente nuevamente más tarde.',
            errorType: 'INTERNAL_SERVER_ERROR'
        });
    }
};




