import { Router } from "express";
import { createUser, listUsers } from "../controllers/user.controller";
import { verifyJwt } from "../middleware/verifyJwt";
import { requireRole } from "../middleware/requireRole";

const router = Router();

router.post("/", verifyJwt, requireRole("SUPER_ADMIN", "ADMIN"), createUser);
router.get("/", verifyJwt, requireRole("SUPER_ADMIN", "ADMIN"), listUsers);

export default router;