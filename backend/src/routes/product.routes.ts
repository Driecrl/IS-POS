import { Router } from "express";
import {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  deactivateProduct,
} from "../controllers/product.controller";
import { verifyJwt } from "../middleware/verifyJwt";
import { requireRole } from "../middleware/requireRole";

const router = Router();

router.post("/", verifyJwt, requireRole("SUPER_ADMIN", "ADMIN"), createProduct);
router.get("/", verifyJwt, listProducts);
router.get("/:id", verifyJwt, getProduct);
router.put("/:id", verifyJwt, requireRole("SUPER_ADMIN", "ADMIN"), updateProduct);
router.put("/:id/deactivate", verifyJwt, requireRole("SUPER_ADMIN", "ADMIN"), deactivateProduct);

export default router;