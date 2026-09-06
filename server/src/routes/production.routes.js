import { Router } from "express";
import {
  changeIssueStatus,
  createSewingDelivery,
  getEmployees,
  getJobs,
  getMachines,
  getPendingIssues,
  getProductionSummary,
  getSewingDeliveries,
  resumeJob,
  saveEmployee,
  saveMachine,
  savePendingIssue,
  startJob,
  stopJob,
} from "../controllers/productionController.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
const productionAccess = allowRoles("admin", "production");

router.use(productionAccess);
router.get("/summary", asyncHandler(getProductionSummary));
router.get("/machines", asyncHandler(getMachines));
router.post("/machines", asyncHandler(saveMachine));
router.put("/machines/:id", asyncHandler(saveMachine));
router.get("/employees", asyncHandler(getEmployees));
router.post("/employees", asyncHandler(saveEmployee));
router.put("/employees/:id", asyncHandler(saveEmployee));
router.get("/jobs", asyncHandler(getJobs));
router.post("/jobs/start", asyncHandler(startJob));
router.patch("/jobs/:id/stop", asyncHandler(stopJob));
router.patch("/jobs/:id/resume", asyncHandler(resumeJob));
router.get("/pending", asyncHandler(getPendingIssues));
router.post("/pending", asyncHandler(savePendingIssue));
router.put("/pending/:id", asyncHandler(savePendingIssue));
router.patch("/pending/:id/status", asyncHandler(changeIssueStatus));
router.get("/sewing", asyncHandler(getSewingDeliveries));
router.post("/sewing", asyncHandler(createSewingDelivery));

export default router;
