import {Router} from 'express';
import {createClient, listAddresses, RucRegistration, updateClient} from "../controllers/clients.controller.js";


const router = Router();

//ruta para crear un cliente o usuario
router.get('/client/address', listAddresses);
router.post('/create-client', createClient);
router.post('/ruc-registration', RucRegistration);
router.put('/update-client', updateClient);

export default router;