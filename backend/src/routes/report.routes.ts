import { Router } from "express";
import {
  salesReport,
  bestSellingProducts,
  inventoryMovementReport,
  dashboardSummary,
} from "../controllers/report.controller";
import { verifyJwt } from "../middleware/verifyJwt";
import { requireRole } from "../middleware/requireRole";

const router = Router();

router.get("/sales", verifyJwt, requireRole("SUPER_ADMIN", "ADMIN", "MANAGER"), salesReport);
router.get("/best-sellers", verifyJwt, requireRole("SUPER_ADMIN", "ADMIN", "MANAGER"), bestSellingProducts);
router.get("/inventory-movement", verifyJwt, requireRole("SUPER_ADMIN", "ADMIN", "MANAGER"), inventoryMovementReport);
router.get("/dashboard", verifyJwt, requireRole("SUPER_ADMIN", "ADMIN", "MANAGER"), dashboardSummary);

export default router;