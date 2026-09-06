import { Router } from "express";
import authRoutes from "./auth.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import itemRoutes from "./items.routes.js";
import purchaseOrderRoutes from "./po.routes.js";
import transactionRoutes from "./transactions.routes.js";
import publicOutwardRoutes from "./publicOutwardRoutes.js";
import productionRoutes from "./production.routes.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.get("/health", (_request, response) => {
  response.json({ success: true, service: "Accessories Flow API" });
});

router.use("/auth", authRoutes);
router.use("/public", publicOutwardRoutes);
router.use("/dashboard", requireAuth, dashboardRoutes);
router.use("/items", requireAuth, allowRoles("admin", "store"), itemRoutes);
router.use("/pos", requireAuth, allowRoles("admin", "store"), purchaseOrderRoutes);
router.use("/transactions", requireAuth, allowRoles("admin", "store"), transactionRoutes);
router.use("/production", requireAuth, productionRoutes);

export default router;
