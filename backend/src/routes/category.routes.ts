import { Router } from "express";
import {
  createCategory,
  listCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller";
import { verifyJwt } from "../middleware/verifyJwt";
import { requireRole } from "../middleware/requireRole";

const router = Router();

router.post("/", verifyJwt, requireRole("SUPER_ADMIN", "ADMIN"), createCategory);
router.get("/", verifyJwt, listCategories);
router.put("/:id", verifyJwt, requireRole("SUPER_ADMIN", "ADMIN"), updateCategory);
router.delete("/:id", verifyJwt, requireRole("SUPER_ADMIN", "ADMIN"), deleteCategory);

export default router;