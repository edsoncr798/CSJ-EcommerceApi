import { Router } from "express";
import * as productoController from "../controllers/producto.controller.js";

const router = Router();

router.get("/buscarProducto", productoController.getProducto);
router.get("/conteoDiarioBuscar", productoController.getConteoDiarioBuscar);
router.get("/listarAlmacen", productoController.getAlmacenes);

export default router;
