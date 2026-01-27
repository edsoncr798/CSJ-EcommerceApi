import { Router } from "express";
import * as ventasController from "../controllers/ventas.controller.js";

const router = Router();

router.get("/listarVendedores", ventasController.listarVendedores);

export default router;
