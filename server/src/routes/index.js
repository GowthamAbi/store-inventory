import { Router } from "express";
import authRoutes from "./auth.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import itemRoutes from "./items.routes.js";
import purchaseOrderRoutes from "./po.routes.js";
import transactionRoutes from "./transactions.routes.js";
import publicOutwardRoutes from "./publicOutwardRoutes.js";
import productionRoutes from "./production.routes.js";
import companyRoutes from "./company.routes.js";
import reportRoutes from "./report.routes.js";
import masterRoutes from "./master.routes.js";
import warehouseRoutes from "./warehouse.routes.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.get("/health", (_request, response) => {
  response.json({ success: true, service: "Accessories Flow API" });
});

router.use("/auth", authRoutes);
router.use("/public", publicOutwardRoutes);
router.use("/dashboard", requireAuth, dashboardRoutes);
router.use("/items", requireAuth, allowRoles("saas_super_admin", "company_admin", "admin", "store", "management", "view_only"), itemRoutes);
router.use("/pos", requireAuth, allowRoles("saas_super_admin", "company_admin", "admin", "store", "management", "view_only"), purchaseOrderRoutes);
router.use("/transactions", requireAuth, allowRoles("saas_super_admin", "company_admin", "admin", "store", "management", "view_only"), transactionRoutes);
router.use("/production", requireAuth, productionRoutes);
router.use("/companies", requireAuth, companyRoutes);
router.use("/reports", requireAuth, allowRoles("saas_super_admin", "company_admin", "admin", "store", "supervisor", "quality", "maintenance", "sewing_coordinator", "management", "view_only", "production_planner", "production_operator", "production"), reportRoutes);
router.use("/masters", requireAuth, allowRoles("saas_super_admin", "company_admin", "admin", "store", "production_planner", "production"), masterRoutes);
router.use("/warehouse", requireAuth, allowRoles("saas_super_admin", "company_admin", "admin", "production", "production_planner", "production_operator", "supervisor", "quality", "management", "view_only"), warehouseRoutes);

export default router;
