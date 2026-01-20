import { Router } from "express";
import { getDetalleOrden, getDetalleGuardado } from "../controllers/detalleOrdenCompra.controller.js";

const router = Router();

router.get("/detalle-orden", getDetalleOrden);
router.get("/detalle-guardado/:idControlAlmacen", getDetalleGuardado);

export default router;
