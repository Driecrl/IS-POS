import { Router } from "express";
import {
  createSupplier,
  listSuppliers,
  updateSupplier,
  deleteSupplier,
} from "../controllers/supplier.controller";
import { verifyJwt } from "../middleware/verifyJwt";
import { requireRole } from "../middleware/requireRole";

const router = Router();

router.post("/", verifyJwt, requireRole("SUPER_ADMIN", "ADMIN"), createSupplier);
router.get("/", verifyJwt, listSuppliers);
router.put("/:id", verifyJwt, requireRole("SUPER_ADMIN", "ADMIN"), updateSupplier);
router.delete("/:id", verifyJwt, requireRole("SUPER_ADMIN", "ADMIN"), deleteSupplier);

export default router;