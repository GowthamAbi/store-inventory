import { Router } from "express";
import authRoutes from "./auth.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import itemRoutes from "./items.routes.js";
import purchaseOrderRoutes from "./po.routes.js";
import transactionRoutes from "./transactions.routes.js";
import publicOutwardRoutes from "./publicOutwardRoutes.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/health", (_request, response) => {
  response.json({ success: true, service: "YarnFlow API" });
});

router.use("/auth", authRoutes);
router.use("/public", publicOutwardRoutes);
router.use("/dashboard", requireAuth, dashboardRoutes);
router.use("/items", requireAuth, itemRoutes);
router.use("/pos", requireAuth, purchaseOrderRoutes);
router.use("/transactions", requireAuth, transactionRoutes);

export default router;
