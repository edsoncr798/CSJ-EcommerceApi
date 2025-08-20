import { Router } from "express";
import { crearCargoKashio, crearCargoVisa } from "../controllers/openpay.controller.js";
import { confirmOpenpayPaymentVisa, recibirWebhookOpenpay } from "../controllers/confirmOpenpayPayment.controller.js";

const router = Router();

router.get('/payment/openpay/confirm', confirmOpenpayPaymentVisa);
router.post('/payment/openpay/initialize', crearCargoVisa);
router.post('/payment/kashio/initialize', crearCargoKashio);
router.post('/webhook/openpay', recibirWebhookOpenpay);

export default router