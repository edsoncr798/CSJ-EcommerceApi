import { Router } from "express";
import { finalizeIngresoAlmacen, saveControlAlmacen, getIngresosTerminados, getIngresosPendientes, getIngresosSinProcesar, updateItemControlAlmacen } from "../controllers/conteo.controller.js";

const router = Router();

router.post("/control-almacen/guardar", saveControlAlmacen);
router.post("/control-almacen/finalizar", finalizeIngresoAlmacen);
router.post("/control-almacen/actualizar-item", updateItemControlAlmacen);
router.get("/control-almacen/terminados", getIngresosTerminados);
router.get("/control-almacen/pendientes", getIngresosPendientes);
router.get("/control-almacen/sin-procesar", getIngresosSinProcesar);

export default router;
