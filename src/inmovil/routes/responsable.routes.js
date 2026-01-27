import { Router } from "express";
import * as responsableController from "../controllers/responsable.controller.js";

const router = Router();

router.get("/listarResponsables", responsableController.getResponsables);
router.get("/validarResponsables", responsableController.validarResponsables);
router.get("/Postregistrar", responsableController.postRegistrar);
router.get("/CerrarSesion", responsableController.cerrarSesion);
router.get("/verificarEnvio", responsableController.verificarEnvio);

export default router;
