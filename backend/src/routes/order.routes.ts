import { Router } from "express";
import { createOrder, listOrders, getOrder, voidOrder } from "../controllers/order.controller";
import { verifyJwt } from "../middleware/verifyJwt";
import { requireRole } from "../middleware/requireRole";

const router = Router();

router.post("/", verifyJwt, requireRole("SUPER_ADMIN", "ADMIN", "CASHIER"), createOrder);
router.get("/", verifyJwt, listOrders);
router.get("/:id", verifyJwt, getOrder);
router.put("/:id/void", verifyJwt, requireRole("SUPER_ADMIN", "ADMIN"), voidOrder);

export default router;