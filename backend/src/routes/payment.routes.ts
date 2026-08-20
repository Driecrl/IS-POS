import { Router } from "express";
import { completePayment, getTransaction, listTransactions, voidTransaction } from "../controllers/payment.controller";
import { verifyJwt } from "../middleware/verifyJwt";
import { requireRole } from "../middleware/requireRole";

const router = Router();

router.post("/", verifyJwt, requireRole("SUPER_ADMIN", "ADMIN", "CASHIER"), completePayment);
router.get("/", verifyJwt, listTransactions);
router.get("/:orderId", verifyJwt, getTransaction);
router.put("/:orderId/void", verifyJwt, requireRole("SUPER_ADMIN", "ADMIN"), voidTransaction);

export default router;