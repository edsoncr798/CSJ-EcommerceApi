import admin from "../config/firebase.js";
import { getConnection, sql } from '../database/connection.js';
import { registerUserWithGoogle } from "../services/registerWithGoogle.service.js";

export const registerWithGoogle = async (req, res) => {

    const pool = await getConnection();

    try {

        const {
            Nombre,
            Apellido,
            email,
            idToken,
            DocIdentidad,
            Direccion1,
            Distrito1,
            TelefonoGeneral
        } = req.body;


        //verificamos el token de ID
        const decodedToken = await admin.auth().verifyIdToken(idToken);

        // Separar nombres
        const nombresArray = Nombre.trim().toUpperCase().split(' ');
        let p_PrimerNombre = nombresArray[0] || '';
        let p_SegundoNombre = nombresArray.slice(1).join(' ') || '';

        // Separar apellidos
        const apellidosArray = Apellido.trim().toUpperCase().split(' ');
        const p_ApellidoPaterno = apellidosArray[0] || '';
        const p_ApellidoMaterno = apellidosArray.slice(1).join(' ') || '';

        // Crear nombre completo para p_Nombre
        const p_Nombre = `${p_ApellidoPaterno} ${p_ApellidoMaterno} ${p_PrimerNombre} ${p_SegundoNombre}`;
        
        let p_Prefijo = '';

        if(DocIdentidad.length === 8 ){
            p_Prefijo = p_ApellidoPaterno?.charAt(0)?.toUpperCase() || 'A'
        } else{
            p_Prefijo = Nombre?.charAt(0)?.toUpperCase() || 'B'
            p_PrimerNombre = '';
            p_SegundoNombre = '';
        }

        const data = {
            p_Prefijo,
            p_Nombre,
            p_ApellidoPaterno,
            p_ApellidoMaterno,
            p_PrimerNombre,
            p_SegundoNombre,
            p_Email: email,
            p_DocIdentidad: DocIdentidad,
            p_Direccion1: Direccion1?.toUpperCase(),
            p_Distrito1: Distrito1,
            p_TelefonoGeneral: TelefonoGeneral
        };


        //Registrar usuario en la db
        
        await registerUserWithGoogle(data); 


        // Verifica si el usuario ya existe en la base de datos
        const resultDb = await pool.request()
            .input('email', sql.VarChar(100), decodedToken.email)
            .execute('ECOMMERCE_getPersonByEmail');


        if(resultDb.recordset.length < 0){
            return res.status(400).json({
                success: false,
                message: 'El usuario creado no se encontro'
            });
        }
        
        // if(!result.success){
        //     console.log('error al crear el usuario')
        //     return res.status(500).json({
        //         success: false,
        //         message: 'Error al crear el usuario en la DB'
        //     });
        // }

        //Intentar obtener el usuario de firebase
        let userRecord;

        try{
            userRecord = await admin.auth().getUserByEmail(decodedToken.email);
        } catch(err) {
            console.log('error al obtener el usuario de firebase: ', err);
            await pool.request()
                .input('email', sql.VarChar(100), decodedToken.email)
                .query('DELETE Persona WHERE Email = @email');
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado en firebase.'
            })
        }

         

        // El usuario ya existe, puedes iniciar sesión
        const user = resultDb.recordset[0];
        const uid = userRecord.uid; // Obtén el uid de Firebase
                    
        const adapterUser = {
            IdUsuario: user.IdUsuario,
            Email: userRecord.email.trim(),
            NombreCompleto: userRecord.displayName.trim(),
            PrimerNombre: user.PrimerNombre.trim(),
            SegundoNombre: user.SegundoNombre.trim(),
            ApellidoPaterno: user.ApellidoPaterno.trim(),
            ApellidoMaterno: user.ApellidoMaterno.trim(),
            Genero: user.Genero.trim(),
            NumeroDocumento: user.NumeroDocumento,
            Telefono: user.Telefono,
            FechaCumpleaños: user.FechaCumpleaños,
            TipoDocumento: user.TipoDocumento,
            Direccion: user.Direccion.trim(),
            Distrito: user.Distrito.trim(),
            Departamento: user.Departamento.trim(),
            Provincia: user.Provincia.trim()
        }
        //creamos un token personalizado
        const customToken = await admin.auth().createCustomToken(uid)

        return res.status(201)
            .json({
                success: true,
                message: 'Cliente creado exitosamente.',
                data: {
                    user: adapterUser,
                    token:  customToken
                },
            });

    } catch (error) {

        console.error('Error en createClient:', error);
        // Manejar diferentes tipos de errores
        if (error.message.includes('Ya existe')) {
            // Si falló en BD pero se creó en Firebase, limpiar Firebase
            try {
                const user = await admin.auth().getUserByEmail(req.body.email);
                await admin.auth().deleteUser(user.uid);
            } catch (firebaseError) {
                console.error('Error limpiando usuario de Firebase:', firebaseError);
            }

            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error al procesar la solicitud: ' + error.message
        });
    }
};