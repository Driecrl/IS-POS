import express from "express";
import cors from "cors";
import { prisma } from "./utils/prisma";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import categoryRoutes from "./routes/category.routes";
import { verifyJwt, AuthenticatedRequest } from "./middleware/verifyJwt";
import { requireRole } from "./middleware/requireRole";
import supplierRoutes from "./routes/supplier.routes";
import productRoutes from "./routes/product.routes";
import stockRoutes from "./routes/stock.routes";
import orderRoutes from "./routes/order.routes";
import paymentRoutes from "./routes/payment.routes";
import reportRoutes from "./routes/report.routes";
import auditLogRoutes from "./routes/auditLog.routes";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/orders", orderRoutes);
app.use("/payments", paymentRoutes);
app.use("/reports", reportRoutes);
app.use("/audit-logs", auditLogRoutes);

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/categories", categoryRoutes);
app.use("/suppliers", supplierRoutes);
app.use("/products", productRoutes);
app.use("/stock", stockRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "online", message: "Inventory POS backend is running" });
});

app.get("/test-db", async (req, res) => {
  try {
    const roles = await prisma.role.findMany();
    res.json({ status: "connected", roles });
  } catch (error) {
    console.error("DB ERROR:", error);
    res.status(500).json({ status: "error", message: String(error) });
  }
});

app.get("/auth/me", verifyJwt, (req: AuthenticatedRequest, res) => {
  res.json({ status: "success", user: req.user });
});

app.get("/admin-only", verifyJwt, requireRole("SUPER_ADMIN"), (req: AuthenticatedRequest, res) => {
  res.json({ status: "success", message: "Welcome, Super Admin!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});