import {getRucClientService, insertClientService, listAddresses as listAddressesService} from "../services/clients.service.js";
import admin from '../config/firebase.js';
import {sendVerificationEmail} from "../services/email.service.js";

export const createClient = async (req, res) => {

    try {

        const {
            Nombre,
            Apellido,
            email,
            password,
            Genero,
            FechaCumpleanio,
            DocIdentidad,
            Direccion1,
            Distrito1,
            TelefonoGeneral
        } = req.body;

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
            p_Web: Genero?.toUpperCase() || '',
            p_FechaCumpleaños: FechaCumpleanio ? FechaCumpleanio : '2014-12-18',
            p_DocIdentidad: DocIdentidad,
            p_Direccion1: Direccion1?.toUpperCase(),
            p_Distrito1: Distrito1,
            p_TelefonoGeneral: TelefonoGeneral
        };

        const result = await insertClientService(data);   
        
        
        const userRecord = await admin.auth().createUser({
            email,
            password,
            emailVerified: false
        });

        const verificationLink = await admin.auth().generateEmailVerificationLink(email);

        await sendVerificationEmail(email, verificationLink);

        return res.status(201)
            .json({
                success: true,
                message: 'Cliente creado exitosamente. Por favor, verifica tu email.',
                data: result?.recordset?.[0],
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

export const RucRegistration = async(req, res) => {

    try {

        const {
            Nombre,
            DocIdentidad,
            Direccion1,
            Distrito1,
        } = req.body;     
        
        //verificar si el ruc ya existe
        const existingClient = await getRucClientService(DocIdentidad);

        if(existingClient){
            //si existe, retornar los datos del cliente
            return res.status(200).json({
                success: true,
                message: 'Es cliente',
                data: existingClient
            });
        }


        const data = {
            p_Prefijo: Nombre?.charAt(0)?.toUpperCase() || 'B',
            p_Nombre: Nombre,
            p_ApellidoPaterno: '',
            p_ApellidoMaterno: '',
            p_PrimerNombre: '',
            p_SegundoNombre: '',
            p_Email: '',
            p_DocIdentidad: DocIdentidad,
            p_Direccion1: Direccion1?.toUpperCase(),
            p_Distrito1: Distrito1,
            p_TelefonoGeneral: ''
        };

        await insertClientService(data);

        //obtener los datos del cliente recien creado
        const newClient = await getRucClientService(DocIdentidad);

        return res.status(201).json({
            success: true,
            message: 'cliente registrado existosamente',
            data: newClient
        });

    } catch (error) {
        console.error('Error en createClient:', error);

        return res.status(500).json({
            success: false,
            message: 'Error al procesar la solicitud: ' + error.message
        });
    }
    
};


export const updateClient = async (req, res) => {

    try {

        const {
            Nombre,
            Apellido,
            email,
            Genero,
            FechaCumpleanio,
            DocIdentidad,
            Direccion1,
            Distrito1,
            TelefonoGeneral
        } = req.body;

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
            console.log('dni', p_Prefijo)
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
            p_Web: Genero?.toUpperCase() || '',
            p_FechaCumpleaños: FechaCumpleanio ? FechaCumpleanio : '2014-12-18',
            p_DocIdentidad: DocIdentidad,
            p_Direccion1: Direccion1?.toUpperCase(),
            p_Distrito1: Distrito1,
            p_TelefonoGeneral: TelefonoGeneral
        };

        const result = await insertClientService(data);   

        return res.status(201)
            .json({
                success: true,
                message: 'Datos del Cliente actualizado exitosamente.',
                data: result?.recordset?.[0],
            });

    } catch (error) {
        console.error('Error en createClient:', error);

        return res.status(500).json({
            success: false,
            message: 'Error al procesar la solicitud: ' + error.message
        });
    }
};


//funcion para listar las direcciones de un cliente
export const listAddresses = async (req, res) => {
    const idPersona = parseInt(req.query.id, 10);
    console.log("ID Persona recibido: ", idPersona)
    try {
        const result = await listAddressesService(idPersona);
        console.log("Resultado de la consulta: ", result);
        res.status(200).json({
            message: 'Direcciones obtenidas exitosamente.',
            data: result.recordsets
        })
    } catch (error) {
        console.error('Error al obtener las direcciones:', error)
        res.status(500).json({
            message: 'Error al obtener las direcciones.',
            error: error.message
        });
    }
};