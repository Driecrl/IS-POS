import { Router } from "express";
import {
  stockIn,
  stockOut,
  stockAdjust,
  getStockLevels,
  getLowStock,
  getStockHistory,
} from "../controllers/stock.controller";
import { verifyJwt } from "../middleware/verifyJwt";
import { requireRole } from "../middleware/requireRole";

const router = Router();

router.post("/in", verifyJwt, requireRole("SUPER_ADMIN", "ADMIN", "MANAGER"), stockIn);
router.post("/out", verifyJwt, requireRole("SUPER_ADMIN", "ADMIN", "MANAGER"), stockOut);
router.post("/adjust", verifyJwt, requireRole("SUPER_ADMIN", "ADMIN", "MANAGER"), stockAdjust);
router.get("/levels", verifyJwt, getStockLevels);
router.get("/low-stock", verifyJwt, getLowStock);
router.get("/history", verifyJwt, getStockHistory);

export default router;