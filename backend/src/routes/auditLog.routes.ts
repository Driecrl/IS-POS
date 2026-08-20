import { Router } from "express";
import { listAuditLogs } from "../controllers/auditLog.controller";
import { verifyJwt } from "../middleware/verifyJwt";
import { requireRole } from "../middleware/requireRole";

const router = Router();
router.get("/", verifyJwt, requireRole("SUPER_ADMIN", "ADMIN"), listAuditLogs);
export default router;