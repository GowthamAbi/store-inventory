import { Router } from "express";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  approvePlan,
  createPlan,
  elasticRequirement,
  getCuttingActual,
  getPlan,
  listPlans,
  saveCuttingActual,
  wasteRegister,
} from "../controllers/garmentFlowController.js";

const router = Router();
const readRoles = ["saas_super_admin", "company_admin", "admin", "fabric_admin", "fabric_entry", "cutting_admin", "cutting_entry", "elastic_admin", "elastic_entry", "management", "view_only"];
const planWriteRoles = ["saas_super_admin", "company_admin", "admin", "fabric_admin", "fabric_entry"];
const approveRoles = ["saas_super_admin", "company_admin", "admin", "fabric_admin"];
const cuttingRoles = ["saas_super_admin", "company_admin", "admin", "cutting_admin", "cutting_entry"];
const elasticRoles = ["saas_super_admin", "company_admin", "admin", "elastic_admin", "elastic_entry"];

router.get("/plans", allowRoles(...readRoles), asyncHandler(listPlans));
router.post("/plans", allowRoles(...planWriteRoles), asyncHandler(createPlan));
router.get("/plans/:reference", allowRoles(...readRoles), asyncHandler(getPlan));
router.patch("/plans/:id/approve", allowRoles(...approveRoles), asyncHandler(approvePlan));
router.post("/plans/:planId/cutting-actual", allowRoles(...cuttingRoles), asyncHandler(saveCuttingActual));
router.get("/cutting-actual/:reference", allowRoles(...readRoles), asyncHandler(getCuttingActual));
router.post("/elastic-requirement/:reference", allowRoles(...elasticRoles), asyncHandler(elasticRequirement));
router.get("/waste-register", allowRoles(...readRoles), asyncHandler(wasteRegister));

export default router;
