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
import saasRoutes from "./saas.routes.js";
import garmentFlowRoutes from "./garmentFlow.routes.js";
import { razorpayWebhook } from "../controllers/saasController.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireActiveSubscription } from "../middleware/subscriptionMiddleware.js";
import { auditMutations } from "../middleware/auditMiddleware.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.get("/health", (_request, response) => {
  response.json({ success: true, service: "Unified Garment Flow SaaS API" });
});

router.post("/webhooks/razorpay", asyncHandler(razorpayWebhook));
router.use("/auth", authRoutes);
router.use("/public", publicOutwardRoutes);
router.use(requireAuth, requireActiveSubscription, auditMutations);
router.use("/saas", saasRoutes);
router.use("/garment-flow", garmentFlowRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/items", allowRoles("saas_super_admin", "company_admin", "admin", "store", "accessories_admin", "accessories_entry", "management", "view_only"), itemRoutes);
router.use("/pos", allowRoles("saas_super_admin", "company_admin", "admin", "store", "accessories_admin", "accessories_entry", "management", "view_only"), purchaseOrderRoutes);
router.use("/transactions", allowRoles("saas_super_admin", "company_admin", "admin", "store", "accessories_admin", "accessories_entry", "management", "view_only"), transactionRoutes);
router.use("/production", productionRoutes);
router.use("/companies", companyRoutes);
router.use("/reports", allowRoles("saas_super_admin", "company_admin", "admin", "fabric_admin", "cutting_admin", "elastic_admin", "accessories_admin", "store", "supervisor", "quality", "maintenance", "sewing_coordinator", "management", "view_only", "production_planner", "production_operator", "production"), reportRoutes);
router.use("/masters", allowRoles("saas_super_admin", "company_admin", "admin", "fabric_admin", "fabric_entry", "elastic_admin", "accessories_admin", "store", "production_planner", "production"), masterRoutes);
router.use("/warehouse", allowRoles("saas_super_admin", "company_admin", "admin", "fabric_admin", "cutting_admin", "elastic_admin", "accessories_admin", "production", "production_planner", "production_operator", "supervisor", "quality", "management", "view_only"), warehouseRoutes);

export default router;
