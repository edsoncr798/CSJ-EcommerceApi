import { Router } from "express";
import { createNewUser, validateUser } from "../controllers/user.controller.js";

const router = Router();

router.post("/usuarios/nuevo", createNewUser);
router.post("/usuarios/validar", validateUser);

export default router;
