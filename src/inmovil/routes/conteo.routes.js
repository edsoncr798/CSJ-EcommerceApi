import { Router } from "express";
import * as conteoController from "../controllers/conteo.controller.js";

const router = Router();

router.post("/guardarResultados", conteoController.guardarResultados);
router.post("/guardarReconteo", conteoController.guardarReconteo);
router.post("/guardarResultadosCD", conteoController.guardarResultadosCD);
router.get("/verDiferencias", conteoController.verDiferencias);

export default router;
