import { Router } from "express";
import { createOrder, getOrder, processBonifications } from "../controllers/order.controller.js";
import { confirmCashPayment } from "../controllers/confirmOpenpayPayment.controller.js";

const router = Router();

router.post('/payment/cash/confirm', confirmCashPayment);
router.post('/order/new', createOrder);
router.post('/process/:IdCp', processBonifications);
router.get('/purchases/history', getOrder);
//router.get('/order/state/:order_id', getOrderStatus);

export default router;